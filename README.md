# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

Personal overlay patch layer for OpenClaw. Keep using upstream OpenClaw, then apply/rollback personal behavior patches with strict compatibility gating.

## Supported OpenClaw versions

Current compatibility includes (from `compatibility.json`):

- `2026.3.2`
- `2026.3.1`
- `2026.2.26`
- `2026.2.25`
- `2026.2.22-2`
- `2026.2.21-2`
- `2026.2.21`
- `2026.2.20`

> Apply is guarded by **exact** `openclawVersion + commitSha` matching. If not matched, it fails safe without modifying install files.

## Feature highlights

- Control-lane handling for command words (`/status`, `/stop`) with strict fast-path behavior.
- Default tool-call routing to sub-sessions unless explicitly forced.
- Main-session safety guard:
  - `forbidLongExec: true` (timeout and long-task restrictions)
  - `maxOutputBytes` policy enabled for exec output truncation in main session.
- Sub-session exec output remains effectively unlimited for long/debug workloads.
- Release apply hardening:
  - strict version matching for release artifacts
  - non-GitHub/curl fallback download path for apply
  - atomic-ish apply/rollback with install-state tracking.

## Patch set status

- For `v2026.3.2`, the autocompat queue contains **19 patches** in total.
- Active patch directory: `patches/e7b600e31882-autocompat/`.

## How to use

### 1) Check status

```bash
bin/openclaw-personal status
```

### 2) Apply overlay

```bash
bin/openclaw-personal apply
```

Optional:

- Skip config guard patching:

```bash
bin/openclaw-personal apply --no-config
```

- Apply from an explicit artifact:

```bash
bin/openclaw-personal apply --artifact ./dist-overlay.tar.gz
```

### 3) Roll back

```bash
bin/openclaw-personal rollback
```

### Source mode (patch queue)

```bash
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## Build process

Build overlay artifact locally:

```bash
./scripts/build-dist-overlay.sh
```

Cross-machine/version-targeted build (useful when builder host OpenClaw version differs):

```bash
TARGET_OPENCLAW_VERSION=2026.3.2 ./scripts/build-dist-overlay.sh
```

Expected output:

- `dist-overlay.tar.gz`
- `dist-overlay.tar.gz.sha256`

## Repository map

- `bin/openclaw-personal` — apply/status/rollback CLI
- `compatibility.json` — support matrix and policy
- `patches/` — versioned patch queues
- `scripts/` — build/apply/rollback/validation helpers
- `.github/workflows/` — CI, release, support rollover, auto-compat
