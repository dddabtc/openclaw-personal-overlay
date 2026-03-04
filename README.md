# openclaw-personal-overlay

**TL;DR** 这是一个叠加在原版 OpenClaw 之上的“个人补丁层”：升级上游时保留本地定制，且只在版本/提交匹配时允许 apply；不匹配就 fail-safe 退出，回滚路径也统一。

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

Personal overlay patches for OpenClaw.

> 中文文档 / Chinese docs: **[README.zh-CN.md](./README.zh-CN.md)**

## What this repo does

This repo keeps personal behavior patches on top of upstream OpenClaw without maintaining a long-lived private fork.

- Tracks upstream updates
- Applies personal patches safely
- Supports quick rollback

## Why not vanilla OpenClaw for this use case?

Pain points in this scenario:
- Local customizations can be lost after upstream upgrades
- No strict gate to block incompatible patch application
- Rollback paths are ad-hoc and easy to get wrong
- Release/sync steps can drift over time
- Automation failures are not always visible early

How this overlay addresses them:
- Keeps custom behavior as versioned patchsets outside upstream
- Enforces `openclawVersion + commitSha` compatibility checks
- Standardizes `status / apply / rollback` as one safe path
- Pins release/sync flow in CI + support workflows
- Surfaces failures via CI gates and non-zero fail-safe exits

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
