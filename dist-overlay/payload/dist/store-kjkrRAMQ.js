import { h as resolveConfigDir } from "./utils-C5WN6czr.js";
import { c as detectMime, l as extensionForMime } from "./image-ops-CQrO7d64.js";
import path from "node:path";
import "node:fs";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";
import "node:stream/promises";
import "node:https";
//#region src/media/store.ts
const resolveMediaDir = () => path.join(resolveConfigDir(), "media");
const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
const MAX_BYTES = MEDIA_MAX_BYTES;
const DEFAULT_TTL_MS = 120 * 1e3;
const MEDIA_FILE_MODE = 420;
/**
* Sanitize a filename for cross-platform safety.
* Removes chars unsafe on Windows/SharePoint/all platforms.
* Keeps: alphanumeric, dots, hyphens, underscores, Unicode letters/numbers.
*/
function sanitizeFilename(name) {
	const trimmed = name.trim();
	if (!trimmed) return "";
	return trimmed.replace(/[^\p{L}\p{N}._-]+/gu, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 60);
}
function getMediaDir() {
	return resolveMediaDir();
}
async function ensureMediaDir() {
	const mediaDir = resolveMediaDir();
	await fs$1.mkdir(mediaDir, {
		recursive: true,
		mode: 448
	});
	return mediaDir;
}
function isMissingPathError(err) {
	return err instanceof Error && "code" in err && err.code === "ENOENT";
}
async function retryAfterRecreatingDir(dir, run) {
	try {
		return await run();
	} catch (err) {
		if (!isMissingPathError(err)) throw err;
		await fs$1.mkdir(dir, {
			recursive: true,
			mode: 448
		});
		return await run();
	}
}
async function cleanOldMedia(ttlMs = DEFAULT_TTL_MS, options = {}) {
	const mediaDir = await ensureMediaDir();
	const now = Date.now();
	const recursive = options.recursive ?? false;
	const pruneEmptyDirs = recursive && (options.pruneEmptyDirs ?? false);
	const removeExpiredFilesInDir = async (dir) => {
		const dirEntries = await fs$1.readdir(dir).catch(() => null);
		if (!dirEntries) return false;
		for (const entry of dirEntries) {
			const fullPath = path.join(dir, entry);
			const stat = await fs$1.lstat(fullPath).catch(() => null);
			if (!stat || stat.isSymbolicLink()) continue;
			if (stat.isDirectory()) {
				if (recursive) {
					if (await removeExpiredFilesInDir(fullPath)) await fs$1.rmdir(fullPath).catch(() => {});
				}
				continue;
			}
			if (!stat.isFile()) continue;
			if (now - stat.mtimeMs > ttlMs) await fs$1.rm(fullPath, { force: true }).catch(() => {});
		}
		if (!pruneEmptyDirs) return false;
		const remainingEntries = await fs$1.readdir(dir).catch(() => null);
		return remainingEntries !== null && remainingEntries.length === 0;
	};
	const entries = await fs$1.readdir(mediaDir).catch(() => []);
	for (const file of entries) {
		const full = path.join(mediaDir, file);
		const stat = await fs$1.lstat(full).catch(() => null);
		if (!stat || stat.isSymbolicLink()) continue;
		if (stat.isDirectory()) {
			if (await removeExpiredFilesInDir(full)) await fs$1.rmdir(full).catch(() => {});
			continue;
		}
		if (stat.isFile() && now - stat.mtimeMs > ttlMs) await fs$1.rm(full, { force: true }).catch(() => {});
	}
}
async function saveMediaBuffer(buffer, contentType, subdir = "inbound", maxBytes = MAX_BYTES, originalFilename) {
	if (buffer.byteLength > maxBytes) throw new Error(`Media exceeds ${(maxBytes / (1024 * 1024)).toFixed(0)}MB limit`);
	const dir = path.join(resolveMediaDir(), subdir);
	await fs$1.mkdir(dir, {
		recursive: true,
		mode: 448
	});
	const uuid = crypto.randomUUID();
	const headerExt = extensionForMime(contentType?.split(";")[0]?.trim() ?? void 0);
	const mime = await detectMime({
		buffer,
		headerMime: contentType
	});
	const ext = headerExt ?? extensionForMime(mime) ?? "";
	let id;
	if (originalFilename) {
		const base = path.parse(originalFilename).name;
		const sanitized = sanitizeFilename(base);
		id = sanitized ? `${sanitized}---${uuid}${ext}` : `${uuid}${ext}`;
	} else id = ext ? `${uuid}${ext}` : uuid;
	const dest = path.join(dir, id);
	await retryAfterRecreatingDir(dir, () => fs$1.writeFile(dest, buffer, { mode: MEDIA_FILE_MODE }));
	return {
		id,
		path: dest,
		size: buffer.byteLength,
		contentType: mime
	};
}
//#endregion
export { saveMediaBuffer as a, getMediaDir as i, cleanOldMedia as n, ensureMediaDir as r, MEDIA_MAX_BYTES as t };
