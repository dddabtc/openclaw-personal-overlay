//#region src/plugin-sdk/allow-from.ts
function formatAllowFromLowercase(params) {
	return params.allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => params.stripPrefixRe ? entry.replace(params.stripPrefixRe, "") : entry).map((entry) => entry.toLowerCase());
}
function formatNormalizedAllowFromEntries(params) {
	return params.allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => params.normalizeEntry(entry)).filter((entry) => Boolean(entry));
}
function isAllowedParsedChatSender(params) {
	const allowFrom = params.allowFrom.map((entry) => String(entry).trim());
	if (allowFrom.length === 0) return false;
	if (allowFrom.includes("*")) return true;
	const senderNormalized = params.normalizeSender(params.sender);
	const chatId = params.chatId ?? void 0;
	const chatGuid = params.chatGuid?.trim();
	const chatIdentifier = params.chatIdentifier?.trim();
	for (const entry of allowFrom) {
		if (!entry) continue;
		const parsed = params.parseAllowTarget(entry);
		if (parsed.kind === "chat_id" && chatId !== void 0) {
			if (parsed.chatId === chatId) return true;
		} else if (parsed.kind === "chat_guid" && chatGuid) {
			if (parsed.chatGuid === chatGuid) return true;
		} else if (parsed.kind === "chat_identifier" && chatIdentifier) {
			if (parsed.chatIdentifier === chatIdentifier) return true;
		} else if (parsed.kind === "handle" && senderNormalized) {
			if (parsed.handle === senderNormalized) return true;
		}
	}
	return false;
}
//#endregion
export { formatNormalizedAllowFromEntries as n, isAllowedParsedChatSender as r, formatAllowFromLowercase as t };
