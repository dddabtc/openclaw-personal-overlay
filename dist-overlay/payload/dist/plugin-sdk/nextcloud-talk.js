import { $ as logInboundDrop, B as formatDocsLink, G as isRequestBodyLimitError, H as resolveDmGroupAccessWithCommandGate, J as createReplyPrefixOptions, K as readRequestBodyWithLimit, Q as resolveMentionGatingWithBypass, R as createDedupeCache, V as readStoreAllowFromForDmPolicy, q as requestBodyErrorToText, z as issuePairingChallenge } from "./dispatch-D-P7e05U.js";
import { At as resolveAllowlistProviderRuntimeGroupPolicy, Ft as buildChannelKeyCandidates, It as normalizeChannelSlug, Lt as resolveChannelEntryMatchWithFallback, Nt as warnMissingProviderGroupPolicyFallbackOnce, Ot as evaluateMatchedGroupAccessForPolicy, Rt as resolveNestedAllowlistDecision, jt as resolveDefaultGroupPolicy, kt as GROUP_POLICY_BLOCKED_LABEL } from "./send-KoMq9K6n.js";
import { lt as DEFAULT_ACCOUNT_ID, ut as normalizeAccountId } from "./run-with-concurrency-B0Wb-l36.js";
import { $ as resolveDefaultSecretProviderAlias, Ar as isValidEnvSecretRefId, C as encodeJsonPointerToken, G as BlockStreamingCoalesceSchema, J as GroupPolicySchema, K as DmConfigSchema, Kr as formatCliCommand, Mr as normalizeSecretInputString, Q as isValidFileSecretRefId, W as ToolPolicySchema, X as ReplyRuntimeConfigSchemaShape, Xn as withFileLock, Y as MarkdownConfigSchema, Z as requireOpenAllowFrom, g as resolveSecretRefString, jr as normalizeResolvedSecretInputString, kr as hasConfiguredSecretInput, q as DmPolicySchema } from "./model-auth-CkGNanzp.js";
import "./logger-Cxu-Klb_.js";
import "./paths-akVZbnot.js";
import "./github-copilot-token-CjEwwa4e.js";
import "./thinking-Cc1GrwLO.js";
import { _ as createAccountListHelpers } from "./accounts-B9DYQQ8S.js";
import { h as resolveAccountWithDefaultFallback, k as mapAllowFromEntries, m as listConfiguredAccountIds } from "./plugins-BCZJyaK6.js";
import "./ssrf-rEz6Utw1.js";
import { t as fetchWithSsrFGuard } from "./fetch-guard-CwPy8FTx.js";
import { $ as readJsonFileWithFallback, et as writeJsonFileAtomically } from "./send-B0bHMfxH.js";
import "./send-Dz7AfB4N.js";
import "./image-ops-BhMjbl6B.js";
import "./pi-embedded-helpers-C3R9yTmI.js";
import "./accounts-BdRXhfdX.js";
import "./paths-CNBdcyu4.js";
import "./deliver-DwmyK2Go.js";
import "./diagnostic-D0UPEXJY.js";
import "./pi-model-discovery-Dho_Y9B8.js";
import "./audio-transcription-runner-Ct9D-6-d.js";
import "./image-BqoYytqX.js";
import "./chrome-MKkzVzI0.js";
import "./skills-DtcUcPWB.js";
import "./path-alias-guards-4pesaMWH.js";
import "./redact-BkCa6pJx.js";
import "./errors-DAKeCDdf.js";
import "./fs-safe-DD7dvC_x.js";
import "./store-B-nHAoqN.js";
import "./tool-images-HdQSENXg.js";
import "./api-key-rotation-C8K71UU8.js";
import "./local-roots-CpTlgVcQ.js";
import "./proxy-fetch-o2k_1EOm.js";
import "./tokens-C3YaGU_B.js";
import "./commands-registry-Cqd_KkoR.js";
import "./skill-commands-BeS2oXBV.js";
import "./ir-D6nZrCO3.js";
import "./render-hUn-4tdL.js";
import "./target-errors-CnikoL72.js";
import "./channel-activity-CSpSSAYv.js";
import "./fetch-CbQacLEh.js";
import "./tables-BaknkN5Z.js";
import "./send-ByRMNdeI.js";
import "./proxy-CgXTW63Y.js";
import "./outbound-attachment-BeJprcuG.js";
import "./send-DCembn8l.js";
import "./manager-BFr_Hqos.js";
import "./query-expansion-i42JMOZH.js";
import { format } from "node:util";
import { z } from "zod";
//#region src/channels/plugins/config-helpers.ts
function isConfiguredSecretValue(value) {
	if (typeof value === "string") return value.trim().length > 0;
	return Boolean(value);
}
function setAccountEnabledInConfigSection(params) {
	const accountKey = params.accountId || "default";
	const base = params.cfg.channels?.[params.sectionKey];
	const hasAccounts = Boolean(base?.accounts);
	if (params.allowTopLevel && accountKey === "default" && !hasAccounts) return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.sectionKey]: {
				...base,
				enabled: params.enabled
			}
		}
	};
	const baseAccounts = base?.accounts ?? {};
	const existing = baseAccounts[accountKey] ?? {};
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.sectionKey]: {
				...base,
				accounts: {
					...baseAccounts,
					[accountKey]: {
						...existing,
						enabled: params.enabled
					}
				}
			}
		}
	};
}
function deleteAccountFromConfigSection(params) {
	const accountKey = params.accountId || "default";
	const base = params.cfg.channels?.[params.sectionKey];
	if (!base) return params.cfg;
	const baseAccounts = base.accounts && typeof base.accounts === "object" ? { ...base.accounts } : void 0;
	if (accountKey !== "default") {
		const accounts = baseAccounts ? { ...baseAccounts } : {};
		delete accounts[accountKey];
		return {
			...params.cfg,
			channels: {
				...params.cfg.channels,
				[params.sectionKey]: {
					...base,
					accounts: Object.keys(accounts).length ? accounts : void 0
				}
			}
		};
	}
	if (baseAccounts && Object.keys(baseAccounts).length > 0) {
		delete baseAccounts[accountKey];
		const baseRecord = { ...base };
		for (const field of params.clearBaseFields ?? []) if (field in baseRecord) baseRecord[field] = void 0;
		return {
			...params.cfg,
			channels: {
				...params.cfg.channels,
				[params.sectionKey]: {
					...baseRecord,
					accounts: Object.keys(baseAccounts).length ? baseAccounts : void 0
				}
			}
		};
	}
	const nextChannels = { ...params.cfg.channels };
	delete nextChannels[params.sectionKey];
	const nextCfg = { ...params.cfg };
	if (Object.keys(nextChannels).length > 0) nextCfg.channels = nextChannels;
	else delete nextCfg.channels;
	return nextCfg;
}
function clearAccountEntryFields(params) {
	const accountKey = params.accountId || "default";
	const baseAccounts = params.accounts && typeof params.accounts === "object" ? { ...params.accounts } : void 0;
	if (!baseAccounts || !(accountKey in baseAccounts)) return {
		nextAccounts: baseAccounts,
		changed: false,
		cleared: false
	};
	const entry = baseAccounts[accountKey];
	if (!entry || typeof entry !== "object") return {
		nextAccounts: baseAccounts,
		changed: false,
		cleared: false
	};
	const nextEntry = { ...entry };
	if (!params.fields.some((field) => field in nextEntry)) return {
		nextAccounts: baseAccounts,
		changed: false,
		cleared: false
	};
	const isValueSet = params.isValueSet ?? isConfiguredSecretValue;
	let cleared = Boolean(params.markClearedOnFieldPresence);
	for (const field of params.fields) {
		if (!(field in nextEntry)) continue;
		if (isValueSet(nextEntry[field])) cleared = true;
		delete nextEntry[field];
	}
	if (Object.keys(nextEntry).length === 0) delete baseAccounts[accountKey];
	else baseAccounts[accountKey] = nextEntry;
	return {
		nextAccounts: Object.keys(baseAccounts).length > 0 ? baseAccounts : void 0,
		changed: true,
		cleared
	};
}
//#endregion
//#region src/channels/plugins/config-schema.ts
function buildChannelConfigSchema(schema) {
	const schemaWithJson = schema;
	if (typeof schemaWithJson.toJSONSchema === "function") return { schema: schemaWithJson.toJSONSchema({
		target: "draft-07",
		unrepresentable: "any"
	}) };
	return { schema: {
		type: "object",
		additionalProperties: true
	} };
}
//#endregion
//#region src/channels/plugins/helpers.ts
function formatPairingApproveHint(channelId) {
	return `Approve via: ${formatCliCommand(`openclaw pairing list ${channelId}`)} / ${formatCliCommand(`openclaw pairing approve ${channelId} <code>`)}`;
}
//#endregion
//#region src/secrets/provider-env-vars.ts
const PROVIDER_ENV_VARS = {
	openai: ["OPENAI_API_KEY"],
	anthropic: ["ANTHROPIC_API_KEY"],
	google: ["GEMINI_API_KEY"],
	minimax: ["MINIMAX_API_KEY"],
	"minimax-cn": ["MINIMAX_API_KEY"],
	moonshot: ["MOONSHOT_API_KEY"],
	"kimi-coding": ["KIMI_API_KEY", "KIMICODE_API_KEY"],
	synthetic: ["SYNTHETIC_API_KEY"],
	venice: ["VENICE_API_KEY"],
	zai: ["ZAI_API_KEY", "Z_AI_API_KEY"],
	xiaomi: ["XIAOMI_API_KEY"],
	openrouter: ["OPENROUTER_API_KEY"],
	"cloudflare-ai-gateway": ["CLOUDFLARE_AI_GATEWAY_API_KEY"],
	litellm: ["LITELLM_API_KEY"],
	"vercel-ai-gateway": ["AI_GATEWAY_API_KEY"],
	opencode: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
	together: ["TOGETHER_API_KEY"],
	huggingface: ["HUGGINGFACE_HUB_TOKEN", "HF_TOKEN"],
	qianfan: ["QIANFAN_API_KEY"],
	xai: ["XAI_API_KEY"],
	mistral: ["MISTRAL_API_KEY"],
	kilocode: ["KILOCODE_API_KEY"],
	volcengine: ["VOLCANO_ENGINE_API_KEY"],
	byteplus: ["BYTEPLUS_API_KEY"]
};
//#endregion
//#region src/commands/auth-choice.apply-helpers.ts
function formatErrorMessage(error) {
	if (error instanceof Error && typeof error.message === "string" && error.message.trim()) return error.message;
	return String(error);
}
function resolveDefaultProviderEnvVar(provider) {
	return PROVIDER_ENV_VARS[provider]?.find((candidate) => candidate.trim().length > 0);
}
function resolveDefaultFilePointerId(provider) {
	return `/providers/${encodeJsonPointerToken(provider)}/apiKey`;
}
async function promptSecretRefForOnboarding(params) {
	const defaultEnvVar = params.preferredEnvVar ?? resolveDefaultProviderEnvVar(params.provider) ?? "";
	const defaultFilePointer = resolveDefaultFilePointerId(params.provider);
	let sourceChoice = "env";
	while (true) {
		const source = await params.prompter.select({
			message: params.copy?.sourceMessage ?? "Where is this API key stored?",
			initialValue: sourceChoice,
			options: [{
				value: "env",
				label: "Environment variable",
				hint: "Reference a variable from your runtime environment"
			}, {
				value: "provider",
				label: "Configured secret provider",
				hint: "Use a configured file or exec secret provider"
			}]
		}) === "provider" ? "provider" : "env";
		sourceChoice = source;
		if (source === "env") {
			const envVarRaw = await params.prompter.text({
				message: params.copy?.envVarMessage ?? "Environment variable name",
				initialValue: defaultEnvVar || void 0,
				placeholder: params.copy?.envVarPlaceholder ?? "OPENAI_API_KEY",
				validate: (value) => {
					const candidate = value.trim();
					if (!isValidEnvSecretRefId(candidate)) return params.copy?.envVarFormatError ?? "Use an env var name like \"OPENAI_API_KEY\" (uppercase letters, numbers, underscores).";
					if (!process.env[candidate]?.trim()) return params.copy?.envVarMissingError?.(candidate) ?? `Environment variable "${candidate}" is missing or empty in this session.`;
				}
			});
			const envCandidate = String(envVarRaw ?? "").trim();
			const envVar = envCandidate && isValidEnvSecretRefId(envCandidate) ? envCandidate : defaultEnvVar;
			if (!envVar) throw new Error(`No valid environment variable name provided for provider "${params.provider}".`);
			const ref = {
				source: "env",
				provider: resolveDefaultSecretProviderAlias(params.config, "env", { preferFirstProviderForSource: true }),
				id: envVar
			};
			const resolvedValue = await resolveSecretRefString(ref, {
				config: params.config,
				env: process.env
			});
			await params.prompter.note(params.copy?.envValidatedMessage?.(envVar) ?? `Validated environment variable ${envVar}. OpenClaw will store a reference, not the key value.`, "Reference validated");
			return {
				ref,
				resolvedValue
			};
		}
		const externalProviders = Object.entries(params.config.secrets?.providers ?? {}).filter(([, provider]) => provider?.source === "file" || provider?.source === "exec");
		if (externalProviders.length === 0) {
			await params.prompter.note(params.copy?.noProvidersMessage ?? "No file/exec secret providers are configured yet. Add one under secrets.providers, or select Environment variable.", "No providers configured");
			continue;
		}
		const defaultProvider = resolveDefaultSecretProviderAlias(params.config, "file", { preferFirstProviderForSource: true });
		const selectedProvider = await params.prompter.select({
			message: "Select secret provider",
			initialValue: externalProviders.find(([providerName]) => providerName === defaultProvider)?.[0] ?? externalProviders[0]?.[0],
			options: externalProviders.map(([providerName, provider]) => ({
				value: providerName,
				label: providerName,
				hint: provider?.source === "exec" ? "Exec provider" : "File provider"
			}))
		});
		const providerEntry = params.config.secrets?.providers?.[selectedProvider];
		if (!providerEntry || providerEntry.source !== "file" && providerEntry.source !== "exec") {
			await params.prompter.note(`Provider "${selectedProvider}" is not a file/exec provider.`, "Invalid provider");
			continue;
		}
		const idPrompt = providerEntry.source === "file" ? "Secret id (JSON pointer for json mode, or 'value' for singleValue mode)" : "Secret id for the exec provider";
		const idDefault = providerEntry.source === "file" ? providerEntry.mode === "singleValue" ? "value" : defaultFilePointer : `${params.provider}/apiKey`;
		const idRaw = await params.prompter.text({
			message: idPrompt,
			initialValue: idDefault,
			placeholder: providerEntry.source === "file" ? "/providers/openai/apiKey" : "openai/api-key",
			validate: (value) => {
				const candidate = value.trim();
				if (!candidate) return "Secret id cannot be empty.";
				if (providerEntry.source === "file" && providerEntry.mode !== "singleValue" && !isValidFileSecretRefId(candidate)) return "Use an absolute JSON pointer like \"/providers/openai/apiKey\".";
				if (providerEntry.source === "file" && providerEntry.mode === "singleValue" && candidate !== "value") return "singleValue mode expects id \"value\".";
			}
		});
		const id = String(idRaw ?? "").trim() || idDefault;
		const ref = {
			source: providerEntry.source,
			provider: selectedProvider,
			id
		};
		try {
			const resolvedValue = await resolveSecretRefString(ref, {
				config: params.config,
				env: process.env
			});
			await params.prompter.note(params.copy?.providerValidatedMessage?.(selectedProvider, id, providerEntry.source) ?? `Validated ${providerEntry.source} reference ${selectedProvider}:${id}. OpenClaw will store a reference, not the key value.`, "Reference validated");
			return {
				ref,
				resolvedValue
			};
		} catch (error) {
			await params.prompter.note([
				`Could not validate provider reference ${selectedProvider}:${id}.`,
				formatErrorMessage(error),
				"Check your provider configuration and try again."
			].join("\n"), "Reference check failed");
		}
	}
}
async function resolveSecretInputModeForEnvSelection(params) {
	if (params.explicitMode) return params.explicitMode;
	if (typeof params.prompter.select !== "function") return "plaintext";
	return await params.prompter.select({
		message: params.copy?.modeMessage ?? "How do you want to provide this API key?",
		initialValue: "plaintext",
		options: [{
			value: "plaintext",
			label: params.copy?.plaintextLabel ?? "Paste API key now",
			hint: params.copy?.plaintextHint ?? "Stores the key directly in OpenClaw config"
		}, {
			value: "ref",
			label: params.copy?.refLabel ?? "Use external secret provider",
			hint: params.copy?.refHint ?? "Stores a reference to env or configured external secret providers"
		}]
	}) === "ref" ? "ref" : "plaintext";
}
//#endregion
//#region src/plugin-sdk/onboarding.ts
async function promptAccountId$1(params) {
	const existingIds = params.listAccountIds(params.cfg);
	const initial = params.currentId?.trim() || params.defaultAccountId || "default";
	const choice = await params.prompter.select({
		message: `${params.label} account`,
		options: [...existingIds.map((id) => ({
			value: id,
			label: id === "default" ? "default (primary)" : id
		})), {
			value: "__new__",
			label: "Add a new account"
		}],
		initialValue: initial
	});
	if (choice !== "__new__") return normalizeAccountId(choice);
	const entered = await params.prompter.text({
		message: `New ${params.label} account id`,
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const normalized = normalizeAccountId(String(entered));
	if (String(entered).trim() !== normalized) await params.prompter.note(`Normalized account id to "${normalized}".`, `${params.label} account`);
	return normalized;
}
//#endregion
//#region src/channels/plugins/setup-helpers.ts
function channelHasAccounts(cfg, channelKey) {
	const base = cfg.channels?.[channelKey];
	return Boolean(base?.accounts && Object.keys(base.accounts).length > 0);
}
function shouldStoreNameInAccounts(params) {
	if (params.alwaysUseAccounts) return true;
	if (params.accountId !== "default") return true;
	return channelHasAccounts(params.cfg, params.channelKey);
}
function applyAccountNameToChannelSection(params) {
	const trimmed = params.name?.trim();
	if (!trimmed) return params.cfg;
	const accountId = normalizeAccountId(params.accountId);
	const baseConfig = params.cfg.channels?.[params.channelKey];
	const base = typeof baseConfig === "object" && baseConfig ? baseConfig : void 0;
	if (!shouldStoreNameInAccounts({
		cfg: params.cfg,
		channelKey: params.channelKey,
		accountId,
		alwaysUseAccounts: params.alwaysUseAccounts
	}) && accountId === "default") {
		const safeBase = base ?? {};
		return {
			...params.cfg,
			channels: {
				...params.cfg.channels,
				[params.channelKey]: {
					...safeBase,
					name: trimmed
				}
			}
		};
	}
	const baseAccounts = base?.accounts ?? {};
	const existingAccount = baseAccounts[accountId] ?? {};
	const baseWithoutName = accountId === "default" ? (({ name: _ignored, ...rest }) => rest)(base ?? {}) : base ?? {};
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.channelKey]: {
				...baseWithoutName,
				accounts: {
					...baseAccounts,
					[accountId]: {
						...existingAccount,
						name: trimmed
					}
				}
			}
		}
	};
}
//#endregion
//#region src/channels/plugins/onboarding/helpers.ts
const promptAccountId = async (params) => {
	return await promptAccountId$1(params);
};
function addWildcardAllowFrom(allowFrom) {
	const next = (allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean);
	if (!next.includes("*")) next.push("*");
	return next;
}
function mergeAllowFromEntries(current, additions) {
	const merged = [...current ?? [], ...additions].map((v) => String(v).trim()).filter(Boolean);
	return [...new Set(merged)];
}
async function resolveAccountIdForConfigure(params) {
	const override = params.accountOverride?.trim();
	let accountId = override ? normalizeAccountId(override) : params.defaultAccountId;
	if (params.shouldPromptAccountIds && !override) accountId = await promptAccountId({
		cfg: params.cfg,
		prompter: params.prompter,
		label: params.label,
		currentId: accountId,
		listAccountIds: params.listAccountIds,
		defaultAccountId: params.defaultAccountId
	});
	return accountId;
}
function setTopLevelChannelDmPolicyWithAllowFrom(params) {
	const channelConfig = params.cfg.channels?.[params.channel] ?? {};
	const existingAllowFrom = params.getAllowFrom?.(params.cfg) ?? channelConfig.allowFrom ?? void 0;
	const allowFrom = params.dmPolicy === "open" ? addWildcardAllowFrom(existingAllowFrom) : void 0;
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.channel]: {
				...channelConfig,
				dmPolicy: params.dmPolicy,
				...allowFrom ? { allowFrom } : {}
			}
		}
	};
}
function buildSingleChannelSecretPromptState(params) {
	return {
		accountConfigured: params.accountConfigured,
		hasConfigToken: params.hasConfigToken,
		canUseEnv: params.allowEnv && Boolean(params.envValue?.trim()) && !params.hasConfigToken
	};
}
async function promptSingleChannelToken(params) {
	const promptToken = async () => String(await params.prompter.text({
		message: params.inputPrompt,
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
	if (params.canUseEnv) {
		if (await params.prompter.confirm({
			message: params.envPrompt,
			initialValue: true
		})) return {
			useEnv: true,
			token: null
		};
		return {
			useEnv: false,
			token: await promptToken()
		};
	}
	if (params.hasConfigToken && params.accountConfigured) {
		if (await params.prompter.confirm({
			message: params.keepPrompt,
			initialValue: true
		})) return {
			useEnv: false,
			token: null
		};
	}
	return {
		useEnv: false,
		token: await promptToken()
	};
}
async function promptSingleChannelSecretInput(params) {
	if (await resolveSecretInputModeForEnvSelection({
		prompter: params.prompter,
		explicitMode: params.secretInputMode,
		copy: {
			modeMessage: `How do you want to provide this ${params.credentialLabel}?`,
			plaintextLabel: `Enter ${params.credentialLabel}`,
			plaintextHint: "Stores the credential directly in OpenClaw config",
			refLabel: "Use external secret provider",
			refHint: "Stores a reference to env or configured external secret providers"
		}
	}) === "plaintext") {
		const plainResult = await promptSingleChannelToken({
			prompter: params.prompter,
			accountConfigured: params.accountConfigured,
			canUseEnv: params.canUseEnv,
			hasConfigToken: params.hasConfigToken,
			envPrompt: params.envPrompt,
			keepPrompt: params.keepPrompt,
			inputPrompt: params.inputPrompt
		});
		if (plainResult.useEnv) return { action: "use-env" };
		if (plainResult.token) return {
			action: "set",
			value: plainResult.token,
			resolvedValue: plainResult.token
		};
		return { action: "keep" };
	}
	if (params.hasConfigToken && params.accountConfigured) {
		if (await params.prompter.confirm({
			message: params.keepPrompt,
			initialValue: true
		})) return { action: "keep" };
	}
	const resolved = await promptSecretRefForOnboarding({
		provider: params.providerHint,
		config: params.cfg,
		prompter: params.prompter,
		preferredEnvVar: params.preferredEnvVar,
		copy: {
			sourceMessage: `Where is this ${params.credentialLabel} stored?`,
			envVarPlaceholder: params.preferredEnvVar ?? "OPENCLAW_SECRET",
			envVarFormatError: "Use an env var name like \"OPENCLAW_SECRET\" (uppercase letters, numbers, underscores).",
			noProvidersMessage: "No file/exec secret providers are configured yet. Add one under secrets.providers, or select Environment variable."
		}
	});
	return {
		action: "set",
		value: resolved.ref,
		resolvedValue: resolved.resolvedValue
	};
}
//#endregion
//#region src/plugin-sdk/secret-input-schema.ts
function buildSecretInputSchema() {
	return z.union([z.string(), z.object({
		source: z.enum([
			"env",
			"file",
			"exec"
		]),
		provider: z.string().min(1),
		id: z.string().min(1)
	})]);
}
//#endregion
//#region src/plugins/config-schema.ts
function error(message) {
	return {
		success: false,
		error: { issues: [{
			path: [],
			message
		}] }
	};
}
function emptyPluginConfigSchema() {
	return {
		safeParse(value) {
			if (value === void 0) return {
				success: true,
				data: void 0
			};
			if (!value || typeof value !== "object" || Array.isArray(value)) return error("expected config object");
			if (Object.keys(value).length > 0) return error("config must be empty");
			return {
				success: true,
				data: value
			};
		},
		jsonSchema: {
			type: "object",
			additionalProperties: false,
			properties: {}
		}
	};
}
//#endregion
//#region src/plugin-sdk/pairing-access.ts
function createScopedPairingAccess(params) {
	const resolvedAccountId = normalizeAccountId(params.accountId);
	return {
		accountId: resolvedAccountId,
		readAllowFromStore: () => params.core.channel.pairing.readAllowFromStore({
			channel: params.channel,
			accountId: resolvedAccountId
		}),
		readStoreForDmPolicy: (provider, accountId) => params.core.channel.pairing.readAllowFromStore({
			channel: provider,
			accountId: normalizeAccountId(accountId)
		}),
		upsertPairingRequest: (input) => params.core.channel.pairing.upsertPairingRequest({
			channel: params.channel,
			accountId: resolvedAccountId,
			...input
		})
	};
}
//#endregion
//#region src/plugin-sdk/persistent-dedupe.ts
const DEFAULT_LOCK_OPTIONS = {
	retries: {
		retries: 6,
		factor: 1.35,
		minTimeout: 8,
		maxTimeout: 180,
		randomize: true
	},
	stale: 6e4
};
function mergeLockOptions(overrides) {
	return {
		stale: overrides?.stale ?? DEFAULT_LOCK_OPTIONS.stale,
		retries: {
			retries: overrides?.retries?.retries ?? DEFAULT_LOCK_OPTIONS.retries.retries,
			factor: overrides?.retries?.factor ?? DEFAULT_LOCK_OPTIONS.retries.factor,
			minTimeout: overrides?.retries?.minTimeout ?? DEFAULT_LOCK_OPTIONS.retries.minTimeout,
			maxTimeout: overrides?.retries?.maxTimeout ?? DEFAULT_LOCK_OPTIONS.retries.maxTimeout,
			randomize: overrides?.retries?.randomize ?? DEFAULT_LOCK_OPTIONS.retries.randomize
		}
	};
}
function sanitizeData(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const [key, ts] of Object.entries(value)) if (typeof ts === "number" && Number.isFinite(ts) && ts > 0) out[key] = ts;
	return out;
}
function pruneData(data, now, ttlMs, maxEntries) {
	if (ttlMs > 0) {
		for (const [key, ts] of Object.entries(data)) if (now - ts >= ttlMs) delete data[key];
	}
	const keys = Object.keys(data);
	if (keys.length <= maxEntries) return;
	keys.toSorted((a, b) => data[a] - data[b]).slice(0, keys.length - maxEntries).forEach((key) => {
		delete data[key];
	});
}
function createPersistentDedupe(options) {
	const ttlMs = Math.max(0, Math.floor(options.ttlMs));
	const memoryMaxSize = Math.max(0, Math.floor(options.memoryMaxSize));
	const fileMaxEntries = Math.max(1, Math.floor(options.fileMaxEntries));
	const lockOptions = mergeLockOptions(options.lockOptions);
	const memory = createDedupeCache({
		ttlMs,
		maxSize: memoryMaxSize
	});
	const inflight = /* @__PURE__ */ new Map();
	async function checkAndRecordInner(key, namespace, scopedKey, now, onDiskError) {
		if (memory.check(scopedKey, now)) return false;
		const path = options.resolveFilePath(namespace);
		try {
			return !await withFileLock(path, lockOptions, async () => {
				const { value } = await readJsonFileWithFallback(path, {});
				const data = sanitizeData(value);
				const seenAt = data[key];
				if (seenAt != null && (ttlMs <= 0 || now - seenAt < ttlMs)) return true;
				data[key] = now;
				pruneData(data, now, ttlMs, fileMaxEntries);
				await writeJsonFileAtomically(path, data);
				return false;
			});
		} catch (error) {
			onDiskError?.(error);
			memory.check(scopedKey, now);
			return true;
		}
	}
	async function warmup(namespace = "global", onError) {
		const filePath = options.resolveFilePath(namespace);
		const now = Date.now();
		try {
			const { value } = await readJsonFileWithFallback(filePath, {});
			const data = sanitizeData(value);
			let loaded = 0;
			for (const [key, ts] of Object.entries(data)) {
				if (ttlMs > 0 && now - ts >= ttlMs) continue;
				const scopedKey = `${namespace}:${key}`;
				memory.check(scopedKey, ts);
				loaded++;
			}
			return loaded;
		} catch (error) {
			onError?.(error);
			return 0;
		}
	}
	async function checkAndRecord(key, dedupeOptions) {
		const trimmed = key.trim();
		if (!trimmed) return true;
		const namespace = dedupeOptions?.namespace?.trim() || "global";
		const scopedKey = `${namespace}:${trimmed}`;
		if (inflight.has(scopedKey)) return false;
		const onDiskError = dedupeOptions?.onDiskError ?? options.onDiskError;
		const work = checkAndRecordInner(trimmed, namespace, scopedKey, dedupeOptions?.now ?? Date.now(), onDiskError);
		inflight.set(scopedKey, work);
		try {
			return await work;
		} finally {
			inflight.delete(scopedKey);
		}
	}
	return {
		checkAndRecord,
		warmup,
		clearMemory: () => memory.clear(),
		memorySize: () => memory.size()
	};
}
//#endregion
//#region src/plugin-sdk/reply-payload.ts
function normalizeOutboundReplyPayload(payload) {
	return {
		text: typeof payload.text === "string" ? payload.text : void 0,
		mediaUrls: Array.isArray(payload.mediaUrls) ? payload.mediaUrls.filter((entry) => typeof entry === "string" && entry.length > 0) : void 0,
		mediaUrl: typeof payload.mediaUrl === "string" ? payload.mediaUrl : void 0,
		replyToId: typeof payload.replyToId === "string" ? payload.replyToId : void 0
	};
}
function createNormalizedOutboundDeliverer(handler) {
	return async (payload) => {
		await handler(payload && typeof payload === "object" ? normalizeOutboundReplyPayload(payload) : {});
	};
}
function resolveOutboundMediaUrls(payload) {
	if (payload.mediaUrls?.length) return payload.mediaUrls;
	if (payload.mediaUrl) return [payload.mediaUrl];
	return [];
}
function formatTextWithAttachmentLinks(text, mediaUrls) {
	const trimmedText = text?.trim() ?? "";
	if (!trimmedText && mediaUrls.length === 0) return "";
	const mediaBlock = mediaUrls.length ? mediaUrls.map((url) => `Attachment: ${url}`).join("\n") : "";
	if (!trimmedText) return mediaBlock;
	if (!mediaBlock) return trimmedText;
	return `${trimmedText}\n\n${mediaBlock}`;
}
//#endregion
//#region src/plugin-sdk/inbound-reply-dispatch.ts
function buildInboundReplyDispatchBase(params) {
	return {
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		agentId: params.route.agentId,
		routeSessionKey: params.route.sessionKey,
		storePath: params.storePath,
		ctxPayload: params.ctxPayload,
		recordInboundSession: params.core.channel.session.recordInboundSession,
		dispatchReplyWithBufferedBlockDispatcher: params.core.channel.reply.dispatchReplyWithBufferedBlockDispatcher
	};
}
async function dispatchInboundReplyWithBase(params) {
	await recordInboundSessionAndDispatchReply({
		...buildInboundReplyDispatchBase(params),
		deliver: params.deliver,
		onRecordError: params.onRecordError,
		onDispatchError: params.onDispatchError,
		replyOptions: params.replyOptions
	});
}
async function recordInboundSessionAndDispatchReply(params) {
	await params.recordInboundSession({
		storePath: params.storePath,
		sessionKey: params.ctxPayload.SessionKey ?? params.routeSessionKey,
		ctx: params.ctxPayload,
		onRecordError: params.onRecordError
	});
	const { onModelSelected, ...prefixOptions } = createReplyPrefixOptions({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: params.channel,
		accountId: params.accountId
	});
	const deliver = createNormalizedOutboundDeliverer(params.deliver);
	await params.dispatchReplyWithBufferedBlockDispatcher({
		ctx: params.ctxPayload,
		cfg: params.cfg,
		dispatcherOptions: {
			...prefixOptions,
			deliver,
			onError: params.onDispatchError
		},
		replyOptions: {
			...params.replyOptions,
			onModelSelected
		}
	});
}
//#endregion
//#region src/plugin-sdk/runtime.ts
function createLoggerBackedRuntime(params) {
	return {
		log: (...args) => {
			params.logger.info(format(...args));
		},
		error: (...args) => {
			params.logger.error(format(...args));
		},
		exit: (code) => {
			throw params.exitError?.(code) ?? /* @__PURE__ */ new Error(`exit ${code}`);
		}
	};
}
//#endregion
//#region src/plugin-sdk/status-helpers.ts
function buildBaseChannelStatusSummary(snapshot) {
	return {
		configured: snapshot.configured ?? false,
		running: snapshot.running ?? false,
		lastStartAt: snapshot.lastStartAt ?? null,
		lastStopAt: snapshot.lastStopAt ?? null,
		lastError: snapshot.lastError ?? null
	};
}
function buildRuntimeAccountStatusSnapshot(params) {
	const { runtime, probe } = params;
	return {
		running: runtime?.running ?? false,
		lastStartAt: runtime?.lastStartAt ?? null,
		lastStopAt: runtime?.lastStopAt ?? null,
		lastError: runtime?.lastError ?? null,
		probe
	};
}
//#endregion
export { BlockStreamingCoalesceSchema, DEFAULT_ACCOUNT_ID, DmConfigSchema, DmPolicySchema, GROUP_POLICY_BLOCKED_LABEL, GroupPolicySchema, MarkdownConfigSchema, ReplyRuntimeConfigSchemaShape, ToolPolicySchema, addWildcardAllowFrom, applyAccountNameToChannelSection, buildBaseChannelStatusSummary, buildChannelConfigSchema, buildChannelKeyCandidates, buildRuntimeAccountStatusSnapshot, buildSecretInputSchema, buildSingleChannelSecretPromptState, clearAccountEntryFields, createAccountListHelpers, createLoggerBackedRuntime, createNormalizedOutboundDeliverer, createPersistentDedupe, createReplyPrefixOptions, createScopedPairingAccess, deleteAccountFromConfigSection, dispatchInboundReplyWithBase, emptyPluginConfigSchema, evaluateMatchedGroupAccessForPolicy, fetchWithSsrFGuard, formatDocsLink, formatPairingApproveHint, formatTextWithAttachmentLinks, hasConfiguredSecretInput, isRequestBodyLimitError, issuePairingChallenge, listConfiguredAccountIds, logInboundDrop, mapAllowFromEntries, mergeAllowFromEntries, normalizeAccountId, normalizeChannelSlug, normalizeResolvedSecretInputString, normalizeSecretInputString, promptAccountId, promptSingleChannelSecretInput, readRequestBodyWithLimit, readStoreAllowFromForDmPolicy, requestBodyErrorToText, requireOpenAllowFrom, resolveAccountIdForConfigure, resolveAccountWithDefaultFallback, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelEntryMatchWithFallback, resolveDefaultGroupPolicy, resolveDmGroupAccessWithCommandGate, resolveMentionGatingWithBypass, resolveNestedAllowlistDecision, resolveOutboundMediaUrls, setAccountEnabledInConfigSection, setTopLevelChannelDmPolicyWithAllowFrom, warnMissingProviderGroupPolicyFallbackOnce };
