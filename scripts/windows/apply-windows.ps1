[CmdletBinding()]
param(
    [ValidateSet('windows-native')]
    [string]$Target = 'windows-native',
    [Parameter(Mandatory = $true)]
    [int]$GatewayPort,
    [switch]$RestartGateway
)

$helpText = @"
Apply Windows-native OpenClaw overlay settings.

This script supports Windows-native OpenClaw only.
It does not apply to WSL installs.

Example:
  powershell -File .\scripts\windows\apply-windows.ps1 -Target windows-native -GatewayPort 18788 -RestartGateway
"@

if ($args -contains '-h' -or $args -contains '--help' -or $args -contains '/?') {
    $helpText
    exit 0
}

. "$PSScriptRoot/lib/common.ps1"

$resolvedTarget = Assert-TargetWindowsNative -Target $Target
if ($GatewayPort -lt 1 -or $GatewayPort -gt 65535) {
    Fail 'GatewayPort must be between 1 and 65535.'
}

Assert-CommandAvailable node
Assert-CommandAvailable npm
Assert-CommandAvailable git

$paths = Get-OpenClawPaths
$currentPort = Get-GatewayPort -ConfigPath $paths.ConfigPath
Write-Info "Target: $resolvedTarget"
Write-Info "State dir: $($paths.StateDir)"
Write-Info "Install root: $($paths.InstallRoot)"
Write-Info "Config: $($paths.ConfigPath)"
Write-Info "Gateway script: $($paths.GatewayCmdPath)"
Write-Info "Current gateway port: $currentPort"
Write-Info "Requested gateway port: $GatewayPort"

$owner = Get-TcpPortOwnerSummary -Port $GatewayPort
if ($owner -and $GatewayPort -ne $currentPort) {
    Fail "Port $GatewayPort is already in use by PID $($owner.ProcessId) ($($owner.ProcessName), state=$($owner.State)). Refusing to continue."
}

$backupDir = New-BackupSet -ConfigPath $paths.ConfigPath -GatewayCmdPath $paths.GatewayCmdPath -BackupRoot $paths.BackupRoot -Metadata @{
    action = 'apply'
    target = $resolvedTarget
    previousPort = $currentPort
    requestedPort = $GatewayPort
    createdAt = (Get-Date).ToString('o')
}
Write-Info "Backup created: $backupDir"

Set-GatewayPort -ConfigPath $paths.ConfigPath -GatewayCmdPath $paths.GatewayCmdPath -Port $GatewayPort
Write-Info 'Updated openclaw.json and gateway.cmd'

if ($RestartGateway) {
    Restart-OpenClawGateway -StateDir $paths.StateDir
    Write-Info 'Gateway restarted'
} else {
    Write-Info 'Restart skipped (use -RestartGateway to restart now)'
}

Write-Info 'Apply complete'
