# Changelog

All notable changes to this project will be documented in this file.

---

## [overlay-v2026.2.21-2] — 2026-02-21 (latest)

### Features
- `feat(status)`: add patch 0022 — resolve target session context in control-plane fast path
- `feat(exec)`: enforce main-session guard for ssh-style tool calls

### Bug Fixes
- `fix(apply)`: resolve install root from `which openclaw` first, warn on duplicates
- `fix(apply)`: use staging dir for atomic overlay apply
- `fix(apply)`: protect installed package.json and accept positional artifact path
- `fix(patch-0022)`: remove debug log from status control-plane fix
- `fix(build)`: generate diff-only dist overlay against baseline
- `fix(ci)`: smoke test should only run build, not vitest
- `fix(ci)`: dynamically resolve upstream commit from compatibility.json
- `fix(ci)`: remove workflow heredocs and make auto-merge best-effort
- `fix(cli)`: robust release artifact fetch and unknown-commit handling
- `fix(autofix)`: create labels lazily and avoid issue-create hard fail
- `fix(autofix)`: remove yaml-breaking heredoc in issue body
- `fix(rollback)`: verify backup integrity before restore
- `fix(scripts)`: harden overlay apply/rollback and stdin handling
- `fix(auto-compat)`: yaml-safe pr-verify version lookup
- `fix(auto-compat)`: remove yaml-breaking heredoc in pr-verify
- `fix`: add pnpm build step before dist overlay packaging

### Tests
- `test`: add rollback, corrupt artifact, and unknown-version tests
- `test(cli)`: cover positional apply and package.json protection

### CI/CD
- `ci(release)`: trigger release job for overlay-v tags
- `ci(auto-compat)`: use build-based required smoke to avoid upstream test drift
- `ci(auto-compat)`: restore PR flow with auto-merge
- `ci(auto-compat)`: switch to direct auto-commit to main
- `ci(auto-compat)`: add PR verify+auto-merge workflow for auto branches
- `ci(auto-compat)`: enforce all-green smoke gate
- `ci(auto-compat)`: track npm latest version (incl -patch suffix)
- `ci`: add autofix PR auto-merge workflow + manual dispatch hooks
- `ci`: add workflow failure auto-dispatch to GitHub Copilot agent

### Chores
- `chore(compat)`: add candidate support for v2026.2.21-2 (#3)
- `chore(compat)`: restore active support for 2026.2.21 alongside 2026.2.21-2
- `chore(compat)`: deprecate 2026.2.21 in favor of 2026.2.21-2
- `chore(compat)`: remove placeholder deprecated entry oc-legacy-sample
- `chore(patches)`: backport exec main-session ssh guard to autocompat queues

### Docs
- `docs`: remove completed items from IMPLEMENTATION.md Planned next

---

## [overlay-v2026.2.21] — 2026-02-21

### Features
- `feat(cli)`: resolve version-matched release tag for apply

### CI/CD
- `ci(auto-compat)`: enable auto-merge after successful validation

### Bug Fixes
- `fix(auto-compat)`: enable clean PR commits and restrict paths

### Chores
- `chore(compat)`: add candidate support for v2026.2.21 (#1)

---

## [overlay-v2026.2.20] — 2026-02-20

### Features
- `feat`: bootstrap personal overlay repo from current personal branch
- `feat(overlay)`: add implementation doc, user CLI wrapper, and improved CI/artifacts
- `feat`: add regular-user binary overlay flow and release automation

### Bug Fixes
- `fix(ci)`: simplify support rollover workflow yaml-safe scripts
- `fix(ci)`: resolve yaml parse issue in support rollover workflow
- `fix(ci)`: correct auto-compat yaml syntax
- `fix(ci)`: make upstream smoke tests non-blocking
- `fix(ci)`: skip install scripts in upstream dependency install
- `fix(ci)`: install deps before upstream smoke tests
- `fix(ci)`: skip local install path in CI apply script
- `fix(ci)`: set git identity before applying patch series
- `fix(ci)`: set git identity before applying patch
- `fix(ci)`: pin upstream checkout to compatible base commit
- `fix(ci)`: correct heredoc indentation in workflow
- `fix(ci)`: remove invalid job output expression
- `fix(overlay)`: harden apply/rollback compatibility and cleanup

### CI/CD
- `ci`: add overlay apply-and-smoke workflow draft
- `ci`: add auto-compat PR workflow for new openclaw releases
- `ci`: add support branch+release rollover (keep latest 20)
- `ci(auto-compat)`: harden triggers and add self-test push path
- `ci(auto-compat)`: make smoke non-blocking and report outcome

### Policy / Docs
- `policy`: exclude ZMQ patches from default overlay queue
- `docs`: rewrite README to reflect current overlay behavior
- `docs`: clarify patch behavior and make ZMQ default-off policy explicit
