#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "compatibility.json")
obj = json.loads(path.read_text(encoding="utf-8"))
errors = []

if not isinstance(obj.get("supported"), list) or not obj["supported"]:
    errors.append("supported must be a non-empty array")

seen = set()
for i, e in enumerate(obj.get("supported", [])):
    ctx = f"supported[{i}]"
    for key in ("openclawVersion", "commitSha"):
        if not isinstance(e.get(key), str) or not e[key].strip():
            errors.append(f"{ctx}.{key} must be non-empty string")
    if isinstance(e.get("commitSha"), str) and not re.fullmatch(r"[0-9a-f]{7,40}", e["commitSha"]):
        errors.append(f"{ctx}.commitSha must be hex sha")
    k = (e.get("openclawVersion"), e.get("commitSha"))
    if k in seen:
        errors.append(f"duplicate compatibility key {k}")
    seen.add(k)

if errors:
    print("compatibility validation failed:")
    for err in errors:
        print(f" - {err}")
    sys.exit(1)

print(f"compatibility validation OK ({len(obj.get('supported', []))} entries)")
