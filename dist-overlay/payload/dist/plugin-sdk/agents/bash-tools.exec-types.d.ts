import type { ExecAsk, ExecHost, ExecSecurity } from "../infra/exec-approvals.js";
import type { SafeBinProfileFixture } from "../infra/exec-safe-bin-policy.js";
import type { BashSandboxConfig } from "./bash-tools.shared.js";
/**
 * PERSONAL BUILD: Main session execution policy.
 * Controls restrictions on exec commands in the main agent session.
 */
export type ExecMainSessionPolicy = {
    /** Block long-running foreground commands in main session. */
    forbidLongExec?: boolean;
    /** Require background=true for all exec in main session. */
    requireBackgroundForExec?: boolean;
    /** Maximum allowed timeout (seconds) for foreground exec in main session. */
    maxExecTimeoutSec?: number;
    /** Block SSH-related commands (ssh, scp, sftp, rsync over ssh). */
    blockSshCommands?: boolean;
    /** Maximum output bytes for main session (default: 50KB = 51200). */
    maxOutputBytes?: number;
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
    currentChannelId?: string;
    currentThreadTs?: string;
    accountId?: string;
    notifyOnExit?: boolean;
    notifyOnExitEmptySuccess?: boolean;
    cwd?: string;
    /** PERSONAL BUILD: Main session execution policy. */
    mainSessionPolicy?: ExecMainSessionPolicy;
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
