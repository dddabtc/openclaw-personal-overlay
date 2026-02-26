export declare function fetchRemoteEmbeddingVectors(params: {
    url: string;
    headers: Record<string, string>;
    body: unknown;
    errorPrefix: string;
}): Promise<number[][]>;
