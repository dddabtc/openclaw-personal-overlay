# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Fixed
- **Cron agent turn hard timeout**: `AGENT_TURN_SAFETY_TIMEOUT_MS` was hardcoded to 1 hour (3600s), killing cron-triggered agent turns (heartbeats, scheduled tasks) before subagents could complete. Raised to 6 hours to match the overlay's `agents.defaults.timeoutSeconds` config.
  - Source patch: `patches/3.8/0010-fix-cron-raise-agent-turn-safety-timeout-to-6-hours.patch`
  - Runtime dist patcher: `scripts/patch-dist-cron-timeout.sh`

## [overlay-v2026.3.16] - 2026-03-16

### Added
- **Subagent config in apply/rollback**: `bin/openclaw-personal apply` now sets these `agents.defaults` values in `openclaw.json`:
  - `timeoutSeconds: 21600` (6 hours per agent turn)
  - `maxConcurrent: 4`
  - `subagents.runTimeoutSeconds: 14400` (4 hours per subagent run)
  - `subagents.maxConcurrent: 8`
- Rollback correctly restores previous values or removes added keys.

## [overlay-v2026.3.8] - 2026-03-08

### Features (patches/3.8)
- **0001 — Sub-agent timeout**: Default subagent timeout changed from 0 (no timeout) to 21600s (6 hours).
- **0002 — PERSONAL BUILD status**: `openclaw gateway status` shows build date and repo URL for easy identification.
- **0003 — Exec guard**: Main-session policy blocking long-running foreground exec and SSH commands.
- **0004 — Output cap**: Main-session exec output capped at 100KB; sub-sessions remain unlimited.
- **0005 — Control fast-path**: Slash commands (`/status`, `/stop`, etc.) bypass the session queue via a dedicated `:control` lane.
- **0006 — Apply-only defaults**: Hardcoded main-session policy defaults for the apply-only (binary) flow.
- **0007 — Abortable retry**: Transient retry delays are now interruptible by abort signals.
- **0008 — Short exec passthrough**: Short, safe foreground exec allowed by default in main session.
- **0009 — Fast-path test**: Telegram control fast-path regression coverage.

### CI/CD
- Full-replace binary overlay mode (not diff-based).
- Release gate CI: rebuild from fresh upstream source, apply patches, run regression tests, validate artifact.

## [overlay-v2026.3.7] - 2026-03-08

### Features
- Rebuilt patchset for v2026.3.7 with fast control path, personal status banner, abortable retry, exec output cap, and 6h sub-session timeout.

## [overlay-v2026.3.2] - 2026-03-04

### Features
- Added `maxOutputBytes` execution-output policy.
- Added `TARGET_OPENCLAW_VERSION` support in artifact build flow.

### Bug Fixes
- Build upstream dist before overlay packaging.
- Set git identity before applying patch queue.
- Upload `dist-overlay.tar.gz` and `.sha256` to GitHub releases.
- Strict version matching and non-`gh` download fallback hardening.

## [overlay-v2026.3.1] - 2026-03-02

### Release
- Auto-compat release for upstream `v2026.3.1`.

### CI/CD
- Relaxed automerge constraints while preserving CI safety gates.
- Better PR branch mapping and conflict auto-resolution.

## [overlay-v2026.2.26] - 2026-02-27

### Release
- Auto-compat release for upstream `v2026.2.26`.

### CI/CD
- Enforce normalized `overlay-v<version>` release tag format.

## [overlay-v2026.2.25] - 2026-02-26

### Release
- Auto-compat release for upstream `v2026.2.25`.

### CI/CD
- Policy-aware/admin-token auto-merge support.
- Stronger closed-loop automation risk gates.

## [overlay-v2026.2.22-2] - 2026-02-23

### Features
- Auto-compat support for upstream `v2026.2.22-2` line.

## [overlay-v2026.2.21-2] - 2026-02-21

### Features
- `feat(status)`: patch 0022 resolves target session context in control-plane fast path.
- `feat(exec)`: enforce main-session guard for ssh-style tool calls.

### Bug Fixes
- Apply/install-root detection, atomic staging, and package protection hardening.
- Release artifact fetch and unknown-commit handling improvements.
- Rollback and script safety improvements.

## [overlay-v2026.2.21] - 2026-02-21

### Features
- `feat(cli)`: resolve version-matched release tag for apply.

## [overlay-v2026.2.20] - 2026-02-20

### Features
- Initial overlay repo bootstrap and binary apply/rollback flow.
- ZMQ patch group excluded from default overlay policy.
