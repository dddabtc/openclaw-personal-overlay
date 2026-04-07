#Requires -Version 5.1
<#
.SYNOPSIS
    Apply Windows-native OpenClaw personal overlay.

.DESCRIPTION
    Windows equivalent of scripts/apply-personal-patch.sh.

    Linux flow:  match HEAD commit in compat.json → git am patches → pnpm build → npm install -g → systemctl restart
    Windows flow: match installed version in compat.json → extract dist-overlay.tar.gz → copy dist/ files → openclaw restart

.PARAMETER RestartGateway
    Restart the OpenClaw gateway after applying.
#>
[CmdletBinding()]
param(
    [switch]$RestartGateway
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── helpers ──────────────────────────────────────────────────────────────────

function Info  { param([string]$m) Write-Host "[openclaw-personal][INFO] $m" }
function Warn  { param([string]$m) Write-Host "[openclaw-personal][WARN] $m" }
function Fail  { param([string]$m) throw   "[openclaw-personal][ERR]  $m" }

function Find-OpenClawRoot {
    $candidates = @()
    if ($env:OPENCLAW_INSTALL_ROOT) { $candidates += $env:OPENCLAW_INSTALL_ROOT }
    $npmPrefix = (& npm prefix -g 2>$null)
    if ($npmPrefix) {
        $candidates += (Join-Path $npmPrefix 'node_modules\openclaw')
    }
    $ocCmd = Get-Command openclaw.cmd -ErrorAction SilentlyContinue
    if ($ocCmd) {
        $d = Split-Path -Parent $ocCmd.Source
        $candidates += (Join-Path $d          'node_modules\openclaw')
        $candidates += (Join-Path (Split-Path -Parent $d) 'node_modules\openclaw')
    }
    foreach ($c in ($candidates | Where-Object { $_ } | Select-Object -Unique)) {
        if (Test-Path (Join-Path $c 'package.json')) { return $c }
    }
    # NVM for Windows detection
    $nvmDir = Join-Path $env:APPDATA "nvm"
    if (Test-Path $nvmDir) {
        Get-ChildItem -Path $nvmDir -Directory -Filter "v*" | ForEach-Object {
            $c = Join-Path $_.FullName "node_modules\openclaw"
            if (Test-Path (Join-Path $c "package.json")) { return $c }
        }
    }
    Fail 'Could not locate Windows-native OpenClaw install root. Set OPENCLAW_INSTALL_ROOT or ensure global npm install is present.'
}

function Get-InstalledVersion([string]$InstallRoot) {
    $pkg = Get-Content -Raw (Join-Path $InstallRoot 'package.json') | ConvertFrom-Json
    if (-not $pkg.version) { Fail 'package.json has no version field' }
    return [string]$pkg.version
}

function Find-CompatEntry([string]$Version, $Compat) {
    # mirror Linux logic: match upstreamBaseCommit → here we match openclawVersion
    foreach ($e in $Compat.supported) {
        if ([string]$e.openclawVersion -eq $Version -and [string]$e.status -ne 'deprecated') {
            return $e
        }
    }
    return $null
}

function Find-Artifact([string]$OverlayDir, [string]$Name) {
    # look beside overlay root and inside dist-overlay dir
    $candidates = @(
        (Join-Path $OverlayDir $Name),
        (Join-Path $OverlayDir "dist-overlay\$Name"),
        (Join-Path $OverlayDir "dist-overlay-local\$Name")
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }
    return $null
}

function New-Backup([string]$InstallRoot, [string]$BackupRoot, [string[]]$RelPaths) {
    $stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backDir = Join-Path $BackupRoot $stamp
    New-Item -ItemType Directory -Force -Path $backDir | Out-Null
    foreach ($rel in $RelPaths) {
        $src = Join-Path $InstallRoot $rel
        if (Test-Path $src) {
            $dst = Join-Path $backDir $rel
            $par = [System.IO.Path]::GetDirectoryName($dst)
            if ($par) { New-Item -ItemType Directory -Force -Path $par | Out-Null }
            Copy-Item -LiteralPath $src -Destination $dst -Force
            # backed up silently
        }
    }
    return $backDir
}

# ── main ─────────────────────────────────────────────────────────────────────

$OverlayDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)  # …/openclaw-personal-overlay
$CompatPath = Join-Path $OverlayDir 'compatibility.json'
$StateDir   = if ($env:OPENCLAW_STATE_DIR) { $env:OPENCLAW_STATE_DIR } else { Join-Path $HOME '.openclaw' }
$BackupRoot = Join-Path $StateDir 'overlay-windows-backups'

# 1. locate openclaw install
$installRoot = Find-OpenClawRoot
Info "Install root : $installRoot"

# 2. get installed version  (≡ git rev-parse HEAD on Linux)
$version = Get-InstalledVersion $installRoot
Info "Installed ver: $version"

# 3. match compatibility entry  (≡ matching upstreamBaseCommit in compat.json)
if (-not (Test-Path $CompatPath)) { Fail "compatibility.json not found: $CompatPath" }
$compat = Get-Content -Raw $CompatPath | ConvertFrom-Json
$entry  = Find-CompatEntry $version $compat
if (-not $entry) {
    Write-Host "[openclaw-personal][ERR] incompatible installed version: $version"
    Write-Host "  No matching entry in compatibility.json (non-deprecated)."
    Write-Host "  Supported versions:"
    foreach ($e in $compat.supported | Where-Object { [string]$e.status -ne 'deprecated' }) {
        Write-Host "    - $($e.openclawVersion)  ($($e.status))"
    }
    exit 3
}
Info "Compat entry : $($entry.id)"

# 4. find binary artifact  (≡ finding .patch files from patchSetDir on Linux)
$artifactName = if ($entry.binaryArtifact) { [string]$entry.binaryArtifact } else { 'dist-overlay.tar.gz' }
$tarPath = Find-Artifact $OverlayDir $artifactName
if (-not $tarPath) { Fail "Binary artifact not found: $artifactName (searched under $OverlayDir)" }
Info "Artifact     : $tarPath"

# 5. peek inside tar → collect file list  (≡ reading patch files list)
$tarEntries = & tar -tf $tarPath 2>&1
if ($LASTEXITCODE -ne 0) { Fail "tar list failed: $tarEntries" }

$payloadFiles = $tarEntries |
    Where-Object { $_ -match '\.js$|\.json$|\.mjs$|\.cjs$' } |
    Where-Object { $_ -notmatch 'metadata\.json$|checksums\.' }

if (-not $payloadFiles) { Fail "No payload files found inside $artifactName" }
Info "Payload files: $($payloadFiles.Count)"

# derive relative paths inside openclaw dist/  (strip leading "dist-overlay/payload/")
# normalise forward-slashes → backslashes so Join-Path never gets an empty ChildPath
$relPaths = $payloadFiles | ForEach-Object {
    ($_ -replace '^[^/]+/payload/', '') -replace '/', '\'   # e.g. "dist\index.js"
}

# 6. backup current files  (≡ the git stash safety Linux assumes via --porcelain check)
$backupDir = New-Backup -InstallRoot $installRoot -BackupRoot $BackupRoot -RelPaths $relPaths
Info "Backup       : $backupDir"

# 7. extract tar into a temp dir, then copy into install root
#    (≡ git am → pnpm build → npm install -g on Linux)
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "oc-overlay-$([System.IO.Path]::GetRandomFileName())"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
try {
    Info "Extracting artifact…"
    & tar -xf $tarPath -C $tmp
    if ($LASTEXITCODE -ne 0) { Fail "tar extract failed (exit $LASTEXITCODE)" }

    # verify metadata version matches  (sanity check like Linux checking patch applies cleanly)
    $metaPath = Join-Path $tmp 'dist-overlay\metadata.json'
    if (Test-Path $metaPath) {
        $meta = Get-Content -Raw $metaPath | ConvertFrom-Json
        $targetVer = [string]$meta.targetOpenclawVersion
        if ($targetVer -and $targetVer -ne $version) {
            Warn "Artifact targets $targetVer but installed version is $version — proceeding anyway (check compatibility)"
        }
    }

    $payloadRoot = Join-Path $tmp 'dist-overlay\payload'
    if (-not (Test-Path $payloadRoot)) { Fail "Expected payload dir not found in extracted archive" }

    foreach ($rel in $relPaths) {
        # payload is extracted with forward-slash paths; try both separators
        $srcFwd  = Join-Path $payloadRoot ($rel -replace '\\', '/')
        $srcBack = Join-Path $payloadRoot $rel
        $src = if (Test-Path $srcFwd) { $srcFwd } elseif (Test-Path $srcBack) { $srcBack } else { $null }
        $dst = Join-Path $installRoot $rel
        if (-not $src) { Warn "Missing in artifact: $rel — skipping"; continue }
        $par = [System.IO.Path]::GetDirectoryName($dst)
        if ($par) { New-Item -ItemType Directory -Force -Path $par | Out-Null }
        Copy-Item -LiteralPath $src -Destination $dst -Force
    }
    $applied = ($relPaths | Where-Object { $_ }).Count
    Info "Applied $applied file(s)"
} finally {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

# 8. restart gateway  (≡ systemctl --user restart openclaw-gateway.service on Linux)
if ($RestartGateway) {
    Info "Restarting OpenClaw gateway…"
    & openclaw gateway restart 2>&1 | ForEach-Object { Info "  $_" }
} else {
    Info "Gateway restart skipped (pass -RestartGateway to restart)"
}

Info "Apply complete ✓"
