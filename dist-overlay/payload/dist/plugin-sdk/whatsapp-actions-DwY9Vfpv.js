import "./run-with-concurrency-DH630Ofd.js";
import "./config-DVSRwvvI.js";
import "./logger-CyvuRp4f.js";
import "./paths-D6tDENa_.js";
import { i as resolveWhatsAppAccount } from "./accounts-dILr6zQ1.js";
import "./plugins-Dy7SueOJ.js";
import { f as readStringParam, l as readReactionParams, o as jsonResult, r as createActionGate, t as ToolAuthorizationError } from "./common-5ZPMhaUa.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-BTzRFFs6.js";
import "./image-ops-RoGKvv-z.js";
import "./github-copilot-token-xlpfBCoP.js";
import "./path-alias-guards-KBvN5BHR.js";
import "./fs-safe-BOSNL1Hu.js";
import "./proxy-env-Bk3b81Iy.js";
import "./tool-images-SytYRFQW.js";
import "./fetch-guard-CrazK8ue.js";
import "./local-roots-uXly8Wqh.js";
import "./ir-C7_DyfyF.js";
import "./render-B80HZuem.js";
import "./tables-C8ICajdQ.js";
import { r as sendReactionWhatsApp } from "./outbound-DQrEfDeD.js";
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
