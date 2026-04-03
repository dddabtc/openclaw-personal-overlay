# Windows-native OpenClaw overlay helpers

These PowerShell helpers are for **Windows-native OpenClaw only**.

They are **not** for WSL installs. If your OpenClaw instance runs inside WSL, use the Linux/overlay flow instead of these scripts.

## Scope

These helpers are **patch-only**.

They do:
- detect Windows-native OpenClaw install/state paths
- back up files that will be overwritten by an overlay payload
- copy overlay payload files into the Windows-native install/state tree
- roll back from the latest backup snapshot

They do **not**:
- edit `openclaw.json` runtime settings
- edit `gateway.cmd`
- change gateway ports
- manage WSL tasks, `wsl.exe`, or Linux systemd services
- install OpenClaw itself

## Backups

Backups are stored under:

```text
$HOME/.openclaw/overlay-windows-backups/
```

Each apply run creates a timestamped backup directory containing only files that are about to be overwritten.

## Payload format

`apply-windows.ps1` expects a payload directory containing a `manifest.json`.

Example manifest shape:

```json
{
  "files": [
    { "target": "installRoot", "path": "dist/reply.js" },
    { "target": "stateDir", "path": "plugins/entries/example.json" }
  ]
}
```

Supported targets:
- `installRoot`
- `stateDir`

## Usage

### Apply overlay payload

```powershell
powershell -File .\scripts\windows\apply-windows.ps1 -Target windows-native -PayloadPath .\dist-overlay
```

### Roll back latest backup

```powershell
powershell -File .\scripts\windows\rollback-windows.ps1 -Target windows-native
```

## Dual-stack hosts (example: host 136)

On dual-stack machines that run both:
- WSL OpenClaw
- Windows-native OpenClaw

these scripts still remain **patch-only**.

Runtime port allocation (for example WSL `18789` vs Windows-native `18788`) is a separate operational concern and is intentionally out of scope here.
