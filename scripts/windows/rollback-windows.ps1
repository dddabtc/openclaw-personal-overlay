#Requires -Version 5.1
<#
.SYNOPSIS
    Rollback Windows-native OpenClaw personal overlay.

.DESCRIPTION
    Windows equivalent of scripts/rollback-personal-patch.sh.

    Linux flow:  match current HEAD in compat.json → git reset --hard upstreamBaseCommit → pnpm build → npm install -g → systemctl restart
    Windows flow: find latest backup dir → restore backed-up dist/ files → openclaw restart

.PARAMETER RestartGateway
    Restart the OpenClaw gateway after rolling back.
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
    Fail 'Could not locate Windows-native OpenClaw install root. Set OPENCLAW_INSTALL_ROOT or ensure global npm install is present.'
}

function Get-InstalledVersion([string]$InstallRoot) {
    $pkg = Get-Content -Raw (Join-Path $InstallRoot 'package.json') | ConvertFrom-Json
    if (-not $pkg.version) { Fail 'package.json has no version field' }
    return [string]$pkg.version
}

function Get-LatestBackupDir([string]$BackupRoot) {
    if (-not (Test-Path $BackupRoot)) { return $null }
    $dir = Get-ChildItem -Path $BackupRoot -Directory |
           Sort-Object Name -Descending |
           Select-Object -First 1
    if ($dir) { return $dir.FullName }
    return $null
}

# ── main ─────────────────────────────────────────────────────────────────────

$OverlayDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)  # …/openclaw-personal-overlay
$CompatPath = Join-Path $OverlayDir 'compatibility.json'
$StateDir   = if ($env:OPENCLAW_STATE_DIR) { $env:OPENCLAW_STATE_DIR } else { Join-Path $HOME '.openclaw' }
$BackupRoot = Join-Path $StateDir 'overlay-windows-backups'

# 1. locate openclaw install
$installRoot = Find-OpenClawRoot
Info "Install root : $installRoot"

# 2. get current version (≡ git rev-parse HEAD on Linux)
$version = Get-InstalledVersion $installRoot
Info "Installed ver: $version"

# 3. find rollback base in compat.json  (≡ matching overlayHeadCommit/upstreamBaseCommit)
$rollbackNote = ''
if (Test-Path $CompatPath) {
    $compat = Get-Content -Raw $CompatPath | ConvertFrom-Json
    $entry = $null
    foreach ($e in $compat.supported) {
        if ([string]$e.openclawVersion -eq $version -and [string]$e.status -ne 'deprecated') {
            $entry = $e
            break
        }
    }
    if ($entry) {
        $rollbackNote = "  (compat entry: $($entry.id))"
    } else {
        Warn "No compat entry for $version — proceeding with backup restore regardless"
    }
}

# 4. find latest backup  (≡ git reset --hard base on Linux)
$backupDir = Get-LatestBackupDir $BackupRoot
if (-not $backupDir) {
    Write-Host "[openclaw-personal][ERR] No backup found under $BackupRoot"
    Write-Host "  Run apply first to create a backup before rolling back."
    exit 3
}
Info "Backup to restore: $backupDir$rollbackNote"

# 5. restore all files from backup into install root
$restored = 0
Get-ChildItem -Path $backupDir -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($backupDir.Length).TrimStart('\').TrimStart('/')
    $dst = Join-Path $installRoot $relative
    $par = Split-Path -Parent $dst
    if ($par) { New-Item -ItemType Directory -Force -Path $par | Out-Null }
    Copy-Item -LiteralPath $_.FullName -Destination $dst -Force
    $restored++
}

if ($restored -eq 0) {
    Warn "Backup dir was empty — nothing restored: $backupDir"
} else {
    Info "Restored $restored file(s)"
}

# 6. restart gateway  (≡ systemctl --user restart openclaw-gateway.service on Linux)
if ($RestartGateway) {
    Info "Restarting OpenClaw gateway…"
    & openclaw gateway restart 2>&1 | ForEach-Object { Info "  $_" }
} else {
    Info "Gateway restart skipped (pass -RestartGateway to restart)"
}

Info "Rollback complete ✓"
