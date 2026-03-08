import { n as listAgentIds, s as resolveAgentWorkspaceDir } from "../../agent-scope-DBH4tc6E.js";
import "../../paths-C9do7WCN.js";
import { pt as isGatewayStartupEvent, r as defaultRuntime, t as createSubsystemLogger } from "../../subsystem-DhjIxims.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-YGVrIVO5.js";
import "../../workspace-jH04VzX-.js";
import "../../model-selection-w6ucPeWO.js";
import "../../github-copilot-token-BkwQAVvU.js";
import "../../env-ClJSw9gs.js";
import "../../boolean-mcn6kL0s.js";
import { n as SILENT_REPLY_TOKEN } from "../../tokens-fYdHc5Il.js";
import { a as createDefaultDeps, i as agentCommand } from "../../pi-embedded-CId9gqP3.js";
import "../../plugins-C1VUBuby.js";
import "../../accounts-CfKX8yG7.js";
import "../../bindings-CDK0IrP0.js";
import "../../send-a1VWNOHV.js";
import "../../send-Cw0_ZiTX.js";
import "../../deliver-BeOJWYth.js";
import "../../diagnostic-DQjjW919.js";
import "../../diagnostic-session-state-C0Sxjfox.js";
import "../../accounts-cHckgn_t.js";
import "../../send-BiqYG7oR.js";
import "../../image-ops-BhxPhYFk.js";
import "../../pi-model-discovery-C-yOXpma.js";
import "../../message-channel-pwZqDIgx.js";
import "../../pi-embedded-helpers-BgYUaSDq.js";
import "../../config-CyPYPMkz.js";
import "../../manifest-registry-BT84-RS7.js";
import "../../dock-DZ4pzoln.js";
import "../../chrome-CcrVABjD.js";
import "../../ssrf-fLpTpy3w.js";
import "../../frontmatter-CYyVkHva.js";
import "../../skills-BBsi_dtC.js";
import "../../redact-SGQAq28W.js";
import "../../errors-DCpmSNbo.js";
import "../../fs-safe-BFmsMcLL.js";
import "../../store-CYaLnTp3.js";
import { U as resolveMainSessionKey, V as resolveAgentMainSessionKey, d as updateSessionStore, s as loadSessionStore } from "../../sessions-C9kw3nkg.js";
import "../../accounts-DXV3Uvzx.js";
import { l as resolveStorePath } from "../../paths-PSh4fBQD.js";
import "../../tool-images-CR47IyyS.js";
import "../../thinking-6RspTgk5.js";
import "../../image-EizydwYA.js";
import "../../reply-prefix-CcDJywCq.js";
import "../../manager-BJQTTP5s.js";
import "../../gemini-auth-BSk0KCpC.js";
import "../../fetch-guard-BYswKNH0.js";
import "../../query-expansion-CdGiZbeS.js";
import "../../retry-BxRFAOR_.js";
import "../../target-errors-DJuiiQI2.js";
import "../../chunk-BI4_3V6t.js";
import "../../markdown-tables-BoOL-Y6h.js";
import "../../local-roots-BqL3X_i0.js";
import "../../ir-BXqInHn9.js";
import "../../render-D7ZNn_WS.js";
import "../../commands-registry-BT9619S7.js";
import "../../skill-commands-Bf82eL6s.js";
import "../../runner-D1Afuzkr.js";
import "../../fetch-DTTG_w9o.js";
import "../../channel-activity-BRGWkG9d.js";
import "../../tables-C-Mxp4A9.js";
import "../../send-Cf1Vq3Nw.js";
import "../../outbound-attachment-CaGRyfCX.js";
import "../../send-DsdsfS6s.js";
import "../../resolve-route-BsYELmmd.js";
import "../../proxy-BMa4czGu.js";
import "../../replies-CSQqUYSm.js";
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