import type { Request, Response } from "express";

import {
    createBreak as createBreakService,
    endBreak as endBreakService,
} from "@/services/break.service";
import { ShiftGateError } from "@/services/punch.service";
import { userKey } from "@/middleware/auth.guard";
import { createBreakSchema } from "@/validations/break.schema";

const MAX_REPORTED_ISSUES = 10;

export const createBreakHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const user = req.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Access token is required.",
        });
        return;
    }

    const parsed = createBreakSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: "Invalid break payload.",
            errors: parsed.error.issues
                .slice(0, MAX_REPORTED_ISSUES)
                .map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                })),
        });
        return;
    }

    try {
        const result = await createBreakService(
            userKey(user),
            parsed.data,
        );

        res.status(201).json(result);
    } catch (error: unknown) {
        if (error instanceof ShiftGateError) {
            res.status(error.status).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Could not start your break.",
        });
    }
};

export const endBreakHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const user = req.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: "Access token is required.",
        });
        return;
    }

    try {
        const result = await endBreakService(userKey(user));

        res.status(200).json(result);
    } catch (error: unknown) {
        if (error instanceof ShiftGateError) {
            res.status(error.status).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Could not end your break.",
        });
    }
};

export { createBreakHandler as createBreak };
export { endBreakHandler as endBreak };
