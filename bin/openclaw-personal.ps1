#Requires -Version 5.1
<#
.SYNOPSIS
    openclaw-personal CLI wrapper (Windows-native).

.DESCRIPTION
    Delegates to scripts/windows/apply-windows.ps1 or rollback-windows.ps1.
    Mirrors the interface of the Linux bin/openclaw-personal shell script.

    Commands:
      apply   [--restart-gateway]   Apply overlay (uses dist-overlay.tar.gz)
      rollback [--restart-gateway]  Rollback to last backup
      status                        Show install info
#>
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$CliArgs
)

$ErrorActionPreference = 'Stop'
$CliArgs = @($CliArgs)   # ensure array even when single element passed
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir   = Split-Path -Parent $ScriptDir

function Show-Usage {
    @"
openclaw-personal commands:
  apply   [--restart-gateway]   Apply overlay from dist-overlay.tar.gz
  rollback [--restart-gateway]  Rollback to last backup
  status                        Show current install info
"@
}

if (-not $CliArgs -or $CliArgs.Count -eq 0) {
    Show-Usage
    exit 1
}

$command = ([string]$CliArgs[0]).ToLowerInvariant()
$rest    = if ($CliArgs.Count -gt 1) { @($CliArgs[1..($CliArgs.Count - 1)]) } else { @() }

switch ($command) {

    'apply' {
        $restartGateway = $false
        foreach ($a in $rest) {
            $a = [string]$a
            switch ($a) {
                '--restart-gateway' { $restartGateway = $true }
                default             { throw "Unknown apply argument: $a" }
            }
        }
        $scriptArgs = @(
            '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
            (Join-Path $RootDir 'scripts\windows\apply-windows.ps1')
        )
        if ($restartGateway) { $scriptArgs += '-RestartGateway' }
        & pwsh @scriptArgs
        exit $LASTEXITCODE
    }

    'rollback' {
        $restartGateway = $false
        foreach ($a in $rest) {
            $a = [string]$a
            switch ($a) {
                '--restart-gateway' { $restartGateway = $true }
                default             { throw "Unknown rollback argument: $a" }
            }
        }
        $scriptArgs = @(
            '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
            (Join-Path $RootDir 'scripts\windows\rollback-windows.ps1')
        )
        if ($restartGateway) { $scriptArgs += '-RestartGateway' }
        & pwsh @scriptArgs
        exit $LASTEXITCODE
    }

    'status' {
        $installRoot = $null
        $npmPrefix   = (& npm prefix -g 2>$null)
        if ($npmPrefix) {
            $cand = Join-Path $npmPrefix 'node_modules\openclaw'
            if (Test-Path (Join-Path $cand 'package.json')) { $installRoot = $cand }
        }
        $version = if ($installRoot) {
            (Get-Content -Raw (Join-Path $installRoot 'package.json') | ConvertFrom-Json).version
        } else { '(unknown)' }

        $stateDir   = if ($env:OPENCLAW_STATE_DIR) { $env:OPENCLAW_STATE_DIR } else { Join-Path $HOME '.openclaw' }
        $backupRoot = Join-Path $stateDir 'overlay-windows-backups'
        $latestBackup = if (Test-Path $backupRoot) {
            $d = Get-ChildItem $backupRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
            if ($d) { $d.Name } else { '(none)' }
        } else { '(none)' }

        Write-Host '[openclaw-personal] Windows-native overlay wrapper'
        Write-Host "[openclaw-personal] Install root   : $(if ($installRoot) { $installRoot } else { '(not found)' })"
        Write-Host "[openclaw-personal] OpenClaw ver   : $version"
        Write-Host "[openclaw-personal] State dir      : $stateDir"
        Write-Host "[openclaw-personal] Latest backup  : $latestBackup"
        Write-Host "[openclaw-personal] Overlay root   : $RootDir"
        Write-Host "[openclaw-personal] Docs           : $(Join-Path $RootDir 'docs\windows-native.md')"
        exit 0
    }

    default {
        Show-Usage
        throw "Unknown command: $command"
    }
}
