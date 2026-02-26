import "./paths-CyR9Pa1R.js";
import "./registry-BmY4gNy6.js";
import "./agent-scope-BaNPxUDt.js";
import "./subsystem-B5g771Td.js";
import "./workspace-C6WgTYr8.js";
import { a as normalizeWhatsAppTarget, i as isWhatsAppGroupJid } from "./plugins-TJvbNSdo.js";
import { t as resolveWhatsAppAccount } from "./accounts-CfUI5fOs.js";
import "./boolean-B8-BqKGQ.js";
import "./command-format-Ck2WauwF.js";
import "./bindings-t1-P4kBT.js";
import "./image-ops-Di1Eegus.js";
import "./model-auth-Ya7dMhOr.js";
import "./github-copilot-token-Dgb9dAHW.js";
import "./message-channel-CQCCb6Xy.js";
import "./config-CysLz7WS.js";
import "./manifest-registry-CY0aE-kW.js";
import "./ssrf-BTMDZjHT.js";
import "./tool-images-VEoh5TwB.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam, n as missingTargetError } from "./target-errors-BGjeS36u.js";
import "./chunk-CWUSbsSi.js";
import "./markdown-tables-PH0_9MSV.js";
import "./local-roots-CiMZVqut.js";
import "./ir-CqsnSacn.js";
import "./render-CDCvpfhh.js";
import "./tables-B5n9kpwW.js";
import { r as sendReactionWhatsApp } from "./outbound-C0fG8QAq.js";

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