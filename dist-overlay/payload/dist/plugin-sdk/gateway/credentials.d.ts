import type { OpenClawConfig } from "../config/config.js";
export type ExplicitGatewayAuth = {
    token?: string;
    password?: string;
};
export type ResolvedGatewayCredentials = {
    token?: string;
    password?: string;
};
export type GatewayCredentialMode = "local" | "remote";
export type GatewayCredentialPrecedence = "env-first" | "config-first";
export type GatewayRemoteCredentialPrecedence = "remote-first" | "env-first";
export type GatewayRemoteCredentialFallback = "remote-env-local" | "remote-only";
export declare class GatewaySecretRefUnavailableError extends Error {
    readonly code = "GATEWAY_SECRET_REF_UNAVAILABLE";
    readonly path: string;
    constructor(path: string);
}
export declare function isGatewaySecretRefUnavailableError(error: unknown, expectedPath?: string): error is GatewaySecretRefUnavailableError;
export declare function trimToUndefined(value: unknown): string | undefined;
/**
 * Like trimToUndefined but also rejects unresolved env var placeholders (e.g. `${VAR}`).
 * This prevents literal placeholder strings like `${OPENCLAW_GATEWAY_TOKEN}` from being
 * accepted as valid credentials when the referenced env var is missing.
 * Note: legitimate credential values containing literal `${UPPER_CASE}` patterns will
 * also be rejected, but this is an extremely unlikely edge case.
 */
export declare function trimCredentialToUndefined(value: unknown): string | undefined;
export declare function readGatewayTokenEnv(env?: NodeJS.ProcessEnv, includeLegacyEnv?: boolean): string | undefined;
export declare function readGatewayPasswordEnv(env?: NodeJS.ProcessEnv, includeLegacyEnv?: boolean): string | undefined;
export declare function hasGatewayTokenEnvCandidate(env?: NodeJS.ProcessEnv, includeLegacyEnv?: boolean): boolean;
export declare function hasGatewayPasswordEnvCandidate(env?: NodeJS.ProcessEnv, includeLegacyEnv?: boolean): boolean;
export declare function resolveGatewayCredentialsFromValues(params: {
    configToken?: unknown;
    configPassword?: unknown;
    env?: NodeJS.ProcessEnv;
    includeLegacyEnv?: boolean;
    tokenPrecedence?: GatewayCredentialPrecedence;
    passwordPrecedence?: GatewayCredentialPrecedence;
}): ResolvedGatewayCredentials;
export declare function resolveGatewayCredentialsFromConfig(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    explicitAuth?: ExplicitGatewayAuth;
    urlOverride?: string;
    urlOverrideSource?: "cli" | "env";
    modeOverride?: GatewayCredentialMode;
    includeLegacyEnv?: boolean;
    localTokenPrecedence?: GatewayCredentialPrecedence;
    localPasswordPrecedence?: GatewayCredentialPrecedence;
    remoteTokenPrecedence?: GatewayRemoteCredentialPrecedence;
    remotePasswordPrecedence?: GatewayRemoteCredentialPrecedence;
    remoteTokenFallback?: GatewayRemoteCredentialFallback;
    remotePasswordFallback?: GatewayRemoteCredentialFallback;
}): ResolvedGatewayCredentials;
