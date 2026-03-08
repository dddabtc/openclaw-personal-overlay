import { n as normalizeAccountId, r as normalizeOptionalAccountId, t as DEFAULT_ACCOUNT_ID } from "./account-id-DQE6gyMr.js";
//#region src/channels/plugins/account-helpers.ts
function createAccountListHelpers(channelKey, options) {
	function resolveConfiguredDefaultAccountId(cfg) {
		const channel = cfg.channels?.[channelKey];
		const preferred = normalizeOptionalAccountId(typeof channel?.defaultAccount === "string" ? channel.defaultAccount : void 0);
		if (!preferred) return;
		if (listAccountIds(cfg).some((id) => normalizeAccountId(id) === preferred)) return preferred;
	}
	function listConfiguredAccountIds(cfg) {
		const accounts = (cfg.channels?.[channelKey])?.accounts;
		if (!accounts || typeof accounts !== "object") return [];
		const ids = Object.keys(accounts).filter(Boolean);
		const normalizeConfiguredAccountId = options?.normalizeAccountId;
		if (!normalizeConfiguredAccountId) return ids;
		return [...new Set(ids.map((id) => normalizeConfiguredAccountId(id)).filter(Boolean))];
	}
	function listAccountIds(cfg) {
		const ids = listConfiguredAccountIds(cfg);
		if (ids.length === 0) return [DEFAULT_ACCOUNT_ID];
		return ids.toSorted((a, b) => a.localeCompare(b));
	}
	function resolveDefaultAccountId(cfg) {
		const preferred = resolveConfiguredDefaultAccountId(cfg);
		if (preferred) return preferred;
		const ids = listAccountIds(cfg);
		if (ids.includes("default")) return DEFAULT_ACCOUNT_ID;
		return ids[0] ?? "default";
	}
	return {
		listConfiguredAccountIds,
		listAccountIds,
		resolveDefaultAccountId
	};
}
//#endregion
export { createAccountListHelpers as t };
