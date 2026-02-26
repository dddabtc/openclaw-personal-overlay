import path from "node:path";

//#region src/infra/path-safety.ts
function resolveSafeBaseDir(rootDir) {
	const resolved = path.resolve(rootDir);
	return resolved.endsWith(path.sep) ? resolved : `${resolved}${path.sep}`;
}
function isWithinDir(rootDir, targetPath) {
	const resolvedRoot = path.resolve(rootDir);
	const resolvedTarget = path.resolve(targetPath);
	if (process.platform === "win32") {
		const relative = path.win32.relative(resolvedRoot.toLowerCase(), resolvedTarget.toLowerCase());
		return relative === "" || !relative.startsWith("..") && !path.win32.isAbsolute(relative);
	}
	const relative = path.relative(resolvedRoot, resolvedTarget);
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}

//#endregion
export { resolveSafeBaseDir as n, isWithinDir as t };