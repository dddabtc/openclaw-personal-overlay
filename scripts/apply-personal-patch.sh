#!/usr/bin/env bash
set -euo pipefail
TARGET_REPO="${1:-$HOME/openclaw-src}"
OVERLAY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPAT="$OVERLAY_DIR/compatibility.json"
if [[ ! -d "$TARGET_REPO/.git" ]]; then
  echo "[ERR] target repo not found: $TARGET_REPO" >&2
  exit 2
fi

cd "$TARGET_REPO"
current=$(git rev-parse HEAD)

patch_dir_rel=$(python3 - <<PY
import json
cur="$current"
with open('$COMPAT','r',encoding='utf-8') as f:
    d=json.load(f)
for e in d.get('supported',[]):
    if e.get('upstreamBaseCommit') == cur and e.get('patchSetDir'):
        print(e['patchSetDir'])
        break
PY
)

if [[ -z "$patch_dir_rel" ]]; then
  echo "[ERR] incompatible base commit"
  echo "  current : $current"
  echo "  no matching upstreamBaseCommit in compatibility matrix"
  exit 3
fi

patch_dir="$OVERLAY_DIR/$patch_dir_rel"
if [[ ! -d "$patch_dir" ]]; then
  echo "[ERR] patch directory missing: $patch_dir" >&2
  exit 5
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[ERR] working tree is dirty; commit/stash first" >&2
  exit 4
fi

git am "$patch_dir"/*.patch
echo "[OK] patches applied"

if [[ "${CI:-}" == "true" || "${OVERLAY_CI_ONLY_APPLY:-0}" == "1" ]]; then
  echo "[OK] CI mode detected; skipping local build/install/restart"
  exit 0
fi

pnpm -s build
npm install -g . --prefix ~/.local
systemctl --user restart openclaw-gateway.service || true
echo "[OK] build/install/restart done"
