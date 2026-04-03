Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info {
    param([string]$Message)
    Write-Host "[openclaw-windows] $Message"
}

function Fail {
    param([string]$Message)
    throw "[openclaw-windows][ERR] $Message"
}

function Assert-TargetWindowsNative {
    param([string]$Target)
    $normalized = if ($Target) { $Target.Trim().ToLowerInvariant() } else { '' }
    if (-not $normalized) {
        $normalized = 'windows-native'
    }
    if ($normalized -ne 'windows-native') {
        Fail "This script only supports Windows-native OpenClaw. Use -Target windows-native. WSL targets are intentionally not supported here."
    }
    return $normalized
}

function Assert-CommandAvailable {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Fail "Required command not found in PATH: $Name"
    }
}

function Get-OpenClawPaths {
    $stateDir = if ($env:OPENCLAW_STATE_DIR) { $env:OPENCLAW_STATE_DIR } else { Join-Path $HOME '.openclaw' }

    $npmPrefix = (& npm prefix -g 2>$null)
    $candidates = @()
    if ($env:OPENCLAW_INSTALL_ROOT) { $candidates += $env:OPENCLAW_INSTALL_ROOT }
    if ($npmPrefix) {
        $candidates += (Join-Path $npmPrefix 'node_modules/openclaw')
        $candidates += (Join-Path $npmPrefix 'openclaw')
    }

    $openclawCmd = Get-Command openclaw.cmd -ErrorAction SilentlyContinue
    if ($openclawCmd) {
        $cmdDir = Split-Path -Parent $openclawCmd.Source
        $candidates += (Join-Path $cmdDir 'node_modules/openclaw')
        $candidates += (Join-Path (Split-Path -Parent $cmdDir) 'node_modules/openclaw')
    }

    $installRoot = $null
    foreach ($candidate in $candidates | Where-Object { $_ } | Select-Object -Unique) {
        if (Test-Path (Join-Path $candidate 'package.json')) {
            $installRoot = $candidate
            break
        }
    }

    if (-not $installRoot) {
        Fail 'Could not locate Windows-native OpenClaw install root. Set OPENCLAW_INSTALL_ROOT or ensure global npm install is present.'
    }

    return [pscustomobject]@{
        StateDir = $stateDir
        InstallRoot = $installRoot
        OverlayBackupRoot = Join-Path $stateDir 'overlay-windows-backups'
    }
}

function Read-JsonFile {
    param([string]$Path)
    return Get-Content -Raw -Path $Path | ConvertFrom-Json
}

function Write-JsonFile {
    param(
        [string]$Path,
        [Parameter(Mandatory = $true)]$Object
    )
    $json = $Object | ConvertTo-Json -Depth 100
    Set-Content -Path $Path -Value ($json + "`r`n") -Encoding UTF8
}

function New-OverlayBackupDir {
    param([string]$BackupRoot)
    New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupDir = Join-Path $BackupRoot $stamp
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    return $backupDir
}

function Get-LatestBackupDir {
    param([string]$BackupRoot)
    if (-not (Test-Path $BackupRoot)) {
        return $null
    }
    $dir = Get-ChildItem -Path $BackupRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
    if ($dir) { return $dir.FullName }
    return $null
}

function Copy-PathSafely {
    param(
        [string]$Source,
        [string]$Destination
    )
    if (-not (Test-Path $Source)) {
        Fail "Source path does not exist: $Source"
    }

    if (Test-Path $Source -PathType Container) {
        Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
    } else {
        $parent = Split-Path -Parent $Destination
        if ($parent) {
            New-Item -ItemType Directory -Force -Path $parent | Out-Null
        }
        Copy-Item -LiteralPath $Source -Destination $Destination -Force
    }
}
