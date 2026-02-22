# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

**TL;DR**: This repo is a **Base + Overlay** layer for OpenClaw personal patches. You keep using official OpenClaw updates, then apply or rollback personal changes with one command. Every apply is guarded by `openclawVersion + commitSha`; if not compatible, it fails safe and does not modify your install.

## What this patch actually changes (personal behavior layer)

This overlay is focused on control-lane reliability and personal UX behavior:

- **Command-word anti-blocking**: command words are handled in a separate control lane, so they do not compete with the main session lane.
- **`/status` and `/stop` fast path with strict match**: these control commands are matched strictly and handled immediately.
- **Tool-call default routing to sub-session**: tool calls default to sub-session routing unless explicitly forced to the main session.
- **Status banner customization**: status output includes personal-build markers (for example, `PERSONAL BUILD` and byline customization).

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

- command-word anti-blocking (command words are not multiplexed on the same lane as normal main-session traffic)
- `/status` + `/stop` strict-match fast-path control handling
- tool-call default routing to sub-session (unless explicitly forced to main-session)
- status banner personalization (`PERSONAL BUILD` / byline customization)

These are represented by the top-level patches in:

- `patches/083298ab9da9-to-91e0ffcfd080/*.patch`

### Optional experimental ZMQ group (disabled by default)

ZMQ/ZeroMQ exec-supervisor patches exist in this repo as an **optional experimental group**, but they are **disabled by default**.

- **Default apply path excludes ZMQ group**:
  - policy: `compatibility.json` → `defaultOverlayPolicy.exclude`
  - mechanism: `scripts/apply-personal-patch.sh` applies only `patchSetDir/*.patch` (top-level), so `experimental-zmq/` is not included.
- **Optional group location**:
  - `patches/083298ab9da9-to-91e0ffcfd080/experimental-zmq/`

Current state: there is no first-class CLI switch to apply the experimental ZMQ group automatically; opt-in is manual today (**TODO**: add explicit optional-group flags/workflow if needed).

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

### Auto-compat PR workflow

This repo also includes `.github/workflows/auto-compat.yml` for automatic compatibility candidate generation:

- discovers latest `openclaw/openclaw` release tag + commit on a schedule
- skips if already present in `compatibility.json`
- clones the current patch queue into a new candidate patch-set dir
- runs apply + smoke tests + artifact build against the new upstream commit
- if all checks pass, opens a PR that updates `compatibility.json` (manual review still required)

This gives you GitHub automation without directly auto-merging compatibility into `main`. 

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
- `patches/` — patch sets (default top-level queue + optional experimental `experimental-zmq/` group)
- `scripts/` — apply/rollback/build/validate helpers
- `tests/` — CLI behavior tests
- `docs/` — regular-user and developer guides
