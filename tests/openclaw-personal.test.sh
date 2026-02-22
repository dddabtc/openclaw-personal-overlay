#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT_DIR/bin/openclaw-personal"

fail() { echo "[FAIL] $*"; exit 1; }
pass() { echo "[PASS] $*"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

export HOME="$TMP/home"
mkdir -p "$HOME/.local/lib/node_modules/openclaw/dist"
INSTALL_ROOT="$HOME/.local/lib/node_modules/openclaw"
export OPENCLAW_INSTALL_ROOT="$INSTALL_ROOT"

cat > "$INSTALL_ROOT/package.json" <<'JSON'
{
  "name": "openclaw",
  "version": "2026.2.20",
  "gitHead": "083298ab9da98238c6fb1e008c8994a565427f2a"
}
JSON

echo 'BASELINE' > "$INSTALL_ROOT/dist/banner.txt"

ART="$TMP/art"
mkdir -p "$ART/dist-overlay/payload/dist"
cat > "$ART/dist-overlay/metadata.json" <<'JSON'
{
  "format": "openclaw-personal-dist-overlay/v1",
  "overlayVersion": "v0.1.0",
  "targetOpenclawVersion": "2026.2.20",
  "targetCommitSha": "083298ab9da98238c6fb1e008c8994a565427f2a",
  "builtAt": "2026-02-21T00:00:00Z"
}
JSON

echo 'OVERLAY' > "$ART/dist-overlay/payload/dist/banner.txt"
cat > "$ART/dist-overlay/payload/package.json" <<'JSON'
{
  "name": "openclaw",
  "version": "0.0.0-should-not-overwrite"
}
JSON
(
  cd "$ART/dist-overlay"
  sha256sum payload/dist/banner.txt payload/package.json metadata.json > checksums.sha256
)
tar -czf "$TMP/dist-overlay.tar.gz" -C "$ART" dist-overlay

"$BIN" apply "$TMP/dist-overlay.tar.gz"
[[ "$(cat "$INSTALL_ROOT/dist/banner.txt")" == "OVERLAY" ]] || fail "apply did not update payload"
[[ "$(python3 - "$INSTALL_ROOT/package.json" <<'PY'
import json, sys
print(json.load(open(sys.argv[1]))['version'])
PY
)" == "2026.2.20" ]] || fail "apply overwrote installed package.json"
pass "compatible apply success + package.json protected"

STATUS_OUT="$($BIN status)"
echo "$STATUS_OUT" | grep -q 'compatibility_match=true' || fail "status missing compatibility match"
echo "$STATUS_OUT" | grep -q 'overlay_version=v0.1.0' || fail "status missing overlay version"
pass "status output correctness"

cat > "$INSTALL_ROOT/package.json" <<'JSON'
{
  "name": "openclaw",
  "version": "2026.2.20",
  "gitHead": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
}
JSON

set +e
"$BIN" apply --artifact "$TMP/dist-overlay.tar.gz" >/tmp/ocp-test.log 2>&1
rc=$?
set -e
[[ $rc -ne 0 ]] || fail "incompatible apply should fail"
[[ "$(cat "$INSTALL_ROOT/dist/banner.txt")" == "OVERLAY" ]] || fail "incompatible apply changed files"
pass "incompatible apply blocked"

echo "all tests passed"
