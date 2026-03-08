import type { AnchoredSandboxEntry, PathSafetyCheck } from "./fs-bridge-path-safety.js";
import type { SandboxResolvedFsPath } from "./fs-paths.js";
export type SandboxFsCommandPlan = {
    checks: PathSafetyCheck[];
    script: string;
    args?: string[];
    recheckBeforeCommand?: boolean;
    allowFailure?: boolean;
};
export declare function buildWriteCommitPlan(target: SandboxResolvedFsPath, tempPath: string): SandboxFsCommandPlan;
export declare function buildMkdirpPlan(target: SandboxResolvedFsPath, anchoredTarget: AnchoredSandboxEntry): SandboxFsCommandPlan;
export declare function buildRemovePlan(params: {
    target: SandboxResolvedFsPath;
    anchoredTarget: AnchoredSandboxEntry;
    recursive?: boolean;
    force?: boolean;
}): SandboxFsCommandPlan;
export declare function buildRenamePlan(params: {
    from: SandboxResolvedFsPath;
    to: SandboxResolvedFsPath;
    anchoredFrom: AnchoredSandboxEntry;
    anchoredTo: AnchoredSandboxEntry;
}): SandboxFsCommandPlan;
export declare function buildStatPlan(target: SandboxResolvedFsPath): SandboxFsCommandPlan;
