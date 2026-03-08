import { i as resolveWhatsAppAccount } from "./accounts-CkURcCwV.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./config-mFX4iXuS.js";
import "./subsystem-wfAzEN3T.js";
import "./command-format-CL9J-e-o.js";
import "./model-selection-DIuDAWoy.js";
import "./agent-scope-LnIU4huW.js";
import "./manifest-registry-BdyBhdiw.js";
import "./message-channel-ChanO1hm.js";
import "./plugins-DYE0rCH8.js";
import "./bindings-B4ev3j7i.js";
import "./fs-safe-Dd-u-yj0.js";
import "./image-ops-DkUrLYnc.js";
import "./ssrf-C8mJOpz5.js";
import "./fetch-guard-2oY0g5rK.js";
import "./local-roots-CpK_t8kV.js";
import "./ir-CeA-WmXE.js";
import "./chunk-DNWlg6MR.js";
import "./markdown-tables-BpE4dZsw.js";
import "./render-BRr7caFG.js";
import "./tables-C_v4hyRV.js";
import "./tool-images-yEhdNnT1.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam } from "./target-errors-KvhwfTtm.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-CMkehk-8.js";
import { r as sendReactionWhatsApp } from "./outbound-26SXXK99.js";

//#region src/agents/tools/whatsapp-target-auth.ts
function resolveAuthorizedWhatsAppOutboundTarget(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const resolution = resolveWhatsAppOutboundTarget({
		to: params.chatJid,
		allowFrom: account.allowFrom ?? [],
		mode: "implicit"
	});
	if (!resolution.ok) throw new ToolAuthorizationError(`WhatsApp ${params.actionLabel} blocked: chatJid "${params.chatJid}" is not in the configured allowFrom list for account "${account.accountId}".`);
	return {
		to: resolution.to,
		accountId: account.accountId
	};
}

//#endregion
//#region src/agents/tools/whatsapp-actions.ts
async function handleWhatsAppAction(params, cfg) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);
	if (action === "react") {
		if (!isActionEnabled("reactions")) throw new Error("WhatsApp reactions are disabled.");
		const chatJid = readStringParam(params, "chatJid", { required: true });
		const messageId = readStringParam(params, "messageId", { required: true });
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a WhatsApp reaction." });
		const participant = readStringParam(params, "participant");
		const accountId = readStringParam(params, "accountId");
		const fromMeRaw = params.fromMe;
		const fromMe = typeof fromMeRaw === "boolean" ? fromMeRaw : void 0;
		const resolved = resolveAuthorizedWhatsAppOutboundTarget({
			cfg,
			chatJid,
			accountId,
			actionLabel: "reaction"
		});
		const resolvedEmoji = remove ? "" : emoji;
		await sendReactionWhatsApp(resolved.to, messageId, resolvedEmoji, {
			verbose: false,
			fromMe,
			participant: participant ?? void 0,
			accountId: resolved.accountId
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	throw new Error(`Unsupported WhatsApp action: ${action}`);
}

//#endregion
export { handleWhatsAppAction };