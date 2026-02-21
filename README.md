# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

Personal overlay for OpenClaw using a **Base + Overlay** model.

## One-command regular-user flow (no source build)

```bash
curl -fsSL https://raw.githubusercontent.com/dddabtc/openclaw-personal-overlay/main/bin/openclaw-personal -o /tmp/openclaw-personal
chmod +x /tmp/openclaw-personal
/tmp/openclaw-personal apply
```

By default `apply`:
1. Detects local npm/global OpenClaw install.
2. Verifies local `openclawVersion + commitSha` against `compatibility.json`.
3. Downloads latest `dist-overlay.tar.gz` release artifact (or use `--artifact`).
4. Applies payload non-destructively with backup and install-state tracking.

If compatibility does not match, it exits non-zero and does **not** modify the install.

## Commands

```bash
bin/openclaw-personal status
bin/openclaw-personal apply [--artifact <path-or-url>]
bin/openclaw-personal rollback
```

Source-mode remains supported:

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## Docs

- `docs/REGULAR_USER_GUIDE.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/IMPLEMENTATION.md`
