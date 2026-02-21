# Regular User Guide

## Apply overlay

```bash
bin/openclaw-personal apply
```

Optional artifact override:

```bash
bin/openclaw-personal apply --artifact /path/to/dist-overlay.tar.gz
bin/openclaw-personal apply --artifact https://github.com/dddabtc/openclaw-personal-overlay/releases/download/vX.Y.Z/dist-overlay.tar.gz
```

## Check status

```bash
bin/openclaw-personal status
```

Shows:
- detected install root
- local OpenClaw version + commit
- compatibility match result
- installed overlay version (if present)

## Rollback

```bash
bin/openclaw-personal rollback
```

Rollback restores last baseline backup captured during apply.

## Troubleshooting

- **"openclaw npm installation not found"**
  - confirm `openclaw` is installed globally and available in PATH.
- **"incompatible local openclaw build"**
  - update overlay release or switch to supported OpenClaw build.
- **"artifact incompatible"**
  - use an artifact that matches both version and commit.
- **Checksum failure**
  - artifact is corrupted or tampered; re-download.
