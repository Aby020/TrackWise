import type { Request, Response } from "express";

import { z } from "zod";

import {
    createPendingEmployee,
    getNextEmployeeId,
    listShiftOptions,
} from "@/services/employeeId.service";

const createEmployeeIdSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(1, "First name is required.")
            .max(100, "First name must be 100 characters or fewer."),
        lastName: z
            .string()
            .trim()
            .min(1, "Last name is required.")
            .max(100, "Last name must be 100 characters or fewer."),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .email("Enter a valid corporate email address.")
            .max(150, "Email must be 150 characters or fewer."),
        shiftId: z
            .number()
            .int()
            .positive()
            .optional(),
    })
    .strict();

const reportIssues = (
    issues: ReadonlyArray<{ path: (string | number | symbol)[]; message: string }>,
    res: Response,
): void => {
    res.status(400).json({
        success: false,
        message: "Invalid payload.",
        errors: issues.slice(0, 10).map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        })),
    });
};

/** GET /admin/employee-id/next → { nextEmployeeId } */
export const getNextEmployeeIdHandler = async (
    _req: Request,
    res: Response,
): Promise<void> => {
    try {
        const nextEmployeeId = await getNextEmployeeId();

        res.status(200).json({
            success: true,
            data: { nextEmployeeId },
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Could not determine the next employee ID.",
        });
    }
};

/** GET /admin/employee-id/shifts → shift selector options */
export const getShiftOptionsHandler = async (
    _req: Request,
    res: Response,
): Promise<void> => {
    try {
        const shifts = await listShiftOptions();

        res.status(200).json({
            success: true,
            data: shifts,
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Could not load shift options.",
        });
    }
};

/** POST /admin/employee-id → create pending employee */
export const createEmployeeIdHandler = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const parsed = createEmployeeIdSchema.safeParse(req.body);

    if (!parsed.success) {
        reportIssues(parsed.error.issues, res);
        return;
    }

    try {
        const result = await createPendingEmployee(parsed.data);

        res.status(201).json(result);
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Could not create the employee ID.";

        const isExpected =
            message.includes("already exists") ||
            message.includes("required") ||
            message.includes("valid");

        res.status(isExpected ? 400 : 500).json({
            success: false,
            message,
        });
    }
};
