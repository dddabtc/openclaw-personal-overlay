export type SlackStreamMode = "replace" | "status_final" | "append";
export declare function resolveSlackStreamMode(raw: unknown): SlackStreamMode;
export declare function applyAppendOnlyStreamUpdate(params: {
    incoming: string;
    rendered: string;
    source: string;
}): {
    rendered: string;
    source: string;
    changed: boolean;
};
export declare function buildStatusFinalPreviewText(updateCount: number): string;
