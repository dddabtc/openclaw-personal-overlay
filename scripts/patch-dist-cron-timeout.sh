#!/usr/bin/env bash
# Runtime patch: raise AGENT_TURN_SAFETY_TIMEOUT_MS from 1 hour to 6 hours
# in the compiled gateway dist.  This is the binary equivalent of patch 0010.
#
# Usage: scripts/patch-dist-cron-timeout.sh [install-root]
#   install-root defaults to the detected openclaw npm installation.
set -euo pipefail

SELF_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SELF_DIR/.." && pwd)"

# Reuse install-root resolution from openclaw-personal
resolve_install_root() {
  local oc_bin
  oc_bin="$(command -v openclaw 2>/dev/null || true)"
  if [[ -n "$oc_bin" ]]; then
    local real_bin
    real_bin="$(readlink -f "$oc_bin" 2>/dev/null || echo "$oc_bin")"
    local dir
    dir="$(dirname "$real_bin")"
    local parent
    parent="$(cd "$dir/.." 2>/dev/null && pwd || true)"
    if [[ -n "$parent" && -f "$parent/lib/node_modules/openclaw/package.json" ]]; then
      echo "$parent/lib/node_modules/openclaw"
      return 0
    fi
    if [[ -f "$dir/package.json" ]]; then echo "$dir"; return 0; fi
    if [[ -f "$parent/package.json" ]]; then echo "$parent"; return 0; fi
  fi
  local npm_root
  npm_root="$(npm root -g 2>/dev/null || true)"
  [[ -n "$npm_root" && -f "$npm_root/openclaw/package.json" ]] && { echo "$npm_root/openclaw"; return 0; }
  echo ""
}

INSTALL_ROOT="${1:-$(resolve_install_root)}"
if [[ -z "$INSTALL_ROOT" || ! -d "$INSTALL_ROOT/dist" ]]; then
  echo "[ERR] cannot locate openclaw dist/ at: ${INSTALL_ROOT:-<not found>}" >&2
  exit 2
fi

# Locate the JS bundle that defines AGENT_TURN_SAFETY_TIMEOUT_MS.
# Upstream has moved this constant between bundles across releases
# (gateway-cli-*.js → server.impl-*.js), so we search dist/ rather than
# hard-coding a filename.
TARGET_JS=""
while IFS= read -r f; do
  if grep -q 'AGENT_TURN_SAFETY_TIMEOUT_MS *=' "$f" 2>/dev/null; then
    TARGET_JS="$f"
    break
  fi
done < <(find "$INSTALL_ROOT/dist" -maxdepth 2 -type f -name '*.js')

if [[ -z "$TARGET_JS" ]]; then
  echo "[ERR] cannot find any dist JS bundle defining AGENT_TURN_SAFETY_TIMEOUT_MS" >&2
  exit 3
fi

echo "[patch-dist-cron-timeout] target: $TARGET_JS"

# Already at >=6h?  Accept any multiplier >= 360 against the 6e4 unit.
CURRENT_LINE="$(grep -o 'AGENT_TURN_SAFETY_TIMEOUT_MS *= *[0-9]\+ *\* *6e4' "$TARGET_JS" | head -1 || true)"
if [[ -n "$CURRENT_LINE" ]]; then
  CURRENT_MULT="$(echo "$CURRENT_LINE" | grep -o '[0-9]\+ *\* *6e4' | grep -o '^[0-9]\+')"
  if [[ -n "$CURRENT_MULT" && "$CURRENT_MULT" -ge 360 ]]; then
    echo "[OK] already at ${CURRENT_MULT} * 6e4 (>= 6h), no patch needed"
    exit 0
  fi
fi

# Original pattern: 60 * 6e4 (1h).  Replace with 360 * 6e4 (6h).
OLD_PATTERN='AGENT_TURN_SAFETY_TIMEOUT_MS = 60 \* 6e4'
NEW_VALUE='AGENT_TURN_SAFETY_TIMEOUT_MS = 360 * 6e4'

if ! grep -q "$OLD_PATTERN" "$TARGET_JS"; then
  echo "[ERR] cannot find AGENT_TURN_SAFETY_TIMEOUT_MS pattern in $TARGET_JS" >&2
  echo "      expected: $OLD_PATTERN" >&2
  echo "      observed: ${CURRENT_LINE:-<none>}" >&2
  exit 4
fi

cp "$TARGET_JS" "${TARGET_JS}.bak-cron-timeout"
sed -i "s/$OLD_PATTERN/$NEW_VALUE/" "$TARGET_JS"

if grep -q 'AGENT_TURN_SAFETY_TIMEOUT_MS = 360 \* 6e4' "$TARGET_JS"; then
  echo "[OK] patched AGENT_TURN_SAFETY_TIMEOUT_MS: 60*6e4 → 360*6e4 (1h → 6h)"
else
  echo "[ERR] sed replacement did not take effect" >&2
  mv "${TARGET_JS}.bak-cron-timeout" "$TARGET_JS"
  exit 5
fi
