import type { Request, Response } from "express";

import {
    getActiveShift,
    ShiftNotFoundError,
} from "@/services/shift.service";

const minutesToClockLabel = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const getShiftInfo = async (
    _req: Request,
    res: Response,
): Promise<void> => {
    try {
        const shift = await getActiveShift();

        if (!shift) {
            throw new ShiftNotFoundError();
        }

        res.status(200).json({
            success: true,
            data: {
                shiftName: shift.shiftName,
                startTime: shift.startTime,
                endTime: shift.endTime,
                startLabel: minutesToClockLabel(
                    Number(shift.startTime.split(":")[0]) * 60 +
                        Number(shift.startTime.split(":")[1]),
                ),
                endLabel: minutesToClockLabel(
                    Number(shift.endTime.split(":")[0]) * 60 +
                        Number(shift.endTime.split(":")[1]),
                ),
                earlyCheckinGraceMinutes: shift.earlyCheckinGraceMinutes,
                isStrictEnforced: shift.isStrictEnforced,
            },
        });
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
