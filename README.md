# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

Personal overlay patches for OpenClaw.

> 中文文档 / Chinese docs: **[README.zh-CN.md](./README.zh-CN.md)**

## What this repo does

This repo keeps personal behavior patches on top of upstream OpenClaw without maintaining a long-lived private fork.

- Tracks upstream updates
- Applies personal patches safely
- Supports quick rollback

## Key features

- Compatibility gate by `openclawVersion + commitSha`
- One-command flow: `status / apply / rollback`
- Fail-safe exit on mismatch (no risky writes)

## Quick start

### Installed OpenClaw

```bash
bin/openclaw-personal status
bin/openclaw-personal apply
bin/openclaw-personal rollback
```

Use a specific artifact (local path or URL):

```bash
bin/openclaw-personal apply --artifact <path-or-url>
# or
bin/openclaw-personal apply <path-or-url>
```

### Source tree mode

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## Automation

- **overlay-ci**: validates matrix, applies patches, runs smoke checks, builds `dist-overlay.tar.gz`
- **auto-compat**: discovers new upstream versions, generates candidate patchsets, opens PRs when checks pass
- **support-release-rollover**: maintains support branches/releases and publishes latest `compatibility.json`

## Safety model

- Compatibility key: `openclawVersion + commitSha`
- Any mismatch: `apply` exits non-zero
- Default behavior: fail-safe

See `compatibility.json` for current coverage.

## Repo layout

- `bin/openclaw-personal`: CLI entrypoint
- `compatibility.json`: compatibility matrix and policy
- `patches/`: patchsets (including autocompat)
- `scripts/`: apply/rollback/build/validate scripts
- `.github/workflows/`: CI and release automation
- `CHANGELOG.md`: release notes

Releases: <https://github.com/dddabtc/openclaw-personal-overlay/releases>
