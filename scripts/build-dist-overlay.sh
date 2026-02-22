#!/usr/bin/env bash
set -euo pipefail

WORK_DIR="${1:-}"
OUT_DIR="${2:-dist-overlay}"
BASELINE_DIR="${3:-${BASELINE_DIR:-}}"
OVERLAY_VERSION="${OVERLAY_VERSION:-$(git rev-parse --short HEAD)}"
TARGET_VERSION="${TARGET_VERSION:-}"
TARGET_COMMIT="${TARGET_COMMIT:-}"
INCLUDE_PACKAGE_JSON="${INCLUDE_PACKAGE_JSON:-0}"
INCLUDE_PNPM_LOCK="${INCLUDE_PNPM_LOCK:-0}"

if [[ -z "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
  echo "usage: $0 <patched-openclaw-dir> [out-dir] [baseline-openclaw-dir]" >&2
  exit 2
fi

if [[ ! -d "$WORK_DIR/dist" ]]; then
  echo "[ERR] patched dist directory missing: $WORK_DIR/dist" >&2
  exit 2
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/payload"

# Build payload from diff-only dist files when baseline is available.
if [[ -n "$BASELINE_DIR" && -d "$BASELINE_DIR/dist" ]]; then
  mkdir -p "$OUT_DIR/payload/dist"
  python3 - "$BASELINE_DIR/dist" "$WORK_DIR/dist" "$OUT_DIR/payload/dist" <<'PY'
import hashlib, pathlib, shutil, sys

base = pathlib.Path(sys.argv[1])
patched = pathlib.Path(sys.argv[2])
out = pathlib.Path(sys.argv[3])


def digest(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

count = 0
for p in patched.rglob('*'):
    if not p.is_file():
        continue
    rel = p.relative_to(patched)
    b = base / rel
    changed = (not b.exists()) or (digest(p) != digest(b))
    if changed:
        dest = out / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, dest)
        count += 1

print(count)
PY
else
  mkdir -p "$OUT_DIR/payload/dist"
  rsync -a "$WORK_DIR/dist/" "$OUT_DIR/payload/dist/"
fi

if [[ "$INCLUDE_PACKAGE_JSON" == "1" && -f "$WORK_DIR/package.json" ]]; then
  cp "$WORK_DIR/package.json" "$OUT_DIR/payload/package.json"
fi

if [[ "$INCLUDE_PNPM_LOCK" == "1" && -f "$WORK_DIR/pnpm-lock.yaml" ]]; then
  cp "$WORK_DIR/pnpm-lock.yaml" "$OUT_DIR/payload/pnpm-lock.yaml"
fi

if [[ -z "$TARGET_VERSION" || -z "$TARGET_COMMIT" ]]; then
  mapfile -t vals < <(python3 - <<PY
import json
import pathlib
p = pathlib.Path("$WORK_DIR") / "package.json"
d = json.loads(p.read_text(encoding="utf-8"))
print(d.get("version", "unknown"))
print(d.get("gitHead") or d.get("commitSha") or "unknown")
PY
)
  TARGET_VERSION="${TARGET_VERSION:-${vals[0]}}"
  TARGET_COMMIT="${TARGET_COMMIT:-${vals[1]}}"
fi

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
  while IFS= read -r -d '' f; do
    sha256sum "$f" >> checksums.sha256
  done < <(find payload -type f -print0)
  sha256sum metadata.json >> checksums.sha256
)

tar -czf "$OUT_DIR.tar.gz" -C "$(dirname "$OUT_DIR")" "$(basename "$OUT_DIR")"
sha256sum "$OUT_DIR.tar.gz" > "$OUT_DIR.tar.gz.sha256"

echo "built: $OUT_DIR.tar.gz"
