#!/usr/bin/env bash
set -euo pipefail
TARGET_REPO="${1:-$HOME/openclaw-src}"
OVERLAY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPAT="$OVERLAY_DIR/compatibility.json"
base=$(python3 - <<PY
import json
print(json.load(open('$COMPAT'))['supported'][0]['upstreamBaseCommit'])
PY
)
cd "$TARGET_REPO"
git am --abort >/dev/null 2>&1 || true
git reset --hard "$base"
pnpm -s build
npm install -g . --prefix ~/.local
systemctl --user restart openclaw-gateway.service || true
echo "[OK] rolled back to base $base"
