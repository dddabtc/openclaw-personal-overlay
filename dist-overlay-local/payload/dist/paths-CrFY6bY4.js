import { X as resolvePreferredOpenClawTmpDir } from "./utils-CP9YLh6M.js";
import { n as openFileWithinRoot, t as SafeOpenError } from "./fs-safe-CUjO1ca2.js";
import path from "node:path";

//#region src/browser/paths.ts
const DEFAULT_BROWSER_TMP_DIR = resolvePreferredOpenClawTmpDir();
const DEFAULT_TRACE_DIR = DEFAULT_BROWSER_TMP_DIR;
const DEFAULT_DOWNLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "downloads");
const DEFAULT_UPLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "uploads");
function resolvePathWithinRoot(params) {
	const root = path.resolve(params.rootDir);
	const raw = params.requestedPath.trim();
	if (!raw) {
		if (!params.defaultFileName) return {
			ok: false,
			error: "path is required"
		};
		return {
			ok: true,
			path: path.join(root, params.defaultFileName)
		};
	}
	const resolved = path.resolve(root, raw);
	const rel = path.relative(root, resolved);
	if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return {
		ok: false,
		error: `Invalid path: must stay within ${params.scopeLabel}`
	};
	return {
		ok: true,
		path: resolved
	};
}
async function resolveExistingPathsWithinRoot(params) {
	const resolvedPaths = [];
	for (const raw of params.requestedPaths) {
		const pathResult = resolvePathWithinRoot({
			rootDir: params.rootDir,
			requestedPath: raw,
			scopeLabel: params.scopeLabel
		});
		if (!pathResult.ok) return {
			ok: false,
			error: pathResult.error
		};
		const rootDir = path.resolve(params.rootDir);
		const relativePath = path.relative(rootDir, pathResult.path);
		let opened;
		try {
			opened = await openFileWithinRoot({
				rootDir,
				relativePath
			});
			resolvedPaths.push(opened.realPath);
		} catch (err) {
			if (err instanceof SafeOpenError && err.code === "not-found") {
				resolvedPaths.push(pathResult.path);
				continue;
			}
			return {
				ok: false,
				error: `Invalid path: must stay within ${params.scopeLabel} and be a regular non-symlink file`
			};
		} finally {
			await opened?.handle.close().catch(() => {});
		}
	}
	return {
		ok: true,
		paths: resolvedPaths
	};
}

//#endregion
export { resolvePathWithinRoot as a, resolveExistingPathsWithinRoot as i, DEFAULT_TRACE_DIR as n, DEFAULT_UPLOAD_DIR as r, DEFAULT_DOWNLOAD_DIR as t };