#!/usr/bin/env bash
set -euo pipefail

ARTIFACT="${1:-dist-overlay.tar.gz}"
EXPECTED_VERSION="${2:-2026.3.7}"
EXPECTED_OVERLAY="overlay-v${EXPECTED_VERSION}"

WORK=/tmp/overlay-validate-$$
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK"

tar -xzf "$ARTIFACT" -C "$WORK"
META="$WORK/dist-overlay/metadata.json"
PAYLOAD="$WORK/dist-overlay/payload"

python3 - <<PY
import json, pathlib, sys
meta = json.loads(pathlib.Path('$META').read_text())
assert meta['overlayVersion'] == '$EXPECTED_OVERLAY', f"overlayVersion mismatch: {meta['overlayVersion']}"
assert meta['targetOpenclawVersion'] == '$EXPECTED_VERSION', f"targetOpenclawVersion mismatch: {meta['targetOpenclawVersion']}"
print('[ok] metadata checks')
PY

mkdir -p "$WORK/clean"
(cd "$WORK/clean" && npm_config_loglevel=error npm pack openclaw@${EXPECTED_VERSION} >/dev/null && tar xzf openclaw-${EXPECTED_VERSION}.tgz)

# Dist payload scope checks:
# - In diff mode: entry.js must never be overlaid
# - In full-replace mode (FULL_REPLACE=1): entry.js MUST be present
# - new files (not in upstream dist) are allowed only when transitively imported
#   by another payload JS file (dependency closure), i.e. no orphan extras.
python3 - <<PY
import pathlib, re, os
base = pathlib.Path('$WORK/clean/package/dist')
payload = pathlib.Path('$PAYLOAD/dist')
base_set = {p.relative_to(base).as_posix() for p in base.rglob('*') if p.is_file()}
payload_files = [p.relative_to(payload).as_posix() for p in payload.rglob('*') if p.is_file()]
payload_set = set(payload_files)
full_replace = os.environ.get('FULL_REPLACE', '0') == '1'
if full_replace:
    assert 'entry.js' in payload_set, 'FULL_REPLACE mode requires entry.js in payload'
else:
    assert 'entry.js' not in payload_set, 'entry.js must not be overlaid in diff mode'

# In full-replace mode, skip orphan check (all files are intentionally included)
extra = set() if full_replace else {p for p in payload_set if p not in base_set}
if extra:
    import_re = re.compile(r"(?:import|export)\s+(?:[^'\";]+?from\s+)?['\"](\.[^'\"]+)['\"]|import\(['\"](\.[^'\"]+)['\"]\)")
    reverse = {e:set() for e in extra}
    for rel in payload_set:
        if not rel.endswith(('.js','.mjs','.cjs')):
            continue
        text = (payload / rel).read_text(encoding='utf-8', errors='ignore')
        for m in import_re.finditer(text):
            spec = m.group(1) or m.group(2)
            if not spec:
                continue
            cand = (pathlib.Path(rel).parent / spec).as_posix()
            cands = [cand, cand+'.js', cand+'.mjs', cand+'.cjs', (pathlib.Path(cand)/'index.js').as_posix(), (pathlib.Path(cand)/'index.mjs').as_posix()]
            for c in cands:
                full = (payload / c).resolve()
                if not str(full).startswith(str(payload.resolve())):
                    continue
                if not full.exists() or not full.is_file():
                    continue
                relc = full.relative_to(payload).as_posix()
                if relc in reverse:
                    reverse[relc].add(rel)
    orphan = sorted([k for k,v in reverse.items() if not v])
    assert not orphan, 'overlay payload contains orphan new dist files: ' + ', '.join(orphan[:20])
print('[ok] dist payload scope checks')
PY

# package.json exports sanity (if package.json included)
if [[ -f "$PAYLOAD/package.json" ]]; then
python3 - <<PY
import json, pathlib
pkg = json.loads(pathlib.Path('$PAYLOAD/package.json').read_text())
dist = pathlib.Path('$PAYLOAD/dist')

def walk(v):
    if isinstance(v, str):
        yield v
    elif isinstance(v, dict):
        for vv in v.values():
            yield from walk(vv)

missing=[]
for tgt in walk(pkg.get('exports', {})):
    if not tgt.startswith('./dist/'):
        continue
    rel=tgt[len('./dist/'):]
    if not (dist/rel).exists():
        missing.append(tgt)
assert not missing, 'exports point to missing dist files: ' + ', '.join(missing)
print('[ok] package exports checks')
PY
fi

echo "[ok] validate-release complete"
