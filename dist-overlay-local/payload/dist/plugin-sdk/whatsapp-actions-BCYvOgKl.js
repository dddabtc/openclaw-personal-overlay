import { r as resolveWhatsAppAccount } from "./accounts-B4AwEIkX.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./plugins-DibeMwuf.js";
import "./registry-BODM0liu.js";
import "./config-Dmuf-X_8.js";
import "./subsystem-CcWTQzT4.js";
import "./command-format-DlCJ6Vf_.js";
import "./model-selection-Jdj95NV3.js";
import "./agent-scope-Xg97m-eH.js";
import "./manifest-registry-BKc0Ujlf.js";
import "./image-ops-C-FmeLM-.js";
import "./ssrf-DKZ8eBrk.js";
import "./local-roots-ClrRhF7x.js";
import "./ir-GLTSswZ6.js";
import "./chunk-DahOhGDR.js";
import "./message-channel-CUaOB1wh.js";
import "./bindings-DEVKMeKf.js";
import "./markdown-tables-DXOal6UY.js";
import "./render-BiJZ5W4Z.js";
import "./tables-D0R3bNAK.js";
import "./tool-images-KxE68Cxp.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam } from "./target-errors-WjRRqiUb.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-COH7wHsC.js";
import { r as sendReactionWhatsApp } from "./outbound-DzbQtLOs.js";

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