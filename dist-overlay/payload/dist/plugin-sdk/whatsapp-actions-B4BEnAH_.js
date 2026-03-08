import "./run-with-concurrency-8rEOAFIb.js";
import "./config-BzzhfwwZ.js";
import "./logger-Blr-bUxJ.js";
import "./paths-D6tDENa_.js";
import { i as resolveWhatsAppAccount } from "./accounts-2nYsK_T0.js";
import "./plugins-lLSwnL0z.js";
import { f as readStringParam, l as readReactionParams, o as jsonResult, r as createActionGate, t as ToolAuthorizationError } from "./common-Dm6qTNY5.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-DlSJYi9O.js";
import "./image-ops-BGa3wbFC.js";
import "./github-copilot-token-xlpfBCoP.js";
import "./path-alias-guards-BRxZnHEh.js";
import "./fs-safe-D0d6G8wj.js";
import "./proxy-env-Bm8SAdaK.js";
import "./tool-images-CKZrLBfM.js";
import "./fetch-guard-BlFx2zlE.js";
import "./local-roots-BQPwhrJJ.js";
import "./ir-BHTCWhOX.js";
import "./render-B80HZuem.js";
import "./tables-CAph4DbJ.js";
import { r as sendReactionWhatsApp } from "./outbound-Lmwk8u2c.js";
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
