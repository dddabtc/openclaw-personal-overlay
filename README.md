# openclaw-personal-overlay

Base/Overlay delivery model for personal OpenClaw patches.

## Quick start

```bash
./scripts/apply-personal-patch.sh /path/to/openclaw-src
```

## Rollback

```bash
./scripts/rollback-personal-patch.sh /path/to/openclaw-src
```

## Compatibility gate

`compatibility.json` defines supported official base commit(s). If target commit does not match, apply script exits with incompatibility error.
