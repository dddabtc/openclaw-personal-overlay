import { _ as resolveConfigDir } from "./logger-By5InJr-.js";
import { c as detectMime, l as extensionForMime } from "./image-ops-DbjpKo-Z.js";
import path from "node:path";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";
import "node:stream/promises";
//#region src/media/store.ts
const resolveMediaDir = () => path.join(resolveConfigDir(), "media");
const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
const MAX_BYTES = MEDIA_MAX_BYTES;
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
export { saveMediaBuffer as i, ensureMediaDir as n, getMediaDir as r, MEDIA_MAX_BYTES as t };
