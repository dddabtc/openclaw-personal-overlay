import type { ExecAsk, ExecSecurity } from "../infra/exec-approvals.js";
export type RequestExecApprovalDecisionParams = {
    id: string;
    command: string;
    commandArgv?: string[];
    cwd: string;
    nodeId?: string;
    host: "gateway" | "node";
    security: ExecSecurity;
    ask: ExecAsk;
    agentId?: string;
    resolvedPath?: string;
    sessionKey?: string;
};
export type ExecApprovalRegistration = {
    id: string;
    expiresAtMs: number;
    finalDecision?: string | null;
};
export declare function registerExecApprovalRequest(params: RequestExecApprovalDecisionParams): Promise<ExecApprovalRegistration>;
export declare function waitForExecApprovalDecision(id: string): Promise<string | null>;
export declare function requestExecApprovalDecision(params: RequestExecApprovalDecisionParams): Promise<string | null>;
export declare function requestExecApprovalDecisionForHost(params: {
    approvalId: string;
    command: string;
    commandArgv?: string[];
    workdir: string;
    host: "gateway" | "node";
    nodeId?: string;
    security: ExecSecurity;
    ask: ExecAsk;
    agentId?: string;
    resolvedPath?: string;
    sessionKey?: string;
}): Promise<string | null>;
export declare function registerExecApprovalRequestForHost(params: {
    approvalId: string;
    command: string;
    commandArgv?: string[];
    workdir: string;
    host: "gateway" | "node";
    nodeId?: string;
    security: ExecSecurity;
    ask: ExecAsk;
    agentId?: string;
    resolvedPath?: string;
    sessionKey?: string;
}): Promise<ExecApprovalRegistration>;
