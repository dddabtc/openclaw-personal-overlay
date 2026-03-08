import type { Api, Model } from "@mariozechner/pi-ai";
export type CompactionSafeguardRuntimeValue = {
    maxHistoryShare?: number;
    contextWindowTokens?: number;
    /**
     * Model to use for compaction summarization.
     * Passed through runtime because `ctx.model` is undefined in the compact.ts workflow
     * (extensionRunner.initialize() is never called in that path).
     */
    model?: Model<Api>;
};
export declare const setCompactionSafeguardRuntime: (sessionManager: unknown, value: CompactionSafeguardRuntimeValue | null) => void;
export declare const getCompactionSafeguardRuntime: (sessionManager: unknown) => CompactionSafeguardRuntimeValue | null;
