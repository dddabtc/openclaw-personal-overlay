import type { OpenClawConfig } from "../config/config.js";
export declare const DISCORD_THREAD_BINDING_CHANNEL = "discord";
export type ThreadBindingSpawnKind = "subagent" | "acp";
export type ThreadBindingSpawnPolicy = {
    channel: string;
    accountId: string;
    enabled: boolean;
    spawnEnabled: boolean;
};
export declare function resolveThreadBindingSessionTtlMs(params: {
    channelTtlHoursRaw: unknown;
    sessionTtlHoursRaw: unknown;
}): number;
export declare function resolveThreadBindingsEnabled(params: {
    channelEnabledRaw: unknown;
    sessionEnabledRaw: unknown;
}): boolean;
export declare function resolveThreadBindingSpawnPolicy(params: {
    cfg: OpenClawConfig;
    channel: string;
    accountId?: string;
    kind: ThreadBindingSpawnKind;
}): ThreadBindingSpawnPolicy;
export declare function resolveThreadBindingSessionTtlMsForChannel(params: {
    cfg: OpenClawConfig;
    channel: string;
    accountId?: string;
}): number;
export declare function formatThreadBindingDisabledError(params: {
    channel: string;
    accountId: string;
    kind: ThreadBindingSpawnKind;
}): string;
export declare function formatThreadBindingSpawnDisabledError(params: {
    channel: string;
    accountId: string;
    kind: ThreadBindingSpawnKind;
}): string;
