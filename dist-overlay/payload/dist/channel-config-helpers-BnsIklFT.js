import { m as normalizeE164 } from "./utils-DC4zYvW0.js";
import { _ as normalizeAccountId } from "./session-key-GuEQvqMH.js";
import { r as normalizeStringEntries } from "./string-normalization-DM-EcQlw.js";
import { b as resolveAccountEntry, i as resolveWhatsAppAccount, y as createAccountListHelpers } from "./accounts-WRgl0tJ1.js";
//#region src/whatsapp/normalize.ts
const WHATSAPP_USER_JID_RE = /^(\d+)(?::\d+)?@s\.whatsapp\.net$/i;
const WHATSAPP_LID_RE = /^(\d+)@lid$/i;
function stripWhatsAppTargetPrefixes(value) {
	let candidate = value.trim();
	for (;;) {
		const before = candidate;
		candidate = candidate.replace(/^whatsapp:/i, "").trim();
		if (candidate === before) return candidate;
	}
}
function isWhatsAppGroupJid(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate.toLowerCase().endsWith("@g.us")) return false;
	const localPart = candidate.slice(0, candidate.length - 5);
	if (!localPart || localPart.includes("@")) return false;
	return /^[0-9]+(-[0-9]+)*$/.test(localPart);
}
/**
* Check if value looks like a WhatsApp user target (e.g. "41796666864:0@s.whatsapp.net" or "123@lid").
*/
function isWhatsAppUserTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	return WHATSAPP_USER_JID_RE.test(candidate) || WHATSAPP_LID_RE.test(candidate);
}
/**
* Extract the phone number from a WhatsApp user JID.
* "41796666864:0@s.whatsapp.net" -> "41796666864"
* "123456@lid" -> "123456"
*/
function extractUserJidPhone(jid) {
	const userMatch = jid.match(WHATSAPP_USER_JID_RE);
	if (userMatch) return userMatch[1];
	const lidMatch = jid.match(WHATSAPP_LID_RE);
	if (lidMatch) return lidMatch[1];
	return null;
}
function normalizeWhatsAppTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate) return null;
	if (isWhatsAppGroupJid(candidate)) return `${candidate.slice(0, candidate.length - 5)}@g.us`;
	if (isWhatsAppUserTarget(candidate)) {
		const phone = extractUserJidPhone(candidate);
		if (!phone) return null;
		const normalized = normalizeE164(phone);
		return normalized.length > 1 ? normalized : null;
	}
	if (candidate.includes("@")) return null;
	const normalized = normalizeE164(candidate);
	return normalized.length > 1 ? normalized : null;
}
//#endregion
//#region src/channels/plugins/normalize/whatsapp.ts
function normalizeWhatsAppAllowFromEntries(allowFrom) {
	return allowFrom.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry)).map((entry) => entry === "*" ? entry : normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry));
}
//#endregion
//#region src/imessage/accounts.ts
const { listAccountIds, resolveDefaultAccountId } = createAccountListHelpers("imessage");
const listIMessageAccountIds = listAccountIds;
const resolveDefaultIMessageAccountId = resolveDefaultAccountId;
function resolveAccountConfig(cfg, accountId) {
	return resolveAccountEntry(cfg.channels?.imessage?.accounts, accountId);
}
function mergeIMessageAccountConfig(cfg, accountId) {
	const { accounts: _ignored, ...base } = cfg.channels?.imessage ?? {};
	const account = resolveAccountConfig(cfg, accountId) ?? {};
	return {
		...base,
		...account
	};
}
function resolveIMessageAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.imessage?.enabled !== false;
	const merged = mergeIMessageAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const configured = Boolean(merged.cliPath?.trim() || merged.dbPath?.trim() || merged.service || merged.region?.trim() || merged.allowFrom && merged.allowFrom.length > 0 || merged.groupAllowFrom && merged.groupAllowFrom.length > 0 || merged.dmPolicy || merged.groupPolicy || typeof merged.includeAttachments === "boolean" || merged.attachmentRoots && merged.attachmentRoots.length > 0 || merged.remoteAttachmentRoots && merged.remoteAttachmentRoots.length > 0 || typeof merged.mediaMaxMb === "number" || typeof merged.textChunkLimit === "number" || merged.groups && Object.keys(merged.groups).length > 0);
	return {
		accountId,
		enabled: baseEnabled && accountEnabled,
		name: merged.name?.trim() || void 0,
		config: merged,
		configured
	};
}
//#endregion
//#region src/plugin-sdk/channel-config-helpers.ts
function mapAllowFromEntries(allowFrom) {
	return (allowFrom ?? []).map((entry) => String(entry));
}
function formatTrimmedAllowFromEntries(allowFrom) {
	return normalizeStringEntries(allowFrom);
}
function resolveOptionalConfigString(value) {
	if (value == null) return;
	return String(value).trim() || void 0;
}
function resolveWhatsAppConfigAllowFrom(params) {
	return resolveWhatsAppAccount(params).allowFrom ?? [];
}
function formatWhatsAppConfigAllowFromEntries(allowFrom) {
	return normalizeWhatsAppAllowFromEntries(allowFrom);
}
function resolveWhatsAppConfigDefaultTo(params) {
	const root = params.cfg.channels?.whatsapp;
	const normalized = normalizeAccountId(params.accountId);
	return ((root?.accounts?.[normalized])?.defaultTo ?? root?.defaultTo)?.trim() || void 0;
}
function resolveIMessageConfigAllowFrom(params) {
	return mapAllowFromEntries(resolveIMessageAccount(params).config.allowFrom);
}
function resolveIMessageConfigDefaultTo(params) {
	return resolveOptionalConfigString(resolveIMessageAccount(params).config.defaultTo);
}
//#endregion
export { resolveIMessageConfigDefaultTo as a, resolveWhatsAppConfigDefaultTo as c, resolveIMessageAccount as d, isWhatsAppGroupJid as f, resolveIMessageConfigAllowFrom as i, listIMessageAccountIds as l, formatWhatsAppConfigAllowFromEntries as n, resolveOptionalConfigString as o, normalizeWhatsAppTarget as p, mapAllowFromEntries as r, resolveWhatsAppConfigAllowFrom as s, formatTrimmedAllowFromEntries as t, resolveDefaultIMessageAccountId as u };
