import type { ManagedRunStdin } from "../types.js";
export type ChildAdapter = {
    pid?: number;
    stdin?: ManagedRunStdin;
    onStdout: (listener: (chunk: string) => void) => void;
    onStderr: (listener: (chunk: string) => void) => void;
    wait: () => Promise<{
        code: number | null;
        signal: NodeJS.Signals | null;
    }>;
    kill: (signal?: NodeJS.Signals) => void;
    dispose: () => void;
};
export declare function createChildAdapter(params: {
    argv: string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    windowsVerbatimArguments?: boolean;
    input?: string;
    stdinMode?: "inherit" | "pipe-open" | "pipe-closed";
}): Promise<ChildAdapter>;
