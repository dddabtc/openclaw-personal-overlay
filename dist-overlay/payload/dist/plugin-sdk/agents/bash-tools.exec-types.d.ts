import type { ExecAsk, ExecHost, ExecSecurity } from "../infra/exec-approvals.js";
import type { SafeBinProfileFixture } from "../infra/exec-safe-bin-policy.js";
import type { BashSandboxConfig } from "./bash-tools.shared.js";
export type ExecMainSessionPolicy = {
    forbidLongExec?: boolean;
    requireBackgroundForExec?: boolean;
    maxExecTimeoutSec?: number;
    maxOutputBytes?: number;
};
export type ExecSubagentSessionPolicy = {
    maxOutputBytes?: number;
};
export type ExecSessionPolicies = {
    main?: ExecMainSessionPolicy;
    subagent?: ExecSubagentSessionPolicy;
};
export type ExecToolDefaults = {
    host?: ExecHost;
    security?: ExecSecurity;
    ask?: ExecAsk;
    node?: string;
    pathPrepend?: string[];
    safeBins?: string[];
    safeBinTrustedDirs?: string[];
    safeBinProfiles?: Record<string, SafeBinProfileFixture>;
    agentId?: string;
    backgroundMs?: number;
    timeoutSec?: number;
    approvalRunningNoticeMs?: number;
    sandbox?: BashSandboxConfig;
    elevated?: ExecElevatedDefaults;
    allowBackground?: boolean;
    scopeKey?: string;
    sessionKey?: string;
    messageProvider?: string;
    notifyOnExit?: boolean;
    notifyOnExitEmptySuccess?: boolean;
    cwd?: string;
    mainSessionPolicy?: ExecMainSessionPolicy;
    sessionPolicies?: ExecSessionPolicies;
};
export type ExecElevatedDefaults = {
    enabled: boolean;
    allowed: boolean;
    defaultLevel: "on" | "off" | "ask" | "full";
};
export type ExecToolDetails = {
    status: "running";
    sessionId: string;
    pid?: number;
    startedAt: number;
    cwd?: string;
    tail?: string;
} | {
    status: "completed" | "failed";
    exitCode: number | null;
    durationMs: number;
    aggregated: string;
    cwd?: string;
} | {
    status: "approval-pending";
    approvalId: string;
    approvalSlug: string;
    expiresAtMs: number;
    host: ExecHost;
    command: string;
    cwd?: string;
    nodeId?: string;
};
