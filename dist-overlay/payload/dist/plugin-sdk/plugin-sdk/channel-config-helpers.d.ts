import type { ChannelConfigAdapter } from "../channels/plugins/types.adapters.js";
import type { OpenClawConfig } from "../config/config.js";
export declare function mapAllowFromEntries(allowFrom: Array<string | number> | null | undefined): string[];
export declare function formatTrimmedAllowFromEntries(allowFrom: Array<string | number>): string[];
export declare function resolveOptionalConfigString(value: string | number | null | undefined): string | undefined;
export declare function createScopedAccountConfigAccessors<ResolvedAccount>(params: {
    resolveAccount: (params: {
        cfg: OpenClawConfig;
        accountId?: string | null;
    }) => ResolvedAccount;
    resolveAllowFrom: (account: ResolvedAccount) => Array<string | number> | null | undefined;
    formatAllowFrom: (allowFrom: Array<string | number>) => string[];
    resolveDefaultTo?: (account: ResolvedAccount) => string | number | null | undefined;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "resolveAllowFrom" | "formatAllowFrom" | "resolveDefaultTo">;
export declare function resolveWhatsAppConfigAllowFrom(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
export declare function formatWhatsAppConfigAllowFromEntries(allowFrom: Array<string | number>): string[];
export declare function resolveWhatsAppConfigDefaultTo(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string | undefined;
export declare function resolveIMessageConfigAllowFrom(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
export declare function resolveIMessageConfigDefaultTo(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string | undefined;
