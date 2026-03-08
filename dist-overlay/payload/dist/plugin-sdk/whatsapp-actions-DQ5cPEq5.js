import "./run-with-concurrency-B0lSSjmf.js";
import { i as resolveWhatsAppAccount } from "./accounts-B_EDzatX.js";
import "./paths-eFexkPEh.js";
import "./github-copilot-token-Cxf8QYZb.js";
import "./config-_c0O-TfJ.js";
import "./logger-DnJ6DlYK.js";
import "./image-ops-AHatQDhr.js";
import "./plugins-Dt00OJ1E.js";
import "./path-alias-guards-lWkVroHS.js";
import "./fs-safe-Cw-rxU-z.js";
import "./ssrf-BqLBb8Gn.js";
import "./fetch-guard-BbixgLbn.js";
import "./local-roots-CPga9VKL.js";
import "./ir-B5bFxswy.js";
import "./render-C15_5JiR.js";
import "./tables-CPhO84eu.js";
import "./tool-images-BfbyjWjl.js";
import { f as readReactionParams, h as readStringParam, i as ToolAuthorizationError, l as jsonResult, o as createActionGate } from "./target-errors-DpLPR-8n.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-BsQykebF.js";
import { r as sendReactionWhatsApp } from "./outbound-Bq9Ereuj.js";
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
