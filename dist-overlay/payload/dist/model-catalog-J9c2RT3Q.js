import { t as createSubsystemLogger } from "./subsystem-Cf9yS0UI.js";
import { H as loadConfig, lr as resolveOpenClawAgentDir } from "./auth-profiles-Dfz0edQp.js";
import { t as ensureOpenClawModelsJson } from "./models-config-DyTiDfSK.js";
//#region src/agents/model-catalog.ts
const log = createSubsystemLogger("model-catalog");
let modelCatalogPromise = null;
let hasLoggedModelCatalogError = false;
const defaultImportPiSdk = () => import("./pi-model-discovery-B5Wxu5WT.js").then((n) => n.r);
let importPiSdk = defaultImportPiSdk;
const CODEX_PROVIDER = "openai-codex";
const OPENAI_PROVIDER = "openai";
const OPENAI_GPT54_MODEL_ID = "gpt-5.4";
const OPENAI_GPT54_PRO_MODEL_ID = "gpt-5.4-pro";
const OPENAI_CODEX_GPT53_MODEL_ID = "gpt-5.3-codex";
const OPENAI_CODEX_GPT53_SPARK_MODEL_ID = "gpt-5.3-codex-spark";
const OPENAI_CODEX_GPT54_MODEL_ID = "gpt-5.4";
const NON_PI_NATIVE_MODEL_PROVIDERS = new Set(["kilocode"]);
const SYNTHETIC_CATALOG_FALLBACKS = [
	{
		provider: OPENAI_PROVIDER,
		id: OPENAI_GPT54_MODEL_ID,
		templateIds: ["gpt-5.2"]
	},
	{
		provider: OPENAI_PROVIDER,
		id: OPENAI_GPT54_PRO_MODEL_ID,
		templateIds: ["gpt-5.2-pro", "gpt-5.2"]
	},
	{
		provider: CODEX_PROVIDER,
		id: OPENAI_CODEX_GPT54_MODEL_ID,
		templateIds: ["gpt-5.3-codex", "gpt-5.2-codex"]
	},
	{
		provider: CODEX_PROVIDER,
		id: OPENAI_CODEX_GPT53_SPARK_MODEL_ID,
		templateIds: [OPENAI_CODEX_GPT53_MODEL_ID]
	}
];
function applySyntheticCatalogFallbacks(models) {
	const findCatalogEntry = (provider, id) => models.find((entry) => entry.provider.toLowerCase() === provider.toLowerCase() && entry.id.toLowerCase() === id.toLowerCase());
	for (const fallback of SYNTHETIC_CATALOG_FALLBACKS) {
		if (findCatalogEntry(fallback.provider, fallback.id)) continue;
		const template = fallback.templateIds.map((templateId) => findCatalogEntry(fallback.provider, templateId)).find((entry) => entry !== void 0);
		if (!template) continue;
		models.push({
			...template,
			id: fallback.id,
			name: fallback.id
		});
	}
}
function normalizeConfiguredModelInput(input) {
	if (!Array.isArray(input)) return;
	const normalized = input.filter((item) => item === "text" || item === "image" || item === "document");
	return normalized.length > 0 ? normalized : void 0;
}
function readConfiguredOptInProviderModels(config) {
	const providers = config.models?.providers;
	if (!providers || typeof providers !== "object") return [];
	const out = [];
	for (const [providerRaw, providerValue] of Object.entries(providers)) {
		const provider = providerRaw.toLowerCase().trim();
		if (!NON_PI_NATIVE_MODEL_PROVIDERS.has(provider)) continue;
		if (!providerValue || typeof providerValue !== "object") continue;
		const configuredModels = providerValue.models;
		if (!Array.isArray(configuredModels)) continue;
		for (const configuredModel of configuredModels) {
			if (!configuredModel || typeof configuredModel !== "object") continue;
			const idRaw = configuredModel.id;
			if (typeof idRaw !== "string") continue;
			const id = idRaw.trim();
			if (!id) continue;
			const rawName = configuredModel.name;
			const name = (typeof rawName === "string" ? rawName : id).trim() || id;
			const contextWindowRaw = configuredModel.contextWindow;
			const contextWindow = typeof contextWindowRaw === "number" && contextWindowRaw > 0 ? contextWindowRaw : void 0;
			const reasoningRaw = configuredModel.reasoning;
			const reasoning = typeof reasoningRaw === "boolean" ? reasoningRaw : void 0;
			const input = normalizeConfiguredModelInput(configuredModel.input);
			out.push({
				id,
				name,
				provider,
				contextWindow,
				reasoning,
				input
			});
		}
	}
	return out;
}
function mergeConfiguredOptInProviderModels(params) {
	const configured = readConfiguredOptInProviderModels(params.config);
	if (configured.length === 0) return;
	const seen = new Set(params.models.map((entry) => `${entry.provider.toLowerCase().trim()}::${entry.id.toLowerCase().trim()}`));
	for (const entry of configured) {
		const key = `${entry.provider.toLowerCase().trim()}::${entry.id.toLowerCase().trim()}`;
		if (seen.has(key)) continue;
		params.models.push(entry);
		seen.add(key);
	}
}
async function loadModelCatalog(params) {
	if (params?.useCache === false) modelCatalogPromise = null;
	if (modelCatalogPromise) return modelCatalogPromise;
	modelCatalogPromise = (async () => {
		const models = [];
		const sortModels = (entries) => entries.sort((a, b) => {
			const p = a.provider.localeCompare(b.provider);
			if (p !== 0) return p;
			return a.name.localeCompare(b.name);
		});
		try {
			const cfg = params?.config ?? loadConfig();
			await ensureOpenClawModelsJson(cfg);
			const piSdk = await importPiSdk();
			const agentDir = resolveOpenClawAgentDir();
			const { join } = await import("node:path");
			const authStorage = piSdk.discoverAuthStorage(agentDir);
			const registry = new piSdk.ModelRegistry(authStorage, join(agentDir, "models.json"));
			const entries = Array.isArray(registry) ? registry : registry.getAll();
			for (const entry of entries) {
				const id = String(entry?.id ?? "").trim();
				if (!id) continue;
				const provider = String(entry?.provider ?? "").trim();
				if (!provider) continue;
				const name = String(entry?.name ?? id).trim() || id;
				const contextWindow = typeof entry?.contextWindow === "number" && entry.contextWindow > 0 ? entry.contextWindow : void 0;
				const reasoning = typeof entry?.reasoning === "boolean" ? entry.reasoning : void 0;
				const input = Array.isArray(entry?.input) ? entry.input : void 0;
				models.push({
					id,
					name,
					provider,
					contextWindow,
					reasoning,
					input
				});
			}
			mergeConfiguredOptInProviderModels({
				config: cfg,
				models
			});
			applySyntheticCatalogFallbacks(models);
			if (models.length === 0) modelCatalogPromise = null;
			return sortModels(models);
		} catch (error) {
			if (!hasLoggedModelCatalogError) {
				hasLoggedModelCatalogError = true;
				log.warn(`Failed to load model catalog: ${String(error)}`);
			}
			modelCatalogPromise = null;
			if (models.length > 0) return sortModels(models);
			return [];
		}
	})();
	return modelCatalogPromise;
}
/**
* Check if a model supports image input based on its catalog entry.
*/
function modelSupportsVision(entry) {
	return entry?.input?.includes("image") ?? false;
}
/**
* Find a model in the catalog by provider and model ID.
*/
function findModelInCatalog(catalog, provider, modelId) {
	const normalizedProvider = provider.toLowerCase().trim();
	const normalizedModelId = modelId.toLowerCase().trim();
	return catalog.find((entry) => entry.provider.toLowerCase() === normalizedProvider && entry.id.toLowerCase() === normalizedModelId);
}
//#endregion
export { loadModelCatalog as n, modelSupportsVision as r, findModelInCatalog as t };
