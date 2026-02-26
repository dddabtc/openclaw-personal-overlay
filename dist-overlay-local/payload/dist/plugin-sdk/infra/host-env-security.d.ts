export declare const HOST_DANGEROUS_ENV_KEY_VALUES: readonly string[];
export declare const HOST_DANGEROUS_ENV_PREFIXES: readonly string[];
export declare const HOST_DANGEROUS_ENV_KEYS: Set<string>;
export declare function normalizeEnvVarKey(rawKey: string, options?: {
    portable?: boolean;
}): string | null;
export declare function isDangerousHostEnvVarName(rawKey: string): boolean;
export declare function sanitizeHostExecEnv(params?: {
    baseEnv?: Record<string, string | undefined>;
    overrides?: Record<string, string> | null;
    blockPathOverrides?: boolean;
}): Record<string, string>;
