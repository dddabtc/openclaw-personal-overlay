import path from "node:path";
import fsPromises from "node:fs/promises";
import { randomUUID } from "node:crypto";
//#region src/infra/json-files.ts
async function readJsonFile(filePath) {
	try {
		const raw = await fsPromises.readFile(filePath, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function writeJsonAtomic(filePath, value, options) {
	await writeTextAtomic(filePath, JSON.stringify(value, null, 2), {
		mode: options?.mode,
		ensureDirMode: options?.ensureDirMode,
		appendTrailingNewline: options?.trailingNewline
	});
}
async function writeTextAtomic(filePath, content, options) {
	const mode = options?.mode ?? 384;
	const payload = options?.appendTrailingNewline && !content.endsWith("\n") ? `${content}\n` : content;
	const mkdirOptions = { recursive: true };
	if (typeof options?.ensureDirMode === "number") mkdirOptions.mode = options.ensureDirMode;
	await fsPromises.mkdir(path.dirname(filePath), mkdirOptions);
	const tmp = `${filePath}.${randomUUID()}.tmp`;
	try {
		await fsPromises.writeFile(tmp, payload, "utf8");
		try {
			await fsPromises.chmod(tmp, mode);
		} catch {}
		await fsPromises.rename(tmp, filePath);
		try {
			await fsPromises.chmod(filePath, mode);
		} catch {}
	} finally {
		await fsPromises.rm(tmp, { force: true }).catch(() => void 0);
	}
}
function createAsyncLock() {
	let lock = Promise.resolve();
	return async function withLock(fn) {
		const prev = lock;
		let release;
		lock = new Promise((resolve) => {
			release = resolve;
		});
		await prev;
		try {
			return await fn();
		} finally {
			release?.();
		}
	};
}
//#endregion
export { writeTextAtomic as i, readJsonFile as n, writeJsonAtomic as r, createAsyncLock as t };
