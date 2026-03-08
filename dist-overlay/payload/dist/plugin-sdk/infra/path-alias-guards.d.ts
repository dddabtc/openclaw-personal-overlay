export type PathAliasPolicy = {
    allowFinalSymlinkForUnlink?: boolean;
    allowFinalHardlinkForUnlink?: boolean;
};
export declare const PATH_ALIAS_POLICIES: {
    readonly strict: Readonly<{
        allowFinalSymlinkForUnlink: false;
        allowFinalHardlinkForUnlink: false;
    }>;
    readonly unlinkTarget: Readonly<{
        allowFinalSymlinkForUnlink: true;
        allowFinalHardlinkForUnlink: true;
    }>;
};
export declare function assertNoPathAliasEscape(params: {
    absolutePath: string;
    rootPath: string;
    boundaryLabel: string;
    policy?: PathAliasPolicy;
}): Promise<void>;
