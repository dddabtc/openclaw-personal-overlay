# openclaw-personal-overlay

Personal overlay for OpenClaw using a **Base + Overlay** model.

- Base: official OpenClaw (users can update freely)
- Overlay: compatibility-gated personal patch set

## Repository URL

https://github.com/dddabtc/openclaw-personal-overlay

## Current delivery

- Source overlay (ready)
- Binary overlay (planned)

## Commands

Use the wrapper command:

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

Direct scripts are also available:

```bash
scripts/apply-personal-patch.sh ~/openclaw-src
scripts/rollback-personal-patch.sh ~/openclaw-src
```

## Compatibility policy

Compatibility is checked by:

1. `openclawVersion`
2. `commitSha`

If the target repo is not compatible, apply exits safely with an error.

## CI

`.github/workflows/overlay-ci.yml` currently validates:

1. checkout upstream OpenClaw
2. apply overlay
3. run smoke tests
4. upload artifacts

## Roadmap

- auto-track upstream releases and regenerate patch queue
- publish release bundles (`tar.gz` + `sha256`)
- add Atlas Memory smoke checks (`memory_search`, `memory_get`)
- binary overlay distribution path for regular npm users
