import type { PreparedSlackMessage } from "./types.js";
export declare function isSlackStreamingEnabled(streaming: boolean | undefined): boolean;
export declare function resolveSlackStreamingThreadHint(params: {
    replyToMode: "off" | "first" | "all";
    incomingThreadTs: string | undefined;
    messageTs: string | undefined;
}): string | undefined;
export declare function dispatchPreparedSlackMessage(prepared: PreparedSlackMessage): Promise<void>;
