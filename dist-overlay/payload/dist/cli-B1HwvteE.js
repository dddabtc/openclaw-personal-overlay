import "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import { t as createSubsystemLogger } from "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import { H as loadConfig } from "./auth-profiles-Dfz0edQp.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-DF-nzI8H.js";
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
import "./tokens-Duelq45x.js";
import { c as loadOpenClawPlugins } from "./compact-ulOOt2EP.js";
import "./plugins-BkoiCBu-.js";
import "./accounts-LPEl32gb.js";
import "./channel-config-helpers-BDId9EPL.js";
import "./send-Hx2tn8_F.js";
import "./send-DkoHZ0uB.js";
import "./with-timeout-k80MopSp.js";
import "./deliver-Cn9Q_eJL.js";
import "./diagnostic-fNDN_0Oo.js";
import "./accounts-_PYzdhne.js";
import "./image-ops-CQrO7d64.js";
import "./send-Dk9vsiNe.js";
import "./pi-model-discovery-B5Wxu5WT.js";
import "./message-channel-Be-gqLbb.js";
import "./pi-embedded-helpers-DZ_4GcxG.js";
import "./sandbox-EOyrbroP.js";
import "./tool-catalog-CFg6jrp9.js";
import "./chrome-BKjyjt3L.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-2S_sxwVw.js";
import "./ws-D9tlW60e.js";
import "./auth-BkOBUTZe.js";
import "./credentials-D-VDFBx4.js";
import "./resolve-configured-secret-input-string-63W718rD.js";
import "./server-context-ojk8baSQ.js";
import "./frontmatter-CDYnjLEC.js";
import "./env-overrides-BeDt30xz.js";
import "./path-alias-guards-D_v2YTP8.js";
import "./skills-B3eXdmA5.js";
import "./paths-DBHbY8ck.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-n_u5Hqlt.js";
import "./proxy-env-nT7ZwVLa.js";
import "./store-kjkrRAMQ.js";
import "./ports-DOBLq-G-.js";
import "./trash-CsUKAlUm.js";
import "./server-middleware-B7_SdxaT.js";
import "./sessions-ziUOptr-.js";
import "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./tool-images-BnvE1YX0.js";
import "./thinking-DykY2Fzj.js";
import "./models-config-DyTiDfSK.js";
import "./exec-approvals-allowlist-YlW1S165.js";
import "./exec-safe-bin-runtime-policy-CqrjxAQz.js";
import "./model-catalog-J9c2RT3Q.js";
import "./fetch-D9GkcQwO.js";
import "./audio-transcription-runner-DeBwNLV1.js";
import "./fetch-guard-BhfPVWia.js";
import "./image-Cvtcv6GF.js";
import "./tool-display-B1jaCPlW.js";
import "./api-key-rotation-84ubqzRa.js";
import "./proxy-fetch-4FkZfomC.js";
import "./ir-C9t1so5N.js";
import "./render-DMmq5MTs.js";
import "./target-errors-Cq0s5cjB.js";
import "./commands-BNTk8Bcu.js";
import "./commands-registry-D2ASBIoP.js";
import "./session-cost-usage-5CCZbVhO.js";
import "./session-utils-BD4YMVHH.js";
import "./sqlite-Cu1wlUjK.js";
import "./call-DAIDQCnk.js";
import "./pairing-token-DSWSMr10.js";
import "./fetch-C1n3F85v.js";
import "./pairing-store-XfFl-x5G.js";
import "./exec-approvals-oKbYU_E8.js";
import "./nodes-screen-0lf4n_FI.js";
import "./restart-B-xYDDdI.js";
import "./system-run-command-BFAcS49X.js";
import "./skill-commands-CJsdr79I.js";
import "./pi-tools.policy-ooY3ZuX-.js";
import "./workspace-dirs-CquAIPLo.js";
import "./channel-activity-b1WFafFx.js";
import "./tables-5QVVtonL.js";
import "./server-lifecycle-p9cjXgEv.js";
import "./stagger-BeBoVYTA.js";
import "./channel-selection-CwG7Bfxc.js";
import "./plugin-auto-enable-DHqa9to_.js";
import "./send-xveI5bIO.js";
import "./outbound-attachment-Cl9ry3xw.js";
import "./delivery-queue-gLCiF0so.js";
import "./send-DRZcvMAE.js";
import "./proxy-De2oME_n.js";
import "./timeouts-B6lMOqjQ.js";
import "./runtime-config-collectors-CPvXRwE6.js";
import "./command-secret-targets-CdR558gG.js";
import "./connection-auth-DH3rQhXS.js";
import "./onboard-helpers-BDLlOeFG.js";
import "./prompt-style-Bcr283QM.js";
import "./pairing-labels-DPuejC_9.js";
import "./memory-cli-_OwrTnxl.js";
import "./manager-BzE5RV8B.js";
import "./links-BvlkOkWs.js";
import "./cli-utils-DNej4wZu.js";
import "./help-format-Dl2PHE-X.js";
import "./progress-fMgIMdPa.js";
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
