# openclaw-personal-overlay

**Apply personal patches to OpenClaw safely — with version gating, one-command apply/rollback, and automatic backup.**

[![CI](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

> 中文文档：**[README.zh-CN.md](./README.zh-CN.md)**
>
> Upstream OpenClaw: **[github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)** · Docs: **[docs.openclaw.ai](https://docs.openclaw.ai)**

## Why

OpenClaw doesn't expose everything you might want to customize. This overlay lets you maintain personal patches **outside** the upstream repo, applied only when the exact version matches — so updates never silently break your tweaks.

## What it does

- **Version-locked patching** — patches only apply when `openclawVersion + commitSha` match exactly. Mismatch = hard stop.
- **One-command workflow** — `status`, `apply`, `rollback`. That's it.
- **Safe apply** — stages files before overwrite, backs up originals, verifies checksums.
- **Two modes** — source patches (`git am`) or pre-built binary artifacts.
- **Release gate CI** — the release workflow rebuilds from fresh upstream source, applies patches with `git am`, runs targeted regression tests, builds the overlay, and validates the final artifact before publishing.
- **Temp-dir failure analysis** — when release/CI fails, the intended local remediation flow is: detect failure, analyze upstream and patch drift in a temp dir, validate fixes on host `192.168.1.193`, then re-trigger release.

## Included patches

The current patch set focuses on stability and responsiveness:

| Patch | What it does |
|-------|-------------|
| **Exec guard** | Blocks risky long-running foreground exec in main sessions |
| **SSH block** | Hard-blocks SSH-family commands in main sessions |
| **Output cap** | Limits main-session output bytes to prevent runaway output |
| **Control fast-path** | Routes `/stop` and `/status` through a dedicated control lane so they never get stuck behind a hung session |
| **Abortable retry** | Makes transient retry delays interruptible |
| **Sub-agent timeout** | Extends default sub-agent session timeout to 6 hours (upstream default is too short for complex tasks) |

## Installation

```bash
# Clone the repository
git clone https://github.com/dddabtc/openclaw-personal-overlay.git
cd openclaw-personal-overlay
```

Check compatibility:
```bash
bin/openclaw-personal status
```

Apply patches:
```bash
bin/openclaw-personal apply
```

Undo everything:
```bash
bin/openclaw-personal rollback
```

### Source tree mode

```bash
bin/openclaw-personal apply --source ~/openclaw-src
```

### Use a specific artifact

```bash
bin/openclaw-personal apply --artifact <path-or-url>
```

## Repo layout

```
bin/openclaw-personal       — CLI entry point
compatibility.json          — version matrix & overlay policy
patches/                    — versioned patch queues
scripts/                    — apply/rollback/build/validation helpers
dist-overlay-local/         — pre-built binary overlay
.github/workflows/          — CI + manual release automation
docs/                       — implementation details
```

## Releases

Pre-built overlays: <https://github.com/dddabtc/openclaw-personal-overlay/releases>

Operational runbook for upgrades and failed-release remediation:
- [docs/RELEASE-OPERATIONS.md](docs/RELEASE-OPERATIONS.md)

## Windows-native support

For Windows-native OpenClaw, use the patch-only PowerShell helpers:
- [docs/windows-native.md](docs/windows-native.md)
- [docs/windows-payload-example/](docs/windows-payload-example/)
