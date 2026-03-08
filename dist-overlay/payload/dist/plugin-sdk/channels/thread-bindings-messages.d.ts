export declare function formatThreadBindingTtlLabel(ttlMs: number): string;
export declare function resolveThreadBindingThreadName(params: {
    agentId?: string;
    label?: string;
}): string;
export declare function resolveThreadBindingIntroText(params: {
    agentId?: string;
    label?: string;
    sessionTtlMs?: number;
    sessionCwd?: string;
    sessionDetails?: string[];
}): string;
export declare function resolveThreadBindingFarewellText(params: {
    reason?: string;
    farewellText?: string;
    sessionTtlMs: number;
}): string;
