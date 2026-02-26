export declare function postJsonWithRetry<T>(params: {
    url: string;
    headers: Record<string, string>;
    body: unknown;
    errorPrefix: string;
}): Promise<T>;
