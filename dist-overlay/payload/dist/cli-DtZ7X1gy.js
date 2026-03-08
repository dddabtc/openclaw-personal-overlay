import "./paths-B4BZAPZh.js";
import "./utils-BvKkAKT3.js";
import "./thinking-EAliFiVK.js";
import { st as loadOpenClawPlugins } from "./reply-DkozZzWy.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-D8gw-U5c.js";
import { t as createSubsystemLogger } from "./subsystem-Bqlcd6-a.js";
import "./exec-CAIB93jD.js";
import "./model-selection-BnthIvhe.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-BgXe2hyu.js";
import "./env-SxoKgHK1.js";
import "./host-env-security-ljCLeQmh.js";
import "./message-channel-CmNH1i-8.js";
import "./send-CJJkybpI.js";
import { i as loadConfig } from "./config-Ca77L3N1.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-L8eulu9n.js";
import "./dock-BAyVFjoI.js";
import "./runner-C_PvE9PO.js";
import "./image-1YtPREVu.js";
import "./models-config-DYcXOndH.js";
import "./pi-model-discovery-Bakt-Qrp.js";
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
import "./send-BJOwqL85.js";
import "./paths-DlJnj-kN.js";
import "./chat-envelope-BndZPORx.js";
import "./tool-images-DED-SeRD.js";
import "./tool-display-MIkhfqyT.js";
import "./fetch-guard-CJ_wKhxM.js";
import "./api-key-rotation-ByOea-20.js";
import "./local-roots-VOPct5kR.js";
import "./query-expansion-BQORTunD.js";
import "./model-catalog-DN7KOzNl.js";
import "./tokens-BozVFeZm.js";
import "./deliver-BLwJiE1C.js";
import "./commands-9uaOLyoy.js";
import "./commands-registry-Bt-81eNK.js";
import "./client-C6Jf-Hpl.js";
import "./call-Uoxjinzb.js";
import "./pairing-token-BqLY9SxE.js";
import "./fetch-C6LCmsQp.js";
import "./retry-FDPEaYUJ.js";
import "./pairing-store-DRpFf-8h.js";
import "./exec-approvals-BQjKzIpH.js";
import "./exec-approvals-allowlist-Bwies_rF.js";
import "./exec-safe-bin-runtime-policy-eTihvraK.js";
import "./nodes-screen-DE5Txo33.js";
import "./target-errors-jXAHWg-v.js";
import "./diagnostic-session-state-BCQ_xRK9.js";
import "./with-timeout-COTLVL3m.js";
import "./diagnostic-m-UmrLXR.js";
import "./send-DcUBeURH.js";
import "./model-C661P9bx.js";
import "./reply-prefix-aUp4d71G.js";
import "./memory-cli-B27KJ7Cv.js";
import "./manager-BSvdNkTL.js";
import "./chunk-txdpZG5p.js";
import "./markdown-tables-DkvExeLr.js";
import "./ir-ON1sJNB5.js";
import "./render-jmhFhlwv.js";
import "./channel-activity-CiJA_kZs.js";
import "./tables-Cz98Jek4.js";
import "./send-Bu0nu4Sy.js";
import "./proxy-W7lEAcDj.js";
import "./links-gLirGfnU.js";
import "./cli-utils-DK6017OO.js";
import "./help-format-CMbyj-cx.js";
import "./progress-Dc2O5riR.js";
import "./resolve-route-DtjSBRbY.js";
import "./pi-tools.policy-BWO37HqM.js";
import "./replies-D4sn5dAB.js";
import "./skill-commands-ypBUxOb0.js";
import "./workspace-dirs-u6swlofe.js";
import "./plugin-auto-enable-rIpFqItI.js";
import "./channel-selection-DuYHEOEs.js";
import "./outbound-attachment-DqAJLK58.js";
import "./delivery-queue-CUHuw1Sc.js";
import "./session-cost-usage-uoPEmNk1.js";
import "./send-y-imSTBn.js";
import "./onboard-helpers-CikULQa1.js";
import "./prompt-style-D72x12nr.js";
import "./pairing-labels-QllVYZ19.js";
import "./server-lifecycle-C-16QIND.js";
import "./stagger-CPIlBwxt.js";

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