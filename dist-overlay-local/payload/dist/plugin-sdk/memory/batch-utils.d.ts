export type BatchHttpClientConfig = {
    baseUrl?: string;
    headers?: Record<string, string>;
};
export declare function normalizeBatchBaseUrl(client: BatchHttpClientConfig): string;
export declare function buildBatchHeaders(client: Pick<BatchHttpClientConfig, "headers">, params: {
    json: boolean;
}): Record<string, string>;
export declare function splitBatchRequests<T>(requests: T[], maxRequests: number): T[][];
