import { d as isRecord } from "./utils-DC4zYvW0.js";
import { Ai as resolveOpenClawAgentDir, M as resolveImplicitBedrockProvider, N as resolveImplicitCopilotProvider, P as resolveImplicitProviders, ei as applyConfigEnvVars, j as normalizeProviders, nn as getRuntimeConfigSourceSnapshot, ot as isNonSecretApiKeyMarker, rn as loadConfig, tn as getRuntimeConfigSnapshot } from "./model-selection-L7RMwsG-.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/agents/models-config.ts
const DEFAULT_MODE = "merge";
const MODELS_JSON_WRITE_LOCKS = /* @__PURE__ */ new Map();
function isPositiveFiniteTokenLimit(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function resolvePreferredTokenLimit(params) {
	if (params.explicitPresent && isPositiveFiniteTokenLimit(params.explicitValue)) return params.explicitValue;
	if (isPositiveFiniteTokenLimit(params.implicitValue)) return params.implicitValue;
	return isPositiveFiniteTokenLimit(params.explicitValue) ? params.explicitValue : void 0;
}
function mergeProviderModels(implicit, explicit) {
	const implicitModels = Array.isArray(implicit.models) ? implicit.models : [];
	const explicitModels = Array.isArray(explicit.models) ? explicit.models : [];
	if (implicitModels.length === 0) return {
		...implicit,
		...explicit
	};
	const getId = (model) => {
		if (!model || typeof model !== "object") return "";
		const id = model.id;
		return typeof id === "string" ? id.trim() : "";
	};
	const implicitById = new Map(implicitModels.map((model) => [getId(model), model]).filter(([id]) => Boolean(id)));
	const seen = /* @__PURE__ */ new Set();
	const mergedModels = explicitModels.map((explicitModel) => {
		const id = getId(explicitModel);
		if (!id) return explicitModel;
		seen.add(id);
		const implicitModel = implicitById.get(id);
		if (!implicitModel) return explicitModel;
		const contextWindow = resolvePreferredTokenLimit({
			explicitPresent: "contextWindow" in explicitModel,
			explicitValue: explicitModel.contextWindow,
			implicitValue: implicitModel.contextWindow
		});
		const maxTokens = resolvePreferredTokenLimit({
			explicitPresent: "maxTokens" in explicitModel,
			explicitValue: explicitModel.maxTokens,
			implicitValue: implicitModel.maxTokens
		});
		return {
			...explicitModel,
			input: implicitModel.input,
			reasoning: "reasoning" in explicitModel ? explicitModel.reasoning : implicitModel.reasoning,
			...contextWindow === void 0 ? {} : { contextWindow },
			...maxTokens === void 0 ? {} : { maxTokens }
		};
	});
	for (const implicitModel of implicitModels) {
		const id = getId(implicitModel);
		if (!id || seen.has(id)) continue;
		seen.add(id);
		mergedModels.push(implicitModel);
	}
	return {
		...implicit,
		...explicit,
		models: mergedModels
	};
}
function mergeProviders(params) {
	const out = params.implicit ? { ...params.implicit } : {};
	for (const [key, explicit] of Object.entries(params.explicit ?? {})) {
		const providerKey = key.trim();
		if (!providerKey) continue;
		const implicit = out[providerKey];
		out[providerKey] = implicit ? mergeProviderModels(implicit, explicit) : explicit;
	}
	return out;
}
async function readJson(pathname) {
	try {
		const raw = await fs.readFile(pathname, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function resolveProvidersForModelsJson(params) {
	const { cfg, agentDir } = params;
	const explicitProviders = cfg.models?.providers ?? {};
	const providers = mergeProviders({
		implicit: await resolveImplicitProviders({
			agentDir,
			explicitProviders
		}),
		explicit: explicitProviders
	});
	const implicitBedrock = await resolveImplicitBedrockProvider({
		agentDir,
		config: cfg
	});
	if (implicitBedrock) {
		const existing = providers["amazon-bedrock"];
		providers["amazon-bedrock"] = existing ? mergeProviderModels(implicitBedrock, existing) : implicitBedrock;
	}
	const implicitCopilot = await resolveImplicitCopilotProvider({ agentDir });
	if (implicitCopilot && !providers["github-copilot"]) providers["github-copilot"] = implicitCopilot;
	return providers;
}
function mergeWithExistingProviderSecrets(params) {
	const { nextProviders, existingProviders, secretRefManagedProviders, explicitBaseUrlProviders } = params;
	const mergedProviders = {};
	for (const [key, entry] of Object.entries(existingProviders)) mergedProviders[key] = entry;
	for (const [key, newEntry] of Object.entries(nextProviders)) {
		const existing = existingProviders[key];
		if (!existing) {
			mergedProviders[key] = newEntry;
			continue;
		}
		const preserved = {};
		if (!secretRefManagedProviders.has(key) && typeof existing.apiKey === "string" && existing.apiKey && !isNonSecretApiKeyMarker(existing.apiKey, { includeEnvVarName: false })) preserved.apiKey = existing.apiKey;
		if (!explicitBaseUrlProviders.has(key) && typeof existing.baseUrl === "string" && existing.baseUrl) preserved.baseUrl = existing.baseUrl;
		mergedProviders[key] = {
			...newEntry,
			...preserved
		};
	}
	return mergedProviders;
}
async function resolveProvidersForMode(params) {
	if (params.mode !== "merge") return params.providers;
	const existing = await readJson(params.targetPath);
	if (!isRecord(existing) || !isRecord(existing.providers)) return params.providers;
	const existingProviders = existing.providers;
	return mergeWithExistingProviderSecrets({
		nextProviders: params.providers,
		existingProviders,
		secretRefManagedProviders: params.secretRefManagedProviders,
		explicitBaseUrlProviders: params.explicitBaseUrlProviders
	});
}
async function readRawFile(pathname) {
	try {
		return await fs.readFile(pathname, "utf8");
	} catch {
		return "";
	}
}
async function ensureModelsFileMode(pathname) {
	await fs.chmod(pathname, 384).catch(() => {});
}
function resolveModelsConfigInput(config) {
	const runtimeSource = getRuntimeConfigSourceSnapshot();
	if (!runtimeSource) return config ?? loadConfig();
	if (!config) return runtimeSource;
	const runtimeResolved = getRuntimeConfigSnapshot();
	if (runtimeResolved && config === runtimeResolved) return runtimeSource;
	return config;
}
async function withModelsJsonWriteLock(targetPath, run) {
	const prior = MODELS_JSON_WRITE_LOCKS.get(targetPath) ?? Promise.resolve();
	let release = () => {};
	const gate = new Promise((resolve) => {
		release = resolve;
	});
	const pending = prior.then(() => gate);
	MODELS_JSON_WRITE_LOCKS.set(targetPath, pending);
	try {
		await prior;
		return await run();
	} finally {
		release();
		if (MODELS_JSON_WRITE_LOCKS.get(targetPath) === pending) MODELS_JSON_WRITE_LOCKS.delete(targetPath);
	}
}
async function ensureOpenClawModelsJson(config, agentDirOverride) {
	const cfg = resolveModelsConfigInput(config);
	const agentDir = agentDirOverride?.trim() ? agentDirOverride.trim() : resolveOpenClawAgentDir();
	const targetPath = path.join(agentDir, "models.json");
	return await withModelsJsonWriteLock(targetPath, async () => {
		applyConfigEnvVars(cfg);
		const providers = await resolveProvidersForModelsJson({
			cfg,
			agentDir
		});
		if (Object.keys(providers).length === 0) return {
			agentDir,
			wrote: false
		};
		const mode = cfg.models?.mode ?? DEFAULT_MODE;
		const secretRefManagedProviders = /* @__PURE__ */ new Set();
		const explicitBaseUrlProviders = new Set(Object.entries(cfg.models?.providers ?? {}).map(([key, provider]) => [key.trim(), provider]).filter(([key, provider]) => Boolean(key) && typeof provider?.baseUrl === "string" && provider.baseUrl.trim()).map(([key]) => key));
		const mergedProviders = await resolveProvidersForMode({
			mode,
			targetPath,
			providers: normalizeProviders({
				providers,
				agentDir,
				secretDefaults: cfg.secrets?.defaults,
				secretRefManagedProviders
			}) ?? providers,
			secretRefManagedProviders,
			explicitBaseUrlProviders
		});
		const next = `${JSON.stringify({ providers: mergedProviders }, null, 2)}\n`;
		if (await readRawFile(targetPath) === next) {
			await ensureModelsFileMode(targetPath);
			return {
				agentDir,
				wrote: false
			};
		}
		await fs.mkdir(agentDir, {
			recursive: true,
			mode: 448
		});
		await fs.writeFile(targetPath, next, { mode: 384 });
		await ensureModelsFileMode(targetPath);
		return {
			agentDir,
			wrote: true
		};
	});
}
//#endregion
export { ensureOpenClawModelsJson as t };
