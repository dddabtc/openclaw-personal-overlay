import { S as describeUnknownError, b as resolveSecretRefValue } from "./auth-profiles-B1GaQT5q.js";
import { d as resolveSecretInputRef } from "./types.secrets-CQ90JO4F.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-Be-gqLbb.js";
import { n as callGateway, xt as validateSecretsResolveResult } from "./call-qPAXM4nu.js";
import { S as getPath, a as createResolverContext, c as analyzeCommandSecretAssignmentsFromSnapshot, f as discoverConfigSecretTargetsByIds, g as listSecretTargetRegistryEntries, t as collectConfigAssignments, v as assertExpectedResolvedSecretValue, w as setPathExistingStrict } from "./runtime-config-collectors-DHveN9Fx.js";
//#region src/cli/command-secret-gateway.ts
function dedupeDiagnostics(entries) {
	const seen = /* @__PURE__ */ new Set();
	const ordered = [];
	for (const entry of entries) {
		const trimmed = entry.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		ordered.push(trimmed);
	}
	return ordered;
}
function collectConfiguredTargetRefPaths(params) {
	const defaults = params.config.secrets?.defaults;
	const configuredTargetRefPaths = /* @__PURE__ */ new Set();
	for (const target of discoverConfigSecretTargetsByIds(params.config, params.targetIds)) {
		const { ref } = resolveSecretInputRef({
			value: target.value,
			refValue: target.refValue,
			defaults
		});
		if (ref) configuredTargetRefPaths.add(target.path);
	}
	return configuredTargetRefPaths;
}
function classifyConfiguredTargetRefs(params) {
	if (params.configuredTargetRefPaths.size === 0) return {
		hasActiveConfiguredRef: false,
		hasUnknownConfiguredRef: false,
		diagnostics: []
	};
	const context = createResolverContext({
		sourceConfig: params.config,
		env: process.env
	});
	collectConfigAssignments({
		config: structuredClone(params.config),
		context
	});
	const activePaths = new Set(context.assignments.map((assignment) => assignment.path));
	const inactiveWarningsByPath = /* @__PURE__ */ new Map();
	for (const warning of context.warnings) {
		if (warning.code !== "SECRETS_REF_IGNORED_INACTIVE_SURFACE") continue;
		inactiveWarningsByPath.set(warning.path, warning.message);
	}
	const diagnostics = /* @__PURE__ */ new Set();
	let hasActiveConfiguredRef = false;
	let hasUnknownConfiguredRef = false;
	for (const path of params.configuredTargetRefPaths) {
		if (activePaths.has(path)) {
			hasActiveConfiguredRef = true;
			continue;
		}
		const inactiveWarning = inactiveWarningsByPath.get(path);
		if (inactiveWarning) {
			diagnostics.add(inactiveWarning);
			continue;
		}
		hasUnknownConfiguredRef = true;
	}
	return {
		hasActiveConfiguredRef,
		hasUnknownConfiguredRef,
		diagnostics: [...diagnostics]
	};
}
function parseGatewaySecretsResolveResult(payload) {
	if (!validateSecretsResolveResult(payload)) throw new Error("gateway returned invalid secrets.resolve payload.");
	const parsed = payload;
	return {
		assignments: parsed.assignments ?? [],
		diagnostics: (parsed.diagnostics ?? []).filter((entry) => entry.trim().length > 0),
		inactiveRefPaths: (parsed.inactiveRefPaths ?? []).filter((entry) => entry.trim().length > 0)
	};
}
function collectInactiveSurfacePathsFromDiagnostics(diagnostics) {
	const paths = /* @__PURE__ */ new Set();
	for (const entry of diagnostics) {
		const markerIndex = entry.indexOf(": secret ref is configured on an inactive surface;");
		if (markerIndex <= 0) continue;
		const path = entry.slice(0, markerIndex).trim();
		if (path.length > 0) paths.add(path);
	}
	return paths;
}
function isUnsupportedSecretsResolveError(err) {
	const message = describeUnknownError(err).toLowerCase();
	if (!message.includes("secrets.resolve")) return false;
	return message.includes("does not support required method") || message.includes("unknown method") || message.includes("method not found") || message.includes("invalid request");
}
async function resolveCommandSecretRefsLocally(params) {
	const sourceConfig = params.config;
	const resolvedConfig = structuredClone(params.config);
	const context = createResolverContext({
		sourceConfig,
		env: process.env
	});
	collectConfigAssignments({
		config: structuredClone(params.config),
		context
	});
	const inactiveRefPaths = new Set(context.warnings.filter((warning) => warning.code === "SECRETS_REF_IGNORED_INACTIVE_SURFACE").map((warning) => warning.path));
	const activePaths = new Set(context.assignments.map((assignment) => assignment.path));
	const localResolutionDiagnostics = [];
	for (const target of discoverConfigSecretTargetsByIds(sourceConfig, params.targetIds)) {
		if (params.allowedPaths && !params.allowedPaths.has(target.path)) continue;
		await resolveTargetSecretLocally({
			target,
			sourceConfig,
			resolvedConfig,
			env: context.env,
			cache: context.cache,
			activePaths,
			inactiveRefPaths,
			mode: params.mode,
			commandName: params.commandName,
			localResolutionDiagnostics
		});
	}
	const analyzed = analyzeCommandSecretAssignmentsFromSnapshot({
		sourceConfig,
		resolvedConfig,
		targetIds: params.targetIds,
		inactiveRefPaths,
		...params.allowedPaths ? { allowedPaths: params.allowedPaths } : {}
	});
	const targetStatesByPath = buildTargetStatesByPath({
		analyzed,
		resolvedState: "resolved_local"
	});
	if (params.mode !== "strict" && analyzed.unresolved.length > 0) scrubUnresolvedAssignments(resolvedConfig, analyzed.unresolved);
	else if (analyzed.unresolved.length > 0) throw new Error(`${params.commandName}: ${analyzed.unresolved[0]?.path ?? "target"} is unresolved in the active runtime snapshot.`);
	return {
		resolvedConfig,
		diagnostics: dedupeDiagnostics([
			...params.preflightDiagnostics,
			...filterInactiveSurfaceDiagnostics({
				diagnostics: analyzed.diagnostics,
				inactiveRefPaths
			}),
			...localResolutionDiagnostics,
			...buildUnresolvedDiagnostics(params.commandName, analyzed.unresolved, params.mode)
		]),
		targetStatesByPath,
		hadUnresolvedTargets: analyzed.unresolved.length > 0
	};
}
function buildTargetStatesByPath(params) {
	const states = {};
	for (const assignment of params.analyzed.assignments) states[assignment.path] = params.resolvedState;
	for (const entry of params.analyzed.inactive) states[entry.path] = "inactive_surface";
	for (const entry of params.analyzed.unresolved) states[entry.path] = "unresolved";
	return states;
}
function buildUnresolvedDiagnostics(commandName, unresolved, mode) {
	if (mode === "strict") return [];
	return unresolved.map((entry) => `${commandName}: ${entry.path} is unavailable in this command path; continuing with degraded read-only config.`);
}
function scrubUnresolvedAssignments(config, unresolved) {
	for (const entry of unresolved) setPathExistingStrict(config, entry.pathSegments, void 0);
}
function filterInactiveSurfaceDiagnostics(params) {
	return params.diagnostics.filter((entry) => {
		const markerIndex = entry.indexOf(": secret ref is configured on an inactive surface;");
		if (markerIndex <= 0) return true;
		const path = entry.slice(0, markerIndex).trim();
		return !params.inactiveRefPaths.has(path);
	});
}
async function resolveTargetSecretLocally(params) {
	const defaults = params.sourceConfig.secrets?.defaults;
	const { ref } = resolveSecretInputRef({
		value: params.target.value,
		refValue: params.target.refValue,
		defaults
	});
	if (!ref || params.inactiveRefPaths.has(params.target.path) || !params.activePaths.has(params.target.path)) return;
	try {
		const resolved = await resolveSecretRefValue(ref, {
			config: params.sourceConfig,
			env: params.env,
			cache: params.cache
		});
		assertExpectedResolvedSecretValue({
			value: resolved,
			expected: params.target.entry.expectedResolvedValue,
			errorMessage: params.target.entry.expectedResolvedValue === "string" ? `${params.target.path} resolved to a non-string or empty value.` : `${params.target.path} resolved to an unsupported value type.`
		});
		setPathExistingStrict(params.resolvedConfig, params.target.pathSegments, resolved);
	} catch (error) {
		if (params.mode !== "strict") params.localResolutionDiagnostics.push(`${params.commandName}: failed to resolve ${params.target.path} locally (${describeUnknownError(error)}).`);
	}
}
async function resolveCommandSecretRefsViaGateway(params) {
	const mode = params.mode ?? "strict";
	const configuredTargetRefPaths = collectConfiguredTargetRefPaths({
		config: params.config,
		targetIds: params.targetIds
	});
	if (configuredTargetRefPaths.size === 0) return {
		resolvedConfig: params.config,
		diagnostics: [],
		targetStatesByPath: {},
		hadUnresolvedTargets: false
	};
	const preflight = classifyConfiguredTargetRefs({
		config: params.config,
		configuredTargetRefPaths
	});
	if (!preflight.hasActiveConfiguredRef && !preflight.hasUnknownConfiguredRef) return {
		resolvedConfig: params.config,
		diagnostics: preflight.diagnostics,
		targetStatesByPath: {},
		hadUnresolvedTargets: false
	};
	let payload;
	try {
		payload = await callGateway({
			config: params.config,
			method: "secrets.resolve",
			requiredMethods: ["secrets.resolve"],
			params: {
				commandName: params.commandName,
				targetIds: [...params.targetIds]
			},
			timeoutMs: 3e4,
			clientName: GATEWAY_CLIENT_NAMES.CLI,
			mode: GATEWAY_CLIENT_MODES.CLI
		});
	} catch (err) {
		try {
			const fallback = await resolveCommandSecretRefsLocally({
				config: params.config,
				commandName: params.commandName,
				targetIds: params.targetIds,
				preflightDiagnostics: preflight.diagnostics,
				mode
			});
			const fallbackMessage = Object.values(fallback.targetStatesByPath).some((state) => state === "resolved_local") && !fallback.hadUnresolvedTargets ? "resolved command secrets locally." : "attempted local command-secret resolution.";
			return {
				resolvedConfig: fallback.resolvedConfig,
				diagnostics: dedupeDiagnostics([...fallback.diagnostics, `${params.commandName}: gateway secrets.resolve unavailable (${describeUnknownError(err)}); ${fallbackMessage}`]),
				targetStatesByPath: fallback.targetStatesByPath,
				hadUnresolvedTargets: fallback.hadUnresolvedTargets
			};
		} catch {}
		if (isUnsupportedSecretsResolveError(err)) throw new Error(`${params.commandName}: active gateway does not support secrets.resolve (${describeUnknownError(err)}). Update the gateway or run without SecretRefs.`, { cause: err });
		throw new Error(`${params.commandName}: failed to resolve secrets from the active gateway snapshot (${describeUnknownError(err)}). Start the gateway and retry.`, { cause: err });
	}
	const parsed = parseGatewaySecretsResolveResult(payload);
	const resolvedConfig = structuredClone(params.config);
	for (const assignment of parsed.assignments) {
		const pathSegments = assignment.pathSegments.filter((segment) => segment.length > 0);
		if (pathSegments.length === 0) continue;
		try {
			setPathExistingStrict(resolvedConfig, pathSegments, assignment.value);
		} catch (err) {
			const path = pathSegments.join(".");
			throw new Error(`${params.commandName}: failed to apply resolved secret assignment at ${path} (${describeUnknownError(err)}).`, { cause: err });
		}
	}
	const inactiveRefPaths = parsed.inactiveRefPaths.length > 0 ? new Set(parsed.inactiveRefPaths) : collectInactiveSurfacePathsFromDiagnostics(parsed.diagnostics);
	const analyzed = analyzeCommandSecretAssignmentsFromSnapshot({
		sourceConfig: params.config,
		resolvedConfig,
		targetIds: params.targetIds,
		inactiveRefPaths
	});
	let diagnostics = dedupeDiagnostics(parsed.diagnostics);
	const targetStatesByPath = buildTargetStatesByPath({
		analyzed,
		resolvedState: "resolved_gateway"
	});
	if (analyzed.unresolved.length > 0) try {
		const localFallback = await resolveCommandSecretRefsLocally({
			config: params.config,
			commandName: params.commandName,
			targetIds: params.targetIds,
			preflightDiagnostics: [],
			mode,
			allowedPaths: new Set(analyzed.unresolved.map((entry) => entry.path))
		});
		for (const unresolved of analyzed.unresolved) {
			if (localFallback.targetStatesByPath[unresolved.path] !== "resolved_local") continue;
			setPathExistingStrict(resolvedConfig, unresolved.pathSegments, getPath(localFallback.resolvedConfig, unresolved.pathSegments));
			targetStatesByPath[unresolved.path] = "resolved_local";
		}
		const recoveredPaths = new Set(Object.entries(localFallback.targetStatesByPath).filter(([, state]) => state === "resolved_local").map(([path]) => path));
		const stillUnresolved = analyzed.unresolved.filter((entry) => !recoveredPaths.has(entry.path));
		if (stillUnresolved.length > 0) {
			if (mode === "strict") throw new Error(`${params.commandName}: ${stillUnresolved[0]?.path ?? "target"} is unresolved in the active runtime snapshot.`);
			scrubUnresolvedAssignments(resolvedConfig, stillUnresolved);
			diagnostics = dedupeDiagnostics([
				...diagnostics,
				...localFallback.diagnostics,
				...buildUnresolvedDiagnostics(params.commandName, stillUnresolved, mode)
			]);
			for (const unresolved of stillUnresolved) targetStatesByPath[unresolved.path] = "unresolved";
		} else if (recoveredPaths.size > 0) diagnostics = dedupeDiagnostics([...diagnostics, `${params.commandName}: resolved ${recoveredPaths.size} secret ${recoveredPaths.size === 1 ? "path" : "paths"} locally after the gateway snapshot was incomplete.`]);
	} catch (error) {
		if (mode === "strict") throw error;
		scrubUnresolvedAssignments(resolvedConfig, analyzed.unresolved);
		diagnostics = dedupeDiagnostics([
			...diagnostics,
			`${params.commandName}: local fallback after incomplete gateway snapshot failed (${describeUnknownError(error)}).`,
			...buildUnresolvedDiagnostics(params.commandName, analyzed.unresolved, mode)
		]);
	}
	return {
		resolvedConfig,
		diagnostics,
		targetStatesByPath,
		hadUnresolvedTargets: Object.values(targetStatesByPath).includes("unresolved")
	};
}
//#endregion
//#region src/cli/command-secret-targets.ts
function idsByPrefix(prefixes) {
	return listSecretTargetRegistryEntries().map((entry) => entry.id).filter((id) => prefixes.some((prefix) => id.startsWith(prefix))).toSorted();
}
const COMMAND_SECRET_TARGETS = {
	memory: ["agents.defaults.memorySearch.remote.apiKey", "agents.list[].memorySearch.remote.apiKey"],
	qrRemote: ["gateway.remote.token", "gateway.remote.password"],
	channels: idsByPrefix(["channels."]),
	models: idsByPrefix(["models.providers."]),
	agentRuntime: idsByPrefix([
		"channels.",
		"models.providers.",
		"agents.defaults.memorySearch.remote.",
		"agents.list[].memorySearch.remote.",
		"skills.entries.",
		"messages.tts.",
		"tools.web.search"
	]),
	status: idsByPrefix([
		"channels.",
		"agents.defaults.memorySearch.remote.",
		"agents.list[].memorySearch.remote."
	])
};
function toTargetIdSet(values) {
	return new Set(values);
}
function getMemoryCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.memory);
}
function getQrRemoteCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.qrRemote);
}
function getChannelsCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.channels);
}
function getModelsCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.models);
}
function getAgentRuntimeCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.agentRuntime);
}
function getStatusCommandSecretTargetIds() {
	return toTargetIdSet(COMMAND_SECRET_TARGETS.status);
}
//#endregion
export { getQrRemoteCommandSecretTargetIds as a, getModelsCommandSecretTargetIds as i, getChannelsCommandSecretTargetIds as n, getStatusCommandSecretTargetIds as o, getMemoryCommandSecretTargetIds as r, resolveCommandSecretRefsViaGateway as s, getAgentRuntimeCommandSecretTargetIds as t };
