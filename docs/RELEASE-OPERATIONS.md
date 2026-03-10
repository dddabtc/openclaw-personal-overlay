# Release Operations

This document is the executable runbook for maintaining `openclaw-personal-overlay` across upstream upgrades.

## Goals

1. Release via GitHub Actions, not by manually uploading local binaries.
2. Treat release CI as a hard gate: no green gate, no release.
3. When CI fails, analyze in a temp dir and compare against the last known-good overlay patchset.
4. Validate source-level fixes in temp dirs first, then on host `192.168.1.193`, then re-run the release workflow.

## Normal release loop

### Step 1: repo CI gate

For a target compatibility entry, the release gate must execute all of the following:

- fresh upstream clone at the exact target commit
- `git am` of the patch queue
- targeted regression tests
- upstream build
- overlay artifact build
- export validation
- release artifact validation
- installer smoke tests

Use:

```bash
scripts/ci-release-gate.sh \
  --version <openclaw-version> \
  --commit <upstream-commit-sha> \
  --patch-dir <patch-set-dir>
```

This script is the source of truth for release-time validation.

### Step 2: publish only through GitHub Actions

After `scripts/ci-release-gate.sh` is green locally/in temp, publish through the repo workflow:

- push source changes to `main`
- manually trigger `.github/workflows/release.yml`
- do **not** hand-upload `dist-overlay.tar.gz`

The release workflow must be allowed to rebuild and republish the artifact itself.

## Failure loop

When `ci.yml` or `release.yml` fails, do **not** patch production first.

### Step A: local failure detection

The local OpenClaw cron job `overlay-release-watch` is expected to:

- watch recent runs of `ci` and `release`
- on failure, create a temp-dir analysis
- never auto-publish
- never modify production runtime directories

### Step B: temp-dir regression analysis

Run:

```bash
scripts/analyze-upstream-regression.sh --target-version <openclaw-version>
```

This report must answer:

- what changed upstream
- what changed in patch inventory
- which previously working patches disappeared
- whether the current patch queue still clean-applies

The report is the required input to any remediation work.

### Step C: source-level remediation in temp only

In a temp dir:

- reconstruct why the previous overlay worked
- compare previous patch subjects vs current patch subjects
- port missing behavior forward with source-level patches
- add/extend regression tests

Do not modify production installs during this phase.

### Step D: environment validation on 193

Before re-triggering release, validate on host `192.168.1.193` in `/tmp`:

- install a local Node/pnpm toolchain if needed
- rerun `scripts/ci-release-gate.sh`
- if needed, run extra temp-dir checks for build/release behavior

Only after 193 validation is clean should the release workflow be manually triggered again.

## Required regression coverage

At minimum, the patch queue must preserve tests covering:

- Telegram control fast-path (`/status`, `/stop`, command mention forms)
- main-session exec defaults that must work without extra config
- abortable transient retry behavior
- release placeholder guards (for example `__PERSONAL_BUILD_DATE__` must never leak into release payload)

## Apply-only rule

Overlay goals that are expected to be runtime defaults must not depend on manual post-apply config edits.

If a feature only works after editing config by hand, mark it as **not release-ready** and fix it in source/patches first.

## Final production validation

After a successful release, validate on the designated clean target host by:

1. updating to the upstream OpenClaw release
2. applying the published overlay release
3. verifying the overlay goals in a real runtime

This final host validation is the last gate before considering the release fully closed.
