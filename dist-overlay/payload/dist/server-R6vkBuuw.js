import "./paths-B4BZAPZh.js";
import "./utils-BvKkAKT3.js";
import "./agent-scope-D8gw-U5c.js";
import { t as createSubsystemLogger } from "./subsystem-Bqlcd6-a.js";
import "./exec-CAIB93jD.js";
import "./model-selection-BnthIvhe.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-BgXe2hyu.js";
import "./env-SxoKgHK1.js";
import "./host-env-security-ljCLeQmh.js";
import { i as loadConfig } from "./config-Ca77L3N1.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-L8eulu9n.js";
import "./chrome-BBeY99fu.js";
import "./tailscale-Cu00fx92.js";
import "./ip-D6hQ9Srg.js";
import "./tailnet-QICRxDwG.js";
import "./ws-D1QB-fai.js";
import "./auth-Bxx2VNC9.js";
import { i as resolveBrowserConfig, o as ensureBrowserControlAuth, r as registerBrowserRoutes, s as resolveBrowserControlAuth, t as createBrowserRouteContext } from "./server-context-GXNpKSjl.js";
import "./redact-FwcF9gh5.js";
import "./errors-B4zBevhh.js";
import "./fs-safe-DwCRJYoe.js";
import "./paths-DJ0CRxTh.js";
import "./ssrf-Bw0uz5oO.js";
import "./image-ops-De8KI3uW.js";
import "./store-BCXyE2P-.js";
import "./ports-C0wnBxwM.js";
import "./trash-BgvPEBCw.js";
import { n as installBrowserCommonMiddleware, t as installBrowserAuthMiddleware } from "./server-middleware-DfaRJTWr.js";
import { n as stopKnownBrowserProfiles, t as ensureExtensionRelayForProfiles } from "./server-lifecycle-C-16QIND.js";
import { t as isPwAiLoaded } from "./tool-loop-detection-Ck6LbMx_.js";
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
	try {
		const ensured = await ensureBrowserControlAuth({ cfg });
		browserAuth = ensured.auth;
		if (ensured.generatedToken) logServer.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logServer.warn(`failed to auto-configure browser auth: ${String(err)}`);
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
		await (await import("./pw-ai-CIXMzeg0.js")).closePlaywrightBrowserConnection();
	} catch {}
}

//#endregion
export { startBrowserControlServerFromConfig, stopBrowserControlServer };