import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-CP9YLh6M.js";
import "./thinking-EAliFiVK.js";
import "./registry-B-j4DRfe.js";
import { f as defaultRuntime } from "./subsystem-BCQGGxdd.js";
import "./exec-DYqRzFbo.js";
import "./agent-scope-B36jktKj.js";
import "./model-selection-mHHEzs4Y.js";
import "./github-copilot-token-D2zp6kMZ.js";
import "./boolean-BsqeuxE6.js";
import "./env-VriqyjXT.js";
import "./message-channel-Bena1Tzd.js";
import "./config-HiRdak1Z.js";
import "./manifest-registry-D2lPzXIl.js";
import "./pi-embedded-helpers-BXORfBBG.js";
import "./sandbox-DBfPqzy1.js";
import "./chrome-DyU5oS8r.js";
import "./tailscale-Lro1Kj8C.js";
import "./auth-G84EF23T.js";
import "./server-context-DZ5TWZsK.js";
import "./frontmatter-C_R2lwvR.js";
import "./skills-DF14CP8t.js";
import "./routes-DThMzaHt.js";
import "./redact-f-Q-hFt_.js";
import "./errors-BF3TeRH2.js";
import "./fs-safe-CUjO1ca2.js";
import "./paths-CrFY6bY4.js";
import "./ssrf-BCYMnxkM.js";
import "./image-ops-CtnOR38U.js";
import "./store-DH3Bsx5y.js";
import "./ports-D_IqQOiD.js";
import "./trash-DXPbQEbW.js";
import "./sessions-CLVPlumA.js";
import "./dock-SQwuNDYw.js";
import "./plugins-CTO4bTbI.js";
import "./accounts-CznR-8mo.js";
import "./accounts-Dq_1iSiE.js";
import "./accounts-DTj1Pkjk.js";
import "./bindings-Dnyf3pJk.js";
import "./logging-w5jq5901.js";
import "./paths-C6eomcf_.js";
import "./tool-images-DoR5YQkw.js";
import "./tool-display-BvrygsZB.js";
import "./commands-Dzc2eVxa.js";
import "./commands-registry-w2QxlrL2.js";
import "./client-DxXj-g8m.js";
import "./call-CuhCBC0h.js";
import "./pairing-token-DGufCZxz.js";
import { t as formatDocsLink } from "./links-CnNpZ2t3.js";
import { t as parseTimeoutMs } from "./parse-timeout-UOA56UND.js";
import { t as runTui } from "./tui-58lZ3lLa.js";

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