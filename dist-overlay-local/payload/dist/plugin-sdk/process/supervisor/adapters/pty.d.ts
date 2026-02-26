import type { ManagedRunStdin } from "../types.js";
export type PtyAdapter = {
    pid?: number;
    stdin?: ManagedRunStdin;
    onStdout: (listener: (chunk: string) => void) => void;
    onStderr: (listener: (chunk: string) => void) => void;
    wait: () => Promise<{
        code: number | null;
        signal: NodeJS.Signals | number | null;
    }>;
    kill: (signal?: NodeJS.Signals) => void;
    dispose: () => void;
};
export declare function createPtyAdapter(params: {
    shell: string;
    args: string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    cols?: number;
    rows?: number;
    name?: string;
}): Promise<PtyAdapter>;
