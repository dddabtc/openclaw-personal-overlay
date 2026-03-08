import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import { f as defaultRuntime } from "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-D6r73dBV.js";
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
import "./dock-B6YZ_Gqv.js";
import "./plugins-BVlyTb8F.js";
import "./accounts-BwOHHQBZ.js";
import "./channel-config-helpers-CsB6X81V.js";
import "./accounts-araUYuXY.js";
import "./image-ops-DKf0L-bN.js";
import "./message-channel-Be-gqLbb.js";
import "./pi-embedded-helpers-C4ix-hp8.js";
import "./sandbox-DOMl4h_t.js";
import "./tool-catalog-CFg6jrp9.js";
import "./chrome-Dg_bOpEm.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-Cw5P8QcH.js";
import "./ws-D5Iy1RWM.js";
import "./auth--ay9gpm5.js";
import "./credentials-C1NEYRqY.js";
import "./resolve-configured-secret-input-string-B5ySloY0.js";
import "./server-context-n4lVlkbM.js";
import "./frontmatter-CDYnjLEC.js";
import "./env-overrides-BeDt30xz.js";
import "./path-alias-guards-a82xwrK5.js";
import "./skills-CGqwYVbO.js";
import "./paths-DELgyEUB.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-Dyd9x5R1.js";
import "./proxy-env-CEo90XCC.js";
import "./store-XprJI9yK.js";
import "./ports-CTMzENnh.js";
import "./trash-CsUKAlUm.js";
import "./server-middleware-CL0tGa0R.js";
import "./sessions-DT6AYWRn.js";
import "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./tool-images-CnTjIKsB.js";
import "./thinking-DykY2Fzj.js";
import "./tool-display-B1jaCPlW.js";
import "./commands--Xt5HXe3.js";
import "./commands-registry-Yve0npkG.js";
import "./call-B6w9tujD.js";
import "./pairing-token-DSWSMr10.js";
import { t as parseTimeoutMs } from "./parse-timeout-Dsusbt0U.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { t as runTui } from "./tui-QtSGkYCq.js";
//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}
//#endregion
export { registerTuiCli };
