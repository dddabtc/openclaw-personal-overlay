type TrustedSafeBinDirsParams = {
    pathEnv?: string | null;
    delimiter?: string;
    baseDirs?: readonly string[];
};
type TrustedSafeBinPathParams = {
    resolvedPath: string;
    trustedDirs?: ReadonlySet<string>;
    pathEnv?: string | null;
    delimiter?: string;
};
export declare function buildTrustedSafeBinDirs(params?: TrustedSafeBinDirsParams): Set<string>;
export declare function getTrustedSafeBinDirs(params?: {
    pathEnv?: string | null;
    delimiter?: string;
    refresh?: boolean;
}): Set<string>;
export declare function isTrustedSafeBinPath(params: TrustedSafeBinPathParams): boolean;
export {};
