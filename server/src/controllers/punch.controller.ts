import type { Request, Response } from "express";

import {
    punchIn,
    punchOut,
    ShiftGateError,
} from "@/services/punch.service";
import { userKey } from "@/middleware/auth.guard";

const MAX_REPORTED_ISSUES = 10;

const failure = (res: Response, error: ShiftGateError): void => {
    res.status(error.status).json({
        success: false,
        message: error.message,
    });
};

export const startWork = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const result = await punchIn(userKey(req.user!));

        res.status(200).json(result);
    } catch (error: unknown) {
        if (error instanceof ShiftGateError) {
            failure(res, error);
            return;
        }

        res.status(500).json({
            success: false,
            message: "Could not start work.",
        });
    }
};

export const endWork = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const result = await punchOut(userKey(req.user!));

        res.status(200).json(result);
    } catch (error: unknown) {
        if (error instanceof ShiftGateError) {
            failure(res, error);
            return;
        }

        res.status(500).json({
            success: false,
            message: "Could not end work.",
        });
    }
};

export const registerValidationErrors = <
    T extends { path: Array<string | number | symbol>; message: string },
>(
    parsed: { success: false; error: { issues: T[] } },
    res: Response,
): void => {
    res.status(400).json({
        success: false,
        message: "Invalid payload.",
        errors: parsed.error.issues
            .slice(0, MAX_REPORTED_ISSUES)
            .map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
    });
};
