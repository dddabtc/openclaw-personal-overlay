# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed
- docs: refresh README and CHANGELOG for current overlay/compatibility/release state.

## [overlay-v2026.3.2] - 2026-03-04

### Features
- Added `maxOutputBytes` execution-output policy:
  - main sessions capped (`100KB`)
  - sub-sessions remain effectively unlimited for long/debug tasks.
- Added `TARGET_OPENCLAW_VERSION` support in artifact build flow.

### CI/CD
- `ci(release)`: add hard gates for required release assets.

### Bug Fixes
- `fix(release)`: build upstream dist before overlay packaging.
- `fix(release)`: set git identity before applying patch queue.
- `fix(release)`: upload `dist-overlay.tar.gz` and `.sha256` to GitHub releases.
- `fix(apply)`: strict version matching and non-`gh` download fallback hardening.

## [overlay-v2026.3.1] - 2026-03-02

### Release
- Auto-compat release for upstream `v2026.3.1`.

### CI/CD
- `ci`: relax automerge constraints while preserving CI safety gates.
- `ci(automerge)`: better PR branch mapping and conflict auto-resolution.

### Bug Fixes
- `fix(autofix/ci)`: workflow hardening for YAML validity,
  branch-protection handling, and merge-strategy fallback.

## [overlay-v2026.2.26] - 2026-02-27

### Release
- Auto-compat release for upstream `v2026.2.26`.

### CI/CD
- `fix(ci)`: enforce normalized `overlay-v<version>` release tag format.

## [overlay-v2026.2.25] - 2026-02-26

### Release
- Auto-compat release for upstream `v2026.2.25`.

### CI/CD
- policy-aware/admin-token auto-merge support.
- stronger closed-loop automation risk gates.

### Bug Fixes
- autofix path hardening for protected-branch repositories.

## [overlay-v2026.2.22-2] - 2026-02-23

### Features
- Auto-compat support rollout for upstream `v2026.2.22-2` line.

## [overlay-v2026.2.21-2] - 2026-02-21

### Features
- `feat(status)`: patch 0022 resolves target session context in control-plane fast path.
- `feat(exec)`: enforce main-session guard for ssh-style tool calls.

### Bug Fixes
- apply/install-root detection, atomic staging, and package protection hardening.
- release artifact fetch and unknown-commit handling improvements.
- rollback and script safety improvements.

### Tests
- rollback/corrupt-artifact/unknown-version and positional-apply coverage.

### CI/CD
- release trigger and auto-compat workflow hardening.

## [overlay-v2026.2.21] - 2026-02-21

### Features
- `feat(cli)`: resolve version-matched release tag for apply.

## [overlay-v2026.2.20] - 2026-02-20

### Features
- Initial overlay repo bootstrap and binary apply/rollback flow.

### Policy / Docs
- ZMQ patch group excluded from default overlay policy.
