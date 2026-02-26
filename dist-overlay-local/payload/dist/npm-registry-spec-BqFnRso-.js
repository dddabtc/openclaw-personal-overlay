import { y as resolveUserPath } from "./utils-CP9YLh6M.js";
import { t as runCommandWithTimeout } from "./exec-DYqRzFbo.js";
import { c as resolveArchiveKind, o as fileExists } from "./install-safe-path-tCLiMpmO.js";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

//#region src/infra/install-package-dir.ts
async function installPackageDir(params) {
	params.logger?.info?.(`Installing to ${params.targetDir}…`);
	let backupDir = null;
	if (params.mode === "update" && await fileExists(params.targetDir)) {
		backupDir = `${params.targetDir}.backup-${Date.now()}`;
		await fs.rename(params.targetDir, backupDir);
	}
	const rollback = async () => {
		if (!backupDir) return;
		await fs.rm(params.targetDir, {
			recursive: true,
			force: true
		}).catch(() => void 0);
		await fs.rename(backupDir, params.targetDir).catch(() => void 0);
	};
	try {
		await fs.cp(params.sourceDir, params.targetDir, { recursive: true });
	} catch (err) {
		await rollback();
		return {
			ok: false,
			error: `${params.copyErrorPrefix}: ${String(err)}`
		};
	}
	try {
		await params.afterCopy?.();
	} catch (err) {
		await rollback();
		return {
			ok: false,
			error: `post-copy validation failed: ${String(err)}`
		};
	}
	if (params.hasDeps) {
		params.logger?.info?.(params.depsLogMessage);
		const npmRes = await runCommandWithTimeout([
			"npm",
			"install",
			"--omit=dev",
			"--silent",
			"--ignore-scripts"
		], {
			timeoutMs: Math.max(params.timeoutMs, 3e5),
			cwd: params.targetDir
		});
		if (npmRes.code !== 0) {
			await rollback();
			return {
				ok: false,
				error: `npm install failed: ${npmRes.stderr.trim() || npmRes.stdout.trim()}`
			};
		}
	}
	if (backupDir) await fs.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	return { ok: true };
}

//#endregion
//#region src/infra/install-source-utils.ts
async function withTempDir(prefix, fn) {
	const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
	try {
		return await fn(tmpDir);
	} finally {
		await fs.rm(tmpDir, {
			recursive: true,
			force: true
		}).catch(() => void 0);
	}
}
async function resolveArchiveSourcePath(archivePath) {
	const resolved = resolveUserPath(archivePath);
	if (!await fileExists(resolved)) return {
		ok: false,
		error: `archive not found: ${resolved}`
	};
	if (!resolveArchiveKind(resolved)) return {
		ok: false,
		error: `unsupported archive: ${resolved}`
	};
	return {
		ok: true,
		path: resolved
	};
}
function toOptionalString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function parseResolvedSpecFromId(id) {
	const at = id.lastIndexOf("@");
	if (at <= 0 || at >= id.length - 1) return;
	const name = id.slice(0, at).trim();
	const version = id.slice(at + 1).trim();
	if (!name || !version) return;
	return `${name}@${version}`;
}
function normalizeNpmPackEntry(entry) {
	if (!entry || typeof entry !== "object") return null;
	const rec = entry;
	const name = toOptionalString(rec.name);
	const version = toOptionalString(rec.version);
	const id = toOptionalString(rec.id);
	const resolvedSpec = (name && version ? `${name}@${version}` : void 0) ?? (id ? parseResolvedSpecFromId(id) : void 0);
	return {
		filename: toOptionalString(rec.filename),
		metadata: {
			name,
			version,
			resolvedSpec,
			integrity: toOptionalString(rec.integrity),
			shasum: toOptionalString(rec.shasum)
		}
	};
}
function parseNpmPackJsonOutput(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const candidates = [trimmed];
	const arrayStart = trimmed.indexOf("[");
	if (arrayStart > 0) candidates.push(trimmed.slice(arrayStart));
	for (const candidate of candidates) {
		let parsed;
		try {
			parsed = JSON.parse(candidate);
		} catch {
			continue;
		}
		const entries = Array.isArray(parsed) ? parsed : [parsed];
		let fallback = null;
		for (let i = entries.length - 1; i >= 0; i -= 1) {
			const normalized = normalizeNpmPackEntry(entries[i]);
			if (!normalized) continue;
			if (!fallback) fallback = normalized;
			if (normalized.filename) return normalized;
		}
		if (fallback) return fallback;
	}
	return null;
}
async function packNpmSpecToArchive(params) {
	const res = await runCommandWithTimeout([
		"npm",
		"pack",
		params.spec,
		"--ignore-scripts",
		"--json"
	], {
		timeoutMs: Math.max(params.timeoutMs, 3e5),
		cwd: params.cwd,
		env: {
			COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
			NPM_CONFIG_IGNORE_SCRIPTS: "true"
		}
	});
	if (res.code !== 0) return {
		ok: false,
		error: `npm pack failed: ${res.stderr.trim() || res.stdout.trim()}`
	};
	const parsedJson = parseNpmPackJsonOutput(res.stdout || "");
	const packed = parsedJson?.filename ?? (res.stdout || "").split("\n").map((line) => line.trim()).filter(Boolean).pop();
	if (!packed) return {
		ok: false,
		error: "npm pack produced no archive"
	};
	return {
		ok: true,
		archivePath: path.join(params.cwd, packed),
		metadata: parsedJson?.metadata ?? {}
	};
}

//#endregion
//#region src/infra/npm-integrity.ts
async function resolveNpmIntegrityDrift(params) {
	if (!params.expectedIntegrity || !params.resolution.integrity) return { proceed: true };
	if (params.expectedIntegrity === params.resolution.integrity) return { proceed: true };
	const integrityDrift = {
		expectedIntegrity: params.expectedIntegrity,
		actualIntegrity: params.resolution.integrity
	};
	const payload = params.createPayload({
		spec: params.spec,
		expectedIntegrity: integrityDrift.expectedIntegrity,
		actualIntegrity: integrityDrift.actualIntegrity,
		resolution: params.resolution
	});
	let proceed = true;
	if (params.onIntegrityDrift) proceed = await params.onIntegrityDrift(payload);
	else params.warn?.(payload);
	return {
		integrityDrift,
		proceed,
		payload
	};
}
async function resolveNpmIntegrityDriftWithDefaultMessage(params) {
	const driftResult = await resolveNpmIntegrityDrift({
		spec: params.spec,
		expectedIntegrity: params.expectedIntegrity,
		resolution: params.resolution,
		createPayload: (drift) => ({ ...drift }),
		onIntegrityDrift: params.onIntegrityDrift,
		warn: (driftPayload) => {
			params.warn?.(`Integrity drift detected for ${driftPayload.resolution.resolvedSpec ?? driftPayload.spec}: expected ${driftPayload.expectedIntegrity}, got ${driftPayload.actualIntegrity}`);
		}
	});
	if (!driftResult.proceed && driftResult.payload) return {
		integrityDrift: driftResult.integrityDrift,
		error: `aborted: npm package integrity drift detected for ${driftResult.payload.resolution.resolvedSpec ?? driftResult.payload.spec}`
	};
	return { integrityDrift: driftResult.integrityDrift };
}

//#endregion
//#region src/infra/npm-pack-install.ts
async function installFromNpmSpecArchive(params) {
	return await withTempDir(params.tempDirPrefix, async (tmpDir) => {
		const packedResult = await packNpmSpecToArchive({
			spec: params.spec,
			timeoutMs: params.timeoutMs,
			cwd: tmpDir
		});
		if (!packedResult.ok) return packedResult;
		const npmResolution = {
			...packedResult.metadata,
			resolvedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		const driftResult = await resolveNpmIntegrityDriftWithDefaultMessage({
			spec: params.spec,
			expectedIntegrity: params.expectedIntegrity,
			resolution: npmResolution,
			onIntegrityDrift: params.onIntegrityDrift,
			warn: params.warn
		});
		if (driftResult.error) return {
			ok: false,
			error: driftResult.error
		};
		return {
			ok: true,
			installResult: await params.installFromArchive({ archivePath: packedResult.archivePath }),
			npmResolution,
			integrityDrift: driftResult.integrityDrift
		};
	});
}

//#endregion
//#region src/infra/npm-registry-spec.ts
function validateRegistryNpmSpec(rawSpec) {
	const spec = rawSpec.trim();
	if (!spec) return "missing npm spec";
	if (/\s/.test(spec)) return "unsupported npm spec: whitespace is not allowed";
	if (spec.includes("://")) return "unsupported npm spec: URLs are not allowed";
	if (spec.includes("#")) return "unsupported npm spec: git refs are not allowed";
	if (spec.includes(":")) return "unsupported npm spec: protocol specs are not allowed";
	const at = spec.lastIndexOf("@");
	const hasVersion = at > 0;
	const name = hasVersion ? spec.slice(0, at) : spec;
	const version = hasVersion ? spec.slice(at + 1) : "";
	if (!(name.startsWith("@") ? /^@[a-z0-9][a-z0-9-._~]*\/[a-z0-9][a-z0-9-._~]*$/.test(name) : /^[a-z0-9][a-z0-9-._~]*$/.test(name))) return "unsupported npm spec: expected <name> or <name>@<version> from the npm registry";
	if (hasVersion) {
		if (!version) return "unsupported npm spec: missing version/tag after @";
		if (/[\\/]/.test(version)) return "unsupported npm spec: invalid version/tag";
	}
	return null;
}

//#endregion
export { installPackageDir as a, withTempDir as i, installFromNpmSpecArchive as n, resolveArchiveSourcePath as r, validateRegistryNpmSpec as t };