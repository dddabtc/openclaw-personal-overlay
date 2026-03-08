import { type BoundaryFileOpenResult } from "../../infra/boundary-file-read.js";
import type { PathAliasPolicy } from "../../infra/path-alias-guards.js";
import type { SafeOpenSyncAllowedType } from "../../infra/safe-open-sync.js";
import type { SandboxResolvedFsPath, SandboxFsMount } from "./fs-paths.js";
export type PathSafetyOptions = {
    action: string;
    aliasPolicy?: PathAliasPolicy;
    requireWritable?: boolean;
    allowedType?: SafeOpenSyncAllowedType;
};
export type PathSafetyCheck = {
    target: SandboxResolvedFsPath;
    options: PathSafetyOptions;
};
export type AnchoredSandboxEntry = {
    canonicalParentPath: string;
    basename: string;
};
type RunCommand = (script: string, options?: {
    args?: string[];
    stdin?: Buffer | string;
    allowFailure?: boolean;
    signal?: AbortSignal;
}) => Promise<{
    stdout: Buffer;
}>;
export declare class SandboxFsPathGuard {
    private readonly mountsByContainer;
    private readonly runCommand;
    constructor(params: {
        mountsByContainer: SandboxFsMount[];
        runCommand: RunCommand;
    });
    assertPathChecks(checks: PathSafetyCheck[]): Promise<void>;
    assertPathSafety(target: SandboxResolvedFsPath, options: PathSafetyOptions): Promise<void>;
    openReadableFile(target: SandboxResolvedFsPath): Promise<BoundaryFileOpenResult & {
        ok: true;
    }>;
    private resolveRequiredMount;
    private assertGuardedPathSafety;
    private openBoundaryWithinRequiredMount;
    resolveAnchoredSandboxEntry(target: SandboxResolvedFsPath): Promise<AnchoredSandboxEntry>;
    private pathIsExistingDirectory;
    private resolveMountByContainerPath;
    private resolveCanonicalContainerPath;
}
export {};
