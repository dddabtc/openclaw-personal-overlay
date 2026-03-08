import { Ot as theme, v as defaultRuntime } from "./entry.js";
import "./auth-profiles-VHiPC1-T.js";
import "./agent-scope-DhI_kPU3.js";
import "./exec-TIZD7ZZn.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-DyQuUnEd.js";
import "./frontmatter-17nP3KZr.js";
import "./skills-M3ShrlYm.js";
import "./manifest-registry-BgY5xgMH.js";
import "./config-CaJqgOvf.js";
import "./env-vars-iFkEK4MO.js";
import "./dock-D4HTBK6f.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-r0eCG3qK.js";
import "./plugins-DS5tNvig.js";
import "./accounts-Q2sI0yx1.js";
import "./accounts-DTV7qtJm.js";
import "./accounts-Bgj4wZaj.js";
import "./bindings-BJckG653.js";
import "./logging-CFvkxgcX.js";
import "./paths-DDT5WL2f.js";
import "./chat-envelope-BG_U_muK.js";
import "./client-Bkvpx3HG.js";
import "./call-HfQjDsxN.js";
import "./pairing-token-CtND5y_8.js";
import "./net-C5Xzxz5G.js";
import "./ip-CyOZe5YF.js";
import "./tailnet-CC0kbSg4.js";
import "./image-ops-BtM0q_Kl.js";
import "./pi-embedded-helpers-BaqEyMdl.js";
import "./sandbox-OR4o76Qx.js";
import "./tool-catalog-BS-Gk_Yg.js";
import "./chrome-DoHC6NEx.js";
import "./tailscale-BIikm3VQ.js";
import "./auth-uSllFIea.js";
import "./server-context-CWN_iNA_.js";
import "./redact-Dcypez3H.js";
import "./errors-Cu3BYw29.js";
import "./fs-safe-Cwp1VOPx.js";
import "./paths-Dm4w47Dx.js";
import "./ssrf-D2dYwtfF.js";
import "./store-BnzosEtE.js";
import "./ports-DcKmwJ_3.js";
import "./trash-BqYFVJft.js";
import "./server-middleware-CjPPadc3.js";
import "./tool-images-DCL9xDRg.js";
import "./thinking-Ds3Ekf1K.js";
import "./commands-pdOUas3E.js";
import "./commands-registry-Cx9aOhEa.js";
import "./tool-display-BjKWYkZ_.js";
import { t as parseTimeoutMs } from "./parse-timeout-0MQgb7pc.js";
import { t as formatDocsLink } from "./links-DfYXF6CQ.js";
import { t as runTui } from "./tui-Cykne4t2.js";

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