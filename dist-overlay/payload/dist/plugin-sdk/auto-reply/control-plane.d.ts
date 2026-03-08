import type { OpenClawConfig } from "../config/config.js";
import type { ReplyDispatcher } from "./reply/reply-dispatcher.js";
import type { FinalizedMsgContext } from "./templating.js";
export declare const STRICT_CONTROL_COMMAND_RE: RegExp;
type ControlCommand = "stop" | "status";
export declare function matchStrictControlCommand(raw?: string): {
    command: ControlCommand;
    rawTrimmed: string;
} | null;
export declare function maybeHandleControlPlaneCommand(params: {
    ctx: FinalizedMsgContext;
    cfg: OpenClawConfig;
    dispatcher: ReplyDispatcher;
    signal?: AbortSignal;
}): Promise<{
    handled: boolean;
}>;
export {};
