import { Dt as theme, _ as defaultRuntime } from "./entry.js";
import "./auth-profiles-C7RTY9Sv.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-DhajVyRS.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-ChKLb_d2.js";
import "./pi-model-discovery-Do3xMEtM.js";
import "./frontmatter-D-YR-Ghi.js";
import "./skills-Bq1s47OA.js";
import "./manifest-registry-XSxPcu0S.js";
import "./config-DMW11Vgn.js";
import "./client-DrK7aLru.js";
import "./call-DpGX4uMX.js";
import "./message-channel-CVHJDItx.js";
import "./pairing-token-Byh6drgn.js";
import "./subagent-registry-BDJet-Vq.js";
import "./sessions-CsRDsl2f.js";
import "./tokens-ANnYrShl.js";
import "./plugins-Dhh2a3qc.js";
import "./accounts-BrsscXpo.js";
import "./bindings-BO7DQ_-I.js";
import "./logging-CFvkxgcX.js";
import "./send-Big2UFm_.js";
import "./send-hNGYd45P.js";
import "./with-timeout-iOq9EFfz.js";
import "./deliver-CyeIWbI8.js";
import "./diagnostic-C6WTf4ZE.js";
import "./diagnostic-session-state-CIjIGxEE.js";
import "./accounts-1gFWxwAw.js";
import "./send-Ca4_6d3W.js";
import "./image-ops-CKJNUuNW.js";
import "./pi-embedded-helpers-Cf-sQwMv.js";
import "./sandbox-DpWD18_K.js";
import "./chrome-DkGieswr.js";
import "./tailscale-BxzsxqAY.js";
import "./auth-BcWLEKcS.js";
import "./server-context-CX9PSgDC.js";
import "./routes-DeZNDmn_.js";
import "./redact-B40lik2B.js";
import "./errors-Ba_ROWsq.js";
import "./fs-safe-CERgjtot.js";
import "./paths-Dzc_6Z5O.js";
import "./ssrf-Ixuyn7h8.js";
import "./store-DRvx-vgM.js";
import "./ports-CjVslX4J.js";
import "./trash-CWQQXWX3.js";
import "./dock-BkVflx2Q.js";
import "./accounts-CuhuCyTF.js";
import "./paths-DNdWAq7b.js";
import "./tool-images-CW04CAn5.js";
import "./thinking-8sKPnzpp.js";
import "./models-config-xdiIJ--F.js";
import "./reply-prefix-D4RfrCeP.js";
import "./memory-cli-meSZHVr2.js";
import "./manager-CYx1MWZA.js";
import "./gemini-auth-FuBGrv0B.js";
import "./sqlite-CQGamAhm.js";
import "./retry-C4Q_VPOo.js";
import "./target-errors-C6mkRlU9.js";
import "./chunk-D6AoZjLE.js";
import "./markdown-tables-CVgUytSx.js";
import "./fetch-guard-Dp7VnmeK.js";
import "./local-roots-LE1f_G0M.js";
import "./ir-DwFJAkDs.js";
import "./render-e7fENCYH.js";
import "./commands-j9S9qRB6.js";
import "./commands-registry-BDRoefkH.js";
import "./image-CMLQrCWd.js";
import "./tool-display-DixohEVL.js";
import "./session-utils-DwO3Isif.js";
import "./session-cost-usage-Dfx7NHjv.js";
import "./runner-BqlaWRyu.js";
import "./model-catalog-DPgNYd7O.js";
import "./skill-commands-DR5wCsHu.js";
import "./workspace-dirs-Dw0EowUJ.js";
import "./pairing-store-BqeL7tj7.js";
import "./fetch-DOex5qYK.js";
import "./exec-approvals-BKZqQjp9.js";
import "./nodes-screen-DCJNznUw.js";
import "./channel-activity-myOnmDZi.js";
import "./tables-CKA-N6SU.js";
import "./control-service-jtQ1tZZN.js";
import "./stagger-CQar2eKe.js";
import "./channel-selection-D5cjTEHf.js";
import "./send-7EWRElEf.js";
import "./outbound-attachment-Bc9bVXwP.js";
import "./delivery-queue-CzNZXd1M.js";
import "./send-ChEZW6oS.js";
import "./resolve-route-C4DUT14V.js";
import "./proxy-DL3MD6-P.js";
import { t as formatDocsLink } from "./links-CW8Bx7rK.js";
import { n as runCommandWithRuntime } from "./cli-utils-CCaEbxAz.js";
import "./help-format-B0pWGnZs.js";
import "./progress-BAHiAaDW.js";
import "./replies-BjWvOhNO.js";
import "./onboard-helpers-BE4hqP_a.js";
import "./prompt-style-DwCXob2h.js";
import "./pairing-labels-D4ymYAjE.js";
import "./pi-tools.policy-PdQU4Q59.js";
import "./note-DDecZomM.js";
import "./clack-prompter-B1aVoXd5.js";
import "./daemon-runtime-DWdkGSbe.js";
import "./runtime-guard-Cs_ClFhP.js";
import "./systemd-BrybH4HV.js";
import "./service-DcFI40_W.js";
import "./health-CB4EydiK.js";
import "./onboarding-DjT6d0Tk.js";
import "./shared-CInXP6v2.js";
import "./auth-token-ED-ILVvP.js";
import "./logging-PVQxLC6I.js";
import { n as formatAuthChoiceChoicesForCli } from "./auth-choice-options-mnJuKKBX.js";
import "./openai-model-default-C6iwMU4X.js";
import "./model-picker-LOJMJKTb.js";
import "./systemd-linger-B8oXYjfA.js";
import "./onboard-custom-CXYp17dF.js";
import { n as ONBOARD_PROVIDER_AUTH_FLAGS, t as onboardCommand } from "./onboard-B2nJAHOW.js";

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
	const command = program.command("onboard").description("Interactive wizard to set up the gateway, workspace, and skills").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/onboard", "docs.openclaw.ai/cli/onboard")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace)").option("--reset", "Reset config + credentials + sessions + workspace before running wizard").option("--non-interactive", "Run without prompts", false).option("--accept-risk", "Acknowledge that agents are powerful and full system access is risky (required for --non-interactive)", false).option("--flow <flow>", "Wizard flow: quickstart|advanced|manual").option("--mode <mode>", "Wizard mode: local|remote").option("--auth-choice <choice>", `Auth: ${AUTH_CHOICE_HELP}`).option("--token-provider <id>", "Token provider id (non-interactive; used with --auth-choice token)").option("--token <token>", "Token value (non-interactive; used with --auth-choice token)").option("--token-profile-id <id>", "Auth profile id (non-interactive; default: <provider>:manual)").option("--token-expires-in <duration>", "Optional token expiry duration (e.g. 365d, 12h)").option("--cloudflare-ai-gateway-account-id <id>", "Cloudflare Account ID").option("--cloudflare-ai-gateway-gateway-id <id>", "Cloudflare AI Gateway ID");
	for (const providerFlag of ONBOARD_PROVIDER_AUTH_FLAGS) command.option(providerFlag.cliOption, providerFlag.description);
	command.option("--custom-base-url <url>", "Custom provider base URL").option("--custom-api-key <key>", "Custom provider API key (optional)").option("--custom-model-id <id>", "Custom provider model ID").option("--custom-provider-id <id>", "Custom provider ID (optional; auto-derived by default)").option("--custom-compatibility <mode>", "Custom provider API compatibility: openai|anthropic (default: openai)").option("--gateway-port <port>", "Gateway port").option("--gateway-bind <mode>", "Gateway bind: loopback|tailnet|lan|auto|custom").option("--gateway-auth <mode>", "Gateway auth: token|password").option("--gateway-token <token>", "Gateway token (token auth)").option("--gateway-password <password>", "Gateway password (password auth)").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").option("--tailscale <mode>", "Tailscale: off|serve|funnel").option("--tailscale-reset-on-exit", "Reset tailscale serve/funnel on exit").option("--install-daemon", "Install gateway service").option("--no-install-daemon", "Skip gateway service install").option("--skip-daemon", "Skip gateway service install").option("--daemon-runtime <runtime>", "Daemon runtime: node|bun").option("--skip-channels", "Skip channel setup").option("--skip-skills", "Skip skills setup").option("--skip-health", "Skip health check").option("--skip-ui", "Skip Control UI/TUI prompts").option("--node-manager <name>", "Node manager for skills: npm|pnpm|bun").option("--json", "Output JSON summary", false);
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
				anthropicApiKey: opts.anthropicApiKey,
				openaiApiKey: opts.openaiApiKey,
				openrouterApiKey: opts.openrouterApiKey,
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
				gatewayPassword: opts.gatewayPassword,
				remoteUrl: opts.remoteUrl,
				remoteToken: opts.remoteToken,
				tailscale: opts.tailscale,
				tailscaleResetOnExit: Boolean(opts.tailscaleResetOnExit),
				reset: Boolean(opts.reset),
				installDaemon,
				daemonRuntime: opts.daemonRuntime,
				skipChannels: Boolean(opts.skipChannels),
				skipSkills: Boolean(opts.skipSkills),
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