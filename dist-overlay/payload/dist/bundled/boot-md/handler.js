import { n as listAgentIds, s as resolveAgentWorkspaceDir } from "../../agent-scope-DfPRIj4l.js";
import "../../paths-CRyD285O.js";
import { pt as isGatewayStartupEvent, r as defaultRuntime, t as createSubsystemLogger } from "../../subsystem-gWhP9HUz.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-YGVrIVO5.js";
import "../../workspace-CoXkK9vh.js";
import "../../model-selection-DzQXaRi3.js";
import "../../github-copilot-token-C_a0oOIO.js";
import "../../env-DAOIQ0Je.js";
import "../../boolean-mcn6kL0s.js";
import { n as SILENT_REPLY_TOKEN } from "../../tokens-CmeDnU40.js";
import { a as createDefaultDeps, i as agentCommand } from "../../pi-embedded-DGsh1hxQ.js";
import "../../plugins-COkGaVNw.js";
import "../../accounts-DqCt-wQc.js";
import "../../bindings-OOnNFCB_.js";
import "../../send-B9rxILPV.js";
import "../../send-KHNmDSc8.js";
import "../../deliver-BDTCk6Zp.js";
import "../../diagnostic-J8y9RHcI.js";
import "../../diagnostic-session-state-C0Sxjfox.js";
import "../../accounts-VI6oRB4t.js";
import "../../send-CJ330W-T.js";
import "../../image-ops-aD0BGevY.js";
import "../../pi-model-discovery-C-yOXpma.js";
import "../../message-channel-DNQoN51i.js";
import "../../pi-embedded-helpers-DdtgKBS8.js";
import "../../config-DPEn0sA9.js";
import "../../manifest-registry-BjPRbY8q.js";
import "../../dock-C7qdzomy.js";
import "../../chrome-DUrZscND.js";
import "../../ssrf-fLpTpy3w.js";
import "../../frontmatter-DhbnPOGB.js";
import "../../skills-C9mKKXRT.js";
import "../../redact-DPmHLmw9.js";
import "../../errors-Dt3U1F5S.js";
import "../../fs-safe-BFmsMcLL.js";
import "../../store-D020k9N1.js";
import { U as resolveMainSessionKey, V as resolveAgentMainSessionKey, d as updateSessionStore, s as loadSessionStore } from "../../sessions-CUpCpsNI.js";
import "../../accounts-OCKm8qxp.js";
import { l as resolveStorePath } from "../../paths-DtNnHbet.js";
import "../../tool-images-D5ANUCus.js";
import "../../thinking-6RspTgk5.js";
import "../../image-CzHSa-_X.js";
import "../../reply-prefix-DV1guQI1.js";
import "../../manager-Cprlyvh8.js";
import "../../gemini-auth-RlLwqORB.js";
import "../../fetch-guard-B6nV3reU.js";
import "../../query-expansion-5BdZBFZd.js";
import "../../retry-C3uWyooV.js";
import "../../target-errors-CluUfAVP.js";
import "../../chunk-DkaSmp4f.js";
import "../../markdown-tables-CgjQWqNB.js";
import "../../local-roots-CFUHsj1i.js";
import "../../ir-DV5PQ0dW.js";
import "../../render-D7ZNn_WS.js";
import "../../commands-registry-frk9-cYB.js";
import "../../skill-commands-y-84rIVE.js";
import "../../runner-B8op_Hh1.js";
import "../../fetch-DTTG_w9o.js";
import "../../channel-activity-CamRvc2O.js";
import "../../tables-B8ymTOL-.js";
import "../../send-yk9iQO_y.js";
import "../../outbound-attachment-CUKcVG-h.js";
import "../../send-Cavm8sGw.js";
import "../../resolve-route-CJwOROn_.js";
import "../../proxy-BMa4czGu.js";
import "../../replies-BWK-p2vT.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

//#region src/gateway/boot.ts
function generateBootSessionId() {
	return `boot-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "")}-${crypto.randomUUID().slice(0, 8)}`;
}
const log$1 = createSubsystemLogger("gateway/boot");
const BOOT_FILENAME = "BOOT.md";
function buildBootPrompt(content) {
	return [
		"You are running a boot check. Follow BOOT.md instructions exactly.",
		"",
		"BOOT.md:",
		content,
		"",
		"If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).",
		"Use the `target` field (not `to`) for message tool destinations.",
		`After sending with the message tool, reply with ONLY: ${SILENT_REPLY_TOKEN}.`,
		`If nothing needs attention, reply with ONLY: ${SILENT_REPLY_TOKEN}.`
	].join("\n");
}
async function loadBootFile(workspaceDir) {
	const bootPath = path.join(workspaceDir, BOOT_FILENAME);
	try {
		const trimmed = (await fs.readFile(bootPath, "utf-8")).trim();
		if (!trimmed) return { status: "empty" };
		return {
			status: "ok",
			content: trimmed
		};
	} catch (err) {
		if (err.code === "ENOENT") return { status: "missing" };
		throw err;
	}
}
function snapshotMainSessionMapping(params) {
	const agentId = resolveAgentIdFromSessionKey(params.sessionKey);
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId });
	try {
		const entry = loadSessionStore(storePath, { skipCache: true })[params.sessionKey];
		if (!entry) return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: true,
			hadEntry: false
		};
		return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: true,
			hadEntry: true,
			entry: structuredClone(entry)
		};
	} catch (err) {
		log$1.debug("boot: could not snapshot main session mapping", {
			sessionKey: params.sessionKey,
			error: String(err)
		});
		return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: false,
			hadEntry: false
		};
	}
}
async function restoreMainSessionMapping(snapshot) {
	if (!snapshot.canRestore) return;
	try {
		await updateSessionStore(snapshot.storePath, (store) => {
			if (snapshot.hadEntry && snapshot.entry) {
				store[snapshot.sessionKey] = snapshot.entry;
				return;
			}
			delete store[snapshot.sessionKey];
		}, { activeSessionKey: snapshot.sessionKey });
		return;
	} catch (err) {
		return err instanceof Error ? err.message : String(err);
	}
}
async function runBootOnce(params) {
	const bootRuntime = {
		log: () => {},
		error: (message) => log$1.error(String(message)),
		exit: defaultRuntime.exit
	};
	let result;
	try {
		result = await loadBootFile(params.workspaceDir);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log$1.error(`boot: failed to read ${BOOT_FILENAME}: ${message}`);
		return {
			status: "failed",
			reason: message
		};
	}
	if (result.status === "missing" || result.status === "empty") return {
		status: "skipped",
		reason: result.status
	};
	const sessionKey = params.agentId ? resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	}) : resolveMainSessionKey(params.cfg);
	const message = buildBootPrompt(result.content ?? "");
	const sessionId = generateBootSessionId();
	const mappingSnapshot = snapshotMainSessionMapping({
		cfg: params.cfg,
		sessionKey
	});
	let agentFailure;
	try {
		await agentCommand({
			message,
			sessionKey,
			sessionId,
			deliver: false
		}, bootRuntime, params.deps);
	} catch (err) {
		agentFailure = err instanceof Error ? err.message : String(err);
		log$1.error(`boot: agent run failed: ${agentFailure}`);
	}
	const mappingRestoreFailure = await restoreMainSessionMapping(mappingSnapshot);
	if (mappingRestoreFailure) log$1.error(`boot: failed to restore main session mapping: ${mappingRestoreFailure}`);
	if (!agentFailure && !mappingRestoreFailure) return { status: "ran" };
	return {
		status: "failed",
		reason: [agentFailure ? `agent run failed: ${agentFailure}` : void 0, mappingRestoreFailure ? `mapping restore failed: ${mappingRestoreFailure}` : void 0].filter((part) => Boolean(part)).join("; ")
	};
}

//#endregion
//#region src/hooks/bundled/boot-md/handler.ts
const log = createSubsystemLogger("hooks/boot-md");
const runBootChecklist = async (event) => {
	if (!isGatewayStartupEvent(event)) return;
	if (!event.context.cfg) return;
	const cfg = event.context.cfg;
	const deps = event.context.deps ?? createDefaultDeps();
	const agentIds = listAgentIds(cfg);
	for (const agentId of agentIds) {
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const result = await runBootOnce({
			cfg,
			deps,
			workspaceDir,
			agentId
		});
		if (result.status === "failed") {
			log.warn("boot-md failed for agent startup run", {
				agentId,
				workspaceDir,
				reason: result.reason
			});
			continue;
		}
		if (result.status === "skipped") log.debug("boot-md skipped for agent startup run", {
			agentId,
			workspaceDir,
			reason: result.reason
		});
	}
};

//#endregion
export { runBootChecklist as default };