[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$CliArgs
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

function Show-Usage {
    @"
openclaw-personal commands:
  apply [--payload-path <dir>] [--restart-gateway]
  rollback [--restart-gateway]
  status

Windows notes:
- This wrapper supports Windows-native OpenClaw only.
- It does not manage WSL installs.
- Overlay helpers are patch-only and do not modify runtime config.
"@
}

if (-not $CliArgs -or $CliArgs.Count -eq 0) {
    Show-Usage
    exit 1
}

$command = $CliArgs[0].ToLowerInvariant()
$rest = if ($CliArgs.Count -gt 1) { $CliArgs[1..($CliArgs.Count - 1)] } else { @() }

switch ($command) {
    'apply' {
        $payloadPath = $null
        $restart = $false
        for ($i = 0; $i -lt $rest.Count; $i++) {
            switch ($rest[$i]) {
                '--payload-path' {
                    if ($i + 1 -ge $rest.Count) { throw 'Missing value for --payload-path' }
                    $payloadPath = $rest[$i + 1]
                    $i++
                }
                '--restart-gateway' { $restart = $true }
                default {
                    if (-not $payloadPath -and -not $rest[$i].StartsWith('--')) {
                        $payloadPath = $rest[$i]
                    } else {
                        throw "Unknown apply argument: $($rest[$i])"
                    }
                }
            }
        }

        if (-not $payloadPath) {
            throw 'apply requires a payload path. Example: bin\openclaw-personal.cmd apply .\dist-overlay'
        }

        $args = @(
            '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $RootDir 'scripts/windows/apply-windows.ps1'),
            '-Target', 'windows-native',
            '-PayloadPath', $payloadPath
        )
        if ($restart) { $args += '-RestartGateway' }
        & powershell @args
        exit $LASTEXITCODE
    }
    'rollback' {
        $restart = $false
        foreach ($arg in $rest) {
            if ($arg -eq '--restart-gateway') {
                $restart = $true
            } else {
                throw "Unknown rollback argument: $arg"
            }
        }

        $args = @(
            '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $RootDir 'scripts/windows/rollback-windows.ps1'),
            '-Target', 'windows-native'
        )
        if ($restart) { $args += '-RestartGateway' }
        & powershell @args
        exit $LASTEXITCODE
    }
    'status' {
        Write-Host '[openclaw-personal] Windows-native wrapper is installed.'
        Write-Host '[openclaw-personal] Overlay helpers are patch-only.'
        Write-Host "[openclaw-personal] Docs: $(Join-Path $RootDir 'docs/windows-native.md')"
        exit 0
    }
    default {
        Show-Usage
        throw "Unknown command: $command"
    }
}
