import { Vn as containsEnvVarReference } from "./auth-profiles-D6r73dBV.js";
import { d as resolveSecretInputRef } from "./types.secrets-CQ90JO4F.js";
//#region src/gateway/credentials.ts
const GATEWAY_SECRET_REF_UNAVAILABLE_ERROR_CODE = "GATEWAY_SECRET_REF_UNAVAILABLE";
var GatewaySecretRefUnavailableError = class extends Error {
	constructor(path) {
		super([
			`${path} is configured as a secret reference but is unavailable in this command path.`,
			"Fix: set OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD, pass explicit --token/--password,",
			"or run a gateway command path that resolves secret references before credential selection."
		].join("\n"));
		this.code = GATEWAY_SECRET_REF_UNAVAILABLE_ERROR_CODE;
		this.name = "GatewaySecretRefUnavailableError";
		this.path = path;
	}
};
function isGatewaySecretRefUnavailableError(error, expectedPath) {
	if (!(error instanceof GatewaySecretRefUnavailableError)) return false;
	if (!expectedPath) return true;
	return error.path === expectedPath;
}
function trimToUndefined(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
/**
* Like trimToUndefined but also rejects unresolved env var placeholders (e.g. `${VAR}`).
* This prevents literal placeholder strings like `${OPENCLAW_GATEWAY_TOKEN}` from being
* accepted as valid credentials when the referenced env var is missing.
* Note: legitimate credential values containing literal `${UPPER_CASE}` patterns will
* also be rejected, but this is an extremely unlikely edge case.
*/
function trimCredentialToUndefined(value) {
	const trimmed = trimToUndefined(value);
	if (trimmed && containsEnvVarReference(trimmed)) return;
	return trimmed;
}
function firstDefined(values) {
	for (const value of values) if (value) return value;
}
function throwUnresolvedGatewaySecretInput(path) {
	throw new GatewaySecretRefUnavailableError(path);
}
function readGatewayTokenEnv(env = process.env, includeLegacyEnv = true) {
	const primary = trimToUndefined(env.OPENCLAW_GATEWAY_TOKEN);
	if (primary) return primary;
	if (!includeLegacyEnv) return;
	return trimToUndefined(env.CLAWDBOT_GATEWAY_TOKEN);
}
function readGatewayPasswordEnv(env = process.env, includeLegacyEnv = true) {
	const primary = trimToUndefined(env.OPENCLAW_GATEWAY_PASSWORD);
	if (primary) return primary;
	if (!includeLegacyEnv) return;
	return trimToUndefined(env.CLAWDBOT_GATEWAY_PASSWORD);
}
function hasGatewayTokenEnvCandidate(env = process.env, includeLegacyEnv = true) {
	return Boolean(readGatewayTokenEnv(env, includeLegacyEnv));
}
function hasGatewayPasswordEnvCandidate(env = process.env, includeLegacyEnv = true) {
	return Boolean(readGatewayPasswordEnv(env, includeLegacyEnv));
}
function resolveGatewayCredentialsFromValues(params) {
	const env = params.env ?? process.env;
	const includeLegacyEnv = params.includeLegacyEnv ?? true;
	const envToken = readGatewayTokenEnv(env, includeLegacyEnv);
	const envPassword = readGatewayPasswordEnv(env, includeLegacyEnv);
	const configToken = trimCredentialToUndefined(params.configToken);
	const configPassword = trimCredentialToUndefined(params.configPassword);
	const tokenPrecedence = params.tokenPrecedence ?? "env-first";
	const passwordPrecedence = params.passwordPrecedence ?? "env-first";
	return {
		token: tokenPrecedence === "config-first" ? firstDefined([configToken, envToken]) : firstDefined([envToken, configToken]),
		password: passwordPrecedence === "config-first" ? firstDefined([configPassword, envPassword]) : firstDefined([envPassword, configPassword])
	};
}
function resolveGatewayCredentialsFromConfig(params) {
	const env = params.env ?? process.env;
	const includeLegacyEnv = params.includeLegacyEnv ?? true;
	const explicitToken = trimToUndefined(params.explicitAuth?.token);
	const explicitPassword = trimToUndefined(params.explicitAuth?.password);
	if (explicitToken || explicitPassword) return {
		token: explicitToken,
		password: explicitPassword
	};
	if (trimToUndefined(params.urlOverride) && params.urlOverrideSource !== "env") return {};
	if (trimToUndefined(params.urlOverride) && params.urlOverrideSource === "env") return resolveGatewayCredentialsFromValues({
		configToken: void 0,
		configPassword: void 0,
		env,
		includeLegacyEnv,
		tokenPrecedence: "env-first",
		passwordPrecedence: "env-first"
	});
	const mode = params.modeOverride ?? (params.cfg.gateway?.mode === "remote" ? "remote" : "local");
	const remote = params.cfg.gateway?.remote;
	const defaults = params.cfg.secrets?.defaults;
	const authMode = params.cfg.gateway?.auth?.mode;
	const envToken = readGatewayTokenEnv(env, includeLegacyEnv);
	const envPassword = readGatewayPasswordEnv(env, includeLegacyEnv);
	const localTokenRef = resolveSecretInputRef({
		value: params.cfg.gateway?.auth?.token,
		defaults
	}).ref;
	const localPasswordRef = resolveSecretInputRef({
		value: params.cfg.gateway?.auth?.password,
		defaults
	}).ref;
	const remoteTokenRef = resolveSecretInputRef({
		value: remote?.token,
		defaults
	}).ref;
	const remotePasswordRef = resolveSecretInputRef({
		value: remote?.password,
		defaults
	}).ref;
	const remoteToken = remoteTokenRef ? void 0 : trimToUndefined(remote?.token);
	const remotePassword = remotePasswordRef ? void 0 : trimToUndefined(remote?.password);
	const localToken = localTokenRef ? void 0 : trimToUndefined(params.cfg.gateway?.auth?.token);
	const localPassword = localPasswordRef ? void 0 : trimToUndefined(params.cfg.gateway?.auth?.password);
	const localTokenPrecedence = params.localTokenPrecedence ?? (env.OPENCLAW_SERVICE_KIND === "gateway" ? "config-first" : "env-first");
	const localPasswordPrecedence = params.localPasswordPrecedence ?? "env-first";
	if (mode === "local") {
		const localResolved = resolveGatewayCredentialsFromValues({
			configToken: localToken ?? remoteToken,
			configPassword: localPassword ?? remotePassword,
			env,
			includeLegacyEnv,
			tokenPrecedence: localTokenPrecedence,
			passwordPrecedence: localPasswordPrecedence
		});
		const localPasswordCanWin = authMode === "password" || authMode !== "token" && authMode !== "none" && authMode !== "trusted-proxy" && !localResolved.token;
		const localTokenCanWin = authMode === "token" || authMode !== "password" && authMode !== "none" && authMode !== "trusted-proxy" && !localResolved.password;
		if (localTokenRef && localTokenPrecedence === "config-first" && !localToken && Boolean(envToken) && localTokenCanWin) throwUnresolvedGatewaySecretInput("gateway.auth.token");
		if (localPasswordRef && localPasswordPrecedence === "config-first" && !localPassword && Boolean(envPassword) && localPasswordCanWin) throwUnresolvedGatewaySecretInput("gateway.auth.password");
		if (localTokenRef && !localResolved.token && !envToken && localTokenCanWin) throwUnresolvedGatewaySecretInput("gateway.auth.token");
		if (localPasswordRef && !localResolved.password && !envPassword && localPasswordCanWin) throwUnresolvedGatewaySecretInput("gateway.auth.password");
		return localResolved;
	}
	const remoteTokenFallback = params.remoteTokenFallback ?? "remote-env-local";
	const remotePasswordFallback = params.remotePasswordFallback ?? "remote-env-local";
	const remoteTokenPrecedence = params.remoteTokenPrecedence ?? "remote-first";
	const remotePasswordPrecedence = params.remotePasswordPrecedence ?? "env-first";
	const token = remoteTokenFallback === "remote-only" ? remoteToken : remoteTokenPrecedence === "env-first" ? firstDefined([
		envToken,
		remoteToken,
		localToken
	]) : firstDefined([
		remoteToken,
		envToken,
		localToken
	]);
	const password = remotePasswordFallback === "remote-only" ? remotePassword : remotePasswordPrecedence === "env-first" ? firstDefined([
		envPassword,
		remotePassword,
		localPassword
	]) : firstDefined([
		remotePassword,
		envPassword,
		localPassword
	]);
	const localTokenCanWin = authMode === "token" || authMode !== "password" && authMode !== "none" && authMode !== "trusted-proxy";
	const localTokenFallbackEnabled = remoteTokenFallback !== "remote-only";
	const localTokenFallback = remoteTokenFallback === "remote-only" ? void 0 : localToken;
	const localPasswordFallback = remotePasswordFallback === "remote-only" ? void 0 : localPassword;
	if (remoteTokenRef && !token && !envToken && !localTokenFallback && !password) throwUnresolvedGatewaySecretInput("gateway.remote.token");
	if (remotePasswordRef && !password && !envPassword && !localPasswordFallback && !token) throwUnresolvedGatewaySecretInput("gateway.remote.password");
	if (localTokenRef && localTokenFallbackEnabled && !token && !password && !envToken && !remoteToken && localTokenCanWin) throwUnresolvedGatewaySecretInput("gateway.auth.token");
	return {
		token,
		password
	};
}
//#endregion
export { readGatewayPasswordEnv as a, resolveGatewayCredentialsFromValues as c, isGatewaySecretRefUnavailableError as i, trimToUndefined as l, hasGatewayPasswordEnvCandidate as n, readGatewayTokenEnv as o, hasGatewayTokenEnvCandidate as r, resolveGatewayCredentialsFromConfig as s, GatewaySecretRefUnavailableError as t };
