import { Z as escapeRegExp, s as createSubsystemLogger } from "./entry.js";
import { at as extractShellWrapperCommand, dt as unwrapDispatchWrappersForResolution, i as loadConfig, pt as unwrapKnownShellMultiplexerInvocation, st as hasEnvManipulationBeforeShellWrapper, ut as normalizeExecutableToken } from "./config-CaJqgOvf.js";
import { i as resolveBrowserConfig, o as ensureBrowserControlAuth, r as registerBrowserRoutes, t as createBrowserRouteContext } from "./server-context-CWN_iNA_.js";
import { t as ensureExtensionRelayForProfiles } from "./server-lifecycle-B1onAHEw.js";
import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";

//#region src/infra/machine-name.ts
const execFileAsync = promisify(execFile);
let cachedPromise = null;
async function tryScutil(key) {
	try {
		const { stdout } = await execFileAsync("/usr/sbin/scutil", ["--get", key], {
			timeout: 1e3,
			windowsHide: true
		});
		const value = String(stdout ?? "").trim();
		return value.length > 0 ? value : null;
	} catch {
		return null;
	}
}
function fallbackHostName() {
	return os.hostname().replace(/\.local$/i, "").trim() || "openclaw";
}
async function getMachineDisplayName() {
	if (cachedPromise) return cachedPromise;
	cachedPromise = (async () => {
		if (process.env.VITEST || false) return fallbackHostName();
		if (process.platform === "darwin") {
			const computerName = await tryScutil("ComputerName");
			if (computerName) return computerName;
			const localHostName = await tryScutil("LocalHostName");
			if (localHostName) return localHostName;
		}
		return fallbackHostName();
	})();
	return cachedPromise;
}

//#endregion
//#region src/browser/control-service.ts
let state = null;
const logService = createSubsystemLogger("browser").child("service");
function createBrowserControlContext() {
	return createBrowserRouteContext({
		getState: () => state,
		refreshConfigFromDisk: true
	});
}
async function startBrowserControlServiceFromConfig() {
	if (state) return state;
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	if (!resolved.enabled) return null;
	try {
		if ((await ensureBrowserControlAuth({ cfg })).generatedToken) logService.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logService.warn(`failed to auto-configure browser auth: ${String(err)}`);
	}
	state = {
		server: null,
		port: resolved.controlPort,
		resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	await ensureExtensionRelayForProfiles({
		resolved,
		onWarn: (message) => logService.warn(message)
	});
	logService.info(`Browser control service ready (profiles=${Object.keys(resolved.profiles).length})`);
	return state;
}

//#endregion
//#region src/browser/routes/dispatcher.ts
function compileRoute(path) {
	const paramNames = [];
	const parts = path.split("/").map((part) => {
		if (part.startsWith(":")) {
			const name = part.slice(1);
			paramNames.push(name);
			return "([^/]+)";
		}
		return escapeRegExp(part);
	});
	return {
		regex: new RegExp(`^${parts.join("/")}$`),
		paramNames
	};
}
function createRegistry() {
	const routes = [];
	const register = (method) => (path, handler) => {
		const { regex, paramNames } = compileRoute(path);
		routes.push({
			method,
			path,
			regex,
			paramNames,
			handler
		});
	};
	return {
		routes,
		router: {
			get: register("GET"),
			post: register("POST"),
			delete: register("DELETE")
		}
	};
}
function normalizePath(path) {
	if (!path) return "/";
	return path.startsWith("/") ? path : `/${path}`;
}
function createBrowserRouteDispatcher(ctx) {
	const registry = createRegistry();
	registerBrowserRoutes(registry.router, ctx);
	return { dispatch: async (req) => {
		const method = req.method;
		const path = normalizePath(req.path);
		const query = req.query ?? {};
		const body = req.body;
		const signal = req.signal;
		const match = registry.routes.find((route) => {
			if (route.method !== method) return false;
			return route.regex.test(path);
		});
		if (!match) return {
			status: 404,
			body: { error: "Not Found" }
		};
		const exec = match.regex.exec(path);
		const params = {};
		if (exec) for (const [idx, name] of match.paramNames.entries()) {
			const value = exec[idx + 1];
			if (typeof value === "string") params[name] = decodeURIComponent(value);
		}
		let status = 200;
		let payload = void 0;
		const res = {
			status(code) {
				status = code;
				return res;
			},
			json(bodyValue) {
				payload = bodyValue;
			}
		};
		try {
			await match.handler({
				params,
				query,
				body,
				signal
			}, res);
		} catch (err) {
			return {
				status: 500,
				body: { error: String(err) }
			};
		}
		return {
			status,
			body: payload
		};
	} };
}

//#endregion
//#region src/infra/system-run-command.ts
function formatExecCommand(argv) {
	return argv.map((arg) => {
		if (arg.length === 0) return "\"\"";
		if (!/\s|"/.test(arg)) return arg;
		return `"${arg.replace(/"/g, "\\\"")}"`;
	}).join(" ");
}
const POSIX_OR_POWERSHELL_INLINE_WRAPPER_NAMES = new Set([
	"ash",
	"bash",
	"dash",
	"fish",
	"ksh",
	"powershell",
	"pwsh",
	"sh",
	"zsh"
]);
const POSIX_INLINE_COMMAND_FLAGS = new Set([
	"-lc",
	"-c",
	"--command"
]);
const POWERSHELL_INLINE_COMMAND_FLAGS = new Set([
	"-c",
	"-command",
	"--command"
]);
function unwrapShellWrapperArgv(argv) {
	const dispatchUnwrapped = unwrapDispatchWrappersForResolution(argv);
	const shellMultiplexer = unwrapKnownShellMultiplexerInvocation(dispatchUnwrapped);
	return shellMultiplexer.kind === "unwrapped" ? shellMultiplexer.argv : dispatchUnwrapped;
}
function resolveInlineCommandTokenIndex(argv, flags, options = {}) {
	for (let i = 1; i < argv.length; i += 1) {
		const token = argv[i]?.trim();
		if (!token) continue;
		const lower = token.toLowerCase();
		if (lower === "--") break;
		if (flags.has(lower)) return i + 1 < argv.length ? i + 1 : null;
		if (options.allowCombinedC && /^-[^-]*c[^-]*$/i.test(token)) {
			const commandIndex = lower.indexOf("c");
			return token.slice(commandIndex + 1).trim() ? i : i + 1 < argv.length ? i + 1 : null;
		}
	}
	return null;
}
function hasTrailingPositionalArgvAfterInlineCommand(argv) {
	const wrapperArgv = unwrapShellWrapperArgv(argv);
	const token0 = wrapperArgv[0]?.trim();
	if (!token0) return false;
	const wrapper = normalizeExecutableToken(token0);
	if (!POSIX_OR_POWERSHELL_INLINE_WRAPPER_NAMES.has(wrapper)) return false;
	const inlineCommandIndex = wrapper === "powershell" || wrapper === "pwsh" ? resolveInlineCommandTokenIndex(wrapperArgv, POWERSHELL_INLINE_COMMAND_FLAGS) : resolveInlineCommandTokenIndex(wrapperArgv, POSIX_INLINE_COMMAND_FLAGS, { allowCombinedC: true });
	if (inlineCommandIndex === null) return false;
	return wrapperArgv.slice(inlineCommandIndex + 1).some((entry) => entry.trim().length > 0);
}
function validateSystemRunCommandConsistency(params) {
	const raw = typeof params.rawCommand === "string" && params.rawCommand.trim().length > 0 ? params.rawCommand.trim() : null;
	const shellWrapperResolution = extractShellWrapperCommand(params.argv);
	const shellCommand = shellWrapperResolution.command;
	const shellWrapperPositionalArgv = hasTrailingPositionalArgvAfterInlineCommand(params.argv);
	const envManipulationBeforeShellWrapper = shellWrapperResolution.isWrapper && hasEnvManipulationBeforeShellWrapper(params.argv);
	const inferred = shellCommand !== null && !(envManipulationBeforeShellWrapper || shellWrapperPositionalArgv) ? shellCommand.trim() : formatExecCommand(params.argv);
	if (raw && raw !== inferred) return {
		ok: false,
		message: "INVALID_REQUEST: rawCommand does not match command",
		details: {
			code: "RAW_COMMAND_MISMATCH",
			rawCommand: raw,
			inferred
		}
	};
	return {
		ok: true,
		shellCommand: shellCommand !== null ? envManipulationBeforeShellWrapper ? shellCommand : raw ?? shellCommand : null,
		cmdText: raw ?? inferred
	};
}
function resolveSystemRunCommand(params) {
	const raw = typeof params.rawCommand === "string" && params.rawCommand.trim().length > 0 ? params.rawCommand.trim() : null;
	const command = Array.isArray(params.command) ? params.command : [];
	if (command.length === 0) {
		if (raw) return {
			ok: false,
			message: "rawCommand requires params.command",
			details: { code: "MISSING_COMMAND" }
		};
		return {
			ok: true,
			argv: [],
			rawCommand: null,
			shellCommand: null,
			cmdText: ""
		};
	}
	const argv = command.map((v) => String(v));
	const validation = validateSystemRunCommandConsistency({
		argv,
		rawCommand: raw
	});
	if (!validation.ok) return {
		ok: false,
		message: validation.message,
		details: validation.details ?? { code: "RAW_COMMAND_MISMATCH" }
	};
	return {
		ok: true,
		argv,
		rawCommand: raw,
		shellCommand: validation.shellCommand,
		cmdText: validation.cmdText
	};
}

//#endregion
//#region src/node-host/with-timeout.ts
async function withTimeout(work, timeoutMs, label) {
	const resolved = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? Math.max(1, Math.floor(timeoutMs)) : void 0;
	if (!resolved) return await work(void 0);
	const abortCtrl = new AbortController();
	const timeoutError = /* @__PURE__ */ new Error(`${label ?? "request"} timed out`);
	const timer = setTimeout(() => abortCtrl.abort(timeoutError), resolved);
	timer.unref?.();
	let abortListener;
	const abortPromise = abortCtrl.signal.aborted ? Promise.reject(abortCtrl.signal.reason ?? timeoutError) : new Promise((_, reject) => {
		abortListener = () => reject(abortCtrl.signal.reason ?? timeoutError);
		abortCtrl.signal.addEventListener("abort", abortListener, { once: true });
	});
	try {
		return await Promise.race([work(abortCtrl.signal), abortPromise]);
	} finally {
		clearTimeout(timer);
		if (abortListener) abortCtrl.signal.removeEventListener("abort", abortListener);
	}
}

//#endregion
export { createBrowserControlContext as a, createBrowserRouteDispatcher as i, formatExecCommand as n, startBrowserControlServiceFromConfig as o, resolveSystemRunCommand as r, getMachineDisplayName as s, withTimeout as t };