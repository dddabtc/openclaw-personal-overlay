export type TelegramNetworkErrorContext = "polling" | "send" | "webhook" | "unknown";
/**
 * Returns true if the error is safe to retry for a non-idempotent Telegram send operation
 * (e.g. sendMessage). Only matches errors that are guaranteed to have occurred *before*
 * the request reached Telegram's servers, preventing duplicate message delivery.
 *
 * Use this instead of isRecoverableTelegramNetworkError for sendMessage/sendPhoto/etc.
 * calls where a retry would create a duplicate visible message.
 */
export declare function isSafeToRetrySendError(err: unknown): boolean;
export declare function isRecoverableTelegramNetworkError(err: unknown, options?: {
    context?: TelegramNetworkErrorContext;
    allowMessageMatch?: boolean;
}): boolean;
