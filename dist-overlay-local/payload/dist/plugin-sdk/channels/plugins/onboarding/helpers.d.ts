import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { PromptAccountId } from "../onboarding-types.js";
export declare const promptAccountId: PromptAccountId;
export declare function addWildcardAllowFrom(allowFrom?: Array<string | number> | null): string[];
export declare function mergeAllowFromEntries(current: Array<string | number> | null | undefined, additions: Array<string | number>): string[];
type AllowFromResolution = {
    input: string;
    resolved: boolean;
    id?: string | null;
};
export declare function promptResolvedAllowFrom(params: {
    prompter: WizardPrompter;
    existing: Array<string | number>;
    token?: string | null;
    message: string;
    placeholder: string;
    label: string;
    parseInputs: (value: string) => string[];
    parseId: (value: string) => string | null;
    invalidWithoutTokenNote: string;
    resolveEntries: (params: {
        token: string;
        entries: string[];
    }) => Promise<AllowFromResolution[]>;
}): Promise<string[]>;
export {};
