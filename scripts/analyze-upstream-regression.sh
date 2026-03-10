#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
usage: scripts/analyze-upstream-regression.sh --target-version <openclaw-version> [--work-dir <dir>]

Creates a temp-dir source analysis for a failed overlay release/CI target.
Outputs a markdown report with:
- compatibility target info
- previous supported entry used for comparison
- patch inventory diff
- missing patch subjects
- upstream diffstat between previous and target base commits
- clean-apply result for target patchset
EOF
  exit 2
}

TARGET_VERSION=""
WORK_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-version) TARGET_VERSION="$2"; shift 2 ;;
    --work-dir) WORK_DIR="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "$TARGET_VERSION" ]] || usage

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="${WORK_DIR:-$(mktemp -d)}"
CLEANUP_WORKDIR="${KEEP_WORKDIR:-0}"
if [[ "$CLEANUP_WORKDIR" != "1" ]]; then
  trap 'rm -rf "$WORK_DIR"' EXIT
fi

python3 - <<'PY' "$REPO_ROOT/compatibility.json" "$TARGET_VERSION" "$WORK_DIR/compat.json"
import json, sys, pathlib
compat = json.loads(pathlib.Path(sys.argv[1]).read_text())
target_version = sys.argv[2]
supported = compat.get('supported', [])
target_idx = None
for i, ent in enumerate(supported):
    if ent.get('openclawVersion') == target_version and ent.get('status') != 'deprecated':
        target_idx = i
        break
if target_idx is None:
    raise SystemExit(f'target version not found: {target_version}')
prev = None
for j in range(target_idx + 1, len(supported)):
    if supported[j].get('status') != 'deprecated':
        prev = supported[j]
        break
pathlib.Path(sys.argv[3]).write_text(json.dumps({'target': supported[target_idx], 'previous': prev}, indent=2))
PY

TARGET_COMMIT="$(python3 - <<'PY' "$WORK_DIR/compat.json"
import json, sys
obj=json.load(open(sys.argv[1]))
print(obj['target']['commitSha'])
PY
)"
TARGET_PATCH_DIR="$(python3 - <<'PY' "$WORK_DIR/compat.json"
import json, sys
obj=json.load(open(sys.argv[1]))
print(obj['target']['patchSetDir'])
PY
)"
PREV_PATCH_DIR="$(python3 - <<'PY' "$WORK_DIR/compat.json"
import json, sys
obj=json.load(open(sys.argv[1]))
prev=obj.get('previous')
print(prev['patchSetDir'] if prev else '')
PY
)"
PREV_BASE="$(python3 - <<'PY' "$WORK_DIR/compat.json"
import json, sys
obj=json.load(open(sys.argv[1]))
prev=obj.get('previous')
print(prev['upstreamBaseCommit'] if prev else '')
PY
)"
TARGET_BASE="$(python3 - <<'PY' "$WORK_DIR/compat.json"
import json, sys
obj=json.load(open(sys.argv[1]))
print(obj['target']['upstreamBaseCommit'])
PY
)"

cd "$WORK_DIR"
git clone --filter=blob:none https://github.com/openclaw/openclaw.git upstream >/dev/null 2>&1
cd upstream
git checkout "$TARGET_COMMIT" >/dev/null 2>&1
git config user.name overlay-analysis
git config user.email overlay-analysis@example.com

PATCH_DIR_ABS="$REPO_ROOT/$TARGET_PATCH_DIR"
mapfile -t patch_files < <(find "$PATCH_DIR_ABS" -maxdepth 1 -type f -name '*.patch' | sort)
APPLY_STATUS="ok"
if ! git am "${patch_files[@]}" >/tmp/overlay-regression-am.log 2>&1; then
  APPLY_STATUS="failed"
  git am --abort >/dev/null 2>&1 || true
fi

cd "$REPO_ROOT"
REPORT="$WORK_DIR/report.md"
{
  echo "# Overlay regression analysis"
  echo
  echo "- target_version: $TARGET_VERSION"
  echo "- target_commit: $TARGET_COMMIT"
  echo "- target_patch_dir: $TARGET_PATCH_DIR"
  echo "- previous_patch_dir: ${PREV_PATCH_DIR:-<none>}"
  echo "- work_dir: $WORK_DIR"
  echo "- clean_apply: $APPLY_STATUS"
  echo
  echo "## Patch inventory"
  echo
  echo "### target"
  find "$REPO_ROOT/$TARGET_PATCH_DIR" -maxdepth 1 -type f -name '*.patch' | sed "s#^$REPO_ROOT/##" | sort | sed 's/^/- /'
  echo
  if [[ -n "$PREV_PATCH_DIR" && -d "$REPO_ROOT/$PREV_PATCH_DIR" ]]; then
    echo "### previous"
    find "$REPO_ROOT/$PREV_PATCH_DIR" -maxdepth 1 -type f -name '*.patch' | sed "s#^$REPO_ROOT/##" | sort | sed 's/^/- /'
    echo
    echo "## Missing previous patch subjects in target"
    python3 - <<'PY' "$REPO_ROOT/$PREV_PATCH_DIR" "$REPO_ROOT/$TARGET_PATCH_DIR"
import pathlib, re, sys
prev = sorted(pathlib.Path(sys.argv[1]).glob('*.patch'))
target = sorted(pathlib.Path(sys.argv[2]).glob('*.patch'))
def subject(p):
    for line in p.read_text(errors='ignore').splitlines():
        if line.startswith('Subject:'):
            s = re.sub(r'^Subject:\s*(\[PATCH[^\]]*\]\s*)?', '', line).strip()
            return s
    return p.name
prev_subjects = {subject(p): p.name for p in prev}
target_subjects = {subject(p): p.name for p in target}
missing = [s for s in prev_subjects if s not in target_subjects]
for s in missing:
    print(f'- {s} ({prev_subjects[s]})')
if not missing:
    print('- none')
PY
    echo
  fi
  if [[ -n "$PREV_BASE" ]]; then
    echo "## Upstream diffstat (${PREV_BASE:0:7}..${TARGET_BASE:0:7})"
    echo
    git -C "$WORK_DIR/upstream" diff --stat "$PREV_BASE" "$TARGET_BASE" || true
    echo
  fi
  echo "## Notes"
  echo
  echo "- Use this report as the temp-dir input for source-level remediation."
  echo "- If clean_apply=failed, inspect /tmp/overlay-regression-am.log on the host where this script ran."
} > "$REPORT"

echo "$REPORT"
