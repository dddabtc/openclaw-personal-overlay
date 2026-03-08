#!/usr/bin/env bash
set -euo pipefail

WORK_DIR="${1:-}"
OUT_DIR="${2:-dist-overlay}"
BASELINE_DIR="${3:-${BASELINE_DIR:-}}"
TARGET_VERSION="${TARGET_VERSION:-}"
TARGET_OPENCLAW_VERSION="${TARGET_OPENCLAW_VERSION:-}"
if [[ -n "$TARGET_OPENCLAW_VERSION" ]]; then
  TARGET_VERSION="$TARGET_OPENCLAW_VERSION"
fi
if [[ -n "$TARGET_OPENCLAW_VERSION" ]]; then
  OVERLAY_VERSION="${OVERLAY_VERSION:-overlay-v${TARGET_OPENCLAW_VERSION}}"
else
  OVERLAY_VERSION="${OVERLAY_VERSION:-$(git rev-parse --short HEAD)}"
fi
TARGET_COMMIT="${TARGET_COMMIT:-}"
INCLUDE_PACKAGE_JSON="${INCLUDE_PACKAGE_JSON:-0}"
INCLUDE_PNPM_LOCK="${INCLUDE_PNPM_LOCK:-0}"
INCLUDE_NEW_DIST_FILES="${INCLUDE_NEW_DIST_FILES:-0}"
# full-replace mode: copy entire dist, no exclusions, no diff
FULL_REPLACE="${FULL_REPLACE:-1}"
# Legacy diff mode settings (ignored when FULL_REPLACE=1)
EXCLUDE_DIST_FILES_REGEX="${EXCLUDE_DIST_FILES_REGEX:-^(entry\.js|build-info\.json)$}"
INCLUDE_DIST_FILES_REGEX="${INCLUDE_DIST_FILES_REGEX:-\.(js|mjs|cjs|json)$}"

if [[ -z "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
  echo "usage: $0 <patched-openclaw-dir> [out-dir] [baseline-openclaw-dir]" >&2
  exit 2
fi
if [[ ! -d "$WORK_DIR/dist" ]]; then
  echo "[ERR] patched dist directory missing: $WORK_DIR/dist" >&2
  exit 2
fi

if [[ -z "$TARGET_VERSION" || -z "$TARGET_COMMIT" ]]; then
  mapfile -t vals < <(python3 - <<PY
import json, pathlib
p = pathlib.Path("$WORK_DIR") / "package.json"
d = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
print(d.get("version", "unknown"))
print(d.get("gitHead") or d.get("commitSha") or "unknown")
PY
)
  TARGET_VERSION="${TARGET_VERSION:-${vals[0]}}"
  TARGET_COMMIT="${TARGET_COMMIT:-${vals[1]}}"
fi

_tmp_baseline=""
cleanup() {
  if [[ -n "$_tmp_baseline" && -d "$_tmp_baseline" ]]; then
    rm -rf "$_tmp_baseline"
  fi
}
trap cleanup EXIT

if [[ -z "$BASELINE_DIR" ]]; then
  echo "[INFO] BASELINE_DIR not provided; downloading openclaw@${TARGET_VERSION} from npm"
  _tmp_baseline="$(mktemp -d)"
  (
    cd "$_tmp_baseline"
    npm pack --silent "openclaw@${TARGET_VERSION}" >/dev/null
    tar -xzf openclaw-*.tgz
  )
  BASELINE_DIR="$_tmp_baseline/package"
fi
if [[ ! -d "$BASELINE_DIR/dist" ]]; then
  echo "[ERR] baseline dist directory missing: $BASELINE_DIR/dist" >&2
  exit 2
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/payload/dist"

if [[ "$FULL_REPLACE" == "1" ]]; then
  echo "[build-dist-overlay] FULL_REPLACE mode: copying entire dist directory"
  cp -r "$WORK_DIR/dist/"* "$OUT_DIR/payload/dist/"
  file_count=$(find "$OUT_DIR/payload/dist" -type f | wc -l)
  echo "[build-dist-overlay] copied dist files: $file_count"
else
  # Legacy diff mode
  python3 - "$WORK_DIR" "$BASELINE_DIR" "$OUT_DIR" "$INCLUDE_NEW_DIST_FILES" "$EXCLUDE_DIST_FILES_REGEX" "$INCLUDE_DIST_FILES_REGEX" <<'PY'
import pathlib, re, shutil, sys
work_dir = pathlib.Path(sys.argv[1])
baseline_dir = pathlib.Path(sys.argv[2])
out_dir = pathlib.Path(sys.argv[3])
include_new = sys.argv[4] == '1'
exclude_re = re.compile(sys.argv[5]) if sys.argv[5] else None
include_re = re.compile(sys.argv[6]) if sys.argv[6] else None
work_dist = work_dir / 'dist'
base_dist = baseline_dir / 'dist'
out_dist = out_dir / 'payload' / 'dist'

base_files = {p.relative_to(base_dist).as_posix() for p in base_dist.rglob('*') if p.is_file()}
selected = set()
for p in work_dist.rglob('*'):
    if not p.is_file():
        continue
    rel = p.relative_to(work_dist).as_posix()
    if include_re and not include_re.search(rel):
        continue
    if exclude_re and exclude_re.search(rel):
        continue
    if rel in base_files:
        if p.read_bytes() != (base_dist / rel).read_bytes():
            selected.add(rel)
    elif include_new:
        selected.add(rel)

import_re = re.compile(r"(?:import|export)\s+(?:[^'\";]+?from\s+)?['\"](\.[^'\"]+)['\"]|import\(['\"](\.[^'\"]+)['\"]\)")
queue = list(selected)
while queue:
    rel = queue.pop()
    if not rel.endswith(('.js', '.mjs', '.cjs')):
        continue
    text = (work_dist / rel).read_text(encoding='utf-8', errors='ignore')
    for m in import_re.finditer(text):
        spec = m.group(1) or m.group(2)
        if not spec:
            continue
        base = (pathlib.Path(rel).parent / spec)
        cands = [
            base.as_posix(),
            (base.as_posix() + '.js'),
            (base.as_posix() + '.mjs'),
            (base.as_posix() + '.cjs'),
            (base / 'index.js').as_posix(),
            (base / 'index.mjs').as_posix(),
        ]
        for c in cands:
            full = (work_dist / c).resolve()
            if not str(full).startswith(str(work_dist.resolve())):
                continue
            if not full.exists() or not full.is_file():
                continue
            relc = full.relative_to(work_dist).as_posix()
            if include_re and not include_re.search(relc):
                continue
            if exclude_re and exclude_re.search(relc):
                continue
            if relc not in selected:
                selected.add(relc)
                queue.append(relc)

for rel in sorted(selected):
    src = work_dist / rel
    dst = out_dist / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
print(f"[build-dist-overlay] copied dist files: {len(selected)}")
if not selected:
    raise SystemExit('[ERR] no dist files selected; refusing to build empty overlay')
PY
fi

if [[ "$INCLUDE_PACKAGE_JSON" == "1" && -f "$WORK_DIR/package.json" ]]; then
  cp "$WORK_DIR/package.json" "$OUT_DIR/payload/package.json"
fi
if [[ "$INCLUDE_PNPM_LOCK" == "1" && -f "$WORK_DIR/pnpm-lock.yaml" ]]; then
  cp "$WORK_DIR/pnpm-lock.yaml" "$OUT_DIR/payload/pnpm-lock.yaml"
fi

scripts/validate-dist-exports.sh "$OUT_DIR/payload" "$TARGET_VERSION"

cat > "$OUT_DIR/metadata.json" <<JSON
{
  "format": "openclaw-personal-dist-overlay/v1",
  "overlayVersion": "$OVERLAY_VERSION",
  "targetOpenclawVersion": "$TARGET_VERSION",
  "targetCommitSha": "$TARGET_COMMIT",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

(
  cd "$OUT_DIR"
  : > checksums.sha256
  while IFS= read -r -d '' f; do sha256sum "$f" >> checksums.sha256; done < <(find payload -type f -print0)
  sha256sum metadata.json >> checksums.sha256
)

tar -czf "$OUT_DIR.tar.gz" -C "$(dirname "$OUT_DIR")" "$(basename "$OUT_DIR")"
sha256sum "$OUT_DIR.tar.gz" > "$OUT_DIR.tar.gz.sha256"
echo "built: $OUT_DIR.tar.gz"
