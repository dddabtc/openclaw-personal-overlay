import { s as resolveStateDir } from "./paths-CyR9Pa1R.js";
import { y as parseAgentSessionKey } from "./session-key-BCzIW1Y2.js";
import "./registry-BmY4gNy6.js";
import { s as resolveAgentWorkspaceDir } from "./agent-scope-BaNPxUDt.js";
import { t as createSubsystemLogger } from "./subsystem-B5g771Td.js";
import "./workspace-C6WgTYr8.js";
import "./redact-jSxx6Ep2.js";
import "./paths-BEAbheM8.js";
import { _ as isFileMissingError, n as buildSessionEntry, r as listSessionFilesForAgent, t as requireNodeSqlite, v as statRegularFile } from "./sqlite-D-QJYTSW.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline";

//#region src/memory/qmd-scope.ts
function isQmdScopeAllowed(scope, sessionKey) {
	if (!scope) return true;
	const parsed = parseQmdSessionScope(sessionKey);
	const channel = parsed.channel;
	const chatType = parsed.chatType;
	const normalizedKey = parsed.normalizedKey ?? "";
	const rawKey = sessionKey?.trim().toLowerCase() ?? "";
	for (const rule of scope.rules ?? []) {
		if (!rule) continue;
		const match = rule.match ?? {};
		if (match.channel && match.channel !== channel) continue;
		if (match.chatType && match.chatType !== chatType) continue;
		const normalizedPrefix = match.keyPrefix?.trim().toLowerCase() || void 0;
		const rawPrefix = match.rawKeyPrefix?.trim().toLowerCase() || void 0;
		if (rawPrefix && !rawKey.startsWith(rawPrefix)) continue;
		if (normalizedPrefix) {
			if (normalizedPrefix.startsWith("agent:")) {
				if (!rawKey.startsWith(normalizedPrefix)) continue;
			} else if (!normalizedKey.startsWith(normalizedPrefix)) continue;
		}
		return rule.action === "allow";
	}
	return (scope.default ?? "allow") === "allow";
}
function deriveQmdScopeChannel(key) {
	return parseQmdSessionScope(key).channel;
}
function deriveQmdScopeChatType(key) {
	return parseQmdSessionScope(key).chatType;
}
function parseQmdSessionScope(key) {
	const normalized = normalizeQmdSessionKey(key);
	if (!normalized) return {};
	const parts = normalized.split(":").filter(Boolean);
	let chatType;
	if (parts.length >= 2 && (parts[1] === "group" || parts[1] === "channel" || parts[1] === "direct" || parts[1] === "dm")) {
		if (parts.includes("group")) chatType = "group";
		else if (parts.includes("channel")) chatType = "channel";
		return {
			normalizedKey: normalized,
			channel: parts[0]?.toLowerCase(),
			chatType: chatType ?? "direct"
		};
	}
	if (normalized.includes(":group:")) return {
		normalizedKey: normalized,
		chatType: "group"
	};
	if (normalized.includes(":channel:")) return {
		normalizedKey: normalized,
		chatType: "channel"
	};
	return {
		normalizedKey: normalized,
		chatType: "direct"
	};
}
function normalizeQmdSessionKey(key) {
	if (!key) return;
	const trimmed = key.trim();
	if (!trimmed) return;
	const normalized = (parseAgentSessionKey(trimmed)?.rest ?? trimmed).toLowerCase();
	if (normalized.startsWith("subagent:")) return;
	return normalized;
}

//#endregion
//#region src/memory/qmd-query-parser.ts
const log$1 = createSubsystemLogger("memory");
function parseQmdQueryJson(stdout, stderr) {
	const trimmedStdout = stdout.trim();
	const trimmedStderr = stderr.trim();
	const stdoutIsMarker = trimmedStdout.length > 0 && isQmdNoResultsOutput(trimmedStdout);
	const stderrIsMarker = trimmedStderr.length > 0 && isQmdNoResultsOutput(trimmedStderr);
	if (stdoutIsMarker || !trimmedStdout && stderrIsMarker) return [];
	if (!trimmedStdout) {
		const message = `stdout empty${trimmedStderr ? ` (stderr: ${summarizeQmdStderr(trimmedStderr)})` : ""}`;
		log$1.warn(`qmd query returned invalid JSON: ${message}`);
		throw new Error(`qmd query returned invalid JSON: ${message}`);
	}
	try {
		const parsed = parseQmdQueryResultArray(trimmedStdout);
		if (parsed !== null) return parsed;
		const noisyPayload = extractFirstJsonArray(trimmedStdout);
		if (!noisyPayload) throw new Error("qmd query JSON response was not an array");
		const fallback = parseQmdQueryResultArray(noisyPayload);
		if (fallback !== null) return fallback;
		throw new Error("qmd query JSON response was not an array");
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log$1.warn(`qmd query returned invalid JSON: ${message}`);
		throw new Error(`qmd query returned invalid JSON: ${message}`, { cause: err });
	}
}
function isQmdNoResultsOutput(raw) {
	return raw.split(/\r?\n/).map((line) => line.trim().toLowerCase().replace(/\s+/g, " ")).filter((line) => line.length > 0).some((line) => isQmdNoResultsLine(line));
}
function isQmdNoResultsLine(line) {
	if (line === "no results found" || line === "no results found.") return true;
	return /^(?:\[[^\]]+\]\s*)?(?:(?:warn(?:ing)?|info|error|qmd)\s*:\s*)+no results found\.?$/.test(line);
}
function summarizeQmdStderr(raw) {
	return raw.length <= 120 ? raw : `${raw.slice(0, 117)}...`;
}
function parseQmdQueryResultArray(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function extractFirstJsonArray(raw) {
	const start = raw.indexOf("[");
	if (start < 0) return null;
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < raw.length; i += 1) {
		const char = raw[i];
		if (char === void 0) break;
		if (inString) {
			if (escaped) {
				escaped = false;
				continue;
			}
			if (char === "\\") escaped = true;
			else if (char === "\"") inString = false;
			continue;
		}
		if (char === "\"") {
			inString = true;
			continue;
		}
		if (char === "[") depth += 1;
		else if (char === "]") {
			depth -= 1;
			if (depth === 0) return raw.slice(start, i + 1);
		}
	}
	return null;
}

//#endregion
//#region src/memory/qmd-manager.ts
const log = createSubsystemLogger("memory");
const SNIPPET_HEADER_RE = /@@\s*-([0-9]+),([0-9]+)/;
const SEARCH_PENDING_UPDATE_WAIT_MS = 500;
const MAX_QMD_OUTPUT_CHARS = 2e5;
const NUL_MARKER_RE = /(?:\^@|\\0|\\x00|\\u0000|null\s*byte|nul\s*byte)/i;
const QMD_EMBED_BACKOFF_BASE_MS = 6e4;
const QMD_EMBED_BACKOFF_MAX_MS = 3600 * 1e3;
let qmdEmbedQueueTail = Promise.resolve();
async function runWithQmdEmbedLock(task) {
	const previous = qmdEmbedQueueTail;
	let release;
	qmdEmbedQueueTail = new Promise((resolve) => {
		release = resolve;
	});
	await previous.catch(() => void 0);
	try {
		return await task();
	} finally {
		release?.();
	}
}
var QmdMemoryManager = class QmdMemoryManager {
	static async create(params) {
		const resolved = params.resolved.qmd;
		if (!resolved) return null;
		const manager = new QmdMemoryManager({
			cfg: params.cfg,
			agentId: params.agentId,
			resolved
		});
		await manager.initialize(params.mode ?? "full");
		return manager;
	}
	constructor(params) {
		this.collectionRoots = /* @__PURE__ */ new Map();
		this.sources = /* @__PURE__ */ new Set();
		this.docPathCache = /* @__PURE__ */ new Map();
		this.exportedSessionState = /* @__PURE__ */ new Map();
		this.maxQmdOutputChars = MAX_QMD_OUTPUT_CHARS;
		this.updateTimer = null;
		this.pendingUpdate = null;
		this.queuedForcedUpdate = null;
		this.queuedForcedRuns = 0;
		this.closed = false;
		this.db = null;
		this.lastUpdateAt = null;
		this.lastEmbedAt = null;
		this.embedBackoffUntil = null;
		this.embedFailureCount = 0;
		this.attemptedNullByteCollectionRepair = false;
		this.cfg = params.cfg;
		this.agentId = params.agentId;
		this.qmd = params.resolved;
		this.workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
		this.stateDir = resolveStateDir(process.env, os.homedir);
		this.agentStateDir = path.join(this.stateDir, "agents", this.agentId);
		this.qmdDir = path.join(this.agentStateDir, "qmd");
		this.xdgConfigHome = path.join(this.qmdDir, "xdg-config");
		this.xdgCacheHome = path.join(this.qmdDir, "xdg-cache");
		this.indexPath = path.join(this.xdgCacheHome, "qmd", "index.sqlite");
		this.env = {
			...process.env,
			XDG_CONFIG_HOME: this.xdgConfigHome,
			XDG_CACHE_HOME: this.xdgCacheHome,
			NO_COLOR: "1"
		};
		this.sessionExporter = this.qmd.sessions.enabled ? {
			dir: this.qmd.sessions.exportDir ?? path.join(this.qmdDir, "sessions"),
			retentionMs: this.qmd.sessions.retentionDays ? this.qmd.sessions.retentionDays * 24 * 60 * 60 * 1e3 : void 0,
			collectionName: this.pickSessionCollectionName()
		} : null;
		if (this.sessionExporter) this.qmd.collections = [...this.qmd.collections, {
			name: this.sessionExporter.collectionName,
			path: this.sessionExporter.dir,
			pattern: "**/*.md",
			kind: "sessions"
		}];
	}
	async initialize(mode) {
		this.bootstrapCollections();
		if (mode === "status") return;
		await fs.mkdir(this.xdgConfigHome, { recursive: true });
		await fs.mkdir(this.xdgCacheHome, { recursive: true });
		await fs.mkdir(path.dirname(this.indexPath), { recursive: true });
		if (this.sessionExporter) await fs.mkdir(this.sessionExporter.dir, { recursive: true });
		await this.symlinkSharedModels();
		await this.ensureCollections();
		if (this.qmd.update.onBoot) {
			const bootRun = this.runUpdate("boot", true);
			if (this.qmd.update.waitForBootSync) await bootRun.catch((err) => {
				log.warn(`qmd boot update failed: ${String(err)}`);
			});
			else bootRun.catch((err) => {
				log.warn(`qmd boot update failed: ${String(err)}`);
			});
		}
		if (this.qmd.update.intervalMs > 0) this.updateTimer = setInterval(() => {
			this.runUpdate("interval").catch((err) => {
				log.warn(`qmd update failed (${String(err)})`);
			});
		}, this.qmd.update.intervalMs);
	}
	bootstrapCollections() {
		this.collectionRoots.clear();
		this.sources.clear();
		for (const collection of this.qmd.collections) {
			const kind = collection.kind === "sessions" ? "sessions" : "memory";
			this.collectionRoots.set(collection.name, {
				path: collection.path,
				kind
			});
			this.sources.add(kind);
		}
	}
	async ensureCollections() {
		const existing = /* @__PURE__ */ new Map();
		try {
			const result = await this.runQmd([
				"collection",
				"list",
				"--json"
			], { timeoutMs: this.qmd.update.commandTimeoutMs });
			const parsed = JSON.parse(result.stdout);
			if (Array.isArray(parsed)) {
				for (const entry of parsed) if (typeof entry === "string") existing.set(entry, {});
				else if (entry && typeof entry === "object") {
					const name = entry.name;
					if (typeof name === "string") {
						const listedPath = entry.path;
						const listedPattern = entry.pattern;
						const listedMask = entry.mask;
						existing.set(name, {
							path: typeof listedPath === "string" ? listedPath : void 0,
							pattern: typeof listedPattern === "string" ? listedPattern : typeof listedMask === "string" ? listedMask : void 0
						});
					}
				}
			}
		} catch {}
		for (const collection of this.qmd.collections) {
			const listed = existing.get(collection.name);
			if (listed && !this.shouldRebindCollection(collection, listed)) continue;
			if (listed) try {
				await this.removeCollection(collection.name);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				if (!this.isCollectionMissingError(message)) log.warn(`qmd collection remove failed for ${collection.name}: ${message}`);
			}
			try {
				await this.ensureCollectionPath(collection);
				await this.addCollection(collection.path, collection.name, collection.pattern);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				if (this.isCollectionAlreadyExistsError(message)) continue;
				log.warn(`qmd collection add failed for ${collection.name}: ${message}`);
			}
		}
	}
	async ensureCollectionPath(collection) {
		if (!this.isDirectoryGlobPattern(collection.pattern)) return;
		await fs.mkdir(collection.path, { recursive: true });
	}
	isDirectoryGlobPattern(pattern) {
		return pattern.includes("*") || pattern.includes("?") || pattern.includes("[");
	}
	isCollectionAlreadyExistsError(message) {
		const lower = message.toLowerCase();
		return lower.includes("already exists") || lower.includes("exists");
	}
	isCollectionMissingError(message) {
		const lower = message.toLowerCase();
		return lower.includes("not found") || lower.includes("does not exist") || lower.includes("missing");
	}
	async addCollection(pathArg, name, pattern) {
		await this.runQmd([
			"collection",
			"add",
			pathArg,
			"--name",
			name,
			"--mask",
			pattern
		], { timeoutMs: this.qmd.update.commandTimeoutMs });
	}
	async removeCollection(name) {
		await this.runQmd([
			"collection",
			"remove",
			name
		], { timeoutMs: this.qmd.update.commandTimeoutMs });
	}
	shouldRebindCollection(collection, listed) {
		if (!listed.path) return true;
		if (!this.pathsMatch(listed.path, collection.path)) return true;
		if (typeof listed.pattern === "string" && listed.pattern !== collection.pattern) return true;
		return false;
	}
	pathsMatch(left, right) {
		const normalize = (value) => {
			const resolved = path.isAbsolute(value) ? path.resolve(value) : path.resolve(this.workspaceDir, value);
			const normalized = path.normalize(resolved);
			return process.platform === "win32" ? normalized.toLowerCase() : normalized;
		};
		return normalize(left) === normalize(right);
	}
	shouldRepairNullByteCollectionError(err) {
		const message = err instanceof Error ? err.message : String(err);
		const lower = message.toLowerCase();
		return (lower.includes("enotdir") || lower.includes("not a directory")) && NUL_MARKER_RE.test(message);
	}
	async tryRepairNullByteCollections(err, reason) {
		if (this.attemptedNullByteCollectionRepair) return false;
		if (!this.shouldRepairNullByteCollectionError(err)) return false;
		this.attemptedNullByteCollectionRepair = true;
		log.warn(`qmd update failed with suspected null-byte collection metadata (${reason}); rebuilding managed collections and retrying once`);
		for (const collection of this.qmd.collections) {
			try {
				await this.removeCollection(collection.name);
			} catch (removeErr) {
				const removeMessage = removeErr instanceof Error ? removeErr.message : String(removeErr);
				if (!this.isCollectionMissingError(removeMessage)) log.warn(`qmd collection remove failed for ${collection.name}: ${removeMessage}`);
			}
			try {
				await this.addCollection(collection.path, collection.name, collection.pattern);
			} catch (addErr) {
				const addMessage = addErr instanceof Error ? addErr.message : String(addErr);
				if (!this.isCollectionAlreadyExistsError(addMessage)) log.warn(`qmd collection add failed for ${collection.name}: ${addMessage}`);
			}
		}
		return true;
	}
	async search(query, opts) {
		if (!this.isScopeAllowed(opts?.sessionKey)) {
			this.logScopeDenied(opts?.sessionKey);
			return [];
		}
		const trimmed = query.trim();
		if (!trimmed) return [];
		await this.waitForPendingUpdateBeforeSearch();
		const limit = Math.min(this.qmd.limits.maxResults, opts?.maxResults ?? this.qmd.limits.maxResults);
		const collectionNames = this.listManagedCollectionNames();
		if (collectionNames.length === 0) {
			log.warn("qmd query skipped: no managed collections configured");
			return [];
		}
		const qmdSearchCommand = this.qmd.searchMode;
		let parsed;
		try {
			if (collectionNames.length > 1) parsed = await this.runQueryAcrossCollections(trimmed, limit, collectionNames, qmdSearchCommand);
			else {
				const args = this.buildSearchArgs(qmdSearchCommand, trimmed, limit);
				args.push(...this.buildCollectionFilterArgs(collectionNames));
				const result = await this.runQmd(args, { timeoutMs: this.qmd.limits.timeoutMs });
				parsed = parseQmdQueryJson(result.stdout, result.stderr);
			}
		} catch (err) {
			if (qmdSearchCommand !== "query" && this.isUnsupportedQmdOptionError(err)) {
				log.warn(`qmd ${qmdSearchCommand} does not support configured flags; retrying search with qmd query`);
				try {
					if (collectionNames.length > 1) parsed = await this.runQueryAcrossCollections(trimmed, limit, collectionNames, "query");
					else {
						const fallbackArgs = this.buildSearchArgs("query", trimmed, limit);
						fallbackArgs.push(...this.buildCollectionFilterArgs(collectionNames));
						const fallback = await this.runQmd(fallbackArgs, { timeoutMs: this.qmd.limits.timeoutMs });
						parsed = parseQmdQueryJson(fallback.stdout, fallback.stderr);
					}
				} catch (fallbackErr) {
					log.warn(`qmd query fallback failed: ${String(fallbackErr)}`);
					throw fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr));
				}
			} else {
				log.warn(`qmd ${qmdSearchCommand} failed: ${String(err)}`);
				throw err instanceof Error ? err : new Error(String(err));
			}
		}
		const results = [];
		for (const entry of parsed) {
			const doc = await this.resolveDocLocation(entry.docid, {
				preferredCollection: entry.collection,
				preferredFile: entry.file
			});
			if (!doc) continue;
			const snippet = entry.snippet?.slice(0, this.qmd.limits.maxSnippetChars) ?? "";
			const lines = this.extractSnippetLines(snippet);
			const score = typeof entry.score === "number" ? entry.score : 0;
			if (score < (opts?.minScore ?? 0)) continue;
			results.push({
				path: doc.rel,
				startLine: lines.startLine,
				endLine: lines.endLine,
				score,
				snippet,
				source: doc.source
			});
		}
		return this.clampResultsByInjectedChars(this.diversifyResultsBySource(results, limit));
	}
	async sync(params) {
		if (params?.progress) params.progress({
			completed: 0,
			total: 1,
			label: "Updating QMD index…"
		});
		await this.runUpdate(params?.reason ?? "manual", params?.force);
		if (params?.progress) params.progress({
			completed: 1,
			total: 1,
			label: "QMD index updated"
		});
	}
	async readFile(params) {
		const relPath = params.relPath?.trim();
		if (!relPath) throw new Error("path required");
		const absPath = this.resolveReadPath(relPath);
		if (!absPath.endsWith(".md")) throw new Error("path required");
		if ((await statRegularFile(absPath)).missing) return {
			text: "",
			path: relPath
		};
		if (params.from !== void 0 || params.lines !== void 0) {
			const partial = await this.readPartialText(absPath, params.from, params.lines);
			if (partial.missing) return {
				text: "",
				path: relPath
			};
			return {
				text: partial.text,
				path: relPath
			};
		}
		const full = await this.readFullText(absPath);
		if (full.missing) return {
			text: "",
			path: relPath
		};
		if (!params.from && !params.lines) return {
			text: full.text,
			path: relPath
		};
		const lines = full.text.split("\n");
		const start = Math.max(1, params.from ?? 1);
		const count = Math.max(1, params.lines ?? lines.length);
		return {
			text: lines.slice(start - 1, start - 1 + count).join("\n"),
			path: relPath
		};
	}
	status() {
		const counts = this.readCounts();
		return {
			backend: "qmd",
			provider: "qmd",
			model: "qmd",
			requestedProvider: "qmd",
			files: counts.totalDocuments,
			chunks: counts.totalDocuments,
			dirty: false,
			workspaceDir: this.workspaceDir,
			dbPath: this.indexPath,
			sources: Array.from(this.sources),
			sourceCounts: counts.sourceCounts,
			vector: {
				enabled: true,
				available: true
			},
			batch: {
				enabled: false,
				failures: 0,
				limit: 0,
				wait: false,
				concurrency: 0,
				pollIntervalMs: 0,
				timeoutMs: 0
			},
			custom: { qmd: {
				collections: this.qmd.collections.length,
				lastUpdateAt: this.lastUpdateAt
			} }
		};
	}
	async probeEmbeddingAvailability() {
		return { ok: true };
	}
	async probeVectorAvailability() {
		return true;
	}
	async close() {
		if (this.closed) return;
		this.closed = true;
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = null;
		}
		this.queuedForcedRuns = 0;
		await this.pendingUpdate?.catch(() => void 0);
		await this.queuedForcedUpdate?.catch(() => void 0);
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}
	async runUpdate(reason, force, opts) {
		if (this.closed) return;
		if (this.pendingUpdate) {
			if (force) return this.enqueueForcedUpdate(reason);
			return this.pendingUpdate;
		}
		if (this.queuedForcedUpdate && !opts?.fromForcedQueue) {
			if (force) return this.enqueueForcedUpdate(reason);
			return this.queuedForcedUpdate;
		}
		if (this.shouldSkipUpdate(force)) return;
		const run = async () => {
			if (this.sessionExporter) await this.exportSessions();
			await this.runQmdUpdateWithRetry(reason);
			if (this.shouldRunEmbed(force)) try {
				await runWithQmdEmbedLock(async () => {
					await this.runQmd(["embed"], { timeoutMs: this.qmd.update.embedTimeoutMs });
				});
				this.lastEmbedAt = Date.now();
				this.embedBackoffUntil = null;
				this.embedFailureCount = 0;
			} catch (err) {
				this.noteEmbedFailure(reason, err);
			}
			this.lastUpdateAt = Date.now();
			this.docPathCache.clear();
		};
		this.pendingUpdate = run().finally(() => {
			this.pendingUpdate = null;
		});
		await this.pendingUpdate;
	}
	async runQmdUpdateWithRetry(reason) {
		const maxAttempts = reason === "boot" || reason.startsWith("boot:") ? 3 : 1;
		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) try {
			await this.runQmdUpdateOnce(reason);
			return;
		} catch (err) {
			if (attempt >= maxAttempts || !this.isRetryableUpdateError(err)) throw err;
			const delayMs = 500 * 2 ** (attempt - 1);
			log.warn(`qmd update retry ${attempt}/${maxAttempts - 1} after failure (${reason}): ${String(err)}`);
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
	async runQmdUpdateOnce(reason) {
		try {
			await this.runQmd(["update"], { timeoutMs: this.qmd.update.updateTimeoutMs });
		} catch (err) {
			if (!await this.tryRepairNullByteCollections(err, reason)) throw err;
			await this.runQmd(["update"], { timeoutMs: this.qmd.update.updateTimeoutMs });
		}
	}
	isRetryableUpdateError(err) {
		if (this.isSqliteBusyError(err)) return true;
		return (err instanceof Error ? err.message : String(err)).toLowerCase().includes("timed out");
	}
	shouldRunEmbed(force) {
		if (this.qmd.searchMode === "search") return false;
		const now = Date.now();
		if (this.embedBackoffUntil !== null && now < this.embedBackoffUntil) return false;
		const embedIntervalMs = this.qmd.update.embedIntervalMs;
		return Boolean(force) || this.lastEmbedAt === null || embedIntervalMs > 0 && now - this.lastEmbedAt > embedIntervalMs;
	}
	noteEmbedFailure(reason, err) {
		this.embedFailureCount += 1;
		const delayMs = Math.min(QMD_EMBED_BACKOFF_MAX_MS, QMD_EMBED_BACKOFF_BASE_MS * 2 ** Math.max(0, this.embedFailureCount - 1));
		this.embedBackoffUntil = Date.now() + delayMs;
		log.warn(`qmd embed failed (${reason}): ${String(err)}; backing off for ${Math.ceil(delayMs / 1e3)}s`);
	}
	enqueueForcedUpdate(reason) {
		this.queuedForcedRuns += 1;
		if (!this.queuedForcedUpdate) this.queuedForcedUpdate = this.drainForcedUpdates(reason).finally(() => {
			this.queuedForcedUpdate = null;
		});
		return this.queuedForcedUpdate;
	}
	async drainForcedUpdates(reason) {
		await this.pendingUpdate?.catch(() => void 0);
		while (!this.closed && this.queuedForcedRuns > 0) {
			this.queuedForcedRuns -= 1;
			await this.runUpdate(`${reason}:queued`, true, { fromForcedQueue: true });
		}
	}
	/**
	* Symlink the default QMD models directory into our custom XDG_CACHE_HOME so
	* that the pre-installed ML models (~/.cache/qmd/models/) are reused rather
	* than re-downloaded for every agent.  If the default models directory does
	* not exist, or a models directory/symlink already exists in the target, this
	* is a no-op.
	*/
	async symlinkSharedModels() {
		const defaultCacheHome = process.env.XDG_CACHE_HOME || (process.platform === "win32" ? process.env.LOCALAPPDATA : void 0) || path.join(os.homedir(), ".cache");
		const defaultModelsDir = path.join(defaultCacheHome, "qmd", "models");
		const targetModelsDir = path.join(this.xdgCacheHome, "qmd", "models");
		try {
			if (!(await fs.stat(defaultModelsDir).catch((err) => {
				if (err.code === "ENOENT") return null;
				throw err;
			}))?.isDirectory()) return;
			try {
				await fs.lstat(targetModelsDir);
				return;
			} catch {}
			try {
				await fs.symlink(defaultModelsDir, targetModelsDir, "dir");
			} catch (symlinkErr) {
				const code = symlinkErr.code;
				if (process.platform === "win32" && (code === "EPERM" || code === "ENOTSUP")) await fs.symlink(defaultModelsDir, targetModelsDir, "junction");
				else throw symlinkErr;
			}
			log.debug(`symlinked qmd models: ${defaultModelsDir} → ${targetModelsDir}`);
		} catch (err) {
			log.warn(`failed to symlink qmd models directory: ${String(err)}`);
		}
	}
	async runQmd(args, opts) {
		return await new Promise((resolve, reject) => {
			const child = spawn(this.qmd.command, args, {
				env: this.env,
				cwd: this.workspaceDir
			});
			let stdout = "";
			let stderr = "";
			let stdoutTruncated = false;
			let stderrTruncated = false;
			const timer = opts?.timeoutMs ? setTimeout(() => {
				child.kill("SIGKILL");
				reject(/* @__PURE__ */ new Error(`qmd ${args.join(" ")} timed out after ${opts.timeoutMs}ms`));
			}, opts.timeoutMs) : null;
			child.stdout.on("data", (data) => {
				const next = appendOutputWithCap(stdout, data.toString("utf8"), this.maxQmdOutputChars);
				stdout = next.text;
				stdoutTruncated = stdoutTruncated || next.truncated;
			});
			child.stderr.on("data", (data) => {
				const next = appendOutputWithCap(stderr, data.toString("utf8"), this.maxQmdOutputChars);
				stderr = next.text;
				stderrTruncated = stderrTruncated || next.truncated;
			});
			child.on("error", (err) => {
				if (timer) clearTimeout(timer);
				reject(err);
			});
			child.on("close", (code) => {
				if (timer) clearTimeout(timer);
				if (stdoutTruncated || stderrTruncated) {
					reject(/* @__PURE__ */ new Error(`qmd ${args.join(" ")} produced too much output (limit ${this.maxQmdOutputChars} chars)`));
					return;
				}
				if (code === 0) resolve({
					stdout,
					stderr
				});
				else reject(/* @__PURE__ */ new Error(`qmd ${args.join(" ")} failed (code ${code}): ${stderr || stdout}`));
			});
		});
	}
	async readPartialText(absPath, from, lines) {
		const start = Math.max(1, from ?? 1);
		const count = Math.max(1, lines ?? Number.POSITIVE_INFINITY);
		let handle;
		try {
			handle = await fs.open(absPath);
		} catch (err) {
			if (isFileMissingError(err)) return { missing: true };
			throw err;
		}
		const stream = handle.createReadStream({ encoding: "utf-8" });
		const rl = readline.createInterface({
			input: stream,
			crlfDelay: Infinity
		});
		const selected = [];
		let index = 0;
		try {
			for await (const line of rl) {
				index += 1;
				if (index < start) continue;
				if (selected.length >= count) break;
				selected.push(line);
			}
		} finally {
			rl.close();
			await handle.close();
		}
		return {
			missing: false,
			text: selected.slice(0, count).join("\n")
		};
	}
	async readFullText(absPath) {
		try {
			return {
				missing: false,
				text: await fs.readFile(absPath, "utf-8")
			};
		} catch (err) {
			if (isFileMissingError(err)) return { missing: true };
			throw err;
		}
	}
	ensureDb() {
		if (this.db) return this.db;
		const { DatabaseSync } = requireNodeSqlite();
		this.db = new DatabaseSync(this.indexPath, { readOnly: true });
		this.db.exec("PRAGMA busy_timeout = 1");
		return this.db;
	}
	async exportSessions() {
		if (!this.sessionExporter) return;
		const exportDir = this.sessionExporter.dir;
		await fs.mkdir(exportDir, { recursive: true });
		const files = await listSessionFilesForAgent(this.agentId);
		const keep = /* @__PURE__ */ new Set();
		const tracked = /* @__PURE__ */ new Set();
		const cutoff = this.sessionExporter.retentionMs ? Date.now() - this.sessionExporter.retentionMs : null;
		for (const sessionFile of files) {
			const entry = await buildSessionEntry(sessionFile);
			if (!entry) continue;
			if (cutoff && entry.mtimeMs < cutoff) continue;
			const target = path.join(exportDir, `${path.basename(sessionFile, ".jsonl")}.md`);
			tracked.add(sessionFile);
			const state = this.exportedSessionState.get(sessionFile);
			if (!state || state.hash !== entry.hash || state.mtimeMs !== entry.mtimeMs) await fs.writeFile(target, this.renderSessionMarkdown(entry), "utf-8");
			this.exportedSessionState.set(sessionFile, {
				hash: entry.hash,
				mtimeMs: entry.mtimeMs,
				target
			});
			keep.add(target);
		}
		const exported = await fs.readdir(exportDir).catch(() => []);
		for (const name of exported) {
			if (!name.endsWith(".md")) continue;
			const full = path.join(exportDir, name);
			if (!keep.has(full)) await fs.rm(full, { force: true });
		}
		for (const [sessionFile, state] of this.exportedSessionState) if (!tracked.has(sessionFile) || !state.target.startsWith(exportDir + path.sep)) this.exportedSessionState.delete(sessionFile);
	}
	renderSessionMarkdown(entry) {
		return `${`# Session ${path.basename(entry.absPath, path.extname(entry.absPath))}`}\n\n${entry.content?.trim().length ? entry.content.trim() : "(empty)"}\n`;
	}
	pickSessionCollectionName() {
		const existing = new Set(this.qmd.collections.map((collection) => collection.name));
		const base = `sessions-${this.sanitizeCollectionNameSegment(this.agentId)}`;
		if (!existing.has(base)) return base;
		let counter = 2;
		let candidate = `${base}-${counter}`;
		while (existing.has(candidate)) {
			counter += 1;
			candidate = `${base}-${counter}`;
		}
		return candidate;
	}
	sanitizeCollectionNameSegment(input) {
		return input.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "agent";
	}
	async resolveDocLocation(docid, hints) {
		if (!docid) return null;
		const normalized = docid.startsWith("#") ? docid.slice(1) : docid;
		if (!normalized) return null;
		const cacheKey = `${hints?.preferredCollection ?? "*"}:${normalized}`;
		const cached = this.docPathCache.get(cacheKey);
		if (cached) return cached;
		const db = this.ensureDb();
		let rows = [];
		try {
			rows = db.prepare("SELECT collection, path FROM documents WHERE hash = ? AND active = 1").all(normalized);
			if (rows.length === 0) rows = db.prepare("SELECT collection, path FROM documents WHERE hash LIKE ? AND active = 1").all(`${normalized}%`);
		} catch (err) {
			if (this.isSqliteBusyError(err)) {
				log.debug(`qmd index is busy while resolving doc path: ${String(err)}`);
				throw this.createQmdBusyError(err);
			}
			throw err;
		}
		if (rows.length === 0) return null;
		const location = this.pickDocLocation(rows, hints);
		if (!location) return null;
		this.docPathCache.set(cacheKey, location);
		return location;
	}
	pickDocLocation(rows, hints) {
		if (hints?.preferredCollection) for (const row of rows) {
			if (row.collection !== hints.preferredCollection) continue;
			const location = this.toDocLocation(row.collection, row.path);
			if (location) return location;
		}
		if (hints?.preferredFile) {
			const preferred = path.normalize(hints.preferredFile);
			for (const row of rows) {
				const rowPath = path.normalize(row.path);
				if (rowPath !== preferred && !rowPath.endsWith(path.sep + preferred)) continue;
				const location = this.toDocLocation(row.collection, row.path);
				if (location) return location;
			}
		}
		for (const row of rows) {
			const location = this.toDocLocation(row.collection, row.path);
			if (location) return location;
		}
		return null;
	}
	extractSnippetLines(snippet) {
		const match = SNIPPET_HEADER_RE.exec(snippet);
		if (match) {
			const start = Number(match[1]);
			const count = Number(match[2]);
			if (Number.isFinite(start) && Number.isFinite(count)) return {
				startLine: start,
				endLine: start + count - 1
			};
		}
		return {
			startLine: 1,
			endLine: snippet.split("\n").length
		};
	}
	readCounts() {
		try {
			const rows = this.ensureDb().prepare("SELECT collection, COUNT(*) as c FROM documents WHERE active = 1 GROUP BY collection").all();
			const bySource = /* @__PURE__ */ new Map();
			for (const source of this.sources) bySource.set(source, {
				files: 0,
				chunks: 0
			});
			let total = 0;
			for (const row of rows) {
				const source = this.collectionRoots.get(row.collection)?.kind ?? "memory";
				const entry = bySource.get(source) ?? {
					files: 0,
					chunks: 0
				};
				entry.files += row.c ?? 0;
				entry.chunks += row.c ?? 0;
				bySource.set(source, entry);
				total += row.c ?? 0;
			}
			return {
				totalDocuments: total,
				sourceCounts: Array.from(bySource.entries()).map(([source, value]) => ({
					source,
					files: value.files,
					chunks: value.chunks
				}))
			};
		} catch (err) {
			log.warn(`failed to read qmd index stats: ${String(err)}`);
			return {
				totalDocuments: 0,
				sourceCounts: Array.from(this.sources).map((source) => ({
					source,
					files: 0,
					chunks: 0
				}))
			};
		}
	}
	logScopeDenied(sessionKey) {
		const channel = deriveQmdScopeChannel(sessionKey) ?? "unknown";
		const chatType = deriveQmdScopeChatType(sessionKey) ?? "unknown";
		const key = sessionKey?.trim() || "<none>";
		log.warn(`qmd search denied by scope (channel=${channel}, chatType=${chatType}, session=${key})`);
	}
	isScopeAllowed(sessionKey) {
		return isQmdScopeAllowed(this.qmd.scope, sessionKey);
	}
	toDocLocation(collection, collectionRelativePath) {
		const root = this.collectionRoots.get(collection);
		if (!root) return null;
		const normalizedRelative = collectionRelativePath.replace(/\\/g, "/");
		const absPath = path.normalize(path.resolve(root.path, collectionRelativePath));
		const relativeToWorkspace = path.relative(this.workspaceDir, absPath);
		return {
			rel: this.buildSearchPath(collection, normalizedRelative, relativeToWorkspace, absPath),
			abs: absPath,
			source: root.kind
		};
	}
	buildSearchPath(collection, collectionRelativePath, relativeToWorkspace, absPath) {
		if (this.isInsideWorkspace(relativeToWorkspace)) {
			const normalized = relativeToWorkspace.replace(/\\/g, "/");
			if (!normalized) return path.basename(absPath);
			return normalized;
		}
		return `qmd/${collection}/${collectionRelativePath.replace(/^\/+/, "")}`;
	}
	isInsideWorkspace(relativePath) {
		if (!relativePath) return true;
		if (relativePath.startsWith("..")) return false;
		if (relativePath.startsWith(`..${path.sep}`)) return false;
		return !path.isAbsolute(relativePath);
	}
	resolveReadPath(relPath) {
		if (relPath.startsWith("qmd/")) {
			const [, collection, ...rest] = relPath.split("/");
			if (!collection || rest.length === 0) throw new Error("invalid qmd path");
			const root = this.collectionRoots.get(collection);
			if (!root) throw new Error(`unknown qmd collection: ${collection}`);
			const joined = rest.join("/");
			const resolved = path.resolve(root.path, joined);
			if (!this.isWithinRoot(root.path, resolved)) throw new Error("qmd path escapes collection");
			return resolved;
		}
		const absPath = path.resolve(this.workspaceDir, relPath);
		if (!this.isWithinWorkspace(absPath)) throw new Error("path escapes workspace");
		return absPath;
	}
	isWithinWorkspace(absPath) {
		const normalizedWorkspace = this.workspaceDir.endsWith(path.sep) ? this.workspaceDir : `${this.workspaceDir}${path.sep}`;
		if (absPath === this.workspaceDir) return true;
		return (absPath.endsWith(path.sep) ? absPath : `${absPath}${path.sep}`).startsWith(normalizedWorkspace);
	}
	isWithinRoot(root, candidate) {
		const normalizedRoot = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
		if (candidate === root) return true;
		return (candidate.endsWith(path.sep) ? candidate : `${candidate}${path.sep}`).startsWith(normalizedRoot);
	}
	clampResultsByInjectedChars(results) {
		const budget = this.qmd.limits.maxInjectedChars;
		if (!budget || budget <= 0) return results;
		let remaining = budget;
		const clamped = [];
		for (const entry of results) {
			if (remaining <= 0) break;
			const snippet = entry.snippet ?? "";
			if (snippet.length <= remaining) {
				clamped.push(entry);
				remaining -= snippet.length;
			} else {
				const trimmed = snippet.slice(0, Math.max(0, remaining));
				clamped.push({
					...entry,
					snippet: trimmed
				});
				break;
			}
		}
		return clamped;
	}
	diversifyResultsBySource(results, limit) {
		const target = Math.max(0, limit);
		if (target <= 0) return [];
		if (results.length <= 1) return results.slice(0, target);
		const bySource = /* @__PURE__ */ new Map();
		for (const entry of results) {
			const list = bySource.get(entry.source) ?? [];
			list.push(entry);
			bySource.set(entry.source, list);
		}
		const hasSessions = bySource.has("sessions");
		const hasMemory = bySource.has("memory");
		if (!hasSessions || !hasMemory) return results.slice(0, target);
		const sourceOrder = Array.from(bySource.entries()).toSorted((a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0)).map(([source]) => source);
		const diversified = [];
		while (diversified.length < target) {
			let emitted = false;
			for (const source of sourceOrder) {
				const next = bySource.get(source)?.shift();
				if (!next) continue;
				diversified.push(next);
				emitted = true;
				if (diversified.length >= target) break;
			}
			if (!emitted) break;
		}
		return diversified;
	}
	shouldSkipUpdate(force) {
		if (force) return false;
		const debounceMs = this.qmd.update.debounceMs;
		if (debounceMs <= 0) return false;
		if (!this.lastUpdateAt) return false;
		return Date.now() - this.lastUpdateAt < debounceMs;
	}
	isSqliteBusyError(err) {
		const normalized = (err instanceof Error ? err.message : String(err)).toLowerCase();
		return normalized.includes("sqlite_busy") || normalized.includes("database is locked");
	}
	isUnsupportedQmdOptionError(err) {
		const normalized = (err instanceof Error ? err.message : String(err)).toLowerCase();
		return normalized.includes("unknown flag") || normalized.includes("unknown option") || normalized.includes("unrecognized option") || normalized.includes("flag provided but not defined") || normalized.includes("unexpected argument");
	}
	createQmdBusyError(err) {
		const message = err instanceof Error ? err.message : String(err);
		return /* @__PURE__ */ new Error(`qmd index busy while reading results: ${message}`);
	}
	async waitForPendingUpdateBeforeSearch() {
		const pending = this.pendingUpdate;
		if (!pending) return;
		await Promise.race([pending.catch(() => void 0), new Promise((resolve) => setTimeout(resolve, SEARCH_PENDING_UPDATE_WAIT_MS))]);
	}
	async runQueryAcrossCollections(query, limit, collectionNames, command) {
		log.debug(`qmd ${command} multi-collection workaround active (${collectionNames.length} collections)`);
		const bestByDocId = /* @__PURE__ */ new Map();
		for (const collectionName of collectionNames) {
			const args = this.buildSearchArgs(command, query, limit);
			args.push("-c", collectionName);
			const result = await this.runQmd(args, { timeoutMs: this.qmd.limits.timeoutMs });
			const parsed = parseQmdQueryJson(result.stdout, result.stderr);
			for (const entry of parsed) {
				const normalizedDocId = typeof entry.docid === "string" && entry.docid.trim().length > 0 ? entry.docid : void 0;
				if (!normalizedDocId) continue;
				const withCollection = {
					...entry,
					docid: normalizedDocId,
					collection: entry.collection ?? collectionName
				};
				const prev = bestByDocId.get(normalizedDocId);
				const prevScore = typeof prev?.score === "number" ? prev.score : Number.NEGATIVE_INFINITY;
				const nextScore = typeof withCollection.score === "number" ? withCollection.score : Number.NEGATIVE_INFINITY;
				if (!prev || nextScore > prevScore) bestByDocId.set(normalizedDocId, withCollection);
			}
		}
		return [...bestByDocId.values()].toSorted((a, b) => (b.score ?? 0) - (a.score ?? 0));
	}
	listManagedCollectionNames() {
		const seen = /* @__PURE__ */ new Set();
		const names = [];
		for (const collection of this.qmd.collections) {
			const name = collection.name?.trim();
			if (!name || seen.has(name)) continue;
			seen.add(name);
			names.push(name);
		}
		return names;
	}
	buildCollectionFilterArgs(collectionNames) {
		if (collectionNames.length === 0) return [];
		return collectionNames.filter(Boolean).flatMap((name) => ["-c", name]);
	}
	buildSearchArgs(command, query, limit) {
		if (command === "query") return [
			"query",
			query,
			"--json",
			"-n",
			String(limit)
		];
		return [
			command,
			query,
			"--json",
			"-n",
			String(limit)
		];
	}
};
function appendOutputWithCap(current, chunk, maxChars) {
	const appended = current + chunk;
	if (appended.length <= maxChars) return {
		text: appended,
		truncated: false
	};
	return {
		text: appended.slice(-maxChars),
		truncated: true
	};
}

//#endregion
export { QmdMemoryManager };