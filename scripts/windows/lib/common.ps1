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

function Get-TcpPortOwnerSummary {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $conn) {
        return $null
    }

    $pid = $conn.OwningProcess
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    [pscustomobject]@{
        Port = $Port
        ProcessId = $pid
        ProcessName = if ($proc) { $proc.ProcessName } else { 'unknown' }
        State = $conn.State
    }
}

function Get-OpenClawPaths {
    $stateDir = if ($env:OPENCLAW_STATE_DIR) { $env:OPENCLAW_STATE_DIR } else { Join-Path $HOME '.openclaw' }
    $configPath = if ($env:OPENCLAW_CONFIG_PATH) { $env:OPENCLAW_CONFIG_PATH } else { Join-Path $stateDir 'openclaw.json' }

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

    $gatewayCmdPath = Join-Path $stateDir 'gateway.cmd'
    if (-not (Test-Path $configPath)) {
        Fail "OpenClaw config not found: $configPath"
    }
    if (-not (Test-Path $gatewayCmdPath)) {
        Fail "Windows-native gateway.cmd not found: $gatewayCmdPath"
    }

    return [pscustomobject]@{
        StateDir = $stateDir
        ConfigPath = $configPath
        GatewayCmdPath = $gatewayCmdPath
        InstallRoot = $installRoot
        BackupRoot = Join-Path $stateDir 'overlay-windows-backups'
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

function New-BackupSet {
    param(
        [string]$ConfigPath,
        [string]$GatewayCmdPath,
        [string]$BackupRoot,
        [hashtable]$Metadata
    )
    New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupDir = Join-Path $BackupRoot $stamp
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

    Copy-Item -LiteralPath $ConfigPath -Destination (Join-Path $backupDir 'openclaw.json') -Force
    Copy-Item -LiteralPath $GatewayCmdPath -Destination (Join-Path $backupDir 'gateway.cmd') -Force

    $metaPath = Join-Path $backupDir 'backup-metadata.json'
    Write-JsonFile -Path $metaPath -Object $Metadata
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

function Get-GatewayPort {
    param([string]$ConfigPath)
    $cfg = Read-JsonFile -Path $ConfigPath
    if ($cfg.gateway -and $cfg.gateway.port) {
        return [int]$cfg.gateway.port
    }
    return 18789
}

function Set-GatewayPort {
    param(
        [string]$ConfigPath,
        [string]$GatewayCmdPath,
        [int]$Port
    )
    $cfg = Read-JsonFile -Path $ConfigPath
    if (-not $cfg.gateway) {
        $cfg | Add-Member -NotePropertyName gateway -NotePropertyValue ([pscustomobject]@{})
    }
    $cfg.gateway.port = $Port
    Write-JsonFile -Path $ConfigPath -Object $cfg

    $gatewayContent = Get-Content -Raw -Path $GatewayCmdPath
    $updated = [regex]::Replace($gatewayContent, '(?m)(set\s+"OPENCLAW_GATEWAY_PORT=)\d+("?)', "`${1}$Port`${2}", 1)
    if ($updated -eq $gatewayContent) {
        $updated = [regex]::Replace($gatewayContent, '(?m)(openclaw\s+gateway\s+--port\s+)\d+', "`${1}$Port", 1)
    }
    if ($updated -eq $gatewayContent) {
        Fail "Did not find gateway port assignment in $GatewayCmdPath"
    }
    Set-Content -Path $GatewayCmdPath -Value $updated -Encoding ASCII
}

function Restart-OpenClawGateway {
    param([string]$StateDir)
    $script = Join-Path $StateDir 'gateway.cmd'
    if (-not (Test-Path $script)) {
        Fail "Cannot restart; missing gateway script: $script"
    }

    $running = Get-CimInstance Win32_Process -Filter "name = 'cmd.exe'" |
        Where-Object { $_.CommandLine -and $_.CommandLine -match [regex]::Escape($script) }

    foreach ($proc in $running) {
        Write-Info "Stopping existing gateway wrapper PID $($proc.ProcessId)"
        Stop-Process -Id $proc.ProcessId -Force
    }

    Write-Info "Starting gateway via $script"
    Start-Process -FilePath $script -WorkingDirectory $StateDir | Out-Null
}
