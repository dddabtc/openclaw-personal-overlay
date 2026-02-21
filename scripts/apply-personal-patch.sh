#!/usr/bin/env bash
set -euo pipefail
TARGET_REPO="${1:-$HOME/openclaw-src}"
OVERLAY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPAT="$OVERLAY_DIR/compatibility.json"
if [[ ! -d "$TARGET_REPO/.git" ]]; then
  echo "[ERR] target repo not found: $TARGET_REPO" >&2
  exit 2
fi
base=$(python3 - <<PY
import json
print(json.load(open('$COMPAT'))['supported'][0]['upstreamBaseCommit'])
PY
)
patch_dir_rel=$(python3 - <<PY
import json
print(json.load(open('$COMPAT'))['supported'][0]['patchSetDir'])
PY
)
patch_dir="$OVERLAY_DIR/$patch_dir_rel"
cd "$TARGET_REPO"
current=$(git rev-parse HEAD)
if [[ "$current" != "$base" ]]; then
  echo "[ERR] incompatible base commit"
  echo "  expected: $base"
  echo "  current : $current"
  exit 3
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "[ERR] working tree is dirty; commit/stash first" >&2
  exit 4
fi
git am "$patch_dir"/*.patch
echo "[OK] patches applied"
pnpm -s build
npm install -g . --prefix ~/.local
systemctl --user restart openclaw-gateway.service || true
echo "[OK] build/install/restart done"
