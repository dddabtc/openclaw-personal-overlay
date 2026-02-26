export declare function runEmbeddingBatchGroups<TRequest>(params: {
    requests: TRequest[];
    maxRequests: number;
    wait: boolean;
    pollIntervalMs: number;
    timeoutMs: number;
    concurrency: number;
    debugLabel: string;
    debug?: (message: string, data?: Record<string, unknown>) => void;
    runGroup: (args: {
        group: TRequest[];
        groupIndex: number;
        groups: number;
        byCustomId: Map<string, number[]>;
    }) => Promise<void>;
}): Promise<Map<string, number[]>>;
