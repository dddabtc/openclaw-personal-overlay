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

GATEWAY_JS="$INSTALL_ROOT/dist/gateway-cli-C0JkZ7Xf.js"
if [[ ! -f "$GATEWAY_JS" ]]; then
  # Try to find gateway-cli-*.js dynamically
  GATEWAY_JS="$(find "$INSTALL_ROOT/dist" -maxdepth 1 -name 'gateway-cli-*.js' | head -1)"
fi
if [[ -z "$GATEWAY_JS" || ! -f "$GATEWAY_JS" ]]; then
  echo "[ERR] cannot find gateway-cli JS bundle in dist/" >&2
  exit 3
fi

echo "[patch-dist-cron-timeout] target: $GATEWAY_JS"

# The pattern: AGENT_TURN_SAFETY_TIMEOUT_MS = 60 * 6e4
# Replace with: AGENT_TURN_SAFETY_TIMEOUT_MS = 360 * 6e4  (6 hours)
OLD_PATTERN='AGENT_TURN_SAFETY_TIMEOUT_MS = 60 \* 6e4'
NEW_VALUE='AGENT_TURN_SAFETY_TIMEOUT_MS = 360 * 6e4'

if ! grep -q "$OLD_PATTERN" "$GATEWAY_JS"; then
  if grep -q 'AGENT_TURN_SAFETY_TIMEOUT_MS = 360 \* 6e4' "$GATEWAY_JS"; then
    echo "[OK] already patched (360 * 6e4)"
    exit 0
  fi
  echo "[ERR] cannot find AGENT_TURN_SAFETY_TIMEOUT_MS pattern in gateway JS" >&2
  echo "      expected: $OLD_PATTERN" >&2
  exit 4
fi

# Backup
cp "$GATEWAY_JS" "${GATEWAY_JS}.bak-cron-timeout"

sed -i "s/$OLD_PATTERN/$NEW_VALUE/" "$GATEWAY_JS"

if grep -q 'AGENT_TURN_SAFETY_TIMEOUT_MS = 360 \* 6e4' "$GATEWAY_JS"; then
  echo "[OK] patched AGENT_TURN_SAFETY_TIMEOUT_MS: 60*6e4 → 360*6e4 (1h → 6h)"
else
  echo "[ERR] sed replacement did not take effect" >&2
  mv "${GATEWAY_JS}.bak-cron-timeout" "$GATEWAY_JS"
  exit 5
fi
