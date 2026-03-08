import { y as resolveUserPath } from "./utils-DC4zYvW0.js";
import fs from "node:fs";
//#region src/acp/secret-file.ts
const MAX_SECRET_FILE_BYTES = 16 * 1024;
function readSecretFromFile(filePath, label) {
	const resolvedPath = resolveUserPath(filePath.trim());
	if (!resolvedPath) throw new Error(`${label} file path is empty.`);
	let stat;
	try {
		stat = fs.lstatSync(resolvedPath);
	} catch (err) {
		throw new Error(`Failed to inspect ${label} file at ${resolvedPath}: ${String(err)}`, { cause: err });
	}
	if (stat.isSymbolicLink()) throw new Error(`${label} file at ${resolvedPath} must not be a symlink.`);
	if (!stat.isFile()) throw new Error(`${label} file at ${resolvedPath} must be a regular file.`);
	if (stat.size > 16384) throw new Error(`${label} file at ${resolvedPath} exceeds ${MAX_SECRET_FILE_BYTES} bytes.`);
	let raw = "";
	try {
		raw = fs.readFileSync(resolvedPath, "utf8");
	} catch (err) {
		throw new Error(`Failed to read ${label} file at ${resolvedPath}: ${String(err)}`, { cause: err });
	}
	const secret = raw.trim();
	if (!secret) throw new Error(`${label} file at ${resolvedPath} is empty.`);
	return secret;
}
//#endregion
export { readSecretFromFile as t };
