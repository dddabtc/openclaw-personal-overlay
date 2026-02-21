# Developer Guide (Source Patch Flow)

## Prereqs

- clone `openclaw/openclaw` to `~/openclaw-src`
- clean working tree
- `pnpm` + Node 22

## Apply patch queue

```bash
bin/openclaw-personal apply --source ~/openclaw-src
```

The script checks current HEAD against compatibility matrix `upstreamBaseCommit` entries and applies matching `patchSetDir` via `git am`.

## Source status / rollback

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## Build binary overlay artifact

After a successful patched build in a working tree:

```bash
scripts/build-dist-overlay.sh ~/openclaw-src dist-overlay
```

Outputs:
- `dist-overlay/` (payload + metadata + checksums)
- `dist-overlay.tar.gz`
- `dist-overlay.tar.gz.sha256`

## Compatibility hygiene

```bash
scripts/validate-compatibility.py compatibility.json
```

CI fails if compatibility keys are malformed or duplicated.


## Experimental layers

Default `bin/openclaw-personal apply --source ...` only applies `patchSetDir/*.patch` top-level patches.
ZMQ/ZeroMQ patches are intentionally parked under `patches/.../experimental-zmq/` and are not part of the default queue.
