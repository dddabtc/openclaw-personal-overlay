# OpenClaw Personal Overlay — Architecture Document

> This document details the design purpose, implementation approach, development workflow, and deployment verification for openclaw-personal-overlay.

## 1. Project Overview

### What is openclaw-personal-overlay

openclaw-personal-overlay is a **full-replace overlay system** that customizes OpenClaw by completely replacing the `dist/` directory with a modified build. This approach ensures reliable behavior by avoiding partial file replacement issues.

### Why Full-Replace Instead of Diff Overlay

**Previous Approach (Failed):** Diff overlay — only replace modified chunk files.

**Problem:** ESM bundler generates complex inter-chunk dependencies. Partial replacement caused:
- Hash mismatches between chunks
- Old chunks being loaded due to unchanged import paths
- Unpredictable runtime behavior from mixed old/new code
- Some exports missing or pointing to wrong versions

**Current Approach (Working):** Full-replace — replace entire `dist/` directory.

**Benefits:**
- Reliable: All files are consistent from same build
- Simple: No complex diff analysis needed
- Debuggable: Easy to verify what's deployed
- Trade-off: ~38MB instead of ~100KB, acceptable for GitHub Releases

### Why entry.js Is Now Included

Previous assumption: "entry.js breaks jiti plugin loading" — this was incorrect.

**Reality:** `entry.js` is just the CLI entry point with shebang. The source-compiled `entry.js` hash differs from npm-installed version, but this doesn't break anything. Including it ensures complete consistency.

**Current policy:** Include `entry.js`, `run-main.js`, `index.js`, and all chunks.

### Supported OpenClaw Versions

Current overlay supports OpenClaw `v2026.3.7` (commit `42a1394c5c0f`).

See `compatibility.json` for the compatibility matrix.

---

## 2. Seven Feature Points

### 2.1 Exec Guard (Main Session Exec Interception)

**Purpose:** Prevent main session from executing long-running commands that block the entire session. Force use of `sessions_spawn` for subagent delegation.

**Implementation:** Add `checkMainSessionPolicy` function check at `createExecTool.execute()` entry point.

**Behavior:**
- Detect if current session is main session
- Main session exec returns error: `"Main session policy blocked exec. Use sessions_spawn to run in a subagent."`
- Subagent sessions unaffected

### 2.2 SSH Block (Main Session SSH Command Interception)

**Purpose:** Block SSH/SCP/SFTP/rsync commands in main session that could cause hangs or security risks.

**Implementation:** Within `checkMainSessionPolicy`, detect if command matches SSH command family.

**Detection pattern:**
```javascript
const SSH_COMMANDS = ['ssh', 'scp', 'sftp', 'rsync'];
function isSshCommand(cmd) {
  return SSH_COMMANDS.some(c => cmd.startsWith(c + ' ') || cmd === c);
}
```

### 2.3 Output Cap (Main Session Output Limit)

**Purpose:** Limit main session command output (default 50KB) to prevent token exhaustion or response timeout.

**Implementation:** Truncate oversized output when returning exec results in main session.

**Default threshold:** 50KB (51200 bytes)

### 2.4 Control Fast-Path

**Purpose:** Ensure `/status`, `/stop`, `/model` and other control commands respond immediately even when main session is busy.

**Implementation:** Modify `sequential-key.ts` to assign all slash commands to a separate sequential key `:control`, binding them to a dedicated processing queue.

**Effect:**
- Regular messages queue and wait
- Control commands use `:control` lane, execute immediately

### 2.5 Abortable Retry

**Purpose:** Make transient error retry sleep abortable, allowing `/stop` to immediately terminate waiting.

**Implementation:** v2026.3.7 has built-in `sleepWithAbort` function.

**Status:** ✅ Built-in, no overlay needed

### 2.6 Sub-Agent Timeout

**Purpose:** Extend default subagent timeout from upstream's shorter value (e.g., 1800s) to 6 hours (21600s) for complex tasks.

**Implementation:** Modify `DEFAULT_TIMEOUT_SECONDS` constant in `subagent-spawn.ts`.

**Change:**
```javascript
const DEFAULT_TIMEOUT_SECONDS = 21600; // 6 hours
```

### 2.7 PERSONAL BUILD Indicator

**Purpose:** Display `PERSONAL BUILD` indicator with date and GitHub link in `/status` output to identify overlay is applied.

**Format:**
```
🧢 PERSONAL BUILD · 2026-03-08T12:53(UTC)
https://github.com/dddabtc
```

---

## 3. Development Workflow

### Source Location

Development uses temporary directory for OpenClaw source:
```bash
/tmp/overlay-fresh/openclaw-src
```

Checkout target version:
```bash
cd /tmp/overlay-fresh/openclaw-src
git checkout v2026.3.7
```

### Build Process

```bash
cd /tmp/overlay-fresh/openclaw-src
pnpm install
pnpm build
```

### Packaging (Full-Replace Mode)

```bash
# Create overlay structure
mkdir -p /tmp/full-overlay/dist-overlay/payload
cp -r dist/ /tmp/full-overlay/dist-overlay/payload/dist/

# Create metadata
cat > /tmp/full-overlay/dist-overlay/metadata.json << 'EOF'
{
  "overlayVersion": "overlay-v2026.3.7",
  "buildDate": "2026-03-08T16:53:00Z",
  "baseVersion": "2026.3.7",
  "baseCommit": "42a1394c5c0f",
  "mode": "full-replace"
}
EOF

# Generate checksums
cd /tmp/full-overlay/dist-overlay
find payload -type f -exec sha256sum {} \; > checksums.sha256

# Create tarball
cd /tmp/full-overlay
tar czf dist-overlay.tar.gz dist-overlay/
```

### Release

```bash
# Calculate checksum
sha256sum dist-overlay.tar.gz > dist-overlay.tar.gz.sha256

# Create GitHub Release
gh release create overlay-v2026.3.7 dist-overlay.tar.gz dist-overlay.tar.gz.sha256 \
  --title "overlay-v2026.3.7" \
  --notes "Full dist replacement overlay with all 7 features."
```

---

## 4. Overlay Tar Structure

```
dist-overlay/
├── metadata.json          # Overlay metadata
├── checksums.sha256       # Payload file checksums
└── payload/
    └── dist/
        ├── entry.js       # CLI entry point
        ├── run-main.js    # CLI runner
        ├── index.js       # Main module entry
        ├── reply-XXXX.js  # Reply handling chunk
        └── ...            # All other dist files
```

### metadata.json Format

```json
{
  "overlayVersion": "overlay-v2026.3.7",
  "buildDate": "2026-03-08T16:53:00Z",
  "baseVersion": "2026.3.7",
  "baseCommit": "42a1394c5c0f",
  "mode": "full-replace"
}
```

**Required fields:**
- `overlayVersion`: Must start with `overlay-v`
- `mode`: Must be `full-replace`
- `baseVersion`: Target OpenClaw version
- `baseCommit`: Target commit SHA (short or full)

---

## 5. Apply Flow

### `bin/openclaw-personal apply` Logic

```
┌─────────────────────────────────────────────────────────┐
│ 1. Detect local OpenClaw installation                   │
│    - Locate install directory via `which openclaw`      │
│    - Read package.json for version                      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Download dist-overlay.tar.gz from GitHub Release     │
│    - Default repo: dddabtc/openclaw-personal-overlay    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Backup current dist/ directory                       │
│    - Save to ~/.local/state/openclaw-personal-overlay/  │
│    - Record backup location in install-state.json       │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Full replace: rsync payload/dist/ to OpenClaw dist/  │
│    - Delete existing files not in payload               │
│    - Complete replacement, not merge                    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Set agents.defaults.timeoutSeconds=21600             │
│    - Via `openclaw config set` command                  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Output success, prompt gateway restart               │
└─────────────────────────────────────────────────────────┘
```

### Rollback Logic

```bash
bin/openclaw-personal rollback
```

1. Read `install-state.json` for backup location
2. Full restore: rsync backup back to dist/
3. Clear install state
4. Prompt gateway restart

---

## 6. CI Design

### validate-overlay.yml

**Purpose:** Validate overlay tarball integrity and correctness for full-replace mode.

**Validation steps:**

1. **Extract overlay:** Unpack `dist-overlay.tar.gz`

2. **Validate metadata:** 
   - `overlayVersion` starts with `overlay-v`
   - `mode` is `full-replace`

3. **Validate full dist structure:**
   - `entry.js` present (CLI entry)
   - `run-main.js` present (CLI runner)
   - `index.js` present (main entry)
   - At least one `reply-*.js` chunk
   - `index.js` references existing reply chunk

4. **Validate checksums:** Verify `checksums.sha256`

5. **Verify features:** Check reply chunk contains:
   - `PERSONAL BUILD` with date and link
   - `enforceMainSessionPolicy`
   - `sessions_spawn` (in error message)
   - SSH block patterns
   - `21600` (subagent timeout)

---

## 7. Lessons Learned

### Diff Overlay Failure (2026-03-08)

**Attempt 1:** Only include modified `reply-*.js` chunk.
- **Result:** Patch not loaded. `index.js` still referenced old chunk hash.

**Attempt 2:** Include `index.js` + new `reply-*.js`.
- **Result:** Still failed. Complex import chains between chunks.

**Attempt 3:** Exclude `entry.js` thinking it breaks jiti.
- **Result:** Unnecessary restriction based on incorrect assumption.

**Final solution:** Full-replace mode. Replace entire `dist/` directory.

### Why npm-installed vs Source-compiled Differ

npm package and source-compiled OpenClaw have different chunk hashes because:
- Bundler uses file content hash for chunk names
- Different build environments produce slightly different output
- Even same source can produce different hashes

**Conclusion:** Overlay must be built from source, then completely replace npm-installed dist. Mixing is unreliable.

### Hash Consistency is Critical

ESM bundler creates complex dependency graphs:
```
index.js → reply-XXXX.js → chunk-YYYY.js → chunk-ZZZZ.js
```

If any hash mismatches, the import chain breaks. Partial replacement cannot guarantee consistency.

**Solution:** Full replacement ensures all files are from same build with consistent hashes.

---

## 8. Verification Checklist

### After Apply

- [ ] `openclaw gateway restart` succeeds
- [ ] `/status` shows `🧢 PERSONAL BUILD · <date>(UTC)`
- [ ] `/status` shows `https://github.com/dddabtc`
- [ ] Main session exec returns "Main session policy blocked"
- [ ] `/status` responds immediately during busy main session

### Technical Verification

```bash
# Check PERSONAL BUILD in reply chunk
DIST=$(dirname $(which openclaw))/../lib/node_modules/openclaw/dist
REPLY=$(ls $DIST/reply-*.js | head -1)

grep -c "PERSONAL BUILD" "$REPLY"        # > 0
grep -c "enforceMainSessionPolicy" "$REPLY"  # > 0
grep -c "21600" "$REPLY"                 # > 0
grep "github.com/dddabtc" "$REPLY"       # should match
```

---

## 9. Quick Reference

### User Commands

```bash
# Check status
bin/openclaw-personal status

# Apply overlay
bin/openclaw-personal apply

# Rollback to original
bin/openclaw-personal rollback

# Restart gateway
openclaw gateway restart
```

### Development Commands

```bash
# Build from source
cd /tmp/overlay-fresh/openclaw-src
pnpm build

# Package overlay
mkdir -p /tmp/overlay/dist-overlay/payload
cp -r dist/ /tmp/overlay/dist-overlay/payload/dist/
# ... create metadata.json and checksums ...
tar czf dist-overlay.tar.gz dist-overlay/

# Verify features
grep -c "PERSONAL BUILD" dist/reply-*.js
grep -c "enforceMainSessionPolicy" dist/reply-*.js
```

---

## Appendix: File Layout

```
openclaw-personal-overlay/
├── bin/
│   └── openclaw-personal        # Main CLI tool
├── compatibility.json           # Compatibility matrix
├── dist-overlay.tar.gz          # Release artifact (~38MB)
├── dist-overlay.tar.gz.sha256   # Checksum
├── docs/
│   ├── ARCHITECTURE.md          # This document
│   └── ...
├── .github/workflows/
│   └── validate-overlay.yml     # CI validation
├── CHANGELOG.md
└── README.md
```

---

*Document version: 2026-03-08*
*Overlay version: overlay-v2026.3.7*
*Mode: full-replace*
