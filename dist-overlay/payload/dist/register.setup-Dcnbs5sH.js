import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import { f as defaultRuntime } from "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import { Y as writeConfigFile, z as createConfigIO } from "./auth-profiles-D6r73dBV.js";
import { E as ensureAgentWorkspace, _ as DEFAULT_AGENT_WORKSPACE_DIR } from "./agent-scope-Da1EU5GK.js";
import { x as shortenHomePath } from "./utils-C5WN6czr.js";
import "./openclaw-root-CUd_d2ed.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-CuX_zqg5.js";
import "./dock-B6YZ_Gqv.js";
import "./plugins-BVlyTb8F.js";
import "./accounts-BwOHHQBZ.js";
import "./channel-config-helpers-CsB6X81V.js";
import "./accounts-araUYuXY.js";
import "./message-channel-Be-gqLbb.js";
import "./tailnet-Cw5P8QcH.js";
import "./ws-D5Iy1RWM.js";
import "./credentials-C1NEYRqY.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./sessions-DT6AYWRn.js";
import { o as resolveSessionTranscriptsDir } from "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./call-B6w9tujD.js";
import "./pairing-token-DSWSMr10.js";
import "./onboard-helpers-ljIuaQk5.js";
import "./prompt-style-Bcr283QM.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { n as runCommandWithRuntime } from "./cli-utils-DNej4wZu.js";
import "./progress-fMgIMdPa.js";
import { t as hasExplicitOptions } from "./command-options-C578vcye.js";
import "./note-DITQCNUf.js";
import "./clack-prompter-TjBORd0f.js";
import "./runtime-guard-CGqgXWWP.js";
import "./onboarding.secret-input-CL5IBGDy.js";
import "./onboarding-DDA_fAJO.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-BfIBddi5.js";
import { t as onboardCommand } from "./onboard-BZn9hcdD.js";
import JSON5 from "json5";
import fsPromises from "node:fs/promises";
//#region src/commands/setup.ts
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fsPromises.readFile(configPath, "utf-8");
		const parsed = JSON5.parse(raw);
		if (parsed && typeof parsed === "object") return {
			exists: true,
			parsed
		};
		return {
			exists: true,
			parsed: {}
		};
	} catch {
		return {
			exists: false,
			parsed: {}
		};
	}
}
async function setupCommand(opts, runtime = defaultRuntime) {
	const desiredWorkspace = typeof opts?.workspace === "string" && opts.workspace.trim() ? opts.workspace.trim() : void 0;
	const configPath = createConfigIO().configPath;
	const existingRaw = await readConfigFileRaw(configPath);
	const cfg = existingRaw.parsed;
	const defaults = cfg.agents?.defaults ?? {};
	const workspace = desiredWorkspace ?? defaults.workspace ?? DEFAULT_AGENT_WORKSPACE_DIR;
	const next = {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				workspace
			}
		}
	};
	if (!existingRaw.exists || defaults.workspace !== workspace) {
		await writeConfigFile(next);
		if (!existingRaw.exists) runtime.log(`Wrote ${formatConfigPath(configPath)}`);
		else logConfigUpdated(runtime, {
			path: configPath,
			suffix: "(set agents.defaults.workspace)"
		});
	} else runtime.log(`Config OK: ${formatConfigPath(configPath)}`);
	const ws = await ensureAgentWorkspace({
		dir: workspace,
		ensureBootstrapFiles: !next.agents?.defaults?.skipBootstrap
	});
	runtime.log(`Workspace OK: ${shortenHomePath(ws.dir)}`);
	const sessionsDir = resolveSessionTranscriptsDir();
	await fsPromises.mkdir(sessionsDir, { recursive: true });
	runtime.log(`Sessions OK: ${shortenHomePath(sessionsDir)}`);
}
//#endregion
//#region src/cli/program/register.setup.ts
function registerSetupCommand(program) {
	program.command("setup").description("Initialize ~/.openclaw/openclaw.json and the agent workspace").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.openclaw.ai/cli/setup")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)").option("--wizard", "Run the interactive onboarding wizard", false).option("--non-interactive", "Run the wizard without prompts", false).option("--mode <mode>", "Wizard mode: local|remote").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasWizardFlags = hasExplicitOptions(command, [
				"wizard",
				"nonInteractive",
				"mode",
				"remoteUrl",
				"remoteToken"
			]);
			if (opts.wizard || hasWizardFlags) {
				await onboardCommand({
					workspace: opts.workspace,
					nonInteractive: Boolean(opts.nonInteractive),
					mode: opts.mode,
					remoteUrl: opts.remoteUrl,
					remoteToken: opts.remoteToken
				}, defaultRuntime);
				return;
			}
			await setupCommand({ workspace: opts.workspace }, defaultRuntime);
		});
	});
}
//#endregion
export { registerSetupCommand };
