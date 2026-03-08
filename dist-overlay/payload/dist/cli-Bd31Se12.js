import "./paths-BJV7vkaX.js";
import "./globals-BM8hKFm0.js";
import "./utils-DC4zYvW0.js";
import "./thinking-BYwvlJ3S.js";
import { _t as loadOpenClawPlugins } from "./reply-C5LKjXcC.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-Cbp0nOOm.js";
import { t as createSubsystemLogger } from "./subsystem-C9Xgeyrw.js";
import "./openclaw-root-D1FcrxOp.js";
import "./logger-BKkZU9TX.js";
import "./exec-nuW3NMJe.js";
import { rn as loadConfig } from "./model-selection-L7RMwsG-.js";
import "./github-copilot-token-BQoM_VEX.js";
import "./boolean-D8Ha5nYV.js";
import "./env-ByppU_6u.js";
import "./host-env-security-CbFV1gAw.js";
import "./registry-DGVIIthr.js";
import "./manifest-registry-BMEqbkWA.js";
import "./dock-BvmTvlyF.js";
import "./message-channel-DMsTX_8C.js";
import "./send-ZM2Vj99l.js";
import "./plugins-t3ljVB7c.js";
import "./sessions-Cqv9FKMF.js";
import "./audio-transcription-runner-CntsvD7H.js";
import "./image-BvuShkXY.js";
import "./models-config-CAmcg63r.js";
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
import "./send-hwmPA089.js";
import "./paths-BWOXmNIW.js";
import "./chat-envelope-BkySjpPY.js";
import "./tool-images-DSp1Kkra.js";
import "./tool-display-ILkHoY2-.js";
import "./fetch-guard-BAZ_dIrZ.js";
import "./api-key-rotation-CL9mMHhS.js";
import "./local-roots-ClyFgL1E.js";
import "./model-catalog-D1QJl-qH.js";
import "./proxy-fetch-DuABaQ_5.js";
import "./tokens-CJBrcSAT.js";
import "./deliver-KNacwBYy.js";
import "./commands-C1X8NLQZ.js";
import "./commands-registry-C78-tPS3.js";
import "./call-CbaJN9rS.js";
import "./pairing-token-CVcXi_hV.js";
import "./with-timeout-DrMwtTZt.js";
import "./diagnostic-Bbxy63Il.js";
import "./send-BRv3v2sJ.js";
import "./pi-model-discovery-BI7Yaf9u.js";
import "./exec-approvals-allowlist-BJv2xKG2.js";
import "./exec-safe-bin-runtime-policy-cATPzgIu.js";
import "./ir-ClOPnj49.js";
import "./render-DT-umBSz.js";
import "./target-errors-sfYwjd0h.js";
import "./channel-selection-BPBwgRwR.js";
import "./plugin-auto-enable-BdGh9Xln.js";
import "./send-BdY6h9ir.js";
import "./outbound-attachment-UGbwpzmz.js";
import "./fetch-v-XU4dvd.js";
import "./delivery-queue-B7XZzp05.js";
import "./send-B96NKVBA.js";
import "./pairing-store-DZCKcKsy.js";
import "./read-only-account-inspect-BXY6OFK3.js";
import "./channel-activity-rRWqsr-Q.js";
import "./tables-CR8cqCWm.js";
import "./proxy-Dgknuv4E.js";
import "./timeouts-CC8HwQOZ.js";
import "./skill-commands-BQXlD2bf.js";
import "./workspace-dirs-BqeXQGT4.js";
import "./restart-BzjDMmkD.js";
import "./runtime-config-collectors-B4hxb0i8.js";
import "./command-secret-targets-DsXaKLn0.js";
import "./session-cost-usage-CkCo2kVx.js";
import "./connection-auth-CGxluRvP.js";
import "./onboard-helpers-DPeYGnt1.js";
import "./prompt-style-D8LvsnSX.js";
import "./pairing-labels-BcbDMIc5.js";
import "./memory-cli-DPye4yd0.js";
import "./manager-4dxT-arP.js";
import "./query-expansion-CjS-pLDf.js";
import "./links-CoNMV1eb.js";
import "./cli-utils-CVpegkfr.js";
import "./help-format-FDT8xd4M.js";
import "./progress-BZWDJTlm.js";
import "./exec-approvals-1t-rSzbk.js";
import "./nodes-screen-CVcD_7Tq.js";
import "./system-run-command-B3YEXYmW.js";
import "./server-lifecycle-Cqixz2yd.js";
import "./stagger-DTvG3eqM.js";
//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}
//#endregion
export { registerPluginCliCommands };
