import "../../paths-CyR9Pa1R.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-BCzIW1Y2.js";
import { b as isGatewayStartupEvent } from "../../registry-BmY4gNy6.js";
import { s as resolveAgentWorkspaceDir, t as listAgentIds } from "../../agent-scope-BaNPxUDt.js";
import { r as defaultRuntime, t as createSubsystemLogger } from "../../subsystem-B5g771Td.js";
import "../../workspace-C6WgTYr8.js";
import { n as SILENT_REPLY_TOKEN } from "../../tokens-xJsz2RTu.js";
import { a as createDefaultDeps, i as agentCommand } from "../../pi-embedded-D77SsO3m.js";
import "../../plugins-TJvbNSdo.js";
import "../../accounts-CfUI5fOs.js";
import "../../boolean-B8-BqKGQ.js";
import "../../command-format-Ck2WauwF.js";
import "../../bindings-t1-P4kBT.js";
import "../../send-D3-Ob9SN.js";
import "../../send-BVPeEScS.js";
import "../../deliver-Bvs9ufgc.js";
import "../../diagnostic-D7GCxNJa.js";
import "../../diagnostic-session-state-Bxo4UHOL.js";
import "../../accounts-KXQIhk1d.js";
import "../../send-C8AI48M3.js";
import "../../image-ops-Di1Eegus.js";
import "../../model-auth-Ya7dMhOr.js";
import "../../github-copilot-token-Dgb9dAHW.js";
import "../../pi-model-discovery-DaNAekda.js";
import "../../message-channel-CQCCb6Xy.js";
import { H as loadSessionStore, K as updateSessionStore, xt as resolveMainSessionKey, yt as resolveAgentMainSessionKey } from "../../pi-embedded-helpers-CqRD7mjY.js";
import "../../config-CysLz7WS.js";
import "../../manifest-registry-CY0aE-kW.js";
import "../../chrome-CKATdJ66.js";
import "../../frontmatter-CdkBcBAo.js";
import "../../skills-DLRwGFBf.js";
import "../../redact-jSxx6Ep2.js";
import "../../errors-BoQgnc8X.js";
import "../../ssrf-BTMDZjHT.js";
import "../../store-BhpNzGEt.js";
import "../../thinking-2XQ3oVP7.js";
import "../../accounts-nMA3v-oF.js";
import { s as resolveStorePath } from "../../paths-BEAbheM8.js";
import "../../tool-images-VEoh5TwB.js";
import "../../image-Bfa1MZ8i.js";
import "../../reply-prefix-BmXR6pJV.js";
import "../../manager-BZc2TkTp.js";
import "../../gemini-auth-rsohQGb3.js";
import "../../sqlite-D-QJYTSW.js";
import "../../retry-C1grpecz.js";
import "../../target-errors-BGjeS36u.js";
import "../../chunk-CWUSbsSi.js";
import "../../markdown-tables-PH0_9MSV.js";
import "../../local-roots-CiMZVqut.js";
import "../../ir-CqsnSacn.js";
import "../../render-CDCvpfhh.js";
import "../../commands-registry-DGUlffbd.js";
import "../../skill-commands-D-jjc5h0.js";
import "../../runner-CccmbQfu.js";
import "../../fetch-DtI0mtzx.js";
import "../../channel-activity--Llibokq.js";
import "../../tables-B5n9kpwW.js";
import "../../send-CzjNLBot.js";
import "../../outbound-attachment-B7UkTnbO.js";
import "../../send-Be0LFAV3.js";
import "../../resolve-route-iHUEniXo.js";
import "../../proxy-CBJ1upuz.js";
import "../../replies-CmKGsIjb.js";
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