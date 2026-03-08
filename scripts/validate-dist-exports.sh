#!/usr/bin/env bash
set -euo pipefail

PAYLOAD_DIR="${1:-}"
OPENCLAW_VERSION="${2:-}"

if [[ -z "$PAYLOAD_DIR" || -z "$OPENCLAW_VERSION" ]]; then
  echo "usage: $0 <payload-dir> <openclaw-version>" >&2
  exit 2
fi

if [[ ! -d "$PAYLOAD_DIR/dist" ]]; then
  echo "[FAIL] payload dist directory missing: $PAYLOAD_DIR/dist" >&2
  exit 1
fi

tmpdir="$(mktemp -d)"
cleanup() { rm -rf "$tmpdir"; }
trap cleanup EXIT

exports_json=""
source_desc=""
reference_dist=""

if (
  cd "$tmpdir"
  npm pack --silent "openclaw@${OPENCLAW_VERSION}" >/dev/null
  tar -xzf openclaw-*.tgz
); then
  pkg_json="$tmpdir/package/package.json"
  exports_json="$(node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));process.stdout.write(JSON.stringify(j.exports||{}));' "$pkg_json")"
  source_desc="npm:openclaw@${OPENCLAW_VERSION} package.json"
  reference_dist="$tmpdir/package/dist"
else
  pkg_json="$PAYLOAD_DIR/package.json"
  if [[ -f "$pkg_json" ]]; then
    exports_json="$(node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));process.stdout.write(JSON.stringify(j.exports||{}));' "$pkg_json")"
    source_desc="$pkg_json"
    reference_dist="$PAYLOAD_DIR/dist"
    echo "[WARN] failed to fetch npm package openclaw@${OPENCLAW_VERSION}; using payload package.json"
  else
    echo "[FAIL] unable to resolve exports from npm and payload/package.json missing" >&2
    exit 1
  fi
fi

mapfile -t required < <(node -e '
const fs = require("fs");
const path = require("path");
const exportsObj = JSON.parse(process.argv[1]);
const referenceDist = process.argv[2];

function collectTargets(v, acc){
  if(typeof v === "string") acc.push(v);
  else if(Array.isArray(v)) for(const x of v) collectTargets(x, acc);
  else if(v && typeof v === "object") for(const x of Object.values(v)) collectTargets(x, acc);
}

function walk(dir, out){
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
}

function expandPattern(target){
  if(!target.includes("*")) return [target];
  const escaped = target.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  const re = new RegExp(`^${escaped}$`);
  const files = [];
  if (fs.existsSync(referenceDist)) walk(referenceDist, files);
  const relTargets = files.map(f => "./dist/" + path.relative(referenceDist, f).replace(/\\\\/g, "/"));
  return relTargets.filter(t => re.test(t));
}

const out = [];
for (const [key,val] of Object.entries(exportsObj || {})) {
  if (!key.startsWith("./plugin-sdk/")) continue;
  const targets=[]; collectTargets(val, targets);
  for (const t of targets) {
    if (typeof t !== "string") continue;
    if (!t.startsWith("./dist/plugin-sdk/")) continue;
    if (!t.endsWith(".js")) continue;
    for (const expanded of expandPattern(t)) {
      out.push(expanded.replace(/^\.\/dist\//, ""));
    }
  }
}
[...new Set(out)].sort().forEach(x => console.log(x));
' "$exports_json" "$reference_dist")

if [[ ${#required[@]} -eq 0 ]]; then
  echo "[FAIL] no ./plugin-sdk/* .js exports resolved from $source_desc" >&2
  exit 1
fi

missing=()
for rel in "${required[@]}"; do
  # A file is valid if it's in the overlay payload OR unchanged in the npm baseline.
  # Delta overlays only include changed files; unchanged plugin-sdk files stay from npm install.
  if [[ ! -f "$PAYLOAD_DIR/dist/$rel" ]]; then
    if [[ -n "$reference_dist" && ! -f "$reference_dist/$rel" ]]; then
      # Missing from both overlay and npm baseline — this is a real problem
      missing+=("$rel")
    fi
    # else: file exists in npm baseline and was not changed — OK for delta overlay
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "[FAIL] plugin-sdk export validation failed"
  echo "source exports: $source_desc"
  echo "payload: $PAYLOAD_DIR"
  echo "required .js exports: ${#required[@]}"
  echo "missing from both overlay and npm baseline: ${#missing[@]}"
  printf '%s\n' "${missing[@]}"
  exit 1
fi

echo "[PASS] plugin-sdk export validation passed"
echo "source exports: $source_desc"
echo "payload: $PAYLOAD_DIR"
echo "validated .js exports: ${#required[@]}"
echo "(note: unchanged plugin-sdk files not in overlay are supplied by npm baseline)"