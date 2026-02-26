import { n as CHAT_CHANNEL_ORDER } from "./registry-B-j4DRfe.js";
import { t as isTruthyEnvValue } from "./env-VriqyjXT.js";
import { n as listChannelPlugins } from "./plugins-CTO4bTbI.js";
import { r as listChannelPluginCatalogEntries } from "./catalog-DxFePbMV.js";
import { t as ensurePluginRegistryLoaded } from "./plugin-registry-DnaxuvP7.js";

//#region src/cli/channel-options.ts
function dedupe(values) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const value of values) {
		if (!value || seen.has(value)) continue;
		seen.add(value);
		resolved.push(value);
	}
	return resolved;
}
function resolveCliChannelOptions() {
	const catalog = listChannelPluginCatalogEntries().map((entry) => entry.id);
	const base = dedupe([...CHAT_CHANNEL_ORDER, ...catalog]);
	if (isTruthyEnvValue(process.env.OPENCLAW_EAGER_CHANNEL_OPTIONS)) {
		ensurePluginRegistryLoaded();
		const pluginIds = listChannelPlugins().map((plugin) => plugin.id);
		return dedupe([...base, ...pluginIds]);
	}
	return base;
}
function formatCliChannelOptions(extra = []) {
	return [...extra, ...resolveCliChannelOptions()].join("|");
}

//#endregion
export { resolveCliChannelOptions as n, formatCliChannelOptions as t };