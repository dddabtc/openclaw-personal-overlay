import { n as isPathInside, r as isSymlinkOpenError, t as isNotFoundPathError } from "./path-guards-5uqoMz3B.js";
import fs from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

//#region src/infra/file-identity.ts
function isZero(value) {
	return value === 0 || value === 0n;
}
function sameFileIdentity(left, right, platform = process.platform) {
	if (left.ino !== right.ino) return false;
	if (left.dev === right.dev) return true;
	return platform === "win32" && (isZero(left.dev) || isZero(right.dev));
}

//#endregion
//#region src/infra/fs-safe.ts
var SafeOpenError = class extends Error {
	constructor(code, message, options) {
		super(message, options);
		this.code = code;
		this.name = "SafeOpenError";
	}
};
const SUPPORTS_NOFOLLOW = process.platform !== "win32" && "O_NOFOLLOW" in constants;
const OPEN_READ_FLAGS = constants.O_RDONLY | (SUPPORTS_NOFOLLOW ? constants.O_NOFOLLOW : 0);
const ensureTrailingSep = (value) => value.endsWith(path.sep) ? value : value + path.sep;
async function openVerifiedLocalFile(filePath) {
	let handle;
	try {
		handle = await fs.open(filePath, OPEN_READ_FLAGS);
	} catch (err) {
		if (isNotFoundPathError(err)) throw new SafeOpenError("not-found", "file not found");
		if (isSymlinkOpenError(err)) throw new SafeOpenError("symlink", "symlink open blocked", { cause: err });
		throw err;
	}
	try {
		const [stat, lstat] = await Promise.all([handle.stat(), fs.lstat(filePath)]);
		if (lstat.isSymbolicLink()) throw new SafeOpenError("symlink", "symlink not allowed");
		if (!stat.isFile()) throw new SafeOpenError("not-file", "not a file");
		if (!sameFileIdentity(stat, lstat)) throw new SafeOpenError("path-mismatch", "path changed during read");
		const realPath = await fs.realpath(filePath);
		if (!sameFileIdentity(stat, await fs.stat(realPath))) throw new SafeOpenError("path-mismatch", "path mismatch");
		return {
			handle,
			realPath,
			stat
		};
	} catch (err) {
		await handle.close().catch(() => {});
		if (err instanceof SafeOpenError) throw err;
		if (isNotFoundPathError(err)) throw new SafeOpenError("not-found", "file not found");
		throw err;
	}
}
async function openFileWithinRoot(params) {
	let rootReal;
	try {
		rootReal = await fs.realpath(params.rootDir);
	} catch (err) {
		if (isNotFoundPathError(err)) throw new SafeOpenError("not-found", "root dir not found");
		throw err;
	}
	const rootWithSep = ensureTrailingSep(rootReal);
	const resolved = path.resolve(rootWithSep, params.relativePath);
	if (!isPathInside(rootWithSep, resolved)) throw new SafeOpenError("invalid-path", "path escapes root");
	let opened;
	try {
		opened = await openVerifiedLocalFile(resolved);
	} catch (err) {
		if (err instanceof SafeOpenError) {
			if (err.code === "not-found") throw err;
			throw new SafeOpenError("invalid-path", "path is not a regular file under root", { cause: err });
		}
		throw err;
	}
	if (!isPathInside(rootWithSep, opened.realPath)) {
		await opened.handle.close().catch(() => {});
		throw new SafeOpenError("invalid-path", "path escapes root");
	}
	return opened;
}
async function readLocalFileSafely(params) {
	const opened = await openVerifiedLocalFile(params.filePath);
	try {
		if (params.maxBytes !== void 0 && opened.stat.size > params.maxBytes) throw new SafeOpenError("too-large", `file exceeds limit of ${params.maxBytes} bytes (got ${opened.stat.size})`);
		return {
			buffer: await opened.handle.readFile(),
			realPath: opened.realPath,
			stat: opened.stat
		};
	} finally {
		await opened.handle.close().catch(() => {});
	}
}

//#endregion
export { openFileWithinRoot as n, readLocalFileSafely as r, SafeOpenError as t };