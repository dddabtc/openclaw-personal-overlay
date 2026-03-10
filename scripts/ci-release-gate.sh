#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
usage: scripts/ci-release-gate.sh --version <openclaw-version> --commit <upstream-commit> --patch-dir <patch-dir> [--out-prefix <name>] [--work-dir <dir>]

Runs the full source-level release gate in a temp directory:
1. clone fresh upstream OpenClaw
2. apply overlay patch queue with git am
3. run targeted regression tests
4. build upstream dist
5. build overlay artifact
6. validate dist exports
7. validate release artifact

Outputs:
- <out-prefix>.tar.gz
- <out-prefix>.tar.gz.sha256
in the current working directory.
EOF
  exit 2
}

TARGET_VERSION=""
TARGET_COMMIT=""
PATCH_DIR=""
OUT_PREFIX="dist-overlay"
WORK_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) TARGET_VERSION="$2"; shift 2 ;;
    --commit) TARGET_COMMIT="$2"; shift 2 ;;
    --patch-dir) PATCH_DIR="$2"; shift 2 ;;
    --out-prefix) OUT_PREFIX="$2"; shift 2 ;;
    --work-dir) WORK_DIR="$2"; shift 2 ;;
    *) usage ;;
  esac
done

[[ -n "$TARGET_VERSION" && -n "$TARGET_COMMIT" && -n "$PATCH_DIR" ]] || usage
[[ -d "$PATCH_DIR" ]] || { echo "patch dir not found: $PATCH_DIR" >&2; exit 2; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="${WORK_DIR:-$(mktemp -d)}"
CLEANUP_WORKDIR="${KEEP_WORKDIR:-0}"
if [[ "$CLEANUP_WORKDIR" != "1" ]]; then
  trap 'rm -rf "$WORK_DIR"' EXIT
fi

PATCH_DIR_ABS="$(cd "$PATCH_DIR" && pwd)"
UPSTREAM_DIR="$WORK_DIR/openclaw-src"
ARTIFACT_DIR="$WORK_DIR/${OUT_PREFIX}"

echo "[gate] work_dir=$WORK_DIR"
echo "[gate] target_version=$TARGET_VERSION"
echo "[gate] target_commit=$TARGET_COMMIT"
echo "[gate] patch_dir=$PATCH_DIR_ABS"

git clone --filter=blob:none https://github.com/openclaw/openclaw.git "$UPSTREAM_DIR" >/dev/null 2>&1
cd "$UPSTREAM_DIR"
git checkout "$TARGET_COMMIT" >/dev/null 2>&1
git config user.name "overlay-gate"
git config user.email "overlay-gate@example.com"
mapfile -t patch_files < <(find "$PATCH_DIR_ABS" -maxdepth 1 -type f -name '*.patch' | sort)
if [[ ${#patch_files[@]} -eq 0 ]]; then
  echo "[gate] no patch files found in $PATCH_DIR_ABS" >&2
  exit 1
fi
git am "${patch_files[@]}"

corepack enable >/dev/null 2>&1 || true
pnpm install --no-frozen-lockfile

TARGET_TESTS=(
  "src/telegram/sequential-key.test.ts"
  "src/agents/bash-tools.exec.main-session-defaults.test.ts"
  "src/auto-reply/reply/agent-runner.misc.runreplyagent.test.ts"
)
EXISTING_TESTS=()
for t in "${TARGET_TESTS[@]}"; do
  [[ -f "$t" ]] && EXISTING_TESTS+=("$t")
done
if [[ ${#EXISTING_TESTS[@]} -gt 0 ]]; then
  echo "[gate] running targeted vitest (${#EXISTING_TESTS[@]} files)"
  pnpm -s vitest "${EXISTING_TESTS[@]}"
else
  echo "[gate] warning: no targeted test files found; skipping vitest" >&2
fi

pnpm -s build

cd "$REPO_ROOT"
TARGET_VERSION="$TARGET_VERSION" TARGET_COMMIT="$TARGET_COMMIT" OVERLAY_VERSION="overlay-v${TARGET_VERSION}" scripts/build-dist-overlay.sh "$UPSTREAM_DIR" "$ARTIFACT_DIR"
bash scripts/validate-dist-exports.sh "$ARTIFACT_DIR/payload" "$TARGET_VERSION"
bash scripts/validate-release.sh "$ARTIFACT_DIR.tar.gz" "$TARGET_VERSION"
bash tests/openclaw-personal.test.sh

cp "$ARTIFACT_DIR.tar.gz" "$REPO_ROOT/${OUT_PREFIX}.tar.gz"
cp "$ARTIFACT_DIR.tar.gz.sha256" "$REPO_ROOT/${OUT_PREFIX}.tar.gz.sha256"

echo "[gate] success"
echo "[gate] artifact=$REPO_ROOT/${OUT_PREFIX}.tar.gz"
echo "[gate] checksum=$REPO_ROOT/${OUT_PREFIX}.tar.gz.sha256"
