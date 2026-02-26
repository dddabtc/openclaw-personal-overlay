import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { D as resolveDefaultAgentWorkspaceDir, c as resolveAgentWorkspaceDir, i as resolveAgentDir, l as resolveDefaultAgentId, o as resolveAgentModelPrimary } from "./agent-scope-B36jktKj.js";
import { At as ensureAuthProfileStore, Ft as resolveOpenClawAgentDir, G as getCustomProviderApiKey, Gt as DEFAULT_MODEL, Kt as DEFAULT_PROVIDER, M as VENICE_DEFAULT_MODEL_REF, Ot as upsertAuthProfile, St as parseOAuthCallbackInput, Tt as listProfilesForProvider, Y as resolveEnvApiKey, bt as exchangeChutesCodeForTokens, ct as CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF, ft as resolveAuthProfileOrder, ot as discoverHuggingfaceModels, p as resolveConfiguredModelRef, st as isHuggingfacePolicyLocked, xt as generateChutesPkce, yt as CHUTES_AUTHORIZE_ENDPOINT, z as SYNTHETIC_DEFAULT_MODEL_REF } from "./model-selection-mHHEzs4Y.js";
import { r as isLoopbackHost } from "./ws-C7EXRv8z.js";
import { n as loadModelCatalog } from "./model-catalog-DoHHvz7d.js";
import { f as openUrl } from "./onboard-helpers-G9Oq_RlQ.js";
import { t as enablePluginInConfig } from "./enable-HSYin9n7.js";
import { $ as setHuggingfaceApiKey, A as applyXaiConfig, B as applyVercelAiGatewayConfig, C as applyQianfanProviderConfig, D as applyTogetherProviderConfig, E as applyTogetherConfig, F as applyZaiProviderConfig, G as OPENROUTER_DEFAULT_MODEL_REF, H as applyAgentDefaultModelPrimary, I as applyLitellmConfig, J as XIAOMI_DEFAULT_MODEL_REF, K as TOGETHER_DEFAULT_MODEL_REF, L as applyLitellmProviderConfig, M as applyXiaomiConfig, N as applyXiaomiProviderConfig, O as applyVeniceConfig, P as applyZaiConfig, Q as setGeminiApiKey, R as applyCloudflareAiGatewayConfig, S as applyQianfanConfig, T as applySyntheticProviderConfig, U as HUGGINGFACE_DEFAULT_MODEL_REF, V as applyVercelAiGatewayProviderConfig, W as LITELLM_DEFAULT_MODEL_REF, X as setAnthropicApiKey, Y as ZAI_DEFAULT_MODEL_REF, Z as setCloudflareAiGatewayConfig, _ as applyMoonshotConfigCn, _t as QIANFAN_DEFAULT_MODEL_REF, a as applyMinimaxApiConfig, at as setOpenrouterApiKey, b as applyOpenrouterConfig, c as applyMinimaxApiProviderConfigCn, ct as setTogetherApiKey, d as applyAuthProfileConfig, dt as setXaiApiKey, et as setKimiCodingApiKey, ft as setXiaomiApiKey, g as applyMoonshotConfig, gt as MOONSHOT_DEFAULT_MODEL_REF, h as applyKimiCodeProviderConfig, ht as KIMI_CODING_MODEL_REF, i as applyOpencodeZenProviderConfig, it as setOpencodeZenApiKey, j as applyXaiProviderConfig, k as applyVeniceProviderConfig, l as applyMinimaxConfig, lt as setVeniceApiKey, m as applyKimiCodeConfig, mt as writeOAuthCredentials, n as validateAnthropicSetupToken, nt as setMinimaxApiKey, o as applyMinimaxApiConfigCn, ot as setQianfanApiKey, p as applyHuggingfaceProviderConfig, pt as setZaiApiKey, q as VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF, r as applyOpencodeZenConfig, rt as setMoonshotApiKey, s as applyMinimaxApiProviderConfig, st as setSyntheticApiKey, t as buildTokenProfileId, tt as setLitellmApiKey, u as applyMinimaxProviderConfig, ut as setVercelAiGatewayApiKey, v as applyMoonshotProviderConfig, vt as XAI_DEFAULT_MODEL_REF, w as applySyntheticConfig, x as applyOpenrouterProviderConfig, y as applyMoonshotProviderConfigCn, z as applyCloudflareAiGatewayProviderConfig } from "./auth-token-BPnpjvqi.js";
import { a as createVpsAwareOAuthHandlers, c as githubCopilotLoginCommand, i as resolveProviderMatch, n as mergeConfigPatch, o as isRemoteEnvironment, r as pickAuthMethod, s as resolvePluginProviders, t as applyDefaultModel } from "./provider-auth-helpers-Bfn3WDY2.js";
import { a as detectZaiEndpoint, c as ensureModelAllowlistEntry, i as upsertSharedEnvVar, n as applyOpenAIConfig, o as GOOGLE_GEMINI_DEFAULT_MODEL, r as applyOpenAIProviderConfig, s as applyGoogleGeminiModelDefault, t as OPENAI_DEFAULT_MODEL } from "./openai-model-default-B3SZ12WA.js";
import { c as OPENAI_CODEX_DEFAULT_MODEL, l as applyOpenAICodexModelDefault, r as applyPrimaryModel, s as promptAndConfigureVllm } from "./model-picker-D528Lmh5.js";
import { randomBytes } from "node:crypto";
import { loginOpenAICodex } from "@mariozechner/pi-ai";
import { createServer } from "node:http";

//#region src/commands/auth-choice.api-key.ts
const DEFAULT_KEY_PREVIEW = {
	head: 4,
	tail: 4
};
function normalizeApiKeyInput(raw) {
	const trimmed = String(raw ?? "").trim();
	if (!trimmed) return "";
	const assignmentMatch = trimmed.match(/^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*(.+)$/);
	const valuePart = assignmentMatch ? assignmentMatch[1].trim() : trimmed;
	const unquoted = valuePart.length >= 2 && (valuePart.startsWith("\"") && valuePart.endsWith("\"") || valuePart.startsWith("'") && valuePart.endsWith("'") || valuePart.startsWith("`") && valuePart.endsWith("`")) ? valuePart.slice(1, -1) : valuePart;
	return (unquoted.endsWith(";") ? unquoted.slice(0, -1) : unquoted).trim();
}
const validateApiKeyInput = (value) => normalizeApiKeyInput(value).length > 0 ? void 0 : "Required";
function formatApiKeyPreview(raw, opts = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return "…";
	const head = opts.head ?? DEFAULT_KEY_PREVIEW.head;
	const tail = opts.tail ?? DEFAULT_KEY_PREVIEW.tail;
	if (trimmed.length <= head + tail) {
		const shortHead = Math.min(2, trimmed.length);
		const shortTail = Math.min(2, trimmed.length - shortHead);
		if (shortTail <= 0) return `${trimmed.slice(0, shortHead)}…`;
		return `${trimmed.slice(0, shortHead)}…${trimmed.slice(-shortTail)}`;
	}
	return `${trimmed.slice(0, head)}…${trimmed.slice(-tail)}`;
}

//#endregion
//#region src/commands/auth-choice.apply.anthropic.ts
const DEFAULT_ANTHROPIC_MODEL = "anthropic/claude-sonnet-4-6";
async function applyAuthChoiceAnthropic(params) {
	if (params.authChoice === "setup-token" || params.authChoice === "oauth" || params.authChoice === "token") {
		let nextConfig = params.config;
		await params.prompter.note(["Run `claude setup-token` in your terminal.", "Then paste the generated token below."].join("\n"), "Anthropic setup-token");
		const tokenRaw = await params.prompter.text({
			message: "Paste Anthropic setup-token",
			validate: (value) => validateAnthropicSetupToken(String(value ?? ""))
		});
		const token = String(tokenRaw ?? "").trim();
		const profileNameRaw = await params.prompter.text({
			message: "Token name (blank = default)",
			placeholder: "default"
		});
		const provider = "anthropic";
		const namedProfileId = buildTokenProfileId({
			provider,
			name: String(profileNameRaw ?? "")
		});
		upsertAuthProfile({
			profileId: namedProfileId,
			agentDir: params.agentDir,
			credential: {
				type: "token",
				provider,
				token
			}
		});
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: namedProfileId,
			provider,
			mode: "token"
		});
		if (params.setDefaultModel) nextConfig = applyAgentDefaultModelPrimary(nextConfig, DEFAULT_ANTHROPIC_MODEL);
		return { config: nextConfig };
	}
	if (params.authChoice === "apiKey") {
		if (params.opts?.tokenProvider && params.opts.tokenProvider !== "anthropic") return null;
		let nextConfig = params.config;
		let hasCredential = false;
		const envKey = process.env.ANTHROPIC_API_KEY?.trim();
		if (params.opts?.token) {
			await setAnthropicApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential && envKey) {
			if (await params.prompter.confirm({
				message: `Use existing ANTHROPIC_API_KEY (env, ${formatApiKeyPreview(envKey)})?`,
				initialValue: true
			})) {
				await setAnthropicApiKey(envKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Anthropic API key",
				validate: validateApiKeyInput
			});
			await setAnthropicApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "anthropic:default",
			provider: "anthropic",
			mode: "api_key"
		});
		if (params.setDefaultModel) nextConfig = applyAgentDefaultModelPrimary(nextConfig, DEFAULT_ANTHROPIC_MODEL);
		return { config: nextConfig };
	}
	return null;
}

//#endregion
//#region src/commands/auth-choice.apply-helpers.ts
function createAuthChoiceAgentModelNoter(params) {
	return async (model) => {
		if (!params.agentId) return;
		await params.prompter.note(`Default model set to ${model} for agent "${params.agentId}".`, "Model configured");
	};
}

//#endregion
//#region src/commands/auth-choice.default-model.ts
async function applyDefaultModelChoice(params) {
	if (params.setDefaultModel) {
		const next = params.applyDefaultConfig(params.config);
		if (params.noteDefault) await params.prompter.note(`Default model set to ${params.noteDefault}`, "Model configured");
		return { config: next };
	}
	const nextWithModel = ensureModelAllowlistEntry({
		cfg: params.applyProviderConfig(params.config),
		modelRef: params.defaultModel
	});
	await params.noteAgentModel(params.defaultModel);
	return {
		config: nextWithModel,
		agentModelOverride: params.defaultModel
	};
}

//#endregion
//#region src/commands/auth-choice.apply.huggingface.ts
async function applyAuthChoiceHuggingface(params) {
	if (params.authChoice !== "huggingface-api-key") return null;
	let nextConfig = params.config;
	let agentModelOverride;
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	let hasCredential = false;
	let hfKey = "";
	if (!hasCredential && params.opts?.token && params.opts.tokenProvider === "huggingface") {
		hfKey = normalizeApiKeyInput(params.opts.token);
		await setHuggingfaceApiKey(hfKey, params.agentDir);
		hasCredential = true;
	}
	if (!hasCredential) await params.prompter.note(["Hugging Face Inference Providers offer OpenAI-compatible chat completions.", "Create a token at: https://huggingface.co/settings/tokens (fine-grained, 'Make calls to Inference Providers')."].join("\n"), "Hugging Face");
	if (!hasCredential) {
		const envKey = resolveEnvApiKey("huggingface");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing Hugging Face token (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				hfKey = envKey.apiKey;
				await setHuggingfaceApiKey(hfKey, params.agentDir);
				hasCredential = true;
			}
		}
	}
	if (!hasCredential) {
		const key = await params.prompter.text({
			message: "Enter Hugging Face API key (HF token)",
			validate: validateApiKeyInput
		});
		hfKey = normalizeApiKeyInput(String(key ?? ""));
		await setHuggingfaceApiKey(hfKey, params.agentDir);
	}
	nextConfig = applyAuthProfileConfig(nextConfig, {
		profileId: "huggingface:default",
		provider: "huggingface",
		mode: "api_key"
	});
	const models = await discoverHuggingfaceModels(hfKey);
	const modelRefPrefix = "huggingface/";
	const options = [];
	for (const m of models) {
		const baseRef = `${modelRefPrefix}${m.id}`;
		const label = m.name ?? m.id;
		options.push({
			value: baseRef,
			label
		});
		options.push({
			value: `${baseRef}:cheapest`,
			label: `${label} (cheapest)`
		});
		options.push({
			value: `${baseRef}:fastest`,
			label: `${label} (fastest)`
		});
	}
	const defaultRef = HUGGINGFACE_DEFAULT_MODEL_REF;
	options.sort((a, b) => {
		if (a.value === defaultRef) return -1;
		if (b.value === defaultRef) return 1;
		return a.label.localeCompare(b.label, void 0, { sensitivity: "base" });
	});
	const selectedModelRef = options.length === 0 ? defaultRef : options.length === 1 ? options[0].value : await params.prompter.select({
		message: "Default Hugging Face model",
		options,
		initialValue: options.some((o) => o.value === defaultRef) ? defaultRef : options[0].value
	});
	if (isHuggingfacePolicyLocked(selectedModelRef)) await params.prompter.note("Provider locked — router will choose backend by cost or speed.", "Hugging Face");
	const applied = await applyDefaultModelChoice({
		config: nextConfig,
		setDefaultModel: params.setDefaultModel,
		defaultModel: selectedModelRef,
		applyDefaultConfig: (config) => {
			const withProvider = applyHuggingfaceProviderConfig(config);
			const existingModel = withProvider.agents?.defaults?.model;
			return ensureModelAllowlistEntry({
				cfg: {
					...withProvider,
					agents: {
						...withProvider.agents,
						defaults: {
							...withProvider.agents?.defaults,
							model: {
								...existingModel && typeof existingModel === "object" && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : {},
								primary: selectedModelRef
							}
						}
					}
				},
				modelRef: selectedModelRef
			});
		},
		applyProviderConfig: applyHuggingfaceProviderConfig,
		noteDefault: selectedModelRef,
		noteAgentModel,
		prompter: params.prompter
	});
	nextConfig = applied.config;
	agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
	return {
		config: nextConfig,
		agentModelOverride
	};
}

//#endregion
//#region src/commands/auth-choice.apply.openrouter.ts
async function applyAuthChoiceOpenRouter(params) {
	let nextConfig = params.config;
	let agentModelOverride;
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	const store = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
	const existingProfileId = resolveAuthProfileOrder({
		cfg: nextConfig,
		store,
		provider: "openrouter"
	}).find((profileId) => Boolean(store.profiles[profileId]));
	const existingCred = existingProfileId ? store.profiles[existingProfileId] : void 0;
	let profileId = "openrouter:default";
	let mode = "api_key";
	let hasCredential = false;
	if (existingProfileId && existingCred?.type) {
		profileId = existingProfileId;
		mode = existingCred.type === "oauth" ? "oauth" : existingCred.type === "token" ? "token" : "api_key";
		hasCredential = true;
	}
	if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "openrouter") {
		await setOpenrouterApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
		hasCredential = true;
	}
	if (!hasCredential) {
		const envKey = resolveEnvApiKey("openrouter");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing OPENROUTER_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setOpenrouterApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
	}
	if (!hasCredential) {
		const key = await params.prompter.text({
			message: "Enter OpenRouter API key",
			validate: validateApiKeyInput
		});
		await setOpenrouterApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		hasCredential = true;
	}
	if (hasCredential) nextConfig = applyAuthProfileConfig(nextConfig, {
		profileId,
		provider: "openrouter",
		mode
	});
	const applied = await applyDefaultModelChoice({
		config: nextConfig,
		setDefaultModel: params.setDefaultModel,
		defaultModel: OPENROUTER_DEFAULT_MODEL_REF,
		applyDefaultConfig: applyOpenrouterConfig,
		applyProviderConfig: applyOpenrouterProviderConfig,
		noteDefault: OPENROUTER_DEFAULT_MODEL_REF,
		noteAgentModel,
		prompter: params.prompter
	});
	nextConfig = applied.config;
	agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
	return {
		config: nextConfig,
		agentModelOverride
	};
}

//#endregion
//#region src/commands/opencode-zen-model-default.ts
const OPENCODE_ZEN_DEFAULT_MODEL = "opencode/claude-opus-4-6";

//#endregion
//#region src/commands/auth-choice.apply.api-providers.ts
async function applyAuthChoiceApiProviders(params) {
	let nextConfig = params.config;
	let agentModelOverride;
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	let authChoice = params.authChoice;
	if (authChoice === "apiKey" && params.opts?.tokenProvider && params.opts.tokenProvider !== "anthropic" && params.opts.tokenProvider !== "openai") {
		if (params.opts.tokenProvider === "openrouter") authChoice = "openrouter-api-key";
		else if (params.opts.tokenProvider === "litellm") authChoice = "litellm-api-key";
		else if (params.opts.tokenProvider === "vercel-ai-gateway") authChoice = "ai-gateway-api-key";
		else if (params.opts.tokenProvider === "cloudflare-ai-gateway") authChoice = "cloudflare-ai-gateway-api-key";
		else if (params.opts.tokenProvider === "moonshot") authChoice = "moonshot-api-key";
		else if (params.opts.tokenProvider === "kimi-code" || params.opts.tokenProvider === "kimi-coding") authChoice = "kimi-code-api-key";
		else if (params.opts.tokenProvider === "google") authChoice = "gemini-api-key";
		else if (params.opts.tokenProvider === "zai") authChoice = "zai-api-key";
		else if (params.opts.tokenProvider === "xiaomi") authChoice = "xiaomi-api-key";
		else if (params.opts.tokenProvider === "synthetic") authChoice = "synthetic-api-key";
		else if (params.opts.tokenProvider === "venice") authChoice = "venice-api-key";
		else if (params.opts.tokenProvider === "together") authChoice = "together-api-key";
		else if (params.opts.tokenProvider === "huggingface") authChoice = "huggingface-api-key";
		else if (params.opts.tokenProvider === "opencode") authChoice = "opencode-zen";
		else if (params.opts.tokenProvider === "qianfan") authChoice = "qianfan-api-key";
	}
	async function ensureMoonshotApiKeyCredential(promptMessage) {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "moonshot") {
			await setMoonshotApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		const envKey = resolveEnvApiKey("moonshot");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing MOONSHOT_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setMoonshotApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: promptMessage,
				validate: validateApiKeyInput
			});
			await setMoonshotApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
	}
	if (authChoice === "openrouter-api-key") return applyAuthChoiceOpenRouter(params);
	if (authChoice === "litellm-api-key") {
		const store = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
		const existingProfileId = resolveAuthProfileOrder({
			cfg: nextConfig,
			store,
			provider: "litellm"
		}).find((profileId) => Boolean(store.profiles[profileId]));
		const existingCred = existingProfileId ? store.profiles[existingProfileId] : void 0;
		let profileId = "litellm:default";
		let hasCredential = false;
		if (existingProfileId && existingCred?.type === "api_key") {
			profileId = existingProfileId;
			hasCredential = true;
		}
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "litellm") {
			await setLitellmApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) {
			await params.prompter.note("LiteLLM provides a unified API to 100+ LLM providers.\nGet your API key from your LiteLLM proxy or https://litellm.ai\nDefault proxy runs on http://localhost:4000", "LiteLLM");
			const envKey = resolveEnvApiKey("litellm");
			if (envKey) {
				if (await params.prompter.confirm({
					message: `Use existing LITELLM_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
					initialValue: true
				})) {
					await setLitellmApiKey(envKey.apiKey, params.agentDir);
					hasCredential = true;
				}
			}
			if (!hasCredential) {
				const key = await params.prompter.text({
					message: "Enter LiteLLM API key",
					validate: validateApiKeyInput
				});
				await setLitellmApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
				hasCredential = true;
			}
		}
		if (hasCredential) nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId,
			provider: "litellm",
			mode: "api_key"
		});
		const applied = await applyDefaultModelChoice({
			config: nextConfig,
			setDefaultModel: params.setDefaultModel,
			defaultModel: LITELLM_DEFAULT_MODEL_REF,
			applyDefaultConfig: applyLitellmConfig,
			applyProviderConfig: applyLitellmProviderConfig,
			noteDefault: LITELLM_DEFAULT_MODEL_REF,
			noteAgentModel,
			prompter: params.prompter
		});
		nextConfig = applied.config;
		agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "ai-gateway-api-key") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "vercel-ai-gateway") {
			await setVercelAiGatewayApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		const envKey = resolveEnvApiKey("vercel-ai-gateway");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing AI_GATEWAY_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setVercelAiGatewayApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Vercel AI Gateway API key",
				validate: validateApiKeyInput
			});
			await setVercelAiGatewayApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "vercel-ai-gateway:default",
			provider: "vercel-ai-gateway",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyVercelAiGatewayConfig,
				applyProviderConfig: applyVercelAiGatewayProviderConfig,
				noteDefault: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "cloudflare-ai-gateway-api-key") {
		let hasCredential = false;
		let accountId = params.opts?.cloudflareAiGatewayAccountId?.trim() ?? "";
		let gatewayId = params.opts?.cloudflareAiGatewayGatewayId?.trim() ?? "";
		const ensureAccountGateway = async () => {
			if (!accountId) {
				const value = await params.prompter.text({
					message: "Enter Cloudflare Account ID",
					validate: (val) => String(val ?? "").trim() ? void 0 : "Account ID is required"
				});
				accountId = String(value ?? "").trim();
			}
			if (!gatewayId) {
				const value = await params.prompter.text({
					message: "Enter Cloudflare AI Gateway ID",
					validate: (val) => String(val ?? "").trim() ? void 0 : "Gateway ID is required"
				});
				gatewayId = String(value ?? "").trim();
			}
		};
		const optsApiKey = normalizeApiKeyInput(params.opts?.cloudflareAiGatewayApiKey ?? "");
		if (!hasCredential && accountId && gatewayId && optsApiKey) {
			await setCloudflareAiGatewayConfig(accountId, gatewayId, optsApiKey, params.agentDir);
			hasCredential = true;
		}
		const envKey = resolveEnvApiKey("cloudflare-ai-gateway");
		if (!hasCredential && envKey) {
			if (await params.prompter.confirm({
				message: `Use existing CLOUDFLARE_AI_GATEWAY_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await ensureAccountGateway();
				await setCloudflareAiGatewayConfig(accountId, gatewayId, normalizeApiKeyInput(envKey.apiKey), params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential && optsApiKey) {
			await ensureAccountGateway();
			await setCloudflareAiGatewayConfig(accountId, gatewayId, optsApiKey, params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) {
			await ensureAccountGateway();
			const key = await params.prompter.text({
				message: "Enter Cloudflare AI Gateway API key",
				validate: validateApiKeyInput
			});
			await setCloudflareAiGatewayConfig(accountId, gatewayId, normalizeApiKeyInput(String(key ?? "")), params.agentDir);
			hasCredential = true;
		}
		if (hasCredential) nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "cloudflare-ai-gateway:default",
			provider: "cloudflare-ai-gateway",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
				applyDefaultConfig: (cfg) => applyCloudflareAiGatewayConfig(cfg, {
					accountId: accountId || params.opts?.cloudflareAiGatewayAccountId,
					gatewayId: gatewayId || params.opts?.cloudflareAiGatewayGatewayId
				}),
				applyProviderConfig: (cfg) => applyCloudflareAiGatewayProviderConfig(cfg, {
					accountId: accountId || params.opts?.cloudflareAiGatewayAccountId,
					gatewayId: gatewayId || params.opts?.cloudflareAiGatewayGatewayId
				}),
				noteDefault: CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "moonshot-api-key") {
		await ensureMoonshotApiKeyCredential("Enter Moonshot API key");
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "moonshot:default",
			provider: "moonshot",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyMoonshotConfig,
				applyProviderConfig: applyMoonshotProviderConfig,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "moonshot-api-key-cn") {
		await ensureMoonshotApiKeyCredential("Enter Moonshot API key (.cn)");
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "moonshot:default",
			provider: "moonshot",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyMoonshotConfigCn,
				applyProviderConfig: applyMoonshotProviderConfigCn,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "kimi-code-api-key") {
		let hasCredential = false;
		const tokenProvider = params.opts?.tokenProvider?.trim().toLowerCase();
		if (!hasCredential && params.opts?.token && (tokenProvider === "kimi-code" || tokenProvider === "kimi-coding")) {
			await setKimiCodingApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) await params.prompter.note(["Kimi Coding uses a dedicated endpoint and API key.", "Get your API key at: https://www.kimi.com/code/en"].join("\n"), "Kimi Coding");
		const envKey = resolveEnvApiKey("kimi-coding");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing KIMI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setKimiCodingApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Kimi Coding API key",
				validate: validateApiKeyInput
			});
			await setKimiCodingApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "kimi-coding:default",
			provider: "kimi-coding",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: KIMI_CODING_MODEL_REF,
				applyDefaultConfig: applyKimiCodeConfig,
				applyProviderConfig: applyKimiCodeProviderConfig,
				noteDefault: KIMI_CODING_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "gemini-api-key") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "google") {
			await setGeminiApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		const envKey = resolveEnvApiKey("google");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing GEMINI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setGeminiApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Gemini API key",
				validate: validateApiKeyInput
			});
			await setGeminiApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "google:default",
			provider: "google",
			mode: "api_key"
		});
		if (params.setDefaultModel) {
			const applied = applyGoogleGeminiModelDefault(nextConfig);
			nextConfig = applied.next;
			if (applied.changed) await params.prompter.note(`Default model set to ${GOOGLE_GEMINI_DEFAULT_MODEL}`, "Model configured");
		} else {
			agentModelOverride = GOOGLE_GEMINI_DEFAULT_MODEL;
			await noteAgentModel(GOOGLE_GEMINI_DEFAULT_MODEL);
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "zai-api-key" || authChoice === "zai-coding-global" || authChoice === "zai-coding-cn" || authChoice === "zai-global" || authChoice === "zai-cn") {
		let endpoint;
		if (authChoice === "zai-coding-global") endpoint = "coding-global";
		else if (authChoice === "zai-coding-cn") endpoint = "coding-cn";
		else if (authChoice === "zai-global") endpoint = "global";
		else if (authChoice === "zai-cn") endpoint = "cn";
		let hasCredential = false;
		let apiKey = "";
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "zai") {
			apiKey = normalizeApiKeyInput(params.opts.token);
			await setZaiApiKey(apiKey, params.agentDir);
			hasCredential = true;
		}
		const envKey = resolveEnvApiKey("zai");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing ZAI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				apiKey = envKey.apiKey;
				await setZaiApiKey(apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Z.AI API key",
				validate: validateApiKeyInput
			});
			apiKey = normalizeApiKeyInput(String(key ?? ""));
			await setZaiApiKey(apiKey, params.agentDir);
		}
		let modelIdOverride;
		if (!endpoint) {
			const detected = await detectZaiEndpoint({ apiKey });
			if (detected) {
				endpoint = detected.endpoint;
				modelIdOverride = detected.modelId;
				await params.prompter.note(detected.note, "Z.AI endpoint");
			} else endpoint = await params.prompter.select({
				message: "Select Z.AI endpoint",
				options: [
					{
						value: "coding-global",
						label: "Coding-Plan-Global",
						hint: "GLM Coding Plan Global (api.z.ai)"
					},
					{
						value: "coding-cn",
						label: "Coding-Plan-CN",
						hint: "GLM Coding Plan CN (open.bigmodel.cn)"
					},
					{
						value: "global",
						label: "Global",
						hint: "Z.AI Global (api.z.ai)"
					},
					{
						value: "cn",
						label: "CN",
						hint: "Z.AI CN (open.bigmodel.cn)"
					}
				],
				initialValue: "global"
			});
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "zai:default",
			provider: "zai",
			mode: "api_key"
		});
		const defaultModel = modelIdOverride ? `zai/${modelIdOverride}` : ZAI_DEFAULT_MODEL_REF;
		const applied = await applyDefaultModelChoice({
			config: nextConfig,
			setDefaultModel: params.setDefaultModel,
			defaultModel,
			applyDefaultConfig: (config) => applyZaiConfig(config, {
				endpoint,
				...modelIdOverride ? { modelId: modelIdOverride } : {}
			}),
			applyProviderConfig: (config) => applyZaiProviderConfig(config, {
				endpoint,
				...modelIdOverride ? { modelId: modelIdOverride } : {}
			}),
			noteDefault: defaultModel,
			noteAgentModel,
			prompter: params.prompter
		});
		nextConfig = applied.config;
		agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "xiaomi-api-key") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "xiaomi") {
			await setXiaomiApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		const envKey = resolveEnvApiKey("xiaomi");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing XIAOMI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setXiaomiApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Xiaomi API key",
				validate: validateApiKeyInput
			});
			await setXiaomiApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "xiaomi:default",
			provider: "xiaomi",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: XIAOMI_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyXiaomiConfig,
				applyProviderConfig: applyXiaomiProviderConfig,
				noteDefault: XIAOMI_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "synthetic-api-key") {
		if (params.opts?.token && params.opts?.tokenProvider === "synthetic") await setSyntheticApiKey(String(params.opts.token ?? "").trim(), params.agentDir);
		else {
			const key = await params.prompter.text({
				message: "Enter Synthetic API key",
				validate: (value) => value?.trim() ? void 0 : "Required"
			});
			await setSyntheticApiKey(String(key ?? "").trim(), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "synthetic:default",
			provider: "synthetic",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: SYNTHETIC_DEFAULT_MODEL_REF,
				applyDefaultConfig: applySyntheticConfig,
				applyProviderConfig: applySyntheticProviderConfig,
				noteDefault: SYNTHETIC_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "venice-api-key") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "venice") {
			await setVeniceApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) await params.prompter.note([
			"Venice AI provides privacy-focused inference with uncensored models.",
			"Get your API key at: https://venice.ai/settings/api",
			"Supports 'private' (fully private) and 'anonymized' (proxy) modes."
		].join("\n"), "Venice AI");
		const envKey = resolveEnvApiKey("venice");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing VENICE_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setVeniceApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Venice AI API key",
				validate: validateApiKeyInput
			});
			await setVeniceApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "venice:default",
			provider: "venice",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: VENICE_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyVeniceConfig,
				applyProviderConfig: applyVeniceProviderConfig,
				noteDefault: VENICE_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "opencode-zen") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "opencode") {
			await setOpencodeZenApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) await params.prompter.note([
			"OpenCode Zen provides access to Claude, GPT, Gemini, and more models.",
			"Get your API key at: https://opencode.ai/auth",
			"OpenCode Zen bills per request. Check your OpenCode dashboard for details."
		].join("\n"), "OpenCode Zen");
		const envKey = resolveEnvApiKey("opencode");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing OPENCODE_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setOpencodeZenApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter OpenCode Zen API key",
				validate: validateApiKeyInput
			});
			await setOpencodeZenApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "opencode:default",
			provider: "opencode",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: OPENCODE_ZEN_DEFAULT_MODEL,
				applyDefaultConfig: applyOpencodeZenConfig,
				applyProviderConfig: applyOpencodeZenProviderConfig,
				noteDefault: OPENCODE_ZEN_DEFAULT_MODEL,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "together-api-key") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "together") {
			await setTogetherApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) await params.prompter.note(["Together AI provides access to leading open-source models including Llama, DeepSeek, Qwen, and more.", "Get your API key at: https://api.together.xyz/settings/api-keys"].join("\n"), "Together AI");
		const envKey = resolveEnvApiKey("together");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing TOGETHER_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setTogetherApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter Together AI API key",
				validate: validateApiKeyInput
			});
			await setTogetherApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "together:default",
			provider: "together",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: TOGETHER_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyTogetherConfig,
				applyProviderConfig: applyTogetherProviderConfig,
				noteDefault: TOGETHER_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (authChoice === "huggingface-api-key") return applyAuthChoiceHuggingface({
		...params,
		authChoice
	});
	if (authChoice === "qianfan-api-key") {
		let hasCredential = false;
		if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "qianfan") {
			setQianfanApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
			hasCredential = true;
		}
		if (!hasCredential) await params.prompter.note(["Get your API key at: https://console.bce.baidu.com/qianfan/ais/console/apiKey", "API key format: bce-v3/ALTAK-..."].join("\n"), "QIANFAN");
		const envKey = resolveEnvApiKey("qianfan");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing QIANFAN_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				setQianfanApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: "Enter QIANFAN API key",
				validate: validateApiKeyInput
			});
			setQianfanApiKey(normalizeApiKeyInput(String(key ?? "")), params.agentDir);
		}
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "qianfan:default",
			provider: "qianfan",
			mode: "api_key"
		});
		{
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: QIANFAN_DEFAULT_MODEL_REF,
				applyDefaultConfig: applyQianfanConfig,
				applyProviderConfig: applyQianfanProviderConfig,
				noteDefault: QIANFAN_DEFAULT_MODEL_REF,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	return null;
}

//#endregion
//#region src/commands/auth-choice.apply.byteplus.ts
/** Default model for BytePlus auth onboarding. */
const BYTEPLUS_DEFAULT_MODEL = "byteplus-plan/ark-code-latest";
async function applyAuthChoiceBytePlus(params) {
	if (params.authChoice !== "byteplus-api-key") return null;
	const envKey = resolveEnvApiKey("byteplus");
	if (envKey) {
		if (await params.prompter.confirm({
			message: `Use existing BYTEPLUS_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
			initialValue: true
		})) {
			const result = upsertSharedEnvVar({
				key: "BYTEPLUS_API_KEY",
				value: envKey.apiKey
			});
			if (!process.env.BYTEPLUS_API_KEY) process.env.BYTEPLUS_API_KEY = envKey.apiKey;
			await params.prompter.note(`Copied BYTEPLUS_API_KEY to ${result.path} for launchd compatibility.`, "BytePlus API key");
			return {
				config: applyPrimaryModel(params.config, BYTEPLUS_DEFAULT_MODEL),
				agentModelOverride: BYTEPLUS_DEFAULT_MODEL
			};
		}
	}
	let key;
	if (params.opts?.byteplusApiKey) key = params.opts.byteplusApiKey;
	else key = await params.prompter.text({
		message: "Enter BytePlus API key",
		validate: validateApiKeyInput
	});
	const trimmed = normalizeApiKeyInput(String(key));
	const result = upsertSharedEnvVar({
		key: "BYTEPLUS_API_KEY",
		value: trimmed
	});
	process.env.BYTEPLUS_API_KEY = trimmed;
	await params.prompter.note(`Saved BYTEPLUS_API_KEY to ${result.path} for launchd compatibility.`, "BytePlus API key");
	return {
		config: applyPrimaryModel(params.config, BYTEPLUS_DEFAULT_MODEL),
		agentModelOverride: BYTEPLUS_DEFAULT_MODEL
	};
}

//#endregion
//#region src/commands/auth-choice.apply.plugin-provider.ts
async function applyAuthChoicePluginProvider(params, options) {
	if (params.authChoice !== options.authChoice) return null;
	const enableResult = enablePluginInConfig(params.config, options.pluginId);
	let nextConfig = enableResult.config;
	if (!enableResult.enabled) {
		await params.prompter.note(`${options.label} plugin is disabled (${enableResult.reason ?? "blocked"}).`, options.label);
		return { config: nextConfig };
	}
	const agentId = params.agentId ?? resolveDefaultAgentId(nextConfig);
	const defaultAgentId = resolveDefaultAgentId(nextConfig);
	const agentDir = params.agentDir ?? (agentId === defaultAgentId ? resolveOpenClawAgentDir() : resolveAgentDir(nextConfig, agentId));
	const workspaceDir = resolveAgentWorkspaceDir(nextConfig, agentId) ?? resolveDefaultAgentWorkspaceDir();
	const provider = resolveProviderMatch(resolvePluginProviders({
		config: nextConfig,
		workspaceDir
	}), options.providerId);
	if (!provider) {
		await params.prompter.note(`${options.label} auth plugin is not available. Enable it and re-run the wizard.`, options.label);
		return { config: nextConfig };
	}
	const method = pickAuthMethod(provider, options.methodId) ?? provider.auth[0];
	if (!method) {
		await params.prompter.note(`${options.label} auth method missing.`, options.label);
		return { config: nextConfig };
	}
	const isRemote = isRemoteEnvironment();
	const result = await method.run({
		config: nextConfig,
		agentDir,
		workspaceDir,
		prompter: params.prompter,
		runtime: params.runtime,
		isRemote,
		openUrl: async (url) => {
			await openUrl(url);
		},
		oauth: { createVpsAwareHandlers: (opts) => createVpsAwareOAuthHandlers(opts) }
	});
	if (result.configPatch) nextConfig = mergeConfigPatch(nextConfig, result.configPatch);
	for (const profile of result.profiles) {
		upsertAuthProfile({
			profileId: profile.profileId,
			credential: profile.credential,
			agentDir
		});
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: profile.profileId,
			provider: profile.credential.provider,
			mode: profile.credential.type === "token" ? "token" : profile.credential.type,
			..."email" in profile.credential && profile.credential.email ? { email: profile.credential.email } : {}
		});
	}
	let agentModelOverride;
	if (result.defaultModel) {
		if (params.setDefaultModel) {
			nextConfig = applyDefaultModel(nextConfig, result.defaultModel);
			await params.prompter.note(`Default model set to ${result.defaultModel}`, "Model configured");
		} else if (params.agentId) {
			agentModelOverride = result.defaultModel;
			await params.prompter.note(`Default model set to ${result.defaultModel} for agent "${params.agentId}".`, "Model configured");
		}
	}
	if (result.notes && result.notes.length > 0) await params.prompter.note(result.notes.join("\n"), "Provider notes");
	return {
		config: nextConfig,
		agentModelOverride
	};
}

//#endregion
//#region src/commands/auth-choice.apply.copilot-proxy.ts
async function applyAuthChoiceCopilotProxy(params) {
	return await applyAuthChoicePluginProvider(params, {
		authChoice: "copilot-proxy",
		pluginId: "copilot-proxy",
		providerId: "copilot-proxy",
		methodId: "local",
		label: "Copilot Proxy"
	});
}

//#endregion
//#region src/commands/auth-choice.apply.github-copilot.ts
async function applyAuthChoiceGitHubCopilot(params) {
	if (params.authChoice !== "github-copilot") return null;
	let nextConfig = params.config;
	await params.prompter.note(["This will open a GitHub device login to authorize Copilot.", "Requires an active GitHub Copilot subscription."].join("\n"), "GitHub Copilot");
	if (!process.stdin.isTTY) {
		await params.prompter.note("GitHub Copilot login requires an interactive TTY.", "GitHub Copilot");
		return { config: nextConfig };
	}
	try {
		await githubCopilotLoginCommand({ yes: true }, params.runtime);
	} catch (err) {
		await params.prompter.note(`GitHub Copilot login failed: ${String(err)}`, "GitHub Copilot");
		return { config: nextConfig };
	}
	nextConfig = applyAuthProfileConfig(nextConfig, {
		profileId: "github-copilot:github",
		provider: "github-copilot",
		mode: "token"
	});
	if (params.setDefaultModel) {
		const model = "github-copilot/gpt-4o";
		nextConfig = {
			...nextConfig,
			agents: {
				...nextConfig.agents,
				defaults: {
					...nextConfig.agents?.defaults,
					model: {
						...typeof nextConfig.agents?.defaults?.model === "object" ? nextConfig.agents.defaults.model : void 0,
						primary: model
					}
				}
			}
		};
		await params.prompter.note(`Default model set to ${model}`, "Model configured");
	}
	return { config: nextConfig };
}

//#endregion
//#region src/commands/auth-choice.apply.google-antigravity.ts
async function applyAuthChoiceGoogleAntigravity(params) {
	return await applyAuthChoicePluginProvider(params, {
		authChoice: "google-antigravity",
		pluginId: "google-antigravity-auth",
		providerId: "google-antigravity",
		methodId: "oauth",
		label: "Google Antigravity"
	});
}

//#endregion
//#region src/commands/auth-choice.apply.google-gemini-cli.ts
async function applyAuthChoiceGoogleGeminiCli(params) {
	return await applyAuthChoicePluginProvider(params, {
		authChoice: "google-gemini-cli",
		pluginId: "google-gemini-cli-auth",
		providerId: "google-gemini-cli",
		methodId: "oauth",
		label: "Google Gemini CLI"
	});
}

//#endregion
//#region src/commands/auth-choice.apply.minimax.ts
async function applyAuthChoiceMiniMax(params) {
	let nextConfig = params.config;
	let agentModelOverride;
	const ensureMinimaxApiKey = async (opts) => {
		let hasCredential = false;
		const envKey = resolveEnvApiKey("minimax");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing MINIMAX_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				await setMinimaxApiKey(envKey.apiKey, params.agentDir, opts.profileId);
				hasCredential = true;
			}
		}
		if (!hasCredential) {
			const key = await params.prompter.text({
				message: opts.promptMessage,
				validate: validateApiKeyInput
			});
			await setMinimaxApiKey(normalizeApiKeyInput(String(key)), params.agentDir, opts.profileId);
		}
	};
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	if (params.authChoice === "minimax-portal") return await applyAuthChoicePluginProvider(params, {
		authChoice: "minimax-portal",
		pluginId: "minimax-portal-auth",
		providerId: "minimax-portal",
		methodId: await params.prompter.select({
			message: "Select MiniMax endpoint",
			options: [{
				value: "oauth",
				label: "Global",
				hint: "OAuth for international users"
			}, {
				value: "oauth-cn",
				label: "CN",
				hint: "OAuth for users in China"
			}]
		}),
		label: "MiniMax"
	});
	if (params.authChoice === "minimax-cloud" || params.authChoice === "minimax-api" || params.authChoice === "minimax-api-lightning") {
		const modelId = params.authChoice === "minimax-api-lightning" ? "MiniMax-M2.5-Lightning" : "MiniMax-M2.5";
		await ensureMinimaxApiKey({
			profileId: "minimax:default",
			promptMessage: "Enter MiniMax API key"
		});
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "minimax:default",
			provider: "minimax",
			mode: "api_key"
		});
		{
			const modelRef = `minimax/${modelId}`;
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: modelRef,
				applyDefaultConfig: (config) => applyMinimaxApiConfig(config, modelId),
				applyProviderConfig: (config) => applyMinimaxApiProviderConfig(config, modelId),
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (params.authChoice === "minimax-api-key-cn") {
		const modelId = "MiniMax-M2.5";
		await ensureMinimaxApiKey({
			profileId: "minimax-cn:default",
			promptMessage: "Enter MiniMax China API key"
		});
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "minimax-cn:default",
			provider: "minimax-cn",
			mode: "api_key"
		});
		{
			const modelRef = `minimax-cn/${modelId}`;
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: modelRef,
				applyDefaultConfig: (config) => applyMinimaxApiConfigCn(config, modelId),
				applyProviderConfig: (config) => applyMinimaxApiProviderConfigCn(config, modelId),
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	if (params.authChoice === "minimax") {
		const applied = await applyDefaultModelChoice({
			config: nextConfig,
			setDefaultModel: params.setDefaultModel,
			defaultModel: "lmstudio/minimax-m2.1-gs32",
			applyDefaultConfig: applyMinimaxConfig,
			applyProviderConfig: applyMinimaxProviderConfig,
			noteAgentModel,
			prompter: params.prompter
		});
		nextConfig = applied.config;
		agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	return null;
}

//#endregion
//#region src/commands/chutes-oauth.ts
function parseManualOAuthInput(input, expectedState) {
	const trimmed = String(input ?? "").trim();
	if (!trimmed) throw new Error("Missing OAuth redirect URL or authorization code.");
	if (!(/^https?:\/\//i.test(trimmed) || trimmed.includes("://") || trimmed.includes("?"))) return {
		code: trimmed,
		state: expectedState
	};
	const parsed = parseOAuthCallbackInput(trimmed, expectedState);
	if ("error" in parsed) throw new Error(parsed.error);
	if (parsed.state !== expectedState) throw new Error("Invalid OAuth state");
	return parsed;
}
function buildAuthorizeUrl(params) {
	return `${CHUTES_AUTHORIZE_ENDPOINT}?${new URLSearchParams({
		client_id: params.clientId,
		redirect_uri: params.redirectUri,
		response_type: "code",
		scope: params.scopes.join(" "),
		state: params.state,
		code_challenge: params.challenge,
		code_challenge_method: "S256"
	}).toString()}`;
}
async function waitForLocalCallback(params) {
	const redirectUrl = new URL(params.redirectUri);
	if (redirectUrl.protocol !== "http:") throw new Error(`Chutes OAuth redirect URI must be http:// (got ${params.redirectUri})`);
	const hostname = redirectUrl.hostname || "127.0.0.1";
	if (!isLoopbackHost(hostname)) throw new Error(`Chutes OAuth redirect hostname must be loopback (got ${hostname}). Use http://127.0.0.1:<port>/...`);
	const port = redirectUrl.port ? Number.parseInt(redirectUrl.port, 10) : 80;
	const expectedPath = redirectUrl.pathname || "/";
	return await new Promise((resolve, reject) => {
		let timeout = null;
		const server = createServer((req, res) => {
			try {
				const requestUrl = new URL(req.url ?? "/", redirectUrl.origin);
				if (requestUrl.pathname !== expectedPath) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.end("Not found");
					return;
				}
				const code = requestUrl.searchParams.get("code")?.trim();
				const state = requestUrl.searchParams.get("state")?.trim();
				if (!code) {
					res.statusCode = 400;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.end("Missing code");
					return;
				}
				if (!state || state !== params.expectedState) {
					res.statusCode = 400;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.end("Invalid state");
					return;
				}
				res.statusCode = 200;
				res.setHeader("Content-Type", "text/html; charset=utf-8");
				res.end([
					"<!doctype html>",
					"<html><head><meta charset='utf-8' /></head>",
					"<body><h2>Chutes OAuth complete</h2>",
					"<p>You can close this window and return to OpenClaw.</p></body></html>"
				].join(""));
				if (timeout) clearTimeout(timeout);
				server.close();
				resolve({
					code,
					state
				});
			} catch (err) {
				if (timeout) clearTimeout(timeout);
				server.close();
				reject(err);
			}
		});
		server.once("error", (err) => {
			if (timeout) clearTimeout(timeout);
			server.close();
			reject(err);
		});
		server.listen(port, hostname, () => {
			params.onProgress?.(`Waiting for OAuth callback on ${redirectUrl.origin}${expectedPath}…`);
		});
		timeout = setTimeout(() => {
			try {
				server.close();
			} catch {}
			reject(/* @__PURE__ */ new Error("OAuth callback timeout"));
		}, params.timeoutMs);
	});
}
async function loginChutes(params) {
	const createPkce = params.createPkce ?? generateChutesPkce;
	const createState = params.createState ?? (() => randomBytes(16).toString("hex"));
	const { verifier, challenge } = createPkce();
	const state = createState();
	const timeoutMs = params.timeoutMs ?? 180 * 1e3;
	const url = buildAuthorizeUrl({
		clientId: params.app.clientId,
		redirectUri: params.app.redirectUri,
		scopes: params.app.scopes,
		state,
		challenge
	});
	let codeAndState;
	if (params.manual) {
		await params.onAuth({ url });
		params.onProgress?.("Waiting for redirect URL…");
		codeAndState = parseManualOAuthInput(await params.onPrompt({
			message: "Paste the redirect URL (or authorization code)",
			placeholder: `${params.app.redirectUri}?code=...&state=...`
		}), state);
	} else {
		const callback = waitForLocalCallback({
			redirectUri: params.app.redirectUri,
			expectedState: state,
			timeoutMs,
			onProgress: params.onProgress
		}).catch(async () => {
			params.onProgress?.("OAuth callback not detected; paste redirect URL…");
			return parseManualOAuthInput(await params.onPrompt({
				message: "Paste the redirect URL (or authorization code)",
				placeholder: `${params.app.redirectUri}?code=...&state=...`
			}), state);
		});
		await params.onAuth({ url });
		codeAndState = await callback;
	}
	params.onProgress?.("Exchanging code for tokens…");
	return await exchangeChutesCodeForTokens({
		app: params.app,
		code: codeAndState.code,
		codeVerifier: verifier,
		fetchFn: params.fetchFn
	});
}

//#endregion
//#region src/commands/auth-choice.apply.oauth.ts
async function applyAuthChoiceOAuth(params) {
	if (params.authChoice === "chutes") {
		let nextConfig = params.config;
		const isRemote = isRemoteEnvironment();
		const redirectUri = process.env.CHUTES_OAUTH_REDIRECT_URI?.trim() || "http://127.0.0.1:1456/oauth-callback";
		const scopes = process.env.CHUTES_OAUTH_SCOPES?.trim() || "openid profile chutes:invoke";
		const clientId = process.env.CHUTES_CLIENT_ID?.trim() || String(await params.prompter.text({
			message: "Enter Chutes OAuth client id",
			placeholder: "cid_xxx",
			validate: (value) => value?.trim() ? void 0 : "Required"
		})).trim();
		const clientSecret = process.env.CHUTES_CLIENT_SECRET?.trim() || void 0;
		await params.prompter.note(isRemote ? [
			"You are running in a remote/VPS environment.",
			"A URL will be shown for you to open in your LOCAL browser.",
			"After signing in, paste the redirect URL back here.",
			"",
			`Redirect URI: ${redirectUri}`
		].join("\n") : [
			"Browser will open for Chutes authentication.",
			"If the callback doesn't auto-complete, paste the redirect URL.",
			"",
			`Redirect URI: ${redirectUri}`
		].join("\n"), "Chutes OAuth");
		const spin = params.prompter.progress("Starting OAuth flow…");
		try {
			const { onAuth, onPrompt } = createVpsAwareOAuthHandlers({
				isRemote,
				prompter: params.prompter,
				runtime: params.runtime,
				spin,
				openUrl,
				localBrowserMessage: "Complete sign-in in browser…"
			});
			const creds = await loginChutes({
				app: {
					clientId,
					clientSecret,
					redirectUri,
					scopes: scopes.split(/\s+/).filter(Boolean)
				},
				manual: isRemote,
				onAuth,
				onPrompt,
				onProgress: (msg) => spin.update(msg)
			});
			spin.stop("Chutes OAuth complete");
			const profileId = await writeOAuthCredentials("chutes", creds, params.agentDir);
			nextConfig = applyAuthProfileConfig(nextConfig, {
				profileId,
				provider: "chutes",
				mode: "oauth"
			});
		} catch (err) {
			spin.stop("Chutes OAuth failed");
			params.runtime.error(String(err));
			await params.prompter.note([
				"Trouble with OAuth?",
				"Verify CHUTES_CLIENT_ID (and CHUTES_CLIENT_SECRET if required).",
				`Verify the OAuth app redirect URI includes: ${redirectUri}`,
				"Chutes docs: https://chutes.ai/docs/sign-in-with-chutes/overview"
			].join("\n"), "OAuth help");
		}
		return { config: nextConfig };
	}
	return null;
}

//#endregion
//#region src/commands/openai-codex-oauth.ts
async function loginOpenAICodexOAuth(params) {
	const { prompter, runtime, isRemote, openUrl, localBrowserMessage } = params;
	await prompter.note(isRemote ? [
		"You are running in a remote/VPS environment.",
		"A URL will be shown for you to open in your LOCAL browser.",
		"After signing in, paste the redirect URL back here."
	].join("\n") : [
		"Browser will open for OpenAI authentication.",
		"If the callback doesn't auto-complete, paste the redirect URL.",
		"OpenAI OAuth uses localhost:1455 for the callback."
	].join("\n"), "OpenAI Codex OAuth");
	const spin = prompter.progress("Starting OAuth flow…");
	try {
		const { onAuth, onPrompt } = createVpsAwareOAuthHandlers({
			isRemote,
			prompter,
			runtime,
			spin,
			openUrl,
			localBrowserMessage: localBrowserMessage ?? "Complete sign-in in browser…"
		});
		const creds = await loginOpenAICodex({
			onAuth,
			onPrompt,
			onProgress: (msg) => spin.update(msg)
		});
		spin.stop("OpenAI OAuth complete");
		return creds ?? null;
	} catch (err) {
		spin.stop("OpenAI OAuth failed");
		runtime.error(String(err));
		await prompter.note("Trouble with OAuth? See https://docs.openclaw.ai/start/faq", "OAuth help");
		throw err;
	}
}

//#endregion
//#region src/commands/auth-choice.apply.openai.ts
async function applyAuthChoiceOpenAI(params) {
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	let authChoice = params.authChoice;
	if (authChoice === "apiKey" && params.opts?.tokenProvider === "openai") authChoice = "openai-api-key";
	if (authChoice === "openai-api-key") {
		let nextConfig = params.config;
		let agentModelOverride;
		const applyOpenAiDefaultModelChoice = async () => {
			const applied = await applyDefaultModelChoice({
				config: nextConfig,
				setDefaultModel: params.setDefaultModel,
				defaultModel: OPENAI_DEFAULT_MODEL,
				applyDefaultConfig: applyOpenAIConfig,
				applyProviderConfig: applyOpenAIProviderConfig,
				noteDefault: OPENAI_DEFAULT_MODEL,
				noteAgentModel,
				prompter: params.prompter
			});
			nextConfig = applied.config;
			agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
			return {
				config: nextConfig,
				agentModelOverride
			};
		};
		const envKey = resolveEnvApiKey("openai");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing OPENAI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				const result = upsertSharedEnvVar({
					key: "OPENAI_API_KEY",
					value: envKey.apiKey
				});
				if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = envKey.apiKey;
				await params.prompter.note(`Copied OPENAI_API_KEY to ${result.path} for launchd compatibility.`, "OpenAI API key");
				return await applyOpenAiDefaultModelChoice();
			}
		}
		let key;
		if (params.opts?.token && params.opts?.tokenProvider === "openai") key = params.opts.token;
		else key = await params.prompter.text({
			message: "Enter OpenAI API key",
			validate: validateApiKeyInput
		});
		const trimmed = normalizeApiKeyInput(String(key));
		const result = upsertSharedEnvVar({
			key: "OPENAI_API_KEY",
			value: trimmed
		});
		process.env.OPENAI_API_KEY = trimmed;
		await params.prompter.note(`Saved OPENAI_API_KEY to ${result.path} for launchd compatibility.`, "OpenAI API key");
		return await applyOpenAiDefaultModelChoice();
	}
	if (params.authChoice === "openai-codex") {
		let nextConfig = params.config;
		let agentModelOverride;
		let creds;
		try {
			creds = await loginOpenAICodexOAuth({
				prompter: params.prompter,
				runtime: params.runtime,
				isRemote: isRemoteEnvironment(),
				openUrl: async (url) => {
					await openUrl(url);
				},
				localBrowserMessage: "Complete sign-in in browser…"
			});
		} catch {
			return {
				config: nextConfig,
				agentModelOverride
			};
		}
		if (creds) {
			const profileId = await writeOAuthCredentials("openai-codex", creds, params.agentDir, { syncSiblingAgents: true });
			nextConfig = applyAuthProfileConfig(nextConfig, {
				profileId,
				provider: "openai-codex",
				mode: "oauth"
			});
			if (params.setDefaultModel) {
				const applied = applyOpenAICodexModelDefault(nextConfig);
				nextConfig = applied.next;
				if (applied.changed) await params.prompter.note(`Default model set to ${OPENAI_CODEX_DEFAULT_MODEL}`, "Model configured");
			} else {
				agentModelOverride = OPENAI_CODEX_DEFAULT_MODEL;
				await noteAgentModel(OPENAI_CODEX_DEFAULT_MODEL);
			}
		}
		return {
			config: nextConfig,
			agentModelOverride
		};
	}
	return null;
}

//#endregion
//#region src/commands/auth-choice.apply.qwen-portal.ts
async function applyAuthChoiceQwenPortal(params) {
	return await applyAuthChoicePluginProvider(params, {
		authChoice: "qwen-portal",
		pluginId: "qwen-portal-auth",
		providerId: "qwen-portal",
		methodId: "device",
		label: "Qwen"
	});
}

//#endregion
//#region src/commands/auth-choice.apply.vllm.ts
function applyVllmDefaultModel(cfg, modelRef) {
	const existingModel = cfg.agents?.defaults?.model;
	const fallbacks = existingModel && typeof existingModel === "object" && "fallbacks" in existingModel ? existingModel.fallbacks : void 0;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				model: {
					...fallbacks ? { fallbacks } : void 0,
					primary: modelRef
				}
			}
		}
	};
}
async function applyAuthChoiceVllm(params) {
	if (params.authChoice !== "vllm") return null;
	const { config: nextConfig, modelRef } = await promptAndConfigureVllm({
		cfg: params.config,
		prompter: params.prompter,
		agentDir: params.agentDir
	});
	if (!params.setDefaultModel) return {
		config: nextConfig,
		agentModelOverride: modelRef
	};
	await params.prompter.note(`Default model set to ${modelRef}`, "Model configured");
	return { config: applyVllmDefaultModel(nextConfig, modelRef) };
}

//#endregion
//#region src/commands/auth-choice.apply.volcengine.ts
/** Default model for Volcano Engine auth onboarding. */
const VOLCENGINE_DEFAULT_MODEL = "volcengine-plan/ark-code-latest";
async function applyAuthChoiceVolcengine(params) {
	if (params.authChoice !== "volcengine-api-key") return null;
	const envKey = resolveEnvApiKey("volcengine");
	if (envKey) {
		if (await params.prompter.confirm({
			message: `Use existing VOLCANO_ENGINE_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
			initialValue: true
		})) {
			const result = upsertSharedEnvVar({
				key: "VOLCANO_ENGINE_API_KEY",
				value: envKey.apiKey
			});
			if (!process.env.VOLCANO_ENGINE_API_KEY) process.env.VOLCANO_ENGINE_API_KEY = envKey.apiKey;
			await params.prompter.note(`Copied VOLCANO_ENGINE_API_KEY to ${result.path} for launchd compatibility.`, "Volcano Engine API Key");
			return {
				config: applyPrimaryModel(params.config, VOLCENGINE_DEFAULT_MODEL),
				agentModelOverride: VOLCENGINE_DEFAULT_MODEL
			};
		}
	}
	let key;
	if (params.opts?.volcengineApiKey) key = params.opts.volcengineApiKey;
	else key = await params.prompter.text({
		message: "Enter Volcano Engine API Key",
		validate: validateApiKeyInput
	});
	const trimmed = normalizeApiKeyInput(String(key));
	const result = upsertSharedEnvVar({
		key: "VOLCANO_ENGINE_API_KEY",
		value: trimmed
	});
	process.env.VOLCANO_ENGINE_API_KEY = trimmed;
	await params.prompter.note(`Saved VOLCANO_ENGINE_API_KEY to ${result.path} for launchd compatibility.`, "Volcano Engine API Key");
	return {
		config: applyPrimaryModel(params.config, VOLCENGINE_DEFAULT_MODEL),
		agentModelOverride: VOLCENGINE_DEFAULT_MODEL
	};
}

//#endregion
//#region src/commands/auth-choice.apply.xai.ts
async function applyAuthChoiceXAI(params) {
	if (params.authChoice !== "xai-api-key") return null;
	let nextConfig = params.config;
	let agentModelOverride;
	const noteAgentModel = createAuthChoiceAgentModelNoter(params);
	let hasCredential = false;
	const optsKey = params.opts?.xaiApiKey?.trim();
	if (optsKey) {
		setXaiApiKey(normalizeApiKeyInput(optsKey), params.agentDir);
		hasCredential = true;
	}
	if (!hasCredential) {
		const envKey = resolveEnvApiKey("xai");
		if (envKey) {
			if (await params.prompter.confirm({
				message: `Use existing XAI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
				initialValue: true
			})) {
				setXaiApiKey(envKey.apiKey, params.agentDir);
				hasCredential = true;
			}
		}
	}
	if (!hasCredential) {
		const key = await params.prompter.text({
			message: "Enter xAI API key",
			validate: validateApiKeyInput
		});
		setXaiApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
	}
	nextConfig = applyAuthProfileConfig(nextConfig, {
		profileId: "xai:default",
		provider: "xai",
		mode: "api_key"
	});
	{
		const applied = await applyDefaultModelChoice({
			config: nextConfig,
			setDefaultModel: params.setDefaultModel,
			defaultModel: XAI_DEFAULT_MODEL_REF,
			applyDefaultConfig: applyXaiConfig,
			applyProviderConfig: applyXaiProviderConfig,
			noteDefault: XAI_DEFAULT_MODEL_REF,
			noteAgentModel,
			prompter: params.prompter
		});
		nextConfig = applied.config;
		agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
	}
	return {
		config: nextConfig,
		agentModelOverride
	};
}

//#endregion
//#region src/commands/auth-choice.apply.ts
async function applyAuthChoice(params) {
	const handlers = [
		applyAuthChoiceAnthropic,
		applyAuthChoiceVllm,
		applyAuthChoiceOpenAI,
		applyAuthChoiceOAuth,
		applyAuthChoiceApiProviders,
		applyAuthChoiceMiniMax,
		applyAuthChoiceGitHubCopilot,
		applyAuthChoiceGoogleAntigravity,
		applyAuthChoiceGoogleGeminiCli,
		applyAuthChoiceCopilotProxy,
		applyAuthChoiceQwenPortal,
		applyAuthChoiceXAI,
		applyAuthChoiceVolcengine,
		applyAuthChoiceBytePlus
	];
	for (const handler of handlers) {
		const result = await handler(params);
		if (result) return result;
	}
	return { config: params.config };
}

//#endregion
//#region src/commands/auth-choice.model-check.ts
async function warnIfModelConfigLooksOff(config, prompter, options) {
	const agentModelOverride = options?.agentId ? resolveAgentModelPrimary(config, options.agentId) : void 0;
	const configWithModel = agentModelOverride && agentModelOverride.length > 0 ? {
		...config,
		agents: {
			...config.agents,
			defaults: {
				...config.agents?.defaults,
				model: {
					...typeof config.agents?.defaults?.model === "object" ? config.agents.defaults.model : void 0,
					primary: agentModelOverride
				}
			}
		}
	} : config;
	const ref = resolveConfiguredModelRef({
		cfg: configWithModel,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const warnings = [];
	const catalog = await loadModelCatalog({
		config: configWithModel,
		useCache: false
	});
	if (catalog.length > 0) {
		if (!catalog.some((entry) => entry.provider === ref.provider && entry.id === ref.model)) warnings.push(`Model not found: ${ref.provider}/${ref.model}. Update agents.defaults.model or run /models list.`);
	}
	const store = ensureAuthProfileStore(options?.agentDir);
	const hasProfile = listProfilesForProvider(store, ref.provider).length > 0;
	const envKey = resolveEnvApiKey(ref.provider);
	const customKey = getCustomProviderApiKey(config, ref.provider);
	if (!hasProfile && !envKey && !customKey) warnings.push(`No auth configured for provider "${ref.provider}". The agent may fail until credentials are added.`);
	if (ref.provider === "openai") {
		if (listProfilesForProvider(store, "openai-codex").length > 0) warnings.push(`Detected OpenAI Codex OAuth. Consider setting agents.defaults.model to ${OPENAI_CODEX_DEFAULT_MODEL}.`);
	}
	if (warnings.length > 0) await prompter.note(warnings.join("\n"), "Model check");
}

//#endregion
//#region src/commands/auth-choice.preferred-provider.ts
const PREFERRED_PROVIDER_BY_AUTH_CHOICE = {
	oauth: "anthropic",
	"setup-token": "anthropic",
	"claude-cli": "anthropic",
	token: "anthropic",
	apiKey: "anthropic",
	vllm: "vllm",
	"openai-codex": "openai-codex",
	"codex-cli": "openai-codex",
	chutes: "chutes",
	"openai-api-key": "openai",
	"openrouter-api-key": "openrouter",
	"ai-gateway-api-key": "vercel-ai-gateway",
	"cloudflare-ai-gateway-api-key": "cloudflare-ai-gateway",
	"moonshot-api-key": "moonshot",
	"moonshot-api-key-cn": "moonshot",
	"kimi-code-api-key": "kimi-coding",
	"gemini-api-key": "google",
	"google-antigravity": "google-antigravity",
	"google-gemini-cli": "google-gemini-cli",
	"zai-api-key": "zai",
	"zai-coding-global": "zai",
	"zai-coding-cn": "zai",
	"zai-global": "zai",
	"zai-cn": "zai",
	"xiaomi-api-key": "xiaomi",
	"synthetic-api-key": "synthetic",
	"venice-api-key": "venice",
	"together-api-key": "together",
	"huggingface-api-key": "huggingface",
	"github-copilot": "github-copilot",
	"copilot-proxy": "copilot-proxy",
	"minimax-cloud": "minimax",
	"minimax-api": "minimax",
	"minimax-api-key-cn": "minimax-cn",
	"minimax-api-lightning": "minimax",
	minimax: "lmstudio",
	"opencode-zen": "opencode",
	"xai-api-key": "xai",
	"litellm-api-key": "litellm",
	"qwen-portal": "qwen-portal",
	"volcengine-api-key": "volcengine",
	"byteplus-api-key": "byteplus",
	"minimax-portal": "minimax-portal",
	"qianfan-api-key": "qianfan",
	"custom-api-key": "custom"
};
function resolvePreferredProviderForAuthChoice(choice) {
	return PREFERRED_PROVIDER_BY_AUTH_CHOICE[choice];
}

//#endregion
//#region src/commands/auth-choice.ts
var auth_choice_exports = /* @__PURE__ */ __exportAll({
	applyAuthChoice: () => applyAuthChoice,
	resolvePreferredProviderForAuthChoice: () => resolvePreferredProviderForAuthChoice,
	warnIfModelConfigLooksOff: () => warnIfModelConfigLooksOff
});

//#endregion
export { applyAuthChoice as i, resolvePreferredProviderForAuthChoice as n, warnIfModelConfigLooksOff as r, auth_choice_exports as t };