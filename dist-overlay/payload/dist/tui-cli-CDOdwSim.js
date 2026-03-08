import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import { f as defaultRuntime } from "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-5CHn7vq1.js";
import "./agent-scope-DF-nzI8H.js";
import "./utils-C5WN6czr.js";
import "./openclaw-root-DFJGXT24.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-Ba187z7Z.js";
import "./dock-BgGWFqHm.js";
import "./plugins-BkoiCBu-.js";
import "./accounts-LPEl32gb.js";
import "./channel-config-helpers-BDId9EPL.js";
import "./accounts-_PYzdhne.js";
import "./image-ops-CQrO7d64.js";
import "./message-channel-Be-gqLbb.js";
import "./pi-embedded-helpers-B7bn2aDM.js";
import "./sandbox-BTeDGNMJ.js";
import "./tool-catalog-CFg6jrp9.js";
import "./chrome-DmtcwLP7.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-BuB4hnEo.js";
import "./ws-Bjkel2eG.js";
import "./auth-DgIL-BOU.js";
import "./credentials-C5dZtBqt.js";
import "./resolve-configured-secret-input-string-BGiZkpTb.js";
import "./server-context-BP-G8-mB.js";
import "./frontmatter-CDYnjLEC.js";
import "./env-overrides-BeDt30xz.js";
import "./path-alias-guards-D_v2YTP8.js";
import "./skills-B3eXdmA5.js";
import "./paths-DBHbY8ck.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-n_u5Hqlt.js";
import "./proxy-env-B1SW3C2U.js";
import "./store-kjkrRAMQ.js";
import "./ports-DOBLq-G-.js";
import "./trash-CsUKAlUm.js";
import "./server-middleware-C6_5AADb.js";
import "./sessions-DVRA-cO-.js";
import "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./tool-images-BnvE1YX0.js";
import "./thinking-DykY2Fzj.js";
import "./tool-display-B1jaCPlW.js";
import "./commands-BNTk8Bcu.js";
import "./commands-registry-l51VuG0m.js";
import "./call-jim2IS_j.js";
import "./pairing-token-DSWSMr10.js";
import { t as parseTimeoutMs } from "./parse-timeout-Dsusbt0U.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { t as runTui } from "./tui-CJF2d0ZX.js";
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
