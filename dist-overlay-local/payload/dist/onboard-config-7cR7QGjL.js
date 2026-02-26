import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";

//#region src/commands/onboard-config.ts
var onboard_config_exports = /* @__PURE__ */ __exportAll({ applyOnboardingLocalWorkspaceConfig: () => applyOnboardingLocalWorkspaceConfig });
function applyOnboardingLocalWorkspaceConfig(baseConfig, workspaceDir) {
	return {
		...baseConfig,
		agents: {
			...baseConfig.agents,
			defaults: {
				...baseConfig.agents?.defaults,
				workspace: workspaceDir
			}
		},
		gateway: {
			...baseConfig.gateway,
			mode: "local"
		}
	};
}

//#endregion
export { onboard_config_exports as n, applyOnboardingLocalWorkspaceConfig as t };