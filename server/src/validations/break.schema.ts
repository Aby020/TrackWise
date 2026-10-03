import { z } from "zod";

const BREAK_TYPES = ["lunch", "tea", "personal_gap"] as const;

export const createBreakSchema = z
    .object({
        breakType: z.enum(BREAK_TYPES, {
            error: "Break type must be lunch, tea, or personal_gap.",
        }),
    })
    .strict();

export type CreateBreakInput = z.infer<typeof createBreakSchema>;
