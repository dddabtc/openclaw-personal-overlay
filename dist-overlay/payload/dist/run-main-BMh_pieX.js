import { _ as defaultRuntime, an as getPrimaryCommand, c as enableConsoleCapture, cn as hasHelpOrVersion, en as normalizeWindowsArgv, i as normalizeEnv, in as getPositiveIntFlagValue, n as isTruthyEnvValue, nn as getCommandPath, on as getVerboseFlag, rn as getFlagValue, sn as hasFlag } from "./entry.js";
import "./auth-profiles-C7RTY9Sv.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-DhajVyRS.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-ChKLb_d2.js";
import "./pi-model-discovery-Do3xMEtM.js";
import "./frontmatter-D8KtsA8M.js";
import "./skills-eYanxJfv.js";
import "./manifest-registry-XSxPcu0S.js";
import { H as VERSION, W as loadDotEnv } from "./config-BBNa7O_8.js";
import "./client-DrK7aLru.js";
import "./call-DMOW0wPs.js";
import "./message-channel-CVHJDItx.js";
import "./pairing-token-Byh6drgn.js";
import "./subagent-registry-Cc0kGCxw.js";
import "./sessions-BfWM-oFg.js";
import "./tokens-ANnYrShl.js";
import "./plugins-Dhh2a3qc.js";
import "./accounts-BrsscXpo.js";
import "./bindings-BO7DQ_-I.js";
import "./logging-CFvkxgcX.js";
import "./send-CwH6VQLi.js";
import "./send-znMAbXL-.js";
import "./with-timeout-CAOVAeKU.js";
import "./deliver-CLUHfJ7h.js";
import "./diagnostic-C6WTf4ZE.js";
import "./diagnostic-session-state-CIjIGxEE.js";
import "./accounts-1gFWxwAw.js";
import "./send-CKMBUMOp.js";
import "./image-ops-CKJNUuNW.js";
import "./pi-embedded-helpers-N0lTe6ZJ.js";
import "./sandbox-D-5UkuzR.js";
import "./chrome-DGy95ia1.js";
import "./tailscale-BxzsxqAY.js";
import "./auth-BcWLEKcS.js";
import "./server-context-BbjbRa1R.js";
import "./routes-2DlmfGiB.js";
import "./redact-B40lik2B.js";
import { r as formatUncaughtError } from "./errors-Ba_ROWsq.js";
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
import "./models-config-DLZ0qBzl.js";
import "./reply-prefix-D4RfrCeP.js";
import "./memory-cli-0uYtPYU9.js";
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
import "./image-nIqLhzdC.js";
import "./tool-display-DixohEVL.js";
import "./session-utils-DNUUPY87.js";
import "./session-cost-usage-Dfx7NHjv.js";
import { u as installUnhandledRejectionHandler } from "./runner-DmUzWvVT.js";
import "./model-catalog-jsoULWdH.js";
import "./skill-commands-BMTXwSBr.js";
import "./workspace-dirs-Dw0EowUJ.js";
import "./pairing-store-BqeL7tj7.js";
import "./fetch-DOex5qYK.js";
import "./exec-approvals-BKZqQjp9.js";
import "./nodes-screen-DCJNznUw.js";
import "./channel-activity-myOnmDZi.js";
import "./tables-CKA-N6SU.js";
import "./control-service-Br6yHjdV.js";
import "./stagger-CQar2eKe.js";
import "./channel-selection-D5cjTEHf.js";
import "./send-DN_eMvo5.js";
import "./outbound-attachment-Bc9bVXwP.js";
import "./delivery-queue-CzNZXd1M.js";
import "./send-WjkKwPZi.js";
import "./resolve-route-C4DUT14V.js";
import "./proxy-DL3MD6-P.js";
import "./links-CW8Bx7rK.js";
import "./cli-utils-CCaEbxAz.js";
import "./help-format-B0pWGnZs.js";
import "./progress-BAHiAaDW.js";
import "./replies-DtqrCcMt.js";
import "./onboard-helpers-VhYln9Mp.js";
import "./prompt-style-DwCXob2h.js";
import "./pairing-labels-D4ymYAjE.js";
import "./pi-tools.policy-CrxWkGkW.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-Co_fin1B.js";
import "./catalog-Da8o-cxw.js";
import "./note-DDecZomM.js";
import "./plugin-auto-enable-Ccy8kRB0.js";
import { t as ensurePluginRegistryLoaded } from "./plugin-registry-W0sy-P-W.js";
import { t as assertSupportedRuntime } from "./runtime-guard-Cs_ClFhP.js";
import { t as emitCliBanner } from "./banner-vy5Ya0j3.js";
import "./doctor-config-flow-B56YiWzx.js";
import { n as ensureConfigReady } from "./config-guard-BgpZLSVg.js";
import process$1 from "node:process";
import { fileURLToPath } from "node:url";

//#region src/cli/program/routes.ts
const routeHealth = {
	match: (path) => path[0] === "health",
	loadPlugins: true,
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
		if (timeoutMs === null) return false;
		const { healthCommand } = await import("./health-Bt4gX0UL.js").then((n) => n.i);
		await healthCommand({
			json,
			timeoutMs,
			verbose
		}, defaultRuntime);
		return true;
	}
};
const routeStatus = {
	match: (path) => path[0] === "status",
	loadPlugins: true,
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const deep = hasFlag(argv, "--deep");
		const all = hasFlag(argv, "--all");
		const usage = hasFlag(argv, "--usage");
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
		if (timeoutMs === null) return false;
		const { statusCommand } = await import("./status-CUxEKIov.js").then((n) => n.t);
		await statusCommand({
			json,
			deep,
			all,
			usage,
			timeoutMs,
			verbose
		}, defaultRuntime);
		return true;
	}
};
const routeSessions = {
	match: (path) => path[0] === "sessions",
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const store = getFlagValue(argv, "--store");
		if (store === null) return false;
		const active = getFlagValue(argv, "--active");
		if (active === null) return false;
		const { sessionsCommand } = await import("./sessions-oaFWA5wv.js").then((n) => n.n);
		await sessionsCommand({
			json,
			store,
			active
		}, defaultRuntime);
		return true;
	}
};
const routeAgentsList = {
	match: (path) => path[0] === "agents" && path[1] === "list",
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const bindings = hasFlag(argv, "--bindings");
		const { agentsListCommand } = await import("./agents-DHiCW7h6.js").then((n) => n.t);
		await agentsListCommand({
			json,
			bindings
		}, defaultRuntime);
		return true;
	}
};
const routeMemoryStatus = {
	match: (path) => path[0] === "memory" && path[1] === "status",
	run: async (argv) => {
		const agent = getFlagValue(argv, "--agent");
		if (agent === null) return false;
		const json = hasFlag(argv, "--json");
		const deep = hasFlag(argv, "--deep");
		const index = hasFlag(argv, "--index");
		const verbose = hasFlag(argv, "--verbose");
		const { runMemoryStatus } = await import("./memory-cli-0uYtPYU9.js").then((n) => n.t);
		await runMemoryStatus({
			agent,
			json,
			deep,
			index,
			verbose
		});
		return true;
	}
};
function getCommandPositionals(argv) {
	const out = [];
	const args = argv.slice(2);
	for (const arg of args) {
		if (!arg || arg === "--") break;
		if (arg.startsWith("-")) continue;
		out.push(arg);
	}
	return out;
}
function getFlagValues(argv, name) {
	const values = [];
	const args = argv.slice(2);
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (!arg || arg === "--") break;
		if (arg === name) {
			const next = args[i + 1];
			if (!next || next === "--" || next.startsWith("-")) return null;
			values.push(next);
			i += 1;
			continue;
		}
		if (arg.startsWith(`${name}=`)) {
			const value = arg.slice(name.length + 1).trim();
			if (!value) return null;
			values.push(value);
		}
	}
	return values;
}
const routes = [
	routeHealth,
	routeStatus,
	routeSessions,
	routeAgentsList,
	routeMemoryStatus,
	{
		match: (path) => path[0] === "config" && path[1] === "get",
		run: async (argv) => {
			const pathArg = getCommandPositionals(argv)[2];
			if (!pathArg) return false;
			const json = hasFlag(argv, "--json");
			const { runConfigGet } = await import("./config-cli-DasmrZdk.js");
			await runConfigGet({
				path: pathArg,
				json
			});
			return true;
		}
	},
	{
		match: (path) => path[0] === "config" && path[1] === "unset",
		run: async (argv) => {
			const pathArg = getCommandPositionals(argv)[2];
			if (!pathArg) return false;
			const { runConfigUnset } = await import("./config-cli-DasmrZdk.js");
			await runConfigUnset({ path: pathArg });
			return true;
		}
	},
	{
		match: (path) => path[0] === "models" && path[1] === "list",
		run: async (argv) => {
			const provider = getFlagValue(argv, "--provider");
			if (provider === null) return false;
			const all = hasFlag(argv, "--all");
			const local = hasFlag(argv, "--local");
			const json = hasFlag(argv, "--json");
			const plain = hasFlag(argv, "--plain");
			const { modelsListCommand } = await import("./models-C7JZNiEE.js").then((n) => n.t);
			await modelsListCommand({
				all,
				local,
				provider,
				json,
				plain
			}, defaultRuntime);
			return true;
		}
	},
	{
		match: (path) => path[0] === "models" && path[1] === "status",
		run: async (argv) => {
			const probeProvider = getFlagValue(argv, "--probe-provider");
			if (probeProvider === null) return false;
			const probeTimeout = getFlagValue(argv, "--probe-timeout");
			if (probeTimeout === null) return false;
			const probeConcurrency = getFlagValue(argv, "--probe-concurrency");
			if (probeConcurrency === null) return false;
			const probeMaxTokens = getFlagValue(argv, "--probe-max-tokens");
			if (probeMaxTokens === null) return false;
			const agent = getFlagValue(argv, "--agent");
			if (agent === null) return false;
			const probeProfileValues = getFlagValues(argv, "--probe-profile");
			if (probeProfileValues === null) return false;
			const probeProfile = probeProfileValues.length === 0 ? void 0 : probeProfileValues.length === 1 ? probeProfileValues[0] : probeProfileValues;
			const json = hasFlag(argv, "--json");
			const plain = hasFlag(argv, "--plain");
			const check = hasFlag(argv, "--check");
			const probe = hasFlag(argv, "--probe");
			const { modelsStatusCommand } = await import("./models-C7JZNiEE.js").then((n) => n.t);
			await modelsStatusCommand({
				json,
				plain,
				check,
				probe,
				probeProvider,
				probeProfile,
				probeTimeout,
				probeConcurrency,
				probeMaxTokens,
				agent
			}, defaultRuntime);
			return true;
		}
	}
];
function findRoutedCommand(path) {
	for (const route of routes) if (route.match(path)) return route;
	return null;
}

//#endregion
//#region src/cli/route.ts
async function prepareRoutedCommand(params) {
	emitCliBanner(VERSION, { argv: params.argv });
	await ensureConfigReady({
		runtime: defaultRuntime,
		commandPath: params.commandPath
	});
	if (params.loadPlugins) ensurePluginRegistryLoaded();
}
async function tryRouteCli(argv) {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_ROUTE_FIRST)) return false;
	if (hasHelpOrVersion(argv)) return false;
	const path = getCommandPath(argv, 2);
	if (!path[0]) return false;
	const route = findRoutedCommand(path);
	if (!route) return false;
	await prepareRoutedCommand({
		argv,
		commandPath: path,
		loadPlugins: route.loadPlugins
	});
	return route.run(argv);
}

//#endregion
//#region src/cli/run-main.ts
function rewriteUpdateFlagArgv(argv) {
	const index = argv.indexOf("--update");
	if (index === -1) return argv;
	const next = [...argv];
	next.splice(index, 1, "update");
	return next;
}
function shouldSkipPluginCommandRegistration(params) {
	if (params.hasBuiltinPrimary) return true;
	if (!params.primary) return hasHelpOrVersion(params.argv);
	return false;
}
function shouldEnsureCliPath(argv) {
	if (hasHelpOrVersion(argv)) return false;
	const [primary, secondary] = getCommandPath(argv, 2);
	if (!primary) return true;
	if (primary === "status" || primary === "health" || primary === "sessions") return false;
	if (primary === "config" && (secondary === "get" || secondary === "unset")) return false;
	if (primary === "models" && (secondary === "list" || secondary === "status")) return false;
	return true;
}
async function runCli(argv = process$1.argv) {
	const normalizedArgv = normalizeWindowsArgv(argv);
	loadDotEnv({ quiet: true });
	normalizeEnv();
	if (shouldEnsureCliPath(normalizedArgv)) ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	if (await tryRouteCli(normalizedArgv)) return;
	enableConsoleCapture();
	const { buildProgram } = await import("./program-BYPYltUm.js");
	const program = buildProgram();
	installUnhandledRejectionHandler();
	process$1.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process$1.exit(1);
	});
	const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
	const primary = getPrimaryCommand(parseArgv);
	if (primary) {
		const { getProgramContext } = await import("./program-context-5q-A0wbP.js").then((n) => n.n);
		const ctx = getProgramContext(program);
		if (ctx) {
			const { registerCoreCliByName } = await import("./command-registry-DPuNHdfh.js").then((n) => n.t);
			await registerCoreCliByName(program, ctx, primary, parseArgv);
		}
		const { registerSubCliByName } = await import("./register.subclis-BhZCfkOS.js").then((n) => n.a);
		await registerSubCliByName(program, primary);
	}
	if (!shouldSkipPluginCommandRegistration({
		argv: parseArgv,
		primary,
		hasBuiltinPrimary: primary !== null && program.commands.some((command) => command.name() === primary)
	})) {
		const { registerPluginCliCommands } = await import("./cli-BpHvBYj5.js");
		const { loadConfig } = await import("./config-BBNa7O_8.js").then((n) => n.t);
		registerPluginCliCommands(program, loadConfig());
	}
	await program.parseAsync(parseArgv);
}

//#endregion
export { runCli };