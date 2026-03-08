import { s as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-VHiPC1-T.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-DhI_kPU3.js";
import "./exec-TIZD7ZZn.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-DyQuUnEd.js";
import "./model-CbAr_Ite.js";
import "./pi-model-discovery-CwESh4K1.js";
import "./frontmatter-olEIkgYh.js";
import "./skills-HuqIMCbl.js";
import "./manifest-registry-BgY5xgMH.js";
import { i as loadConfig } from "./config-C5eGjyf_.js";
import "./env-vars-iFkEK4MO.js";
import "./dock-D4HTBK6f.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-tp_rJRIm.js";
import "./plugins-DS5tNvig.js";
import "./accounts-Q2sI0yx1.js";
import "./accounts-DTV7qtJm.js";
import "./accounts-Bgj4wZaj.js";
import "./bindings-BJckG653.js";
import "./logging-CFvkxgcX.js";
import "./send-CqFqAQ2s.js";
import "./send-dWIHwD83.js";
import { _ as loadOpenClawPlugins } from "./subagent-registry-D_kP1cL8.js";
import "./paths-DDT5WL2f.js";
import "./chat-envelope-BG_U_muK.js";
import "./client-CkQCw2_e.js";
import "./call-wzS2iP4k.js";
import "./pairing-token-CtND5y_8.js";
import "./net-C5Xzxz5G.js";
import "./ip-CyOZe5YF.js";
import "./tailnet-CC0kbSg4.js";
import "./tokens-k5g99v2x.js";
import "./with-timeout-DkLiP3_U.js";
import "./deliver-wdulsjfo.js";
import "./diagnostic-J4rp2SRl.js";
import "./diagnostic-session-state-CT36_PCE.js";
import "./send-C1iLeH0J.js";
import "./image-ops-BtM0q_Kl.js";
import "./pi-embedded-helpers-CsgdqaKA.js";
import "./sandbox-DQpHeFtV.js";
import "./tool-catalog-BS-Gk_Yg.js";
import "./chrome-DX_XtkSm.js";
import "./tailscale-BIikm3VQ.js";
import "./auth-uSllFIea.js";
import "./server-context-8RSvOysq.js";
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
import "./models-config-C7ZKKxuo.js";
import "./exec-approvals-allowlist-Che7RjBW.js";
import "./exec-safe-bin-runtime-policy-UjGiqwPz.js";
import "./reply-prefix-BesSkS9Q.js";
import "./memory-cli-B9T45K0l.js";
import "./manager-gyw0Q2gC.js";
import "./gemini-auth-Bym9uufz.js";
import "./fetch-guard-CozZxo_V.js";
import "./query-expansion-BEs7YpS_.js";
import "./retry-D7bSETth.js";
import "./target-errors-BLVNpa_x.js";
import "./chunk-KIogEvi4.js";
import "./markdown-tables-BZUA0Ci_.js";
import "./local-roots-CtEMMzoM.js";
import "./ir-Cgj_QBGB.js";
import "./render-CC7dS9Xb.js";
import "./commands-pdOUas3E.js";
import "./commands-registry-Cx9aOhEa.js";
import "./image-Bi5mjtKi.js";
import "./tool-display-BjKWYkZ_.js";
import "./runner-BGEicYhv.js";
import "./model-catalog-BB6eLw3G.js";
import "./fetch-CHNZ_dCB.js";
import "./pairing-store-C9G8zMVO.js";
import "./exec-approvals-B7Du3_pT.js";
import "./nodes-screen-C3z0wL7F.js";
import "./session-utils-Mk0su1_q.js";
import "./session-cost-usage-BVCE7Q2u.js";
import "./skill-commands-D0BWAj_B.js";
import "./workspace-dirs-CXaWreqW.js";
import "./channel-activity-bWh1Qb3v.js";
import "./tables-Bm2dBo_l.js";
import "./server-lifecycle-CfVwZ7nK.js";
import "./stagger-DAKdJbmK.js";
import "./channel-selection-BiLB94ww.js";
import "./plugin-auto-enable-Cp3AF1aF.js";
import "./send-BynQfrl0.js";
import "./outbound-attachment-BpdHwovB.js";
import "./delivery-queue-dGFvsvks.js";
import "./send-BxDMzrIs.js";
import "./resolve-route-DsNueEDS.js";
import "./proxy-DyD4fJMf.js";
import "./links-DfYXF6CQ.js";
import "./cli-utils-B_gcZWk3.js";
import "./help-format-Yb22e8jt.js";
import "./progress-DGbpXOaw.js";
import "./pi-tools.policy-D2QEOku3.js";
import "./replies-CTpi3Yh0.js";
import "./onboard-helpers-ByiIhSd_.js";
import "./prompt-style-wsroINzm.js";
import "./pairing-labels-jUrcrf8l.js";

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