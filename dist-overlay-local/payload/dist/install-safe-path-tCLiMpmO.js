import { n as resolveSafeBaseDir } from "./path-safety-BqPJ8DDQ.js";
import { createWriteStream } from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import JSZip from "jszip";
import * as tar from "tar";

//#region src/infra/archive-path.ts
function isWindowsDrivePath(value) {
	return /^[a-zA-Z]:[\\/]/.test(value);
}
function normalizeArchiveEntryPath(raw) {
	return raw.replaceAll("\\", "/");
}
function validateArchiveEntryPath(entryPath, params) {
	if (!entryPath || entryPath === "." || entryPath === "./") return;
	if (isWindowsDrivePath(entryPath)) throw new Error(`archive entry uses a drive path: ${entryPath}`);
	const normalized = path.posix.normalize(normalizeArchiveEntryPath(entryPath));
	const escapeLabel = params?.escapeLabel ?? "destination";
	if (normalized === ".." || normalized.startsWith("../")) throw new Error(`archive entry escapes ${escapeLabel}: ${entryPath}`);
	if (path.posix.isAbsolute(normalized) || normalized.startsWith("//")) throw new Error(`archive entry is absolute: ${entryPath}`);
}
function stripArchivePath(entryPath, stripComponents) {
	const raw = normalizeArchiveEntryPath(entryPath);
	if (!raw || raw === "." || raw === "./") return null;
	const parts = raw.split("/").filter((part) => part.length > 0 && part !== ".");
	const strip = Math.max(0, Math.floor(stripComponents));
	const stripped = strip === 0 ? parts.join("/") : parts.slice(strip).join("/");
	const result = path.posix.normalize(stripped);
	if (!result || result === "." || result === "./") return null;
	return result;
}
function resolveArchiveOutputPath(params) {
	const safeBase = resolveSafeBaseDir(params.rootDir);
	const outPath = path.resolve(params.rootDir, params.relPath);
	const escapeLabel = params.escapeLabel ?? "destination";
	if (!outPath.startsWith(safeBase)) throw new Error(`archive entry escapes ${escapeLabel}: ${params.originalPath}`);
	return outPath;
}

//#endregion
//#region src/infra/archive.ts
/** @internal */
const DEFAULT_MAX_ARCHIVE_BYTES_ZIP = 256 * 1024 * 1024;
/** @internal */
const DEFAULT_MAX_ENTRIES = 5e4;
/** @internal */
const DEFAULT_MAX_EXTRACTED_BYTES = 512 * 1024 * 1024;
/** @internal */
const DEFAULT_MAX_ENTRY_BYTES = 256 * 1024 * 1024;
const ERROR_ARCHIVE_SIZE_EXCEEDS_LIMIT = "archive size exceeds limit";
const ERROR_ARCHIVE_ENTRY_COUNT_EXCEEDS_LIMIT = "archive entry count exceeds limit";
const ERROR_ARCHIVE_ENTRY_EXTRACTED_SIZE_EXCEEDS_LIMIT = "archive entry extracted size exceeds limit";
const ERROR_ARCHIVE_EXTRACTED_SIZE_EXCEEDS_LIMIT = "archive extracted size exceeds limit";
const TAR_SUFFIXES = [
	".tgz",
	".tar.gz",
	".tar"
];
function resolveArchiveKind(filePath) {
	const lower = filePath.toLowerCase();
	if (lower.endsWith(".zip")) return "zip";
	if (TAR_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return "tar";
	return null;
}
async function resolvePackedRootDir(extractDir) {
	const direct = path.join(extractDir, "package");
	try {
		if ((await fs$1.stat(direct)).isDirectory()) return direct;
	} catch {}
	const dirs = (await fs$1.readdir(extractDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
	if (dirs.length !== 1) throw new Error(`unexpected archive layout (dirs: ${dirs.join(", ")})`);
	const onlyDir = dirs[0];
	if (!onlyDir) throw new Error("unexpected archive layout (no package dir found)");
	return path.join(extractDir, onlyDir);
}
async function withTimeout(promise, timeoutMs, label) {
	let timeoutId;
	try {
		return await Promise.race([promise, new Promise((_, reject) => {
			timeoutId = setTimeout(() => reject(/* @__PURE__ */ new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
		})]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}
function clampLimit(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return;
	const v = Math.floor(value);
	return v > 0 ? v : void 0;
}
function resolveExtractLimits(limits) {
	return {
		maxArchiveBytes: clampLimit(limits?.maxArchiveBytes) ?? DEFAULT_MAX_ARCHIVE_BYTES_ZIP,
		maxEntries: clampLimit(limits?.maxEntries) ?? DEFAULT_MAX_ENTRIES,
		maxExtractedBytes: clampLimit(limits?.maxExtractedBytes) ?? DEFAULT_MAX_EXTRACTED_BYTES,
		maxEntryBytes: clampLimit(limits?.maxEntryBytes) ?? DEFAULT_MAX_ENTRY_BYTES
	};
}
function assertArchiveEntryCountWithinLimit(entryCount, limits) {
	if (entryCount > limits.maxEntries) throw new Error(ERROR_ARCHIVE_ENTRY_COUNT_EXCEEDS_LIMIT);
}
function createByteBudgetTracker(limits) {
	let entryBytes = 0;
	let extractedBytes = 0;
	const addBytes = (bytes) => {
		const b = Math.max(0, Math.floor(bytes));
		if (b === 0) return;
		entryBytes += b;
		if (entryBytes > limits.maxEntryBytes) throw new Error(ERROR_ARCHIVE_ENTRY_EXTRACTED_SIZE_EXCEEDS_LIMIT);
		extractedBytes += b;
		if (extractedBytes > limits.maxExtractedBytes) throw new Error(ERROR_ARCHIVE_EXTRACTED_SIZE_EXCEEDS_LIMIT);
	};
	return {
		startEntry() {
			entryBytes = 0;
		},
		addBytes,
		addEntrySize(size) {
			const s = Math.max(0, Math.floor(size));
			if (s > limits.maxEntryBytes) throw new Error(ERROR_ARCHIVE_ENTRY_EXTRACTED_SIZE_EXCEEDS_LIMIT);
			addBytes(s);
		}
	};
}
function createExtractBudgetTransform(params) {
	return new Transform({ transform(chunk, _encoding, callback) {
		try {
			const buf = chunk instanceof Buffer ? chunk : Buffer.from(chunk);
			params.onChunkBytes(buf.byteLength);
			callback(null, buf);
		} catch (err) {
			callback(err instanceof Error ? err : new Error(String(err)));
		}
	} });
}
async function readZipEntryStream(entry) {
	if (typeof entry.nodeStream === "function") return entry.nodeStream();
	const buf = await entry.async("nodebuffer");
	return Readable.from(buf);
}
async function extractZip(params) {
	const limits = resolveExtractLimits(params.limits);
	if ((await fs$1.stat(params.archivePath)).size > limits.maxArchiveBytes) throw new Error(ERROR_ARCHIVE_SIZE_EXCEEDS_LIMIT);
	const buffer = await fs$1.readFile(params.archivePath);
	const zip = await JSZip.loadAsync(buffer);
	const entries = Object.values(zip.files);
	const strip = Math.max(0, Math.floor(params.stripComponents ?? 0));
	assertArchiveEntryCountWithinLimit(entries.length, limits);
	const budget = createByteBudgetTracker(limits);
	for (const entry of entries) {
		validateArchiveEntryPath(entry.name);
		const relPath = stripArchivePath(entry.name, strip);
		if (!relPath) continue;
		validateArchiveEntryPath(relPath);
		const outPath = resolveArchiveOutputPath({
			rootDir: params.destDir,
			relPath,
			originalPath: entry.name
		});
		if (entry.dir) {
			await fs$1.mkdir(outPath, { recursive: true });
			continue;
		}
		await fs$1.mkdir(path.dirname(outPath), { recursive: true });
		budget.startEntry();
		const readable = await readZipEntryStream(entry);
		try {
			await pipeline(readable, createExtractBudgetTransform({ onChunkBytes: budget.addBytes }), createWriteStream(outPath));
		} catch (err) {
			await fs$1.unlink(outPath).catch(() => void 0);
			throw err;
		}
		if (typeof entry.unixPermissions === "number") {
			const mode = entry.unixPermissions & 511;
			if (mode !== 0) await fs$1.chmod(outPath, mode).catch(() => void 0);
		}
	}
}
function readTarEntryInfo(entry) {
	return {
		path: typeof entry === "object" && entry !== null && "path" in entry ? String(entry.path) : "",
		type: typeof entry === "object" && entry !== null && "type" in entry ? String(entry.type) : "",
		size: typeof entry === "object" && entry !== null && "size" in entry && typeof entry.size === "number" && Number.isFinite(entry.size) ? Math.max(0, Math.floor(entry.size)) : 0
	};
}
async function extractArchive(params) {
	const kind = params.kind ?? resolveArchiveKind(params.archivePath);
	if (!kind) throw new Error(`unsupported archive: ${params.archivePath}`);
	const label = kind === "zip" ? "extract zip" : "extract tar";
	if (kind === "tar") {
		const strip = Math.max(0, Math.floor(params.stripComponents ?? 0));
		const limits = resolveExtractLimits(params.limits);
		let entryCount = 0;
		const budget = createByteBudgetTracker(limits);
		await withTimeout(tar.x({
			file: params.archivePath,
			cwd: params.destDir,
			strip,
			gzip: params.tarGzip,
			preservePaths: false,
			strict: true,
			onReadEntry(entry) {
				const info = readTarEntryInfo(entry);
				try {
					validateArchiveEntryPath(info.path);
					const relPath = stripArchivePath(info.path, strip);
					if (!relPath) return;
					validateArchiveEntryPath(relPath);
					resolveArchiveOutputPath({
						rootDir: params.destDir,
						relPath,
						originalPath: info.path
					});
					if (info.type === "SymbolicLink" || info.type === "Link" || info.type === "BlockDevice" || info.type === "CharacterDevice" || info.type === "FIFO" || info.type === "Socket") throw new Error(`tar entry is a link: ${info.path}`);
					entryCount += 1;
					assertArchiveEntryCountWithinLimit(entryCount, limits);
					budget.addEntrySize(info.size);
				} catch (err) {
					const error = err instanceof Error ? err : new Error(String(err));
					this.abort?.(error);
				}
			}
		}), params.timeoutMs, label);
		return;
	}
	await withTimeout(extractZip({
		archivePath: params.archivePath,
		destDir: params.destDir,
		stripComponents: params.stripComponents,
		limits: params.limits
	}), params.timeoutMs, label);
}
async function fileExists(filePath) {
	try {
		await fs$1.stat(filePath);
		return true;
	} catch {
		return false;
	}
}
async function readJsonFile(filePath) {
	const raw = await fs$1.readFile(filePath, "utf-8");
	return JSON.parse(raw);
}

//#endregion
//#region src/infra/install-safe-path.ts
function unscopedPackageName(name) {
	const trimmed = name.trim();
	if (!trimmed) return trimmed;
	return trimmed.includes("/") ? trimmed.split("/").pop() ?? trimmed : trimmed;
}
function safeDirName(input) {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	return trimmed.replaceAll("/", "__").replaceAll("\\", "__");
}
function safePathSegmentHashed(input) {
	const trimmed = input.trim();
	const base = trimmed.replaceAll(/[\\/]/g, "-").replaceAll(/[^a-zA-Z0-9._-]/g, "-").replaceAll(/-+/g, "-").replaceAll(/^-+/g, "").replaceAll(/-+$/g, "");
	const normalized = base.length > 0 ? base : "skill";
	const safe = normalized === "." || normalized === ".." ? "skill" : normalized;
	const hash = createHash("sha256").update(trimmed).digest("hex").slice(0, 10);
	if (safe !== trimmed) return `${safe.length > 50 ? safe.slice(0, 50) : safe}-${hash}`;
	if (safe.length > 60) return `${safe.slice(0, 50)}-${hash}`;
	return safe;
}
function resolveSafeInstallDir(params) {
	const targetDir = path.join(params.baseDir, safeDirName(params.id));
	const resolvedBase = path.resolve(params.baseDir);
	const resolvedTarget = path.resolve(targetDir);
	const relative = path.relative(resolvedBase, resolvedTarget);
	if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return {
		ok: false,
		error: params.invalidNameMessage
	};
	return {
		ok: true,
		path: targetDir
	};
}

//#endregion
export { extractArchive as a, resolveArchiveKind as c, resolveArchiveOutputPath as d, stripArchivePath as f, unscopedPackageName as i, resolvePackedRootDir as l, safeDirName as n, fileExists as o, validateArchiveEntryPath as p, safePathSegmentHashed as r, readJsonFile as s, resolveSafeInstallDir as t, isWindowsDrivePath as u };