import "./session-key-GuEQvqMH.js";
//#region src/channels/plugins/helpers.ts
function resolveChannelDefaultAccountId(params) {
	const accountIds = params.accountIds ?? params.plugin.config.listAccountIds(params.cfg);
	return params.plugin.config.defaultAccountId?.(params.cfg) ?? accountIds[0] ?? "default";
}
//#endregion
export { resolveChannelDefaultAccountId as t };
