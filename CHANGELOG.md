# Changelog

All notable changes to this project are documented in this file.

## [overlay-v2026.3.2] - 2026-03-03

### Features
- Added `maxOutputBytes` execution-output policy:
  - main sessions capped at `100KB`
  - sub-sessions remain unlimited (no truncation cap)
- Added `TARGET_OPENCLAW_VERSION` build support for cross-machine/repro builds.

### Bug Fixes / Hardening
- `apply` now includes curl/non-`gh` fallback for release artifact download.
- Enforced strict version matching during apply (`openclawVersion + commitSha` compatibility gate must match exactly).
- Strengthened release/apply expectations around dist assets.

## [overlay-v2026.3.1] - 2026-03-02

### Summary
- Added support bump/autocompat updates for OpenClaw `2026.3.1`.
- Continued stabilization of autofix/compat workflow.

## [overlay-v2026.2.25/26 line] - 2026-02

### Summary
- Introduced rebased autocompat queue (`patches/e7b600e31882-autocompat`).
- Added apply-time config guard (`forbidLongExec`) with optional `--no-config` bypass.
- Release workflow improvements: ensure `dist-overlay.tar.gz` + checksum are produced/published.

## [overlay-v2026.2.21-2] - 2026-02-21

### Summary
- Control-plane improvements for `/status`/`/stop` handling.
- Main-session exec guard improvements for ssh-style/tool-call risks.
- CI/auto-compat hardening and rollback safety improvements.

## [overlay-v2026.2.20] - 2026-02-20

### Summary
- Initial overlay repo bootstrap.
- Added binary apply/rollback flow, compatibility matrix, patch queue model, and CI/release automation.
