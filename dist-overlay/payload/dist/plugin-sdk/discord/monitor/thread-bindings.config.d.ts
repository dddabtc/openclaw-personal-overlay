import { resolveThreadBindingSessionTtlMs, resolveThreadBindingsEnabled } from "../../channels/thread-bindings-policy.js";
import type { OpenClawConfig } from "../../config/config.js";
export { resolveThreadBindingSessionTtlMs, resolveThreadBindingsEnabled };
export declare function resolveDiscordThreadBindingSessionTtlMs(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): number;
