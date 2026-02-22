#!/usr/bin/env bash
set -euo pipefail
TARGET_REPO="${1:-$HOME/openclaw-src}"
OVERLAY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPAT="$OVERLAY_DIR/compatibility.json"

if [[ ! -d "$TARGET_REPO/.git" ]]; then
  echo "[ERR] target repo not found: $TARGET_REPO" >&2
  exit 2
fi

current="$(git -C "$TARGET_REPO" rev-parse HEAD)"

base="$(python3 - <<PY
import json
cur="$current"
with open('$COMPAT','r',encoding='utf-8') as f:
    d=json.load(f)
for e in d.get('supported',[]):
    if e.get('status') == 'deprecated':
        continue
    if e.get('overlayHeadCommit') == cur:
        print(e.get('upstreamBaseCommit',''))
        raise SystemExit(0)
    if e.get('upstreamBaseCommit') == cur:
        print(cur)
        raise SystemExit(0)
print('')
PY
)"

if [[ -z "$base" ]]; then
  echo "[ERR] cannot determine rollback base for current commit: $current" >&2
  echo "      no matching overlayHeadCommit/upstreamBaseCommit in compatibility matrix" >&2
  exit 3
fi

cd "$TARGET_REPO"
git am --abort >/dev/null 2>&1 || true

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[ERR] working tree is dirty; commit/stash first" >&2
  exit 4
fi

git reset --hard "$base"

if [[ "${CI:-}" == "true" || "${OVERLAY_CI_ONLY_APPLY:-0}" == "1" ]]; then
  echo "[OK] CI mode detected; skipping local build/install/restart"
  exit 0
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[ERR] pnpm not found; cannot build rolled-back source" >&2
  exit 6
fi

pnpm -s build
npm install -g . --prefix ~/.local
if command -v systemctl >/dev/null 2>&1; then
  systemctl --user restart openclaw-gateway.service || true
fi
echo "[OK] rolled back to base $base"
