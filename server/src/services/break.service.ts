import { and, desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { attendanceBreaks, attendanceRecords, users } from "@/db/schema";
import type { CreateBreakInput } from "@/validations/break.schema";
import { ShiftGateError } from "@/services/punch.service";

const workDate = (now: Date): string =>
    now.toISOString().slice(0, 10);

const findActiveSession = async (userId: string, now: Date) => {
    const rows = await db
        .select()
        .from(attendanceRecords)
        .where(
            and(
                eq(attendanceRecords.userId, userId),
                eq(attendanceRecords.workDate, workDate(now)),
            ),
        )
        .orderBy(desc(attendanceRecords.id))
        .limit(1);

    return rows[0];
};

const findUserByEmployeeId = async (lookup: string) => {
    const raw = String(lookup ?? "").trim();

    if (raw) {
        const byId = await db
            .select({
                id: users.id,
                employeeId: users.employeeId,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                status: users.status,
            })
            .from(users)
            .where(eq(users.id, raw))
            .limit(1);

        const direct = byId[0];

        if (direct) {
            if (direct.status === "inactive") {
                throw new ShiftGateError(
                    "Your account has been deactivated. Please contact the administrator.",
                    403,
                );
            }
            return direct;
        }
    }

    const normalized = raw.toLowerCase().replace(/-/g, "");

    const rows = await db
        .select({
            id: users.id,
            employeeId: users.employeeId,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            status: users.status,
        })
        .from(users)
        .where(
            or(
                sql`${users.employeeId} ILIKE ${normalized}`,
                sql`replace(${users.employeeId}, '-', '') ILIKE ${normalized}`,
            ),
        )
        .limit(5);

    const matched = rows.find((row) => {
        const candidate = row.employeeId.toLowerCase().replace(/-/g, "");
        return candidate === normalized;
    });

    const found = matched;

    if (!found) {
        throw new ShiftGateError("Employee ID not found.", 404);
    }

    if (found.status === "inactive") {
        throw new ShiftGateError(
            "Your account has been deactivated. Please contact the administrator.",
            403,
        );
    }

    return found;
};

export const createBreak = async (
    employeeId: string,
    data: CreateBreakInput,
) => {
    const found = await findUserByEmployeeId(employeeId);
    const now = new Date();

    const session = await findActiveSession(found.id, now);

    if (!session || !session.sessionActive) {
        throw new ShiftGateError(
            "You must be clocked in to take a break.",
        );
    }

    const [record] = await db
        .insert(attendanceBreaks)
        .values({
            attendanceId: session.id,
            userId: found.id,
            breakType: data.breakType,
            startedAt: now,
        })
        .returning();

    return {
        success: true,
        message: "Break started.",
        data: record,
    };
};

export const endBreak = async (employeeId: string) => {
    const found = await findUserByEmployeeId(employeeId);
    const now = new Date();

    const openBreaks = await db
        .select()
        .from(attendanceBreaks)
        .where(
            and(
                eq(attendanceBreaks.userId, found.id),
                sql`${attendanceBreaks.endedAt} IS NULL`,
            ),
        )
        .orderBy(desc(attendanceBreaks.startedAt))
        .limit(1);

    const openBreak = openBreaks[0];

    if (!openBreak) {
        throw new ShiftGateError("No break is currently active.");
    }

    const durationMinutes = Math.max(
        0,
        Math.round(
            (now.getTime() - openBreak.startedAt.getTime()) / 60000,
        ),
    );

    const [record] = await db
        .update(attendanceBreaks)
        .set({
            endedAt: now,
            durationMinutes,
        })
        .where(eq(attendanceBreaks.id, openBreak.id))
        .returning();

    const session = await findActiveSession(found.id, now);

    if (session) {
        const existingBreaks = await db
            .select({
                durationMinutes: attendanceBreaks.durationMinutes,
            })
            .from(attendanceBreaks)
            .where(eq(attendanceBreaks.attendanceId, session.id));

        const totalBreakMinutes = existingBreaks.reduce(
            (sum, row) => sum + (row.durationMinutes ?? 0),
            0,
        );

        await db
            .update(attendanceRecords)
            .set({
                breakMinutes: totalBreakMinutes,
                updatedAt: now,
            })
            .where(eq(attendanceRecords.id, session.id));
    }

    return {
        success: true,
        message: "Break ended. Welcome back.",
        data: record,
    };
};
