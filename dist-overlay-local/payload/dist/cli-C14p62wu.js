import { o as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-C7RTY9Sv.js";
import "./exec-CBKBIMpA.js";
import { c as resolveAgentWorkspaceDir, l as resolveDefaultAgentId } from "./agent-scope-DhajVyRS.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-ChKLb_d2.js";
import "./pi-model-discovery-Do3xMEtM.js";
import "./frontmatter-D-YR-Ghi.js";
import "./skills-Bq1s47OA.js";
import "./manifest-registry-XSxPcu0S.js";
import { i as loadConfig } from "./config-DMW11Vgn.js";
import "./client-DrK7aLru.js";
import "./call-DpGX4uMX.js";
import "./message-channel-CVHJDItx.js";
import "./pairing-token-Byh6drgn.js";
import { g as loadOpenClawPlugins } from "./subagent-registry-BDJet-Vq.js";
import "./sessions-CsRDsl2f.js";
import "./tokens-ANnYrShl.js";
import "./plugins-Dhh2a3qc.js";
import "./accounts-BrsscXpo.js";
import "./bindings-BO7DQ_-I.js";
import "./logging-CFvkxgcX.js";
import "./send-Big2UFm_.js";
import "./send-hNGYd45P.js";
import "./with-timeout-iOq9EFfz.js";
import "./deliver-CyeIWbI8.js";
import "./diagnostic-C6WTf4ZE.js";
import "./diagnostic-session-state-CIjIGxEE.js";
import "./accounts-1gFWxwAw.js";
import "./send-Ca4_6d3W.js";
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
import "./models-config-xdiIJ--F.js";
import "./reply-prefix-D4RfrCeP.js";
import "./memory-cli-meSZHVr2.js";
import "./manager-CYx1MWZA.js";
import "./gemini-auth-FuBGrv0B.js";
import "./sqlite-CQGamAhm.js";
import "./retry-C4Q_VPOo.js";
import "./target-errors-C6mkRlU9.js";
import "./chunk-D6AoZjLE.js";
import "./markdown-tables-CVgUytSx.js";
import "./fetch-guard-Dp7VnmeK.js";
import "./local-roots-LE1f_G0M.js";
import "./ir-DwFJAkDs.js";
import "./render-e7fENCYH.js";
import "./commands-j9S9qRB6.js";
import "./commands-registry-BDRoefkH.js";
import "./image-CMLQrCWd.js";
import "./tool-display-DixohEVL.js";
import "./session-utils-DwO3Isif.js";
import "./session-cost-usage-Dfx7NHjv.js";
import "./runner-BqlaWRyu.js";
import "./model-catalog-DPgNYd7O.js";
import "./skill-commands-DR5wCsHu.js";
import "./workspace-dirs-Dw0EowUJ.js";
import "./pairing-store-BqeL7tj7.js";
import "./fetch-DOex5qYK.js";
import "./exec-approvals-BKZqQjp9.js";
import "./nodes-screen-DCJNznUw.js";
import "./channel-activity-myOnmDZi.js";
import "./tables-CKA-N6SU.js";
import "./control-service-jtQ1tZZN.js";
import "./stagger-CQar2eKe.js";
import "./channel-selection-D5cjTEHf.js";
import "./send-7EWRElEf.js";
import "./outbound-attachment-Bc9bVXwP.js";
import "./delivery-queue-CzNZXd1M.js";
import "./send-ChEZW6oS.js";
import "./resolve-route-C4DUT14V.js";
import "./proxy-DL3MD6-P.js";
import "./links-CW8Bx7rK.js";
import "./cli-utils-CCaEbxAz.js";
import "./help-format-B0pWGnZs.js";
import "./progress-BAHiAaDW.js";
import "./replies-BjWvOhNO.js";
import "./onboard-helpers-BE4hqP_a.js";
import "./prompt-style-DwCXob2h.js";
import "./pairing-labels-D4ymYAjE.js";
import "./pi-tools.policy-PdQU4Q59.js";

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