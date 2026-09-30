import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { companyShifts } from "@/db/schema";
import type { UpdateShiftInput } from "@/validations/shift.schema";

const toTimeString = (value: string): string =>
    value.length === 5 ? `${value}:00` : value;

export class ShiftNotFoundError extends Error {
    constructor() {
        super("No active company shift is configured.");
        this.name = "ShiftNotFoundError";
    }
}

export const getActiveShift = async () => {
    const rows = await db
        .select()
        .from(companyShifts)
        .where(eq(companyShifts.isActive, true))
        .orderBy(desc(companyShifts.id))
        .limit(1);

    const shift = rows[0];

    if (!shift) {
        throw new ShiftNotFoundError();
    }

    return shift;
};

export const updateActiveShift = async (data: UpdateShiftInput) => {
    const current = await getActiveShift();

    const next = {
        ...current,
        ...(data.shiftName === undefined ? {} : { shiftName: data.shiftName }),
        ...(data.startTime === undefined
            ? {}
            : { startTime: toTimeString(data.startTime) }),
        ...(data.endTime === undefined
            ? {}
            : { endTime: toTimeString(data.endTime) }),
        ...(data.earlyCheckinGraceMinutes === undefined
            ? {}
            : {
                  earlyCheckinGraceMinutes:
                      data.earlyCheckinGraceMinutes,
              }),
        ...(data.isStrictEnforced === undefined
            ? {}
            : { isStrictEnforced: data.isStrictEnforced }),
    };

    if (next.startTime >= next.endTime) {
        throw new Error("Start time must be earlier than end time.");
    }

    const updated = await db
        .update(companyShifts)
        .set({
            shiftName: next.shiftName,
            startTime: next.startTime,
            endTime: next.endTime,
            earlyCheckinGraceMinutes: next.earlyCheckinGraceMinutes,
            isStrictEnforced: next.isStrictEnforced,
            updatedAt: new Date(),
        })
        .where(
            and(eq(companyShifts.id, current.id), eq(companyShifts.isActive, true)),
        )
        .returning();

    const row = updated[0];

    if (!row) {
        throw new ShiftNotFoundError();
    }

    return row;
};
