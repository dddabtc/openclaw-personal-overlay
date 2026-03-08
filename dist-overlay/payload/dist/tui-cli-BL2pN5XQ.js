import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-BvKkAKT3.js";
import "./thinking-EAliFiVK.js";
import "./agent-scope-D8gw-U5c.js";
import { f as defaultRuntime } from "./subsystem-Bqlcd6-a.js";
import "./exec-CAIB93jD.js";
import "./model-selection-BnthIvhe.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-BgXe2hyu.js";
import "./env-SxoKgHK1.js";
import "./host-env-security-ljCLeQmh.js";
import "./message-channel-CmNH1i-8.js";
import "./config-Ca77L3N1.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-L8eulu9n.js";
import "./dock-BAyVFjoI.js";
import "./pi-embedded-helpers-IykXeTcj.js";
import "./sandbox-DRVWt7n5.js";
import "./tool-catalog-CrsxKKLj.js";
import "./chrome-BBeY99fu.js";
import "./tailscale-Cu00fx92.js";
import "./ip-D6hQ9Srg.js";
import "./tailnet-QICRxDwG.js";
import "./ws-D1QB-fai.js";
import "./auth-Bxx2VNC9.js";
import "./server-context-GXNpKSjl.js";
import "./frontmatter-DR47FZL2.js";
import "./skills-7LoesrWg.js";
import "./redact-FwcF9gh5.js";
import "./errors-B4zBevhh.js";
import "./fs-safe-DwCRJYoe.js";
import "./paths-DJ0CRxTh.js";
import "./ssrf-Bw0uz5oO.js";
import "./image-ops-De8KI3uW.js";
import "./store-BCXyE2P-.js";
import "./ports-C0wnBxwM.js";
import "./trash-BgvPEBCw.js";
import "./server-middleware-DfaRJTWr.js";
import "./sessions-BydE9SSo.js";
import "./plugins-DayOjXZ9.js";
import "./accounts-mX89jP1j.js";
import "./accounts-WdSU9oY0.js";
import "./accounts-qzL_Ozg5.js";
import "./bindings-DaFjLbOa.js";
import "./logging-6RmrnEvA.js";
import "./paths-DlJnj-kN.js";
import "./chat-envelope-BndZPORx.js";
import "./tool-images-DED-SeRD.js";
import "./tool-display-MIkhfqyT.js";
import "./commands-9uaOLyoy.js";
import "./commands-registry-Bt-81eNK.js";
import "./client-C6Jf-Hpl.js";
import "./call-Uoxjinzb.js";
import "./pairing-token-BqLY9SxE.js";
import { t as formatDocsLink } from "./links-gLirGfnU.js";
import { t as parseTimeoutMs } from "./parse-timeout-DDSWreYs.js";
import { t as runTui } from "./tui-W77UtBUU.js";

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