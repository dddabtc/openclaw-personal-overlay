import { Ut as resolveGatewayPort, _ as defaultRuntime, lt as shortenHomePath, ot as resolveUserPath, v as restoreTerminalState } from "./entry.js";
import { Ct as resolveEnvApiKey, Et as normalizeSecretInput, L as normalizeProviderId, Tt as normalizeOptionalSecretInput, b as ensureAuthProfileStore, c as resolveApiKeyForProfile, n as resolveAuthProfileOrder, v as upsertAuthProfile } from "./auth-profiles-C7RTY9Sv.js";
import { t as formatCliCommand } from "./command-format-D3syQOZg.js";
import { C as parseDurationMs, l as writeConfigFile, o as readConfigFileSnapshot } from "./config-BBNa7O_8.js";
import { a as ensureWorkspaceAndSessions, b as waitForGatewayReachable, c as handleReset, g as resolveControlUiLinks, h as randomToken, n as applyWizardMetadata, t as DEFAULT_WORKSPACE } from "./onboard-helpers-VhYln9Mp.js";
import { t as WizardCancelledError } from "./prompts-m1IJwIAx.js";
import { t as createClackPrompter } from "./clack-prompter-B1aVoXd5.js";
import { a as gatewayInstallErrorHint, i as buildGatewayInstallPlan, r as isGatewayDaemonRuntime, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-yGnZwmEI.js";
import { t as assertSupportedRuntime } from "./runtime-guard-Cs_ClFhP.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-BrybH4HV.js";
import { t as resolveGatewayService } from "./service-DcFI40_W.js";
import { r as healthCommand } from "./health-Bt4gX0UL.js";
import { t as runOnboardingWizard } from "./onboarding-A3D_Qhgd.js";
import { $ as setHuggingfaceApiKey, A as applyXaiConfig, B as applyVercelAiGatewayConfig, E as applyTogetherConfig, I as applyLitellmConfig, M as applyXiaomiConfig, O as applyVeniceConfig, P as applyZaiConfig, Q as setGeminiApiKey, R as applyCloudflareAiGatewayConfig, S as applyQianfanConfig, X as setAnthropicApiKey, Z as setCloudflareAiGatewayConfig, _ as applyMoonshotConfigCn, a as applyMinimaxApiConfig, at as setOpenrouterApiKey, b as applyOpenrouterConfig, ct as setTogetherApiKey, d as applyAuthProfileConfig, dt as setXaiApiKey, et as setKimiCodingApiKey, f as applyHuggingfaceConfig, ft as setXiaomiApiKey, g as applyMoonshotConfig, it as setOpencodeZenApiKey, l as applyMinimaxConfig, lt as setVeniceApiKey, m as applyKimiCodeConfig, n as validateAnthropicSetupToken, nt as setMinimaxApiKey, o as applyMinimaxApiConfigCn, ot as setQianfanApiKey, pt as setZaiApiKey, r as applyOpencodeZenConfig, rt as setMoonshotApiKey, st as setSyntheticApiKey, t as buildTokenProfileId, tt as setLitellmApiKey, ut as setVercelAiGatewayApiKey, w as applySyntheticConfig } from "./auth-token-ED-ILVvP.js";
import { n as logConfigUpdated } from "./logging-PVQxLC6I.js";
import { n as isDeprecatedAuthChoice, r as normalizeLegacyOnboardAuthChoice } from "./auth-choice-legacy-DxCamFcQ.js";
import { a as detectZaiEndpoint, i as upsertSharedEnvVar, n as applyOpenAIConfig, s as applyGoogleGeminiModelDefault } from "./openai-model-default-C6iwMU4X.js";
import { r as applyPrimaryModel } from "./model-picker-Dz4aaA3l.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-B8oXYjfA.js";
import { i as parseNonInteractiveCustomApiFlags, n as applyCustomApiConfig, o as resolveCustomProviderId, t as CustomApiError } from "./onboard-custom-DiRsKvTz.js";
import { t as applyOnboardingLocalWorkspaceConfig } from "./onboard-config-7cR7QGjL.js";

//#region src/commands/onboard-provider-auth-flags.ts
const ONBOARD_PROVIDER_AUTH_FLAGS = [
	{
		optionKey: "anthropicApiKey",
		authChoice: "apiKey",
		cliFlag: "--anthropic-api-key",
		cliOption: "--anthropic-api-key <key>",
		description: "Anthropic API key"
	},
	{
		optionKey: "openaiApiKey",
		authChoice: "openai-api-key",
		cliFlag: "--openai-api-key",
		cliOption: "--openai-api-key <key>",
		description: "OpenAI API key"
	},
	{
		optionKey: "openrouterApiKey",
		authChoice: "openrouter-api-key",
		cliFlag: "--openrouter-api-key",
		cliOption: "--openrouter-api-key <key>",
		description: "OpenRouter API key"
	},
	{
		optionKey: "aiGatewayApiKey",
		authChoice: "ai-gateway-api-key",
		cliFlag: "--ai-gateway-api-key",
		cliOption: "--ai-gateway-api-key <key>",
		description: "Vercel AI Gateway API key"
	},
	{
		optionKey: "cloudflareAiGatewayApiKey",
		authChoice: "cloudflare-ai-gateway-api-key",
		cliFlag: "--cloudflare-ai-gateway-api-key",
		cliOption: "--cloudflare-ai-gateway-api-key <key>",
		description: "Cloudflare AI Gateway API key"
	},
	{
		optionKey: "moonshotApiKey",
		authChoice: "moonshot-api-key",
		cliFlag: "--moonshot-api-key",
		cliOption: "--moonshot-api-key <key>",
		description: "Moonshot API key"
	},
	{
		optionKey: "kimiCodeApiKey",
		authChoice: "kimi-code-api-key",
		cliFlag: "--kimi-code-api-key",
		cliOption: "--kimi-code-api-key <key>",
		description: "Kimi Coding API key"
	},
	{
		optionKey: "geminiApiKey",
		authChoice: "gemini-api-key",
		cliFlag: "--gemini-api-key",
		cliOption: "--gemini-api-key <key>",
		description: "Gemini API key"
	},
	{
		optionKey: "zaiApiKey",
		authChoice: "zai-api-key",
		cliFlag: "--zai-api-key",
		cliOption: "--zai-api-key <key>",
		description: "Z.AI API key"
	},
	{
		optionKey: "xiaomiApiKey",
		authChoice: "xiaomi-api-key",
		cliFlag: "--xiaomi-api-key",
		cliOption: "--xiaomi-api-key <key>",
		description: "Xiaomi API key"
	},
	{
		optionKey: "minimaxApiKey",
		authChoice: "minimax-api",
		cliFlag: "--minimax-api-key",
		cliOption: "--minimax-api-key <key>",
		description: "MiniMax API key"
	},
	{
		optionKey: "syntheticApiKey",
		authChoice: "synthetic-api-key",
		cliFlag: "--synthetic-api-key",
		cliOption: "--synthetic-api-key <key>",
		description: "Synthetic API key"
	},
	{
		optionKey: "veniceApiKey",
		authChoice: "venice-api-key",
		cliFlag: "--venice-api-key",
		cliOption: "--venice-api-key <key>",
		description: "Venice API key"
	},
	{
		optionKey: "togetherApiKey",
		authChoice: "together-api-key",
		cliFlag: "--together-api-key",
		cliOption: "--together-api-key <key>",
		description: "Together AI API key"
	},
	{
		optionKey: "huggingfaceApiKey",
		authChoice: "huggingface-api-key",
		cliFlag: "--huggingface-api-key",
		cliOption: "--huggingface-api-key <key>",
		description: "Hugging Face API key (HF token)"
	},
	{
		optionKey: "opencodeZenApiKey",
		authChoice: "opencode-zen",
		cliFlag: "--opencode-zen-api-key",
		cliOption: "--opencode-zen-api-key <key>",
		description: "OpenCode Zen API key"
	},
	{
		optionKey: "xaiApiKey",
		authChoice: "xai-api-key",
		cliFlag: "--xai-api-key",
		cliOption: "--xai-api-key <key>",
		description: "xAI API key"
	},
	{
		optionKey: "litellmApiKey",
		authChoice: "litellm-api-key",
		cliFlag: "--litellm-api-key",
		cliOption: "--litellm-api-key <key>",
		description: "LiteLLM API key"
	},
	{
		optionKey: "qianfanApiKey",
		authChoice: "qianfan-api-key",
		cliFlag: "--qianfan-api-key",
		cliOption: "--qianfan-api-key <key>",
		description: "QIANFAN API key"
	},
	{
		optionKey: "volcengineApiKey",
		authChoice: "volcengine-api-key",
		cliFlag: "--volcengine-api-key",
		cliOption: "--volcengine-api-key <key>",
		description: "Volcano Engine API key"
	},
	{
		optionKey: "byteplusApiKey",
		authChoice: "byteplus-api-key",
		cliFlag: "--byteplus-api-key",
		cliOption: "--byteplus-api-key <key>",
		description: "BytePlus API key"
	}
];

//#endregion
//#region src/commands/onboard-interactive.ts
async function runInteractiveOnboarding(opts, runtime = defaultRuntime) {
	const prompter = createClackPrompter();
	let exitCode = null;
	try {
		await runOnboardingWizard(opts, runtime, prompter);
	} catch (err) {
		if (err instanceof WizardCancelledError) {
			exitCode = 1;
			return;
		}
		throw err;
	} finally {
		restoreTerminalState("onboarding finish", { resumeStdinIfPaused: false });
		if (exitCode !== null) runtime.exit(exitCode);
	}
}

//#endregion
//#region src/commands/onboard-non-interactive/local/auth-choice-inference.ts
function hasStringValue(value) {
	return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}
function inferAuthChoiceFromFlags(opts) {
	const matches = ONBOARD_PROVIDER_AUTH_FLAGS.filter(({ optionKey }) => hasStringValue(opts[optionKey])).map((flag) => ({
		optionKey: flag.optionKey,
		authChoice: flag.authChoice,
		label: flag.cliFlag
	}));
	if (hasStringValue(opts.customBaseUrl) || hasStringValue(opts.customModelId) || hasStringValue(opts.customApiKey)) matches.push({
		optionKey: "customBaseUrl",
		authChoice: "custom-api-key",
		label: "--custom-base-url/--custom-model-id/--custom-api-key"
	});
	return {
		choice: matches[0]?.authChoice,
		matches
	};
}

//#endregion
//#region src/commands/onboard-non-interactive/api-keys.ts
async function resolveApiKeyFromProfiles(params) {
	const store = ensureAuthProfileStore(params.agentDir);
	const order = resolveAuthProfileOrder({
		cfg: params.cfg,
		store,
		provider: params.provider
	});
	for (const profileId of order) {
		if (store.profiles[profileId]?.type !== "api_key") continue;
		const resolved = await resolveApiKeyForProfile({
			cfg: params.cfg,
			store,
			profileId,
			agentDir: params.agentDir
		});
		if (resolved?.apiKey) return resolved.apiKey;
	}
	return null;
}
async function resolveNonInteractiveApiKey(params) {
	const flagKey = normalizeOptionalSecretInput(params.flagValue);
	if (flagKey) return {
		key: flagKey,
		source: "flag"
	};
	const envResolved = resolveEnvApiKey(params.provider);
	if (envResolved?.apiKey) return {
		key: envResolved.apiKey,
		source: "env"
	};
	const explicitEnvVar = params.envVarName?.trim();
	if (explicitEnvVar) {
		const explicitEnvKey = normalizeOptionalSecretInput(process.env[explicitEnvVar]);
		if (explicitEnvKey) return {
			key: explicitEnvKey,
			source: "env"
		};
	}
	if (params.allowProfile ?? true) {
		const profileKey = await resolveApiKeyFromProfiles({
			provider: params.provider,
			cfg: params.cfg,
			agentDir: params.agentDir
		});
		if (profileKey) return {
			key: profileKey,
			source: "profile"
		};
	}
	if (params.required === false) return null;
	const profileHint = params.allowProfile === false ? "" : `, or existing ${params.provider} API-key profile`;
	params.runtime.error(`Missing ${params.flagName} (or ${params.envVar} in env${profileHint}).`);
	params.runtime.exit(1);
	return null;
}

//#endregion
//#region src/commands/onboard-non-interactive/local/auth-choice.ts
async function applyNonInteractiveAuthChoice(params) {
	const { authChoice, opts, runtime, baseConfig } = params;
	let nextConfig = params.nextConfig;
	if (authChoice === "claude-cli" || authChoice === "codex-cli") {
		runtime.error([`Auth choice "${authChoice}" is deprecated.`, "Use \"--auth-choice token\" (Anthropic setup-token) or \"--auth-choice openai-codex\"."].join("\n"));
		runtime.exit(1);
		return null;
	}
	if (authChoice === "setup-token") {
		runtime.error(["Auth choice \"setup-token\" requires interactive mode.", "Use \"--auth-choice token\" with --token and --token-provider anthropic."].join("\n"));
		runtime.exit(1);
		return null;
	}
	if (authChoice === "vllm") {
		runtime.error(["Auth choice \"vllm\" requires interactive mode.", "Use interactive onboard/configure to enter base URL, API key, and model ID."].join("\n"));
		runtime.exit(1);
		return null;
	}
	if (authChoice === "apiKey") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "anthropic",
			cfg: baseConfig,
			flagValue: opts.anthropicApiKey,
			flagName: "--anthropic-api-key",
			envVar: "ANTHROPIC_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setAnthropicApiKey(resolved.key);
		return applyAuthProfileConfig(nextConfig, {
			profileId: "anthropic:default",
			provider: "anthropic",
			mode: "api_key"
		});
	}
	if (authChoice === "token") {
		const providerRaw = opts.tokenProvider?.trim();
		if (!providerRaw) {
			runtime.error("Missing --token-provider for --auth-choice token.");
			runtime.exit(1);
			return null;
		}
		const provider = normalizeProviderId(providerRaw);
		if (provider !== "anthropic") {
			runtime.error("Only --token-provider anthropic is supported for --auth-choice token.");
			runtime.exit(1);
			return null;
		}
		const tokenRaw = normalizeSecretInput(opts.token);
		if (!tokenRaw) {
			runtime.error("Missing --token for --auth-choice token.");
			runtime.exit(1);
			return null;
		}
		const tokenError = validateAnthropicSetupToken(tokenRaw);
		if (tokenError) {
			runtime.error(tokenError);
			runtime.exit(1);
			return null;
		}
		let expires;
		const expiresInRaw = opts.tokenExpiresIn?.trim();
		if (expiresInRaw) try {
			expires = Date.now() + parseDurationMs(expiresInRaw, { defaultUnit: "d" });
		} catch (err) {
			runtime.error(`Invalid --token-expires-in: ${String(err)}`);
			runtime.exit(1);
			return null;
		}
		const profileId = opts.tokenProfileId?.trim() || buildTokenProfileId({
			provider,
			name: ""
		});
		upsertAuthProfile({
			profileId,
			credential: {
				type: "token",
				provider,
				token: tokenRaw.trim(),
				...expires ? { expires } : {}
			}
		});
		return applyAuthProfileConfig(nextConfig, {
			profileId,
			provider,
			mode: "token"
		});
	}
	if (authChoice === "gemini-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "google",
			cfg: baseConfig,
			flagValue: opts.geminiApiKey,
			flagName: "--gemini-api-key",
			envVar: "GEMINI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setGeminiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "google:default",
			provider: "google",
			mode: "api_key"
		});
		return applyGoogleGeminiModelDefault(nextConfig).next;
	}
	if (authChoice === "zai-api-key" || authChoice === "zai-coding-global" || authChoice === "zai-coding-cn" || authChoice === "zai-global" || authChoice === "zai-cn") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "zai",
			cfg: baseConfig,
			flagValue: opts.zaiApiKey,
			flagName: "--zai-api-key",
			envVar: "ZAI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setZaiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "zai:default",
			provider: "zai",
			mode: "api_key"
		});
		let endpoint;
		let modelIdOverride;
		if (authChoice === "zai-coding-global") endpoint = "coding-global";
		else if (authChoice === "zai-coding-cn") endpoint = "coding-cn";
		else if (authChoice === "zai-global") endpoint = "global";
		else if (authChoice === "zai-cn") endpoint = "cn";
		else {
			const detected = await detectZaiEndpoint({ apiKey: resolved.key });
			if (detected) {
				endpoint = detected.endpoint;
				modelIdOverride = detected.modelId;
			} else endpoint = "global";
		}
		return applyZaiConfig(nextConfig, {
			endpoint,
			...modelIdOverride ? { modelId: modelIdOverride } : {}
		});
	}
	if (authChoice === "xiaomi-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "xiaomi",
			cfg: baseConfig,
			flagValue: opts.xiaomiApiKey,
			flagName: "--xiaomi-api-key",
			envVar: "XIAOMI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setXiaomiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "xiaomi:default",
			provider: "xiaomi",
			mode: "api_key"
		});
		return applyXiaomiConfig(nextConfig);
	}
	if (authChoice === "xai-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "xai",
			cfg: baseConfig,
			flagValue: opts.xaiApiKey,
			flagName: "--xai-api-key",
			envVar: "XAI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") setXaiApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "xai:default",
			provider: "xai",
			mode: "api_key"
		});
		return applyXaiConfig(nextConfig);
	}
	if (authChoice === "volcengine-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "volcengine",
			cfg: baseConfig,
			flagValue: opts.volcengineApiKey,
			flagName: "--volcengine-api-key",
			envVar: "VOLCANO_ENGINE_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") {
			const result = upsertSharedEnvVar({
				key: "VOLCANO_ENGINE_API_KEY",
				value: resolved.key
			});
			process.env.VOLCANO_ENGINE_API_KEY = resolved.key;
			runtime.log(`Saved VOLCANO_ENGINE_API_KEY to ${shortenHomePath(result.path)}`);
		}
		return applyPrimaryModel(nextConfig, "volcengine-plan/ark-code-latest");
	}
	if (authChoice === "byteplus-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "byteplus",
			cfg: baseConfig,
			flagValue: opts.byteplusApiKey,
			flagName: "--byteplus-api-key",
			envVar: "BYTEPLUS_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") {
			const result = upsertSharedEnvVar({
				key: "BYTEPLUS_API_KEY",
				value: resolved.key
			});
			process.env.BYTEPLUS_API_KEY = resolved.key;
			runtime.log(`Saved BYTEPLUS_API_KEY to ${shortenHomePath(result.path)}`);
		}
		return applyPrimaryModel(nextConfig, "byteplus-plan/ark-code-latest");
	}
	if (authChoice === "qianfan-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "qianfan",
			cfg: baseConfig,
			flagValue: opts.qianfanApiKey,
			flagName: "--qianfan-api-key",
			envVar: "QIANFAN_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") setQianfanApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "qianfan:default",
			provider: "qianfan",
			mode: "api_key"
		});
		return applyQianfanConfig(nextConfig);
	}
	if (authChoice === "openai-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "openai",
			cfg: baseConfig,
			flagValue: opts.openaiApiKey,
			flagName: "--openai-api-key",
			envVar: "OPENAI_API_KEY",
			runtime,
			allowProfile: false
		});
		if (!resolved) return null;
		const key = resolved.key;
		const result = upsertSharedEnvVar({
			key: "OPENAI_API_KEY",
			value: key
		});
		process.env.OPENAI_API_KEY = key;
		runtime.log(`Saved OPENAI_API_KEY to ${shortenHomePath(result.path)}`);
		return applyOpenAIConfig(nextConfig);
	}
	if (authChoice === "openrouter-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "openrouter",
			cfg: baseConfig,
			flagValue: opts.openrouterApiKey,
			flagName: "--openrouter-api-key",
			envVar: "OPENROUTER_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setOpenrouterApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "openrouter:default",
			provider: "openrouter",
			mode: "api_key"
		});
		return applyOpenrouterConfig(nextConfig);
	}
	if (authChoice === "litellm-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "litellm",
			cfg: baseConfig,
			flagValue: opts.litellmApiKey,
			flagName: "--litellm-api-key",
			envVar: "LITELLM_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setLitellmApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "litellm:default",
			provider: "litellm",
			mode: "api_key"
		});
		return applyLitellmConfig(nextConfig);
	}
	if (authChoice === "ai-gateway-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "vercel-ai-gateway",
			cfg: baseConfig,
			flagValue: opts.aiGatewayApiKey,
			flagName: "--ai-gateway-api-key",
			envVar: "AI_GATEWAY_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setVercelAiGatewayApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "vercel-ai-gateway:default",
			provider: "vercel-ai-gateway",
			mode: "api_key"
		});
		return applyVercelAiGatewayConfig(nextConfig);
	}
	if (authChoice === "cloudflare-ai-gateway-api-key") {
		const accountId = opts.cloudflareAiGatewayAccountId?.trim() ?? "";
		const gatewayId = opts.cloudflareAiGatewayGatewayId?.trim() ?? "";
		if (!accountId || !gatewayId) {
			runtime.error(["Auth choice \"cloudflare-ai-gateway-api-key\" requires Account ID and Gateway ID.", "Use --cloudflare-ai-gateway-account-id and --cloudflare-ai-gateway-gateway-id."].join("\n"));
			runtime.exit(1);
			return null;
		}
		const resolved = await resolveNonInteractiveApiKey({
			provider: "cloudflare-ai-gateway",
			cfg: baseConfig,
			flagValue: opts.cloudflareAiGatewayApiKey,
			flagName: "--cloudflare-ai-gateway-api-key",
			envVar: "CLOUDFLARE_AI_GATEWAY_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setCloudflareAiGatewayConfig(accountId, gatewayId, resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "cloudflare-ai-gateway:default",
			provider: "cloudflare-ai-gateway",
			mode: "api_key"
		});
		return applyCloudflareAiGatewayConfig(nextConfig, {
			accountId,
			gatewayId
		});
	}
	const applyMoonshotApiKeyChoice = async (applyConfig) => {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "moonshot",
			cfg: baseConfig,
			flagValue: opts.moonshotApiKey,
			flagName: "--moonshot-api-key",
			envVar: "MOONSHOT_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setMoonshotApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "moonshot:default",
			provider: "moonshot",
			mode: "api_key"
		});
		return applyConfig(nextConfig);
	};
	if (authChoice === "moonshot-api-key") return await applyMoonshotApiKeyChoice(applyMoonshotConfig);
	if (authChoice === "moonshot-api-key-cn") return await applyMoonshotApiKeyChoice(applyMoonshotConfigCn);
	if (authChoice === "kimi-code-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "kimi-coding",
			cfg: baseConfig,
			flagValue: opts.kimiCodeApiKey,
			flagName: "--kimi-code-api-key",
			envVar: "KIMI_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setKimiCodingApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "kimi-coding:default",
			provider: "kimi-coding",
			mode: "api_key"
		});
		return applyKimiCodeConfig(nextConfig);
	}
	if (authChoice === "synthetic-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "synthetic",
			cfg: baseConfig,
			flagValue: opts.syntheticApiKey,
			flagName: "--synthetic-api-key",
			envVar: "SYNTHETIC_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setSyntheticApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "synthetic:default",
			provider: "synthetic",
			mode: "api_key"
		});
		return applySyntheticConfig(nextConfig);
	}
	if (authChoice === "venice-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "venice",
			cfg: baseConfig,
			flagValue: opts.veniceApiKey,
			flagName: "--venice-api-key",
			envVar: "VENICE_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setVeniceApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "venice:default",
			provider: "venice",
			mode: "api_key"
		});
		return applyVeniceConfig(nextConfig);
	}
	if (authChoice === "minimax-cloud" || authChoice === "minimax-api" || authChoice === "minimax-api-key-cn" || authChoice === "minimax-api-lightning") {
		const isCn = authChoice === "minimax-api-key-cn";
		const providerId = isCn ? "minimax-cn" : "minimax";
		const profileId = `${providerId}:default`;
		const resolved = await resolveNonInteractiveApiKey({
			provider: providerId,
			cfg: baseConfig,
			flagValue: opts.minimaxApiKey,
			flagName: "--minimax-api-key",
			envVar: "MINIMAX_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setMinimaxApiKey(resolved.key, void 0, profileId);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId,
			provider: providerId,
			mode: "api_key"
		});
		const modelId = authChoice === "minimax-api-lightning" ? "MiniMax-M2.5-Lightning" : "MiniMax-M2.5";
		return isCn ? applyMinimaxApiConfigCn(nextConfig, modelId) : applyMinimaxApiConfig(nextConfig, modelId);
	}
	if (authChoice === "minimax") return applyMinimaxConfig(nextConfig);
	if (authChoice === "opencode-zen") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "opencode",
			cfg: baseConfig,
			flagValue: opts.opencodeZenApiKey,
			flagName: "--opencode-zen-api-key",
			envVar: "OPENCODE_API_KEY (or OPENCODE_ZEN_API_KEY)",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setOpencodeZenApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "opencode:default",
			provider: "opencode",
			mode: "api_key"
		});
		return applyOpencodeZenConfig(nextConfig);
	}
	if (authChoice === "together-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "together",
			cfg: baseConfig,
			flagValue: opts.togetherApiKey,
			flagName: "--together-api-key",
			envVar: "TOGETHER_API_KEY",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setTogetherApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "together:default",
			provider: "together",
			mode: "api_key"
		});
		return applyTogetherConfig(nextConfig);
	}
	if (authChoice === "huggingface-api-key") {
		const resolved = await resolveNonInteractiveApiKey({
			provider: "huggingface",
			cfg: baseConfig,
			flagValue: opts.huggingfaceApiKey,
			flagName: "--huggingface-api-key",
			envVar: "HF_TOKEN",
			runtime
		});
		if (!resolved) return null;
		if (resolved.source !== "profile") await setHuggingfaceApiKey(resolved.key);
		nextConfig = applyAuthProfileConfig(nextConfig, {
			profileId: "huggingface:default",
			provider: "huggingface",
			mode: "api_key"
		});
		return applyHuggingfaceConfig(nextConfig);
	}
	if (authChoice === "custom-api-key") try {
		const customAuth = parseNonInteractiveCustomApiFlags({
			baseUrl: opts.customBaseUrl,
			modelId: opts.customModelId,
			compatibility: opts.customCompatibility,
			apiKey: opts.customApiKey,
			providerId: opts.customProviderId
		});
		const resolvedCustomApiKey = await resolveNonInteractiveApiKey({
			provider: resolveCustomProviderId({
				config: nextConfig,
				baseUrl: customAuth.baseUrl,
				providerId: customAuth.providerId
			}).providerId,
			cfg: baseConfig,
			flagValue: customAuth.apiKey,
			flagName: "--custom-api-key",
			envVar: "CUSTOM_API_KEY",
			envVarName: "CUSTOM_API_KEY",
			runtime,
			required: false
		});
		const result = applyCustomApiConfig({
			config: nextConfig,
			baseUrl: customAuth.baseUrl,
			modelId: customAuth.modelId,
			compatibility: customAuth.compatibility,
			apiKey: resolvedCustomApiKey?.key,
			providerId: customAuth.providerId
		});
		if (result.providerIdRenamedFrom && result.providerId) runtime.log(`Custom provider ID "${result.providerIdRenamedFrom}" already exists for a different base URL. Using "${result.providerId}".`);
		return result.config;
	} catch (err) {
		if (err instanceof CustomApiError) {
			switch (err.code) {
				case "missing_required":
				case "invalid_compatibility":
					runtime.error(err.message);
					break;
				default:
					runtime.error(`Invalid custom provider config: ${err.message}`);
					break;
			}
			runtime.exit(1);
			return null;
		}
		const reason = err instanceof Error ? err.message : String(err);
		runtime.error(`Invalid custom provider config: ${reason}`);
		runtime.exit(1);
		return null;
	}
	if (authChoice === "oauth" || authChoice === "chutes" || authChoice === "openai-codex" || authChoice === "qwen-portal" || authChoice === "minimax-portal") {
		runtime.error("OAuth requires interactive mode.");
		runtime.exit(1);
		return null;
	}
	return nextConfig;
}

//#endregion
//#region src/commands/onboard-non-interactive/local/daemon-install.ts
async function installGatewayDaemonNonInteractive(params) {
	const { opts, runtime, port, gatewayToken } = params;
	if (!opts.installDaemon) return;
	const daemonRuntimeRaw = opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) {
		runtime.log("Systemd user services are unavailable; skipping service install.");
		return;
	}
	if (!isGatewayDaemonRuntime(daemonRuntimeRaw)) {
		runtime.error("Invalid --daemon-runtime (use node or bun)");
		runtime.exit(1);
		return;
	}
	const service = resolveGatewayService();
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		token: gatewayToken,
		runtime: daemonRuntimeRaw,
		warn: (message) => runtime.log(message),
		config: params.nextConfig
	});
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		runtime.error(`Gateway service install failed: ${String(err)}`);
		runtime.log(gatewayInstallErrorHint());
		return;
	}
	await ensureSystemdUserLingerNonInteractive({ runtime });
}

//#endregion
//#region src/commands/onboard-non-interactive/local/gateway-config.ts
function applyNonInteractiveGatewayConfig(params) {
	const { opts, runtime } = params;
	const hasGatewayPort = opts.gatewayPort !== void 0;
	if (hasGatewayPort && (!Number.isFinite(opts.gatewayPort) || (opts.gatewayPort ?? 0) <= 0)) {
		runtime.error("Invalid --gateway-port");
		runtime.exit(1);
		return null;
	}
	const port = hasGatewayPort ? opts.gatewayPort : params.defaultPort;
	let bind = opts.gatewayBind ?? "loopback";
	const authModeRaw = opts.gatewayAuth ?? "token";
	if (authModeRaw !== "token" && authModeRaw !== "password") {
		runtime.error("Invalid --gateway-auth (use token|password).");
		runtime.exit(1);
		return null;
	}
	let authMode = authModeRaw;
	const tailscaleMode = opts.tailscale ?? "off";
	const tailscaleResetOnExit = Boolean(opts.tailscaleResetOnExit);
	if (tailscaleMode !== "off" && bind !== "loopback") bind = "loopback";
	if (tailscaleMode === "funnel" && authMode !== "password") authMode = "password";
	let nextConfig = params.nextConfig;
	let gatewayToken = opts.gatewayToken?.trim() || void 0;
	if (authMode === "token") {
		if (!gatewayToken) gatewayToken = randomToken();
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "token",
					token: gatewayToken
				}
			}
		};
	}
	if (authMode === "password") {
		const password = opts.gatewayPassword?.trim();
		if (!password) {
			runtime.error("Missing --gateway-password for password auth.");
			runtime.exit(1);
			return null;
		}
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "password",
					password
				}
			}
		};
	}
	nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			port,
			bind,
			tailscale: {
				...nextConfig.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	return {
		nextConfig,
		port,
		bind,
		authMode,
		tailscaleMode,
		tailscaleResetOnExit,
		gatewayToken
	};
}

//#endregion
//#region src/commands/onboard-non-interactive/local/output.ts
function logNonInteractiveOnboardingJson(params) {
	if (!params.opts.json) return;
	params.runtime.log(JSON.stringify({
		mode: params.mode,
		workspace: params.workspaceDir,
		authChoice: params.authChoice,
		gateway: params.gateway,
		installDaemon: Boolean(params.installDaemon),
		daemonRuntime: params.daemonRuntime,
		skipSkills: Boolean(params.skipSkills),
		skipHealth: Boolean(params.skipHealth)
	}, null, 2));
}

//#endregion
//#region src/commands/onboard-non-interactive/local/skills-config.ts
function applyNonInteractiveSkillsConfig(params) {
	const { nextConfig, opts, runtime } = params;
	if (opts.skipSkills) return nextConfig;
	const nodeManager = opts.nodeManager ?? "npm";
	if (![
		"npm",
		"pnpm",
		"bun"
	].includes(nodeManager)) {
		runtime.error("Invalid --node-manager (use npm, pnpm, or bun)");
		runtime.exit(1);
		return nextConfig;
	}
	return {
		...nextConfig,
		skills: {
			...nextConfig.skills,
			install: {
				...nextConfig.skills?.install,
				nodeManager
			}
		}
	};
}

//#endregion
//#region src/commands/onboard-non-interactive/local/workspace.ts
function resolveNonInteractiveWorkspaceDir(params) {
	return resolveUserPath((params.opts.workspace ?? params.baseConfig.agents?.defaults?.workspace ?? params.defaultWorkspaceDir).trim());
}

//#endregion
//#region src/commands/onboard-non-interactive/local.ts
async function runNonInteractiveOnboardingLocal(params) {
	const { opts, runtime, baseConfig } = params;
	const mode = "local";
	const workspaceDir = resolveNonInteractiveWorkspaceDir({
		opts,
		baseConfig,
		defaultWorkspaceDir: DEFAULT_WORKSPACE
	});
	let nextConfig = applyOnboardingLocalWorkspaceConfig(baseConfig, workspaceDir);
	const inferredAuthChoice = inferAuthChoiceFromFlags(opts);
	if (!opts.authChoice && inferredAuthChoice.matches.length > 1) {
		runtime.error([
			"Multiple API key flags were provided for non-interactive onboarding.",
			"Use a single provider flag or pass --auth-choice explicitly.",
			`Flags: ${inferredAuthChoice.matches.map((match) => match.label).join(", ")}`
		].join("\n"));
		runtime.exit(1);
		return;
	}
	const authChoice = opts.authChoice ?? inferredAuthChoice.choice ?? "skip";
	const nextConfigAfterAuth = await applyNonInteractiveAuthChoice({
		nextConfig,
		authChoice,
		opts,
		runtime,
		baseConfig
	});
	if (!nextConfigAfterAuth) return;
	nextConfig = nextConfigAfterAuth;
	const gatewayBasePort = resolveGatewayPort(baseConfig);
	const gatewayResult = applyNonInteractiveGatewayConfig({
		nextConfig,
		opts,
		runtime,
		defaultPort: gatewayBasePort
	});
	if (!gatewayResult) return;
	nextConfig = gatewayResult.nextConfig;
	nextConfig = applyNonInteractiveSkillsConfig({
		nextConfig,
		opts,
		runtime
	});
	nextConfig = applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	await writeConfigFile(nextConfig);
	logConfigUpdated(runtime);
	await ensureWorkspaceAndSessions(workspaceDir, runtime, { skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap) });
	await installGatewayDaemonNonInteractive({
		nextConfig,
		opts,
		runtime,
		port: gatewayResult.port,
		gatewayToken: gatewayResult.gatewayToken
	});
	const daemonRuntimeRaw = opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
	if (!opts.skipHealth) {
		await waitForGatewayReachable({
			url: resolveControlUiLinks({
				bind: gatewayResult.bind,
				port: gatewayResult.port,
				customBindHost: nextConfig.gateway?.customBindHost,
				basePath: void 0
			}).wsUrl,
			token: gatewayResult.gatewayToken,
			deadlineMs: 15e3
		});
		await healthCommand({
			json: false,
			timeoutMs: 1e4
		}, runtime);
	}
	logNonInteractiveOnboardingJson({
		opts,
		runtime,
		mode,
		workspaceDir,
		authChoice,
		gateway: {
			port: gatewayResult.port,
			bind: gatewayResult.bind,
			authMode: gatewayResult.authMode,
			tailscaleMode: gatewayResult.tailscaleMode
		},
		installDaemon: Boolean(opts.installDaemon),
		daemonRuntime: opts.installDaemon ? daemonRuntimeRaw : void 0,
		skipSkills: Boolean(opts.skipSkills),
		skipHealth: Boolean(opts.skipHealth)
	});
	if (!opts.json) runtime.log(`Tip: run \`${formatCliCommand("openclaw configure --section web")}\` to store your Brave API key for web_search. Docs: https://docs.openclaw.ai/tools/web`);
}

//#endregion
//#region src/commands/onboard-non-interactive/remote.ts
async function runNonInteractiveOnboardingRemote(params) {
	const { opts, runtime, baseConfig } = params;
	const mode = "remote";
	const remoteUrl = opts.remoteUrl?.trim();
	if (!remoteUrl) {
		runtime.error("Missing --remote-url for remote mode.");
		runtime.exit(1);
		return;
	}
	let nextConfig = {
		...baseConfig,
		gateway: {
			...baseConfig.gateway,
			mode: "remote",
			remote: {
				url: remoteUrl,
				token: opts.remoteToken?.trim() || void 0
			}
		}
	};
	nextConfig = applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	await writeConfigFile(nextConfig);
	logConfigUpdated(runtime);
	const payload = {
		mode,
		remoteUrl,
		auth: opts.remoteToken ? "token" : "none"
	};
	if (opts.json) runtime.log(JSON.stringify(payload, null, 2));
	else {
		runtime.log(`Remote gateway: ${remoteUrl}`);
		runtime.log(`Auth: ${payload.auth}`);
		runtime.log(`Tip: run \`${formatCliCommand("openclaw configure --section web")}\` to store your Brave API key for web_search. Docs: https://docs.openclaw.ai/tools/web`);
	}
}

//#endregion
//#region src/commands/onboard-non-interactive.ts
async function runNonInteractiveOnboarding(opts, runtime = defaultRuntime) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.exists && !snapshot.valid) {
		runtime.error(`Config invalid. Run \`${formatCliCommand("openclaw doctor")}\` to repair it, then re-run onboarding.`);
		runtime.exit(1);
		return;
	}
	const baseConfig = snapshot.valid ? snapshot.config : {};
	const mode = opts.mode ?? "local";
	if (mode !== "local" && mode !== "remote") {
		runtime.error(`Invalid --mode "${String(mode)}" (use local|remote).`);
		runtime.exit(1);
		return;
	}
	if (mode === "remote") {
		await runNonInteractiveOnboardingRemote({
			opts,
			runtime,
			baseConfig
		});
		return;
	}
	await runNonInteractiveOnboardingLocal({
		opts,
		runtime,
		baseConfig
	});
}

//#endregion
//#region src/commands/onboard.ts
async function onboardCommand(opts, runtime = defaultRuntime) {
	assertSupportedRuntime(runtime);
	const originalAuthChoice = opts.authChoice;
	const normalizedAuthChoice = normalizeLegacyOnboardAuthChoice(originalAuthChoice);
	if (opts.nonInteractive && isDeprecatedAuthChoice(originalAuthChoice)) {
		runtime.error([`Auth choice "${String(originalAuthChoice)}" is deprecated.`, "Use \"--auth-choice token\" (Anthropic setup-token) or \"--auth-choice openai-codex\"."].join("\n"));
		runtime.exit(1);
		return;
	}
	if (originalAuthChoice === "claude-cli") runtime.log("Auth choice \"claude-cli\" is deprecated; using setup-token flow instead.");
	if (originalAuthChoice === "codex-cli") runtime.log("Auth choice \"codex-cli\" is deprecated; using OpenAI Codex OAuth instead.");
	const flow = opts.flow === "manual" ? "advanced" : opts.flow;
	const normalizedOpts = normalizedAuthChoice === opts.authChoice && flow === opts.flow ? opts : {
		...opts,
		authChoice: normalizedAuthChoice,
		flow
	};
	if (normalizedOpts.nonInteractive && normalizedOpts.acceptRisk !== true) {
		runtime.error([
			"Non-interactive onboarding requires explicit risk acknowledgement.",
			"Read: https://docs.openclaw.ai/security",
			`Re-run with: ${formatCliCommand("openclaw onboard --non-interactive --accept-risk ...")}`
		].join("\n"));
		runtime.exit(1);
		return;
	}
	if (normalizedOpts.reset) {
		const snapshot = await readConfigFileSnapshot();
		const baseConfig = snapshot.valid ? snapshot.config : {};
		await handleReset("full", resolveUserPath(normalizedOpts.workspace ?? baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE), runtime);
	}
	if (process.platform === "win32") runtime.log([
		"Windows detected — OpenClaw runs great on WSL2!",
		"Native Windows might be trickier.",
		"Quick setup: wsl --install (one command, one reboot)",
		"Guide: https://docs.openclaw.ai/windows"
	].join("\n"));
	if (normalizedOpts.nonInteractive) {
		await runNonInteractiveOnboarding(normalizedOpts, runtime);
		return;
	}
	await runInteractiveOnboarding(normalizedOpts, runtime);
}

//#endregion
export { ONBOARD_PROVIDER_AUTH_FLAGS as n, onboardCommand as t };