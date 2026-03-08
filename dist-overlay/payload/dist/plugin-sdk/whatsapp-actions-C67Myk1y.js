import { i as resolveWhatsAppAccount } from "./accounts-Dg_Jn43j.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./config-CGGh37TZ.js";
import "./subsystem-BaHMxILP.js";
import "./command-format-BopkP03g.js";
import "./model-selection-Ci8st5Hn.js";
import "./agent-scope-Dse8uqIv.js";
import "./manifest-registry-BlYN_Oms.js";
import "./message-channel-CeGVmVeq.js";
import "./plugins-D40OuDLZ.js";
import "./bindings-Dwa28k3n.js";
import "./fs-safe-Dd-u-yj0.js";
import "./image-ops-CrkHe2yG.js";
import "./ssrf-C8mJOpz5.js";
import "./fetch-guard-DrdTzp-o.js";
import "./local-roots-CbvahFFG.js";
import "./ir-cfGaT1Tl.js";
import "./chunk-DI6hoaLP.js";
import "./markdown-tables-C6A1jlHk.js";
import "./render-BRr7caFG.js";
import "./tables-DAoaCdNS.js";
import "./tool-images-S7yU49ho.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam } from "./target-errors-5NE5rFWO.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-CNPnrqBD.js";
import { r as sendReactionWhatsApp } from "./outbound-BxFBau-I.js";

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