# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

Personal overlay patch layer for OpenClaw:

- **Base**: official OpenClaw install/source
- **Overlay**: personal behavior patch queue from this repo

You can keep upgrading upstream OpenClaw, then apply/rollback personal behavior with strict compatibility gates.

## What the overlay changes

Default (non-experimental) patches focus on control-lane reliability and operator UX:

- guard risky/long exec behavior in main session
- control-plane fast path for `/status` and `/stop` (strict match)
- default tool-call routing to sub-session unless explicitly forced
- status banner personalization (`PERSONAL BUILD` + byline)

> Optional ZMQ/exec-supervisor files exist only as experimental patches and are excluded by default.

## Compatibility and safety

Apply requires an exact match on both:

- `openclawVersion`
- `commitSha`

Compatibility is defined in `compatibility.json`. On mismatch, apply fails non-zero without destructive install modification.

Current compatibility lines:

- `2026.3.2` → `patches/e7b600e31882-autocompat`
- `2026.3.1` → `patches/e7b600e31882-autocompat`
- `2026.2.26` → `patches/e7b600e31882-autocompat`
- `2026.2.25` → `patches/e7b600e31882-autocompat`
- `2026.2.22-2` → `patches/45febecf2a2d-autocompat`
- `2026.2.21-2` → `patches/35a57bc94083-autocompat`
- `2026.2.21` → `patches/5e34eb98fb02-autocompat`
- `2026.2.20` → `patches/083298ab9da9-to-91e0ffcfd080`

## Build/apply/rollback

### Regular mode (installed OpenClaw)

```bash
bin/openclaw-personal status
bin/openclaw-personal apply
bin/openclaw-personal rollback
```

Useful options:

```bash
bin/openclaw-personal apply --artifact ./dist-overlay.tar.gz
bin/openclaw-personal apply --no-config
```

### Source mode (local source tree)

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

### Build artifact

```bash
scripts/build-dist-overlay.sh
# optional cross-target version pin
TARGET_OPENCLAW_VERSION=2026.3.2 scripts/build-dist-overlay.sh
```

Build output:

- `dist-overlay.tar.gz`
- `dist-overlay.tar.gz.sha256`

## Patch directories

- `patches/e7b600e31882-autocompat`
- `patches/45febecf2a2d-autocompat`
- `patches/35a57bc94083-autocompat`
- `patches/5e34eb98fb02-autocompat`
- `patches/083298ab9da9-to-91e0ffcfd080`

## Recent releases

- `overlay-v2026.3.2` (latest)
- `overlay-v2026.3.1`
- `overlay-v2026.2.26`
- `overlay-v2026.2.25`

Full history: <https://github.com/dddabtc/openclaw-personal-overlay/releases>

## Repo map

- `bin/openclaw-personal` — CLI (`status/apply/rollback`)
- `compatibility.json` — compatibility matrix and policy
- `patches/` — versioned patch queues
- `scripts/` — build/apply/rollback helpers
- `tests/` — CLI tests
- `.github/workflows/` — CI, auto-compat, release automation
