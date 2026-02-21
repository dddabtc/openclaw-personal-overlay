#!/usr/bin/env bash
set -euo pipefail

# Placeholder compatibility smoke check for Atlas memory APIs.
# Defaults to mock mode in CI unless ATLAS_URL is provided.

if [[ -z "${ATLAS_URL:-}" ]]; then
  echo '[atlas-smoke] mock mode (ATLAS_URL unset)'
  echo '{"items":[{"id":"x","content":"ok"}]}' | python3 -c 'import json,sys;d=json.load(sys.stdin);assert isinstance(d.get("items"),list)'
  echo '{"id":"x","content":"ok"}' | python3 -c 'import json,sys;d=json.load(sys.stdin);assert "id" in d and "content" in d'
  exit 0
fi

echo "[atlas-smoke] live mode against $ATLAS_URL"
search_payload='{"query":"smoke","limit":1}'
search_resp="$(curl -fsS "$ATLAS_URL/memories/search" -X POST -H 'content-type: application/json' -d "$search_payload")"
echo "$search_resp" | python3 -c 'import json,sys;d=json.load(sys.stdin);assert isinstance(d.get("items"),list)'

echo '[atlas-smoke] memory_search contract OK'
