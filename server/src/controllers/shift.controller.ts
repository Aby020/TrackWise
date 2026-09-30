import type { Request, Response } from "express";

import {
    getActiveShift,
    ShiftNotFoundError,
    updateActiveShift,
} from "@/services/shift.service";
import { updateShiftSchema } from "@/validations/shift.schema";

export const getCurrentShift = async (
    _req: Request,
    res: Response,
): Promise<void> => {
    try {
        const shift = await getActiveShift();

        res.status(200).json({ success: true, data: shift });
    } catch (error: unknown) {
        const status =
            error instanceof ShiftNotFoundError ? 404 : 500;

        res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load shift configuration.",
        });
    }
};

export const updateCurrentShift = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const parsed = updateShiftSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: "Invalid shift configuration.",
            errors: parsed.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    try {
        const shift = await updateActiveShift(parsed.data);

        res.status(200).json({ success: true, data: shift });
    } catch (error: unknown) {
        const status =
            error instanceof ShiftNotFoundError
                ? 404
                : error instanceof Error && error.message.includes("earlier")
                  ? 400
                  : 500;

        res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update shift configuration.",
        });
    }
};
