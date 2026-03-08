import type { OpenClawConfig } from "../config/config.js";
import type { GatewayRequestHandler } from "../gateway/server-methods/types.js";
import { type PluginRegistry } from "./registry.js";
import { type CreatePluginRuntimeOptions } from "./runtime/index.js";
import type { PluginLogger } from "./types.js";
export type PluginLoadResult = PluginRegistry;
export type PluginLoadOptions = {
    config?: OpenClawConfig;
    workspaceDir?: string;
    logger?: PluginLogger;
    coreGatewayHandlers?: Record<string, GatewayRequestHandler>;
    runtimeOptions?: CreatePluginRuntimeOptions;
    cache?: boolean;
    mode?: "full" | "validate";
};
type PluginSdkAliasCandidateKind = "dist" | "src";
declare function resolvePluginSdkAliasCandidateOrder(params: {
    modulePath: string;
    isProduction: boolean;
}): PluginSdkAliasCandidateKind[];
declare function listPluginSdkAliasCandidates(params: {
    srcFile: string;
    distFile: string;
    modulePath: string;
}): string[];
export declare const __testing: {
    listPluginSdkAliasCandidates: typeof listPluginSdkAliasCandidates;
    resolvePluginSdkAliasCandidateOrder: typeof resolvePluginSdkAliasCandidateOrder;
    resolvePluginSdkAliasFile: (params: {
        srcFile: string;
        distFile: string;
        modulePath?: string;
    }) => string | null;
};
export declare function loadOpenClawPlugins(options?: PluginLoadOptions): PluginRegistry;
export {};
