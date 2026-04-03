[CmdletBinding()]
param(
    [ValidateSet('windows-native')]
    [string]$Target = 'windows-native',
    [switch]$RestartGateway
)

$helpText = @"
Rollback Windows-native OpenClaw overlay settings from the latest backup.

This script supports Windows-native OpenClaw only.
It does not apply to WSL installs.

Example:
  powershell -File .\scripts\windows\rollback-windows.ps1 -Target windows-native -RestartGateway
"@

if ($args -contains '-h' -or $args -contains '--help' -or $args -contains '/?') {
    $helpText
    exit 0
}

. "$PSScriptRoot/lib/common.ps1"

$resolvedTarget = Assert-TargetWindowsNative -Target $Target
Assert-CommandAvailable node
Assert-CommandAvailable npm
Assert-CommandAvailable git

$paths = Get-OpenClawPaths
$backupDir = Get-LatestBackupDir -BackupRoot $paths.BackupRoot
if (-not $backupDir) {
    Fail "No backup found under $($paths.BackupRoot)"
}

$backupConfig = Join-Path $backupDir 'openclaw.json'
$backupGateway = Join-Path $backupDir 'gateway.cmd'
if (-not (Test-Path $backupConfig) -or -not (Test-Path $backupGateway)) {
    Fail "Latest backup is incomplete: $backupDir"
}

$rollbackPort = Get-GatewayPort -ConfigPath $backupConfig
$currentPort = Get-GatewayPort -ConfigPath $paths.ConfigPath
Write-Info "Target: $resolvedTarget"
Write-Info "Restoring backup: $backupDir"
Write-Info "Current port: $currentPort"
Write-Info "Rollback port: $rollbackPort"

$owner = Get-TcpPortOwnerSummary -Port $rollbackPort
if ($owner -and $rollbackPort -ne $currentPort) {
    Fail "Rollback target port $rollbackPort is already in use by PID $($owner.ProcessId) ($($owner.ProcessName), state=$($owner.State)). Refusing to continue."
}

Copy-Item -LiteralPath $backupConfig -Destination $paths.ConfigPath -Force
Copy-Item -LiteralPath $backupGateway -Destination $paths.GatewayCmdPath -Force
Write-Info 'Restored openclaw.json and gateway.cmd from latest backup'

if ($RestartGateway) {
    Restart-OpenClawGateway -StateDir $paths.StateDir
    Write-Info 'Gateway restarted'
} else {
    Write-Info 'Restart skipped (use -RestartGateway to restart now)'
}

Write-Info 'Rollback complete'
