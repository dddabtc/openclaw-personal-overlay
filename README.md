# openclaw-personal-overlay

Personal overlay patches for OpenClaw, with strict compatibility gating and rollback.

**TL;DR**
- Keep personal behavior patches outside the upstream repo.
- Apply only when `openclawVersion + commitSha` matches.
- Use one wrapper: `status / apply / rollback`.
- Protect regular installs with staged copy + backup + checksum.
- Reduce control-path stalls: `/stop` and `/status` get a dedicated control lane.

[![CI](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

> Chinese documentation: **[README.zh-CN.md](./README.zh-CN.md)**

## What this overlay concretely provides

Each item below maps to implementation files in this repo.

1. **Strict compatibility gate before patching/installing**  
   Uses `openclawVersion + commitSha` as the key. Mismatch exits non-zero (fail-safe).  
   Evidence: `bin/openclaw-personal`, `compatibility.json`, `scripts/validate-compatibility.py`

2. **Two delivery channels: source patch mode and binary artifact mode**  
   - Source mode: `git am` patch queue from `patchSetDir`  
   - Binary mode: release artifact + metadata/checksum verification  
   Evidence: `scripts/apply-personal-patch.sh`, `scripts/rollback-personal-patch.sh`, `scripts/build-dist-overlay.sh`, `dist-overlay/metadata.json`

3. **Safe regular-user apply/rollback path**  
   - Detect install root
   - Stage payload before overwrite
   - Backup payload files
   - Verify backup before rollback restore
   Evidence: `bin/openclaw-personal` (functions `regular_apply`, `regular_rollback`)

4. **Auto-compat and release automation**  
   - Upstream version detection and support comparison
   - Full-flow validation gates
   - Artifact publishing and postflight asset checks
   Evidence: `.github/workflows/auto-compat.yml`, `.github/workflows/release.yml`, `.github/workflows/ci.yml`

5. **Main-session exec guard (anti-stall policy)**  
   Overlay patch adds policy to block risky long foreground exec in main sessions, with timeout constraints and sub-session guidance.  
   Evidence: `patches/e7b600e31882-autocompat/0001-feat-exec-guard-long-exec-in-main-sessions-via-polic.patch`

6. **Control-plane fast path for `/stop` and `/status` (anti-blocking path)**  
   Overlay patch routes these commands through durable control handling with strict matching, timeout handling, and recovery markers.  
   Evidence: `patches/e7b600e31882-autocompat/0008-feat-control-plane-route-stop-and-status-via-durable.patch`, `0005-telegram-fast-path-stop-and-status-in-ingress-contro.patch`, `0009-fix-control-plane-align-control-lane-status-timeout-.patch`

## Vanilla OpenClaw vs this overlay

### Added by this overlay
- Compatibility matrix + hard gate (`compatibility.json` + wrapper/scripts).
- Versioned personal patchsets and repeatable apply/rollback flow.
- Control-plane and command-lane patchset for `/stop` and `/status` handling.
- Main-session exec safety patches (long-exec guard, SSH-family block, output cap).

### Current not covered in this repo
- No first-class wrapper flag to selectively apply experimental patch groups (like optional ZMQ layer). Manual path only.  
  Evidence: `docs/IMPLEMENTATION.md` ("Current limitation / TODO"), `compatibility.json` (`defaultOverlayPolicy.optionalExperimentalPatchDirs`)
- No standalone watchdog service in this overlay wrapper that automatically kills all hung subprocesses. Current mitigation is policy + control-lane routing in patchset.

## Exec hang / flow-stall mitigation status

Implemented in patchset:
- Long exec guard for main sessions (`0001...patch`)
- Hard block SSH-family exec in main sessions (`0014-fix-exec-hard-block-ssh-and-long-exec-in-main-sessio.patch`)
- Main-session output cap (`0017-feat-exec-add-session-max-output-bytes-policy.patch`)
- Abortable transient retry delay (`0006-fix-make-transient-retry-delay-abortable.patch`)
- Durable control-plane for `/stop` and `/status` (`0008...`, `0009...`, `0015...`, `0016...`)

Not enabled by default:
- ZMQ exec-supervisor path is explicitly optional/experimental and excluded from default overlay policy.  
  Evidence: `docs/IMPLEMENTATION.md`, `compatibility.json`

## Quick start

### Installed OpenClaw

```bash
bin/openclaw-personal status
bin/openclaw-personal apply
bin/openclaw-personal rollback
```

Use a specific artifact:

```bash
bin/openclaw-personal apply --artifact <path-or-url>
```

### Source tree mode

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## Repository layout

- `bin/openclaw-personal` — CLI wrapper for status/apply/rollback
- `compatibility.json` — support matrix and overlay policy
- `patches/` — versioned patch queues (including autocompat)
- `scripts/` — apply/rollback/build/validation helpers
- `.github/workflows/` — CI, auto-compat, release, autofix
- `docs/` — implementation and usage docs

Releases: <https://github.com/dddabtc/openclaw-personal-overlay/releases>
