import { z } from "zod";
export declare function buildSecretInputSchema(): z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    source: z.ZodEnum<{
        env: "env";
        file: "file";
        exec: "exec";
    }>;
    provider: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>]>;
