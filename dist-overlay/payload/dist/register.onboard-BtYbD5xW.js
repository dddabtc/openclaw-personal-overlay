import "./paths-BJV7vkaX.js";
import { p as theme } from "./globals-BM8hKFm0.js";
import "./utils-DC4zYvW0.js";
import "./agent-scope-Cbp0nOOm.js";
import { f as defaultRuntime } from "./subsystem-C9Xgeyrw.js";
import "./openclaw-root-D1FcrxOp.js";
import "./logger-BKkZU9TX.js";
import "./exec-nuW3NMJe.js";
import "./model-selection-Dnp6qsMS.js";
import "./github-copilot-token-BQoM_VEX.js";
import "./boolean-D8Ha5nYV.js";
import "./env-ByppU_6u.js";
import "./host-env-security-CbFV1gAw.js";
import "./registry-DGVIIthr.js";
import "./manifest-registry-BMEqbkWA.js";
import "./dock-BvmTvlyF.js";
import "./message-channel-DMsTX_8C.js";
import "./plugins-t3ljVB7c.js";
import "./sessions-BHlTfQrB.js";
import "./tailnet-aR1njljD.js";
import "./ws-CyLniShb.js";
import "./credentials-BXh0SH4r.js";
import "./redact-XVjLULTG.js";
import "./errors-Dl9nRyXH.js";
import "./accounts-WRgl0tJ1.js";
import "./channel-config-helpers-BnsIklFT.js";
import "./accounts-BtlgULZC.js";
import "./paths-BWOXmNIW.js";
import "./chat-envelope-BkySjpPY.js";
import "./call-CUrd3PC6.js";
import "./pairing-token-CVcXi_hV.js";
import "./onboard-helpers-BNHN3TZr.js";
import "./prompt-style-D8LvsnSX.js";
import { t as formatDocsLink } from "./links-CoNMV1eb.js";
import { n as runCommandWithRuntime } from "./cli-utils-CVpegkfr.js";
import "./progress-BZWDJTlm.js";
import "./runtime-guard-C_HR58Q-.js";
import "./note-OzIdLwt-.js";
import "./clack-prompter-C2rZOXIQ.js";
import "./onboarding.secret-input-WUr3la7S.js";
import "./onboarding-9MbUyJi4.js";
import "./logging-MtSj7aeX.js";
import { t as ONBOARD_PROVIDER_AUTH_FLAGS } from "./onboard-provider-auth-flags-B4Booc4Q.js";
import { n as formatAuthChoiceChoicesForCli } from "./auth-choice-options-Dz8m0ZrF.js";
import { t as onboardCommand } from "./onboard-D--CMWz_.js";
//#region src/cli/program/register.onboard.ts
function resolveInstallDaemonFlag(command, opts) {
	if (!command || typeof command !== "object") return;
	const getOptionValueSource = "getOptionValueSource" in command ? command.getOptionValueSource : void 0;
	if (typeof getOptionValueSource !== "function") return;
	if (getOptionValueSource.call(command, "skipDaemon") === "cli") return false;
	if (getOptionValueSource.call(command, "installDaemon") === "cli") return Boolean(opts.installDaemon);
}
const AUTH_CHOICE_HELP = formatAuthChoiceChoicesForCli({
	includeLegacyAliases: true,
	includeSkip: true
});
function registerOnboardCommand(program) {
	const command = program.command("onboard").description("Interactive wizard to set up the gateway, workspace, and skills").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/onboard", "docs.openclaw.ai/cli/onboard")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace)").option("--reset", "Reset config + credentials + sessions before running wizard (workspace only with --reset-scope full)").option("--reset-scope <scope>", "Reset scope: config|config+creds+sessions|full").option("--non-interactive", "Run without prompts", false).option("--accept-risk", "Acknowledge that agents are powerful and full system access is risky (required for --non-interactive)", false).option("--flow <flow>", "Wizard flow: quickstart|advanced|manual").option("--mode <mode>", "Wizard mode: local|remote").option("--auth-choice <choice>", `Auth: ${AUTH_CHOICE_HELP}`).option("--token-provider <id>", "Token provider id (non-interactive; used with --auth-choice token)").option("--token <token>", "Token value (non-interactive; used with --auth-choice token)").option("--token-profile-id <id>", "Auth profile id (non-interactive; default: <provider>:manual)").option("--token-expires-in <duration>", "Optional token expiry duration (e.g. 365d, 12h)").option("--secret-input-mode <mode>", "API key persistence mode: plaintext|ref (default: plaintext)").option("--cloudflare-ai-gateway-account-id <id>", "Cloudflare Account ID").option("--cloudflare-ai-gateway-gateway-id <id>", "Cloudflare AI Gateway ID");
	for (const providerFlag of ONBOARD_PROVIDER_AUTH_FLAGS) command.option(providerFlag.cliOption, providerFlag.description);
	command.option("--custom-base-url <url>", "Custom provider base URL").option("--custom-api-key <key>", "Custom provider API key (optional)").option("--custom-model-id <id>", "Custom provider model ID").option("--custom-provider-id <id>", "Custom provider ID (optional; auto-derived by default)").option("--custom-compatibility <mode>", "Custom provider API compatibility: openai|anthropic (default: openai)").option("--gateway-port <port>", "Gateway port").option("--gateway-bind <mode>", "Gateway bind: loopback|tailnet|lan|auto|custom").option("--gateway-auth <mode>", "Gateway auth: token|password").option("--gateway-token <token>", "Gateway token (token auth)").option("--gateway-token-ref-env <name>", "Gateway token SecretRef env var name (token auth; e.g. OPENCLAW_GATEWAY_TOKEN)").option("--gateway-password <password>", "Gateway password (password auth)").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").option("--tailscale <mode>", "Tailscale: off|serve|funnel").option("--tailscale-reset-on-exit", "Reset tailscale serve/funnel on exit").option("--install-daemon", "Install gateway service").option("--no-install-daemon", "Skip gateway service install").option("--skip-daemon", "Skip gateway service install").option("--daemon-runtime <runtime>", "Daemon runtime: node|bun").option("--skip-channels", "Skip channel setup").option("--skip-skills", "Skip skills setup").option("--skip-search", "Skip search provider setup").option("--skip-health", "Skip health check").option("--skip-ui", "Skip Control UI/TUI prompts").option("--node-manager <name>", "Node manager for skills: npm|pnpm|bun").option("--json", "Output JSON summary", false);
	command.action(async (opts, commandRuntime) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const installDaemon = resolveInstallDaemonFlag(commandRuntime, { installDaemon: Boolean(opts.installDaemon) });
			const gatewayPort = typeof opts.gatewayPort === "string" ? Number.parseInt(opts.gatewayPort, 10) : void 0;
			await onboardCommand({
				workspace: opts.workspace,
				nonInteractive: Boolean(opts.nonInteractive),
				acceptRisk: Boolean(opts.acceptRisk),
				flow: opts.flow,
				mode: opts.mode,
				authChoice: opts.authChoice,
				tokenProvider: opts.tokenProvider,
				token: opts.token,
				tokenProfileId: opts.tokenProfileId,
				tokenExpiresIn: opts.tokenExpiresIn,
				secretInputMode: opts.secretInputMode,
				anthropicApiKey: opts.anthropicApiKey,
				openaiApiKey: opts.openaiApiKey,
				mistralApiKey: opts.mistralApiKey,
				openrouterApiKey: opts.openrouterApiKey,
				kilocodeApiKey: opts.kilocodeApiKey,
				aiGatewayApiKey: opts.aiGatewayApiKey,
				cloudflareAiGatewayAccountId: opts.cloudflareAiGatewayAccountId,
				cloudflareAiGatewayGatewayId: opts.cloudflareAiGatewayGatewayId,
				cloudflareAiGatewayApiKey: opts.cloudflareAiGatewayApiKey,
				moonshotApiKey: opts.moonshotApiKey,
				kimiCodeApiKey: opts.kimiCodeApiKey,
				geminiApiKey: opts.geminiApiKey,
				zaiApiKey: opts.zaiApiKey,
				xiaomiApiKey: opts.xiaomiApiKey,
				qianfanApiKey: opts.qianfanApiKey,
				minimaxApiKey: opts.minimaxApiKey,
				syntheticApiKey: opts.syntheticApiKey,
				veniceApiKey: opts.veniceApiKey,
				togetherApiKey: opts.togetherApiKey,
				huggingfaceApiKey: opts.huggingfaceApiKey,
				opencodeZenApiKey: opts.opencodeZenApiKey,
				xaiApiKey: opts.xaiApiKey,
				litellmApiKey: opts.litellmApiKey,
				volcengineApiKey: opts.volcengineApiKey,
				byteplusApiKey: opts.byteplusApiKey,
				customBaseUrl: opts.customBaseUrl,
				customApiKey: opts.customApiKey,
				customModelId: opts.customModelId,
				customProviderId: opts.customProviderId,
				customCompatibility: opts.customCompatibility,
				gatewayPort: typeof gatewayPort === "number" && Number.isFinite(gatewayPort) ? gatewayPort : void 0,
				gatewayBind: opts.gatewayBind,
				gatewayAuth: opts.gatewayAuth,
				gatewayToken: opts.gatewayToken,
				gatewayTokenRefEnv: opts.gatewayTokenRefEnv,
				gatewayPassword: opts.gatewayPassword,
				remoteUrl: opts.remoteUrl,
				remoteToken: opts.remoteToken,
				tailscale: opts.tailscale,
				tailscaleResetOnExit: Boolean(opts.tailscaleResetOnExit),
				reset: Boolean(opts.reset),
				resetScope: opts.resetScope,
				installDaemon,
				daemonRuntime: opts.daemonRuntime,
				skipChannels: Boolean(opts.skipChannels),
				skipSkills: Boolean(opts.skipSkills),
				skipSearch: Boolean(opts.skipSearch),
				skipHealth: Boolean(opts.skipHealth),
				skipUi: Boolean(opts.skipUi),
				nodeManager: opts.nodeManager,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
}
//#endregion
export { registerOnboardCommand };
