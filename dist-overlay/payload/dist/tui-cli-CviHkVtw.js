import "./paths-BJV7vkaX.js";
import { p as theme } from "./globals-BM8hKFm0.js";
import "./utils-DC4zYvW0.js";
import "./thinking-BYwvlJ3S.js";
import "./agent-scope-Cbp0nOOm.js";
import { f as defaultRuntime } from "./subsystem-C9Xgeyrw.js";
import "./openclaw-root-D1FcrxOp.js";
import "./logger-BKkZU9TX.js";
import "./exec-nuW3NMJe.js";
import "./model-selection-L7RMwsG-.js";
import "./github-copilot-token-BQoM_VEX.js";
import "./boolean-D8Ha5nYV.js";
import "./env-ByppU_6u.js";
import "./host-env-security-CbFV1gAw.js";
import "./registry-DGVIIthr.js";
import "./manifest-registry-BMEqbkWA.js";
import "./dock-BvmTvlyF.js";
import "./message-channel-DMsTX_8C.js";
import "./plugins-t3ljVB7c.js";
import "./sessions-Cqv9FKMF.js";
import "./pi-embedded-helpers-CGK9ncQY.js";
import "./sandbox-DtNRfhZb.js";
import "./tool-catalog-DE9Q8xiB.js";
import "./chrome-B3GPMnZQ.js";
import "./tailscale-DrDx-3cv.js";
import "./tailnet-DQFT4WRD.js";
import "./ws-DCAgtqK4.js";
import "./auth-CkQjEn8_.js";
import "./credentials-DFpHgFp_.js";
import "./resolve-configured-secret-input-string-DNyQwn7C.js";
import "./server-context-CjEWjKYZ.js";
import "./frontmatter-BvLOP38b.js";
import "./env-overrides-Cam0mPAe.js";
import "./path-alias-guards-BxTM8fFt.js";
import "./skills-C5yXLr4m.js";
import "./paths-TP02AE1K.js";
import "./redact-XVjLULTG.js";
import "./errors-Dl9nRyXH.js";
import "./fs-safe-BFrSJTKP.js";
import "./proxy-env-B11GTapA.js";
import "./image-ops-v9o00YrC.js";
import "./store-CCWPL_3R.js";
import "./ports-CZeJLe7P.js";
import "./trash-R64jHFGe.js";
import "./server-middleware-CbRiwg4x.js";
import "./accounts-WRgl0tJ1.js";
import "./channel-config-helpers-BnsIklFT.js";
import "./accounts-BtlgULZC.js";
import "./paths-BWOXmNIW.js";
import "./chat-envelope-BkySjpPY.js";
import "./tool-images-DSp1Kkra.js";
import "./tool-display-ILkHoY2-.js";
import "./commands-C1X8NLQZ.js";
import "./commands-registry-C78-tPS3.js";
import "./call-CbaJN9rS.js";
import "./pairing-token-CVcXi_hV.js";
import { t as formatDocsLink } from "./links-CoNMV1eb.js";
import { t as parseTimeoutMs } from "./parse-timeout-BRAJ4wdA.js";
import { t as runTui } from "./tui-DGZv0XVj.js";
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
