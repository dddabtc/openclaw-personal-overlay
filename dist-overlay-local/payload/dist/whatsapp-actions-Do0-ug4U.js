import "./paths-Bp5uKvNR.js";
import "./registry-dD2_jBuv.js";
import "./agent-scope-BwpIA8AB.js";
import "./subsystem-CGx2ESmP.js";
import "./model-selection-D21G6-RX.js";
import "./github-copilot-token-ttqQRqMA.js";
import "./env-MtDjQbRJ.js";
import { a as normalizeWhatsAppTarget, i as isWhatsAppGroupJid } from "./plugins-B15qlrXp.js";
import { t as resolveWhatsAppAccount } from "./accounts-B7JHFO05.js";
import "./bindings-CouyEDd-.js";
import "./image-ops-CK3EyTQS.js";
import "./message-channel-On7Q-_2D.js";
import "./config-C3X0bZVI.js";
import "./manifest-registry-DOlyZDjG.js";
import "./ssrf-CxfFyMRZ.js";
import "./tool-images-B7QCXVMD.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam, n as missingTargetError } from "./target-errors-FQkZxYJw.js";
import "./chunk-BK8U4d_z.js";
import "./markdown-tables-Cp2gx1N9.js";
import "./local-roots-CkICMIko.js";
import "./ir-C_UO7zX_.js";
import "./render-B1VqYyvo.js";
import "./tables-DayZmw4B.js";
import { r as sendReactionWhatsApp } from "./outbound-DjMUhc5L.js";

//#region src/whatsapp/resolve-outbound-target.ts
function resolveWhatsAppOutboundTarget(params) {
	const trimmed = params.to?.trim() ?? "";
	const allowListRaw = (params.allowFrom ?? []).map((entry) => String(entry).trim()).filter(Boolean);
	const hasWildcard = allowListRaw.includes("*");
	const allowList = allowListRaw.filter((entry) => entry !== "*").map((entry) => normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry));
	if (trimmed) {
		const normalizedTo = normalizeWhatsAppTarget(trimmed);
		if (!normalizedTo) return {
			ok: false,
			error: missingTargetError("WhatsApp", "<E.164|group JID>")
		};
		if (isWhatsAppGroupJid(normalizedTo)) return {
			ok: true,
			to: normalizedTo
		};
		if (params.mode === "implicit" || params.mode === "heartbeat") {
			if (hasWildcard || allowList.length === 0) return {
				ok: true,
				to: normalizedTo
			};
			if (allowList.includes(normalizedTo)) return {
				ok: true,
				to: normalizedTo
			};
			return {
				ok: false,
				error: missingTargetError("WhatsApp", "<E.164|group JID>")
			};
		}
		return {
			ok: true,
			to: normalizedTo
		};
	}
	return {
		ok: false,
		error: missingTargetError("WhatsApp", "<E.164|group JID>")
	};
}

//#endregion
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