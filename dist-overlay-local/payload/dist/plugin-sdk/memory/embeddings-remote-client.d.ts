import type { EmbeddingProviderOptions } from "./embeddings.js";
type RemoteEmbeddingProviderId = "openai" | "voyage";
export declare function resolveRemoteEmbeddingBearerClient(params: {
    provider: RemoteEmbeddingProviderId;
    options: EmbeddingProviderOptions;
    defaultBaseUrl: string;
}): Promise<{
    baseUrl: string;
    headers: Record<string, string>;
}>;
export {};
