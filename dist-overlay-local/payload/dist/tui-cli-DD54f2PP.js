import { Dt as theme, _ as defaultRuntime } from "./entry.js";
import "./auth-profiles-C7RTY9Sv.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-DhajVyRS.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./frontmatter-D-YR-Ghi.js";
import "./skills-Bq1s47OA.js";
import "./manifest-registry-XSxPcu0S.js";
import "./config-DMW11Vgn.js";
import "./client-DrK7aLru.js";
import "./call-DpGX4uMX.js";
import "./message-channel-CVHJDItx.js";
import "./pairing-token-Byh6drgn.js";
import "./sessions-CsRDsl2f.js";
import "./plugins-Dhh2a3qc.js";
import "./accounts-BrsscXpo.js";
import "./bindings-BO7DQ_-I.js";
import "./logging-CFvkxgcX.js";
import "./accounts-1gFWxwAw.js";
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
import "./commands-j9S9qRB6.js";
import "./commands-registry-BDRoefkH.js";
import "./tool-display-DixohEVL.js";
import { t as parseTimeoutMs } from "./parse-timeout-zNJBr1fY.js";
import { t as formatDocsLink } from "./links-CW8Bx7rK.js";
import { t as runTui } from "./tui-CGonv_Ct.js";

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