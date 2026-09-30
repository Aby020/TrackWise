import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const timeStringSchema = z
    .string()
    .trim()
    .regex(TIME_PATTERN, "Time must be in HH:MM or HH:MM:SS format.");

export const updateShiftSchema = z
    .object({
        shiftName: z
            .string()
            .trim()
            .min(3, "Shift name must be at least 3 characters.")
            .max(100, "Shift name must be at most 100 characters.")
            .optional(),
        startTime: timeStringSchema.optional(),
        endTime: timeStringSchema.optional(),
        earlyCheckinGraceMinutes: z
            .number()
            .int("Grace minutes must be a whole number.")
            .min(0, "Grace minutes cannot be negative.")
            .max(240, "Grace minutes cannot exceed 240.")
            .optional(),
        isStrictEnforced: z.boolean().optional(),
    })
    .strict()
    .refine(
        (value) =>
            value.startTime === undefined ||
            value.endTime === undefined ||
            value.startTime < value.endTime,
        {
            message: "Start time must be earlier than end time.",
            path: ["startTime"],
        },
    )
    .refine(
        (value) => Object.keys(value).length > 0,
        {
            message: "At least one field is required.",
        },
    );

export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
