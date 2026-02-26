export type SafeBinProfile = {
    minPositional?: number;
    maxPositional?: number;
    valueFlags?: ReadonlySet<string>;
    blockedFlags?: ReadonlySet<string>;
};
export type SafeBinProfileFixture = {
    minPositional?: number;
    maxPositional?: number;
    valueFlags?: readonly string[];
    blockedFlags?: readonly string[];
};
export declare const SAFE_BIN_GENERIC_PROFILE_FIXTURE: SafeBinProfileFixture;
export declare const SAFE_BIN_PROFILE_FIXTURES: Record<string, SafeBinProfileFixture>;
export declare const SAFE_BIN_GENERIC_PROFILE: SafeBinProfile;
export declare const SAFE_BIN_PROFILES: Record<string, SafeBinProfile>;
export declare function validateSafeBinArgv(args: string[], profile: SafeBinProfile): boolean;
