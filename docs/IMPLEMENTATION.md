# OpenClaw Personal Overlay — Implementation Plan

This repository uses a **Base + Overlay** model:

- **Base** = official OpenClaw install (users can update freely)
- **Overlay** = personal patch package with compatibility gating

## Goals

1. Preserve user freedom to run official `openclaw update`
2. Re-apply personal features safely after official updates
3. Block incompatible installs with clear error messages
4. Keep Atlas Memory compatibility outside core patch logic

## Delivery Modes

### 1) Regular users (npm/binary install)

Use one command:

```bash
openclaw-personal apply
```

The command should:

1. Detect local OpenClaw version + commit
2. Read compatibility manifest
3. If compatible: apply overlay package and restart service
4. If incompatible: show a non-destructive warning and exit

### 2) Developers (source users)

Use source patch mode:

```bash
openclaw-personal apply --source /path/to/openclaw-src
```

This uses `git am` patch application and local build.

## Compatibility Key

Compatibility should be keyed by both:

- `openclaw_version`
- `commit_sha`

This avoids false compatibility when two builds share a version string.

## CI Responsibilities

Pipeline should:

1. Detect upstream OpenClaw updates (tag/commit)
2. Rebase overlay patch queue
3. Run smoke tests
   - command-word anti-blocking (`/status`, `/stop`)
   - forced sub-session routing check
4. Generate release artifacts
   - patch bundle (`.tar.gz`)
   - `sha256` checksum
5. Update compatibility manifest


## ZMQ / exec-supervisor policy

- **Default behavior:** ZMQ is excluded from the default overlay patch queue (disabled by default).
- **Reason:** keep baseline overlay lean/stable and avoid introducing an extra runtime dependency by default.
- **Optional path:** ZMQ-related patches are preserved as an experimental opt-in layer (`patches/.../experimental-zmq/`) and are not applied by `scripts/apply-personal-patch.sh` (which only consumes `patchSetDir/*.patch`).
- **Current limitation / TODO:** no first-class CLI flag yet for optional experimental groups; current opt-in is manual.

## Atlas Memory Compatibility

Atlas integration is treated as an external compatibility surface.

Add smoke checks:

- `memory_search`
- `memory_get`

Do not couple Atlas protocol changes to core overlay patches.

## Current Status in this Repo

Implemented now:

- Compatibility manifest (`compatibility.json`)
- Source apply script (`scripts/apply-personal-patch.sh`)
- Rollback script (`scripts/rollback-personal-patch.sh`)
- Initial CI workflow (`.github/workflows/overlay-ci.yml`)
- User CLI wrapper (`bin/openclaw-personal`)

Planned next:

- Binary/dist overlay delivery path for non-source users
- Auto-release packaging + checksum publication
- Automatic upstream tracking with compatibility matrix refresh
