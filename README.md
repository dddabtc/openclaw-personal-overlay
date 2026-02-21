# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

**TL;DR**: This repo is a **Base + Overlay** layer for OpenClaw personal patches. You keep using official OpenClaw updates, then apply or rollback personal changes with one command. Every apply is guarded by `openclawVersion + commitSha`; if not compatible, it fails safe and does not modify your install.

---

## What this project is

`openclaw-personal-overlay` is a patch delivery wrapper around official OpenClaw:

- **Base** = official OpenClaw (upstream)
- **Overlay** = personal patch set maintained in this repo

The goal is to keep personal behavior customizations without forking your daily usage model.

## What problem it solves

This project is designed for the common pain point:

1. OpenClaw upstream evolves quickly.
2. Personal patches can break after updates.
3. Manual cherry-pick/rebuild is slow and risky.

So this repo provides:

- compatibility gating (`openclawVersion + commitSha`)
- one-command apply / rollback
- fail-safe behavior on mismatch (no destructive writes)

## Who it is for

### Regular users (npm/global install)
You want to keep using installed OpenClaw, then apply personal overlay artifact safely.

### Source developers
You maintain a local OpenClaw source tree and want to apply patch queues via `git am`.

---

## Quick start (minimum commands)

### Regular mode (default)

```bash
bin/openclaw-personal status
bin/openclaw-personal apply
bin/openclaw-personal rollback
```

What regular mode does today:

- detects local OpenClaw install
- checks compatibility matrix
- downloads latest release artifact (or uses `--artifact`)
- applies payload with backup + install-state tracking
- rollback restores backed-up files from last apply

### Source mode (`--source`)

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

Source mode uses patch queues under `patches/*` and `scripts/apply-personal-patch.sh`.

---

## Current status

### Implemented

- CLI wrapper: `bin/openclaw-personal` (`status/apply/rollback`)
- Regular-mode compatibility-gated apply/rollback
- Source-mode patch apply/rollback scripts
- Overlay artifact builder (`scripts/build-dist-overlay.sh`)
- Compatibility manifest validation (`scripts/validate-compatibility.py`)
- CI workflow for validation, upstream smoke packaging, artifacts, tag release assets

### In progress / planned

- richer regular-mode lifecycle helpers (for example, explicit service restart orchestration)
- wider compatibility matrix coverage across more upstream commits/versions
- stronger live contract checks beyond current smoke scope

(If something is not listed in **Implemented**, treat it as not guaranteed yet.)

---

## Compatibility & Safety

Compatibility key is strict and two-dimensional:

- `openclawVersion`
- `commitSha`

Both must match an entry in `compatibility.json`.

Safety behavior:

- if local install is incompatible, apply exits non-zero
- if artifact target metadata mismatches local install, apply exits non-zero
- in both mismatch cases, the script is fail-safe: **no system modification is performed**

This avoids false-positive compatibility when version strings are reused across different commits.

---

## Patch Scope (default overlay)

Default patch queue (non-experimental) currently focuses on:

- command handling that avoids blocking behavior in control flow
- status/stop fast-path improvements
- sub-session/control-lane routing improvements for command handling

These are represented by the top-level patches in:

- `patches/083298ab9da9-to-91e0ffcfd080/*.patch`

### ZMQ policy

ZMQ/ZeroMQ exec-supervisor patches are **not** part of the default queue.

- excluded by default policy (`compatibility.json`)
- kept as optional experimental history under:
  - `patches/083298ab9da9-to-91e0ffcfd080/experimental-zmq/`

So default apply/rollback paths remain deterministic without requiring ZMQ runtime changes.

---

## CI & Artifacts

Workflow: `.github/workflows/overlay-ci.yml`

Current workflow does:

1. validate compatibility matrix
2. run CLI tests
3. run Atlas contract smoke script
4. checkout pinned upstream OpenClaw commit
5. apply overlay patch set
6. run upstream smoke tests (**non-blocking**)
7. build `dist-overlay.tar.gz` + checksum
8. upload artifacts
9. on `v*` tags, publish release assets

### About “non-blocking smoke tests”

`continue-on-error: true` means smoke failures are reported but do not fail the entire workflow job.

- It is an **early warning signal**, not a release-quality guarantee.
- You should still read logs and validate before trusting a candidate for production use.

---

## Mode difference summary

- **Regular mode**: patch an installed OpenClaw using release artifact + compatibility gate.
- **Source mode**: patch a source checkout using `git am` queue and local build/install flow.

Use regular mode if you do not want to maintain a source fork.
Use source mode if you actively develop/rebase patches.

---

## Repository map

- `bin/openclaw-personal` — user CLI
- `compatibility.json` — compatibility matrix + policy
- `patches/` — patch sets (default + experimental-zmq)
- `scripts/` — apply/rollback/build/validate helpers
- `tests/` — CLI behavior tests
- `docs/` — regular-user and developer guides
