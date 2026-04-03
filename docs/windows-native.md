# Windows-native OpenClaw overlay helpers

These PowerShell helpers are for **Windows-native OpenClaw only**.

They are **not** for WSL installs. If your OpenClaw instance runs inside WSL, use the Linux/overlay flow instead of these scripts.

## What they do

- require `windows-native` target semantics
- verify `node`, `npm`, and `git` exist
- detect `~/.openclaw/openclaw.json` and `~/.openclaw/gateway.cmd`
- create a timestamped backup before editing
- update the gateway port in both files
- optionally restart the Windows-native gateway wrapper
- rollback from the latest backup

Backups are stored under:

```text
$HOME/.openclaw/overlay-windows-backups/
```

## Usage

### Apply / change gateway port

```powershell
powershell -File .\scripts\windows\apply-windows.ps1 -Target windows-native -GatewayPort 18788 -RestartGateway
```

### Roll back latest backup

```powershell
powershell -File .\scripts\windows\rollback-windows.ps1 -Target windows-native -RestartGateway
```

## Dual-stack hosts (example: host 136)

If a machine runs both:

- **WSL OpenClaw** and
- **Windows-native OpenClaw**

then do **not** bind them to the same port.

Recommended split:

- **WSL OpenClaw:** `18789`
- **Windows-native OpenClaw:** `18788`

The scripts here only manage the **Windows-native** side.

## Notes

- The scripts intentionally stop on port conflicts.
- They modify only:
  - `~/.openclaw/openclaw.json`
  - `~/.openclaw/gateway.cmd`
- They do not install OpenClaw for you.
- They do not manage WSL tasks, `wsl.exe`, or Linux systemd services.
