#!/usr/bin/env bash
set -euo pipefail

WORK_DIR="${1:-}"
OUT_DIR="${2:-dist-overlay}"
OVERLAY_VERSION="${OVERLAY_VERSION:-$(git rev-parse --short HEAD)}"
TARGET_VERSION="${TARGET_VERSION:-}"
TARGET_COMMIT="${TARGET_COMMIT:-}"

if [[ -z "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
  echo "usage: $0 <patched-openclaw-dir> [out-dir]" >&2
  exit 2
fi

mkdir -p "$OUT_DIR/payload"

if [[ -d "$WORK_DIR/dist" ]]; then
  mkdir -p "$OUT_DIR/payload/dist"
  rsync -a "$WORK_DIR/dist/" "$OUT_DIR/payload/dist/"
fi
for f in package.json pnpm-lock.yaml; do
  [[ -f "$WORK_DIR/$f" ]] && cp "$WORK_DIR/$f" "$OUT_DIR/payload/$f"
done

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
  find payload -type f -print0 | xargs -0 sha256sum > checksums.sha256
  sha256sum metadata.json >> checksums.sha256
)

tar -czf "$OUT_DIR.tar.gz" -C "$(dirname "$OUT_DIR")" "$(basename "$OUT_DIR")"
sha256sum "$OUT_DIR.tar.gz" > "$OUT_DIR.tar.gz.sha256"

echo "built: $OUT_DIR.tar.gz"
