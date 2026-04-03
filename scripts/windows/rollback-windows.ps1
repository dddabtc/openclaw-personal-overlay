[CmdletBinding()]
param(
    [ValidateSet('windows-native')]
    [string]$Target = 'windows-native',
    [switch]$RestartGateway
)

$helpText = @"
Rollback Windows-native OpenClaw overlay files from the latest backup.

This script supports Windows-native OpenClaw only.
It does not apply to WSL installs.
It does not modify runtime config such as gateway ports.

Example:
  powershell -File .\scripts\windows\rollback-windows.ps1 -Target windows-native
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
$backupDir = Get-LatestBackupDir -BackupRoot $paths.OverlayBackupRoot
if (-not $backupDir) {
    Fail "No backup found under $($paths.OverlayBackupRoot)"
}

Write-Info "Target: $resolvedTarget"
Write-Info "Restoring backup: $backupDir"

$installBackup = Join-Path $backupDir 'installRoot'
$stateBackup = Join-Path $backupDir 'stateDir'

if (Test-Path $installBackup) {
    Get-ChildItem -Path $installBackup -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($installBackup.Length).TrimStart('\')
        $destination = Join-Path $paths.InstallRoot $relative
        Copy-PathSafely -Source $_.FullName -Destination $destination
        Write-Info "Restored: installRoot/$relative"
    }
}

if (Test-Path $stateBackup) {
    Get-ChildItem -Path $stateBackup -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($stateBackup.Length).TrimStart('\')
        $destination = Join-Path $paths.StateDir $relative
        Copy-PathSafely -Source $_.FullName -Destination $destination
        Write-Info "Restored: stateDir/$relative"
    }
}

if ($RestartGateway) {
    Write-Info 'Restart requested, but this patch-only helper does not modify or manage gateway runtime directly. Restart manually if needed.'
} else {
    Write-Info 'Restart skipped'
}

Write-Info 'Rollback complete'
