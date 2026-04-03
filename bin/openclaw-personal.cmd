@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%openclaw-personal.ps1"

if not exist "%PS_SCRIPT%" (
  echo [openclaw-personal][ERR] Missing PowerShell wrapper: %PS_SCRIPT% 1>&2
  exit /b 2
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*
exit /b %ERRORLEVEL%
