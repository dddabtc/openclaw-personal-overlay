import "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import { t as createSubsystemLogger } from "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import { H as loadConfig } from "./auth-profiles-B1GaQT5q.js";
import "./agent-scope-Da1EU5GK.js";
import "./utils-C5WN6czr.js";
import "./openclaw-root-CUd_d2ed.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-CuX_zqg5.js";
import "./image-ops-DKf0L-bN.js";
import "./chrome-BYPs9otD.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-D6G15e7J.js";
import "./ws-Z0GdyNOg.js";
import "./auth-DdEjESsp.js";
import "./credentials-BmtdMaC0.js";
import "./resolve-configured-secret-input-string-Cjny1Pmf.js";
import { c as resolveBrowserControlAuth, i as resolveBrowserConfig, r as registerBrowserRoutes, s as ensureBrowserControlAuth, t as createBrowserRouteContext } from "./server-context-L6JZ3V1F.js";
import "./path-alias-guards-a82xwrK5.js";
import "./paths-DELgyEUB.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-Dyd9x5R1.js";
import "./proxy-env-DQF_ZEGo.js";
import "./store-XprJI9yK.js";
import "./ports-CTMzENnh.js";
import "./trash-CsUKAlUm.js";
import { n as installBrowserCommonMiddleware, t as installBrowserAuthMiddleware } from "./server-middleware-UHVTx4Wc.js";
import { n as stopKnownBrowserProfiles, t as ensureExtensionRelayForProfiles } from "./server-lifecycle-Cg-nDG7u.js";
import { t as isPwAiLoaded } from "./runtime-whatsapp-login.runtime-B3x1W-9w.js";
import express from "express";
//#region src/browser/server.ts
let state = null;
const logServer = createSubsystemLogger("browser").child("server");
async function startBrowserControlServerFromConfig() {
	if (state) return state;
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	if (!resolved.enabled) return null;
	let browserAuth = resolveBrowserControlAuth(cfg);
	let browserAuthBootstrapFailed = false;
	try {
		const ensured = await ensureBrowserControlAuth({ cfg });
		browserAuth = ensured.auth;
		if (ensured.generatedToken) logServer.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logServer.warn(`failed to auto-configure browser auth: ${String(err)}`);
		browserAuthBootstrapFailed = true;
	}
	if (browserAuthBootstrapFailed && !browserAuth.token && !browserAuth.password) {
		logServer.error("browser control startup aborted: authentication bootstrap failed and no fallback auth is configured.");
		return null;
	}
	const app = express();
	installBrowserCommonMiddleware(app);
	installBrowserAuthMiddleware(app, browserAuth);
	registerBrowserRoutes(app, createBrowserRouteContext({
		getState: () => state,
		refreshConfigFromDisk: true
	}));
	const port = resolved.controlPort;
	const server = await new Promise((resolve, reject) => {
		const s = app.listen(port, "127.0.0.1", () => resolve(s));
		s.once("error", reject);
	}).catch((err) => {
		logServer.error(`openclaw browser server failed to bind 127.0.0.1:${port}: ${String(err)}`);
		return null;
	});
	if (!server) return null;
	state = {
		server,
		port,
		resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	await ensureExtensionRelayForProfiles({
		resolved,
		onWarn: (message) => logServer.warn(message)
	});
	const authMode = browserAuth.token ? "token" : browserAuth.password ? "password" : "off";
	logServer.info(`Browser control listening on http://127.0.0.1:${port}/ (auth=${authMode})`);
	return state;
}
async function stopBrowserControlServer() {
	const current = state;
	if (!current) return;
	await stopKnownBrowserProfiles({
		getState: () => state,
		onWarn: (message) => logServer.warn(message)
	});
	if (current.server) await new Promise((resolve) => {
		current.server?.close(() => resolve());
	});
	state = null;
	if (isPwAiLoaded()) try {
		await (await import("./pw-ai-CUBD88fb.js")).closePlaywrightBrowserConnection();
	} catch {}
}
//#endregion
export { startBrowserControlServerFromConfig, stopBrowserControlServer };
