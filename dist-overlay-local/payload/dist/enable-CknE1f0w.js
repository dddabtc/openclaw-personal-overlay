import { t as ensurePluginAllowlisted } from "./plugins-allowlist-CCpr61rO.js";

//#region src/plugins/enable.ts
function enablePluginInConfig(cfg, pluginId) {
	if (cfg.plugins?.enabled === false) return {
		config: cfg,
		enabled: false,
		reason: "plugins disabled"
	};
	if (cfg.plugins?.deny?.includes(pluginId)) return {
		config: cfg,
		enabled: false,
		reason: "blocked by denylist"
	};
	const entries = {
		...cfg.plugins?.entries,
		[pluginId]: {
			...cfg.plugins?.entries?.[pluginId],
			enabled: true
		}
	};
	let next = {
		...cfg,
		plugins: {
			...cfg.plugins,
			entries
		}
	};
	next = ensurePluginAllowlisted(next, pluginId);
	return {
		config: next,
		enabled: true
	};
}

//#endregion
export { enablePluginInConfig as t };