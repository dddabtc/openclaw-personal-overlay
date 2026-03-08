# Contributing / Release Guardrails

Before publishing any `overlay-v*` release, all checks below are mandatory.

## 1) Build from baseline diff (not full dist)
Use baseline-aware build to avoid environment-generated fake diffs.

```bash
scripts/build-dist-overlay.sh <patched-openclaw-dir> dist-overlay <clean-openclaw-dir>
```

Rules:
- `metadata.json.overlayVersion` MUST be `overlay-v<openclawVersion>`
- `metadata.json.targetOpenclawVersion` MUST match release tag version
- Do **not** overlay `dist/entry.js`
- Dist payload must only include files that exist in upstream dist unless explicitly approved

## 2) Validate artifact

```bash
scripts/validate-release.sh dist-overlay.tar.gz <openclawVersion>
```

This checks:
- metadata format/version correctness
- payload dist scope (no unexpected new files)
- no `entry.js` override
- package.json exports point to existing dist files (if package.json is present)

## 3) End-to-end apply/rollback smoke test (in /tmp only)

```bash
TMP=$(mktemp -d)
cd "$TMP"
npm pack openclaw@<openclawVersion>
tar xzf openclaw-<openclawVersion>.tgz
OPENCLAW_INSTALL_ROOT="$TMP/package" ~/openclaw-personal-overlay/bin/openclaw-personal apply --artifact ~/openclaw-personal-overlay/dist-overlay.tar.gz --no-config
node -e "require('$TMP/package/dist/plugin-sdk/index.js')"
OPENCLAW_INSTALL_ROOT="$TMP/package" ~/openclaw-personal-overlay/bin/openclaw-personal rollback
```

## 4) Release publish checklist
- [ ] Commit includes scripts/build + validation changes
- [ ] `dist-overlay.tar.gz` rebuilt and validated
- [ ] Existing bad release deleted (if reissuing same tag)
- [ ] New release uploaded with `dist-overlay.tar.gz` and `.sha256`
- [ ] Re-download release artifact and re-run `scripts/validate-release.sh`
