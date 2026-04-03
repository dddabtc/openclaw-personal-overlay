[CmdletBinding()]
param(
    [ValidateSet('windows-native')]
    [string]$Target = 'windows-native',
    [Parameter(Mandatory = $true)]
    [string]$PayloadPath,
    [switch]$RestartGateway
)

$helpText = @"
Apply Windows-native OpenClaw overlay files.

This script supports Windows-native OpenClaw only.
It does not apply to WSL installs.
It does not modify runtime config such as gateway ports.

Example:
  powershell -File .\scripts\windows\apply-windows.ps1 -Target windows-native -PayloadPath .\dist-overlay\payload
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
$resolvedPayload = Resolve-Path -Path $PayloadPath -ErrorAction Stop

Write-Info "Target: $resolvedTarget"
Write-Info "State dir: $($paths.StateDir)"
Write-Info "Install root: $($paths.InstallRoot)"
Write-Info "Payload path: $resolvedPayload"

$backupDir = New-OverlayBackupDir -BackupRoot $paths.OverlayBackupRoot
Write-Info "Backup created: $backupDir"

$payloadRoot = $resolvedPayload.Path
$installPayload = Join-Path $payloadRoot 'dist-overlay'
if (Test-Path $installPayload) {
    $payloadRoot = $installPayload
}

$manifestPath = Join-Path $payloadRoot 'manifest.json'
if (-not (Test-Path $manifestPath)) {
    Fail "Missing manifest.json in payload path: $payloadRoot"
}

$manifest = Read-JsonFile -Path $manifestPath
$files = @($manifest.files)
if (-not $files -or $files.Count -eq 0) {
    Fail "No files listed in payload manifest: $manifestPath"
}

foreach ($entry in $files) {
    $relativePath = [string]$entry.path
    $targetType = [string]$entry.target
    if (-not $relativePath) {
        Fail 'Manifest entry missing path'
    }

    switch ($targetType) {
        'installRoot' { $base = $paths.InstallRoot }
        'stateDir' { $base = $paths.StateDir }
        default { Fail "Unsupported manifest target '$targetType' for $relativePath" }
    }

    $sourcePath = Join-Path $payloadRoot $relativePath
    $targetPath = Join-Path $base $relativePath
    $backupPath = Join-Path $backupDir $targetType
    $backupTargetPath = Join-Path $backupPath $relativePath

    if (Test-Path $targetPath) {
        Copy-PathSafely -Source $targetPath -Destination $backupTargetPath
    }

    Copy-PathSafely -Source $sourcePath -Destination $targetPath
    Write-Info "Applied: $targetType/$relativePath"
}

if ($RestartGateway) {
    Write-Info 'Restart requested, but this patch-only helper does not modify or manage gateway runtime directly. Restart manually if needed.'
} else {
    Write-Info 'Restart skipped'
}

Write-Info 'Apply complete'
