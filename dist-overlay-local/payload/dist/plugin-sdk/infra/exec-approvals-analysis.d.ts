import type { ExecAllowlistEntry } from "./exec-approvals.js";
export declare const DEFAULT_SAFE_BINS: string[];
export type CommandResolution = {
    rawExecutable: string;
    resolvedPath?: string;
    executableName: string;
};
export declare function resolveCommandResolution(command: string, cwd?: string, env?: NodeJS.ProcessEnv): CommandResolution | null;
export declare function resolveCommandResolutionFromArgv(argv: string[], cwd?: string, env?: NodeJS.ProcessEnv): CommandResolution | null;
export declare function resolveAllowlistCandidatePath(resolution: CommandResolution | null, cwd?: string): string | undefined;
export declare function matchAllowlist(entries: ExecAllowlistEntry[], resolution: CommandResolution | null): ExecAllowlistEntry | null;
export type ExecCommandSegment = {
    raw: string;
    argv: string[];
    resolution: CommandResolution | null;
};
export type ExecArgvToken = {
    kind: "empty";
    raw: string;
} | {
    kind: "terminator";
    raw: string;
} | {
    kind: "stdin";
    raw: string;
} | {
    kind: "positional";
    raw: string;
} | {
    kind: "option";
    raw: string;
    style: "long";
    flag: string;
    inlineValue?: string;
} | {
    kind: "option";
    raw: string;
    style: "short-cluster";
    cluster: string;
    flags: string[];
};
/**
 * Tokenizes a single argv entry into a normalized option/positional model.
 * Consumers can share this model to keep argv parsing behavior consistent.
 */
export declare function parseExecArgvToken(raw: string): ExecArgvToken;
export type ExecCommandAnalysis = {
    ok: boolean;
    reason?: string;
    segments: ExecCommandSegment[];
    chains?: ExecCommandSegment[][];
};
export type ShellChainOperator = "&&" | "||" | ";";
export type ShellChainPart = {
    part: string;
    opToNext: ShellChainOperator | null;
};
export declare function isWindowsPlatform(platform?: string | null): boolean;
/**
 * Splits a command string by chain operators (&&, ||, ;) while preserving the operators.
 * Returns null when no chain is present or when the chain is malformed.
 */
export declare function splitCommandChainWithOperators(command: string): ShellChainPart[] | null;
/**
 * Builds a shell command string that preserves pipes/chaining, but forces *arguments* to be
 * literal (no globbing, no env-var expansion) by single-quoting every argv token.
 *
 * Used to make "safe bins" actually stdin-only even though execution happens via `shell -c`.
 */
export declare function buildSafeShellCommand(params: {
    command: string;
    platform?: string | null;
}): {
    ok: boolean;
    command?: string;
    reason?: string;
};
/**
 * Rebuilds a shell command and selectively single-quotes argv tokens for segments that
 * must be treated as literal (safeBins hardening) while preserving the rest of the
 * shell syntax (pipes + chaining).
 */
export declare function buildSafeBinsShellCommand(params: {
    command: string;
    segments: ExecCommandSegment[];
    segmentSatisfiedBy: ("allowlist" | "safeBins" | "skills" | null)[];
    platform?: string | null;
}): {
    ok: boolean;
    command?: string;
    reason?: string;
};
/**
 * Splits a command string by chain operators (&&, ||, ;) while respecting quotes.
 * Returns null when no chain is present or when the chain is malformed.
 */
export declare function splitCommandChain(command: string): string[] | null;
export declare function analyzeShellCommand(params: {
    command: string;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    platform?: string | null;
}): ExecCommandAnalysis;
export declare function analyzeArgvCommand(params: {
    argv: string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}): ExecCommandAnalysis;
