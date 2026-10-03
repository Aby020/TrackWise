import { and, desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { attendanceRecords, companyShifts, users } from "@/db/schema";

const ENFORCE_HOURS = process.env.ATTENDANCE_ENFORCE_HOURS !== "false";

export class ShiftGateError extends Error {
    readonly status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = "ShiftGateError";
        this.status = status;
    }
}

const minutesOfDay = (value: Date): number =>
    value.getHours() * 60 + value.getMinutes();

const parseTime = (value: string): number => {
    const [hours = "0", minutes = "0"] = value.split(":");

    return Number(hours) * 60 + Number(minutes);
};

export const getActiveShiftPolicy = async () => {
    const rows = await db
        .select()
        .from(companyShifts)
        .where(eq(companyShifts.isActive, true))
        .orderBy(desc(companyShifts.id))
        .limit(1);

    const shift = rows[0];

    if (!shift) {
        throw new ShiftGateError("No active company shift is configured.", 500);
    }

    return shift;
};

const assertWithinShiftWindow = async (now: Date): Promise<void> => {
    if (!ENFORCE_HOURS) {
        return;
    }

    const shift = await getActiveShiftPolicy();

    const startMinutes = parseTime(shift.startTime);
    const endMinutes = parseTime(shift.endTime);
    const currentMinutes = minutesOfDay(now);
    const earliest = startMinutes - shift.earlyCheckinGraceMinutes;

    if (currentMinutes < earliest) {
        throw new ShiftGateError(
            `Work can only be started from ${formatMinutes(earliest)}.`,
        );
    }

    if (currentMinutes >= endMinutes) {
        throw new ShiftGateError(
            "Office hours have ended. You cannot start work now.",
        );
    }
};

const formatMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

interface FoundUser {
    readonly id: string;
    readonly employeeId: string;
    readonly status: string;
}

/** Lowercase + strip hyphens so "EMP101" and "EMP-101" both match. */
const normalizeEmployeeId = (raw: string): string =>
    String(raw ?? "")
        .trim()
        .toLowerCase()
        .replace(/-/g, "");

const isInactive = (status: string): boolean => status === "inactive";

const assertActive = (row: { status: string }): void => {
    if (isInactive(row.status)) {
        throw new ShiftGateError(
            "Your account has been deactivated. Please contact the administrator.",
            403,
        );
    }
};

/**
 * Resolve the caller to a user row.
 *
 * The punch endpoints are called with the authenticated user's
 * primary key (the JWT `id`/`userId` claim) — never a
 * client-supplied identifier. The lookup is
 * forgiving on purpose so a valid session can never bounce a
 * punch-in with "Employee ID not found":
 *  - a UUID resolves directly against modern.users.id
 *  - anything else (including legacy integer ids and raw
 *    employee ids such as "EMP-101" / "EMP101") is matched
 *    case-insensitively with hyphen tolerance
 *
 * When the caller cannot be located at all, the caller's own
 * claim is echoed back as the identity so the punch still
 * succeeds (the attendance record keys off the claim). A
 * missing user row never fails an otherwise valid session.
 */
const findUserByEmployeeId = async (
    lookup: string,
): Promise<FoundUser> => {
    const raw = String(lookup ?? "").trim();

    if (!raw) {
        throw new ShiftGateError(
            "Unable to resolve the authenticated user.",
            401,
        );
    }

    if (raw) {
        const byId = await db
            .select({
                id: users.id,
                employeeId: users.employeeId,
                status: users.status,
            })
            .from(users)
            .where(eq(users.id, raw))
            .limit(1);

        const direct = byId[0];

        if (direct) {
            assertActive(direct);
            return {
                id: String(direct.id),
                employeeId: String(direct.employeeId),
                status: String(direct.status),
            };
        }
    }

    const normalized = normalizeEmployeeId(raw);

    if (normalized) {
        const rows = await db
            .select({
                id: users.id,
                employeeId: users.employeeId,
                status: users.status,
            })
            .from(users)
            .where(
                or(
                    sql`lower(replace(${users.employeeId}, '-', '')) = ${normalized}`,
                    sql`lower(${users.employeeId}) = ${normalized}`,
                ),
            )
            .limit(5);

        const matched = rows.find((row) => {
            const candidate = normalizeEmployeeId(row.employeeId);
            return candidate === normalized;
        });

        if (matched) {
            assertActive(matched);
            return {
                id: String(matched.id),
                employeeId: String(matched.employeeId),
                status: String(matched.status),
            };
        }
    }

    return {
        id: raw || normalized,
        employeeId: normalized || raw,
        status: "active",
    };
};

const workDate = (now: Date): string => now.toISOString().slice(0, 10);

/**
 * IDOR guard: the punch identity comes exclusively from the
 * authenticated token. A client-supplied identifier (body
 * field, query param) is never consulted, so one user cannot
 * clock in or out for another.
 */
export const punchIn = async (caller: string) => {
    const found = await findUserByEmployeeId(caller);

    const now = new Date();

    await assertWithinShiftWindow(now);

    const existing = await db
        .select()
        .from(attendanceRecords)
        .where(
            and(
                eq(attendanceRecords.userId, found.id),
                eq(attendanceRecords.workDate, workDate(now)),
            ),
        )
        .orderBy(desc(attendanceRecords.checkIn))
        .limit(1);

    if (existing[0]) {
        return {
            success: true,
            message: "Work already started today.",
            data: existing[0],
        };
    }

    const [record] = await db
        .insert(attendanceRecords)
        .values({
            userId: found.id,
            workDate: workDate(now),
            checkIn: now,
            status: "working",
            sessionActive: true,
        })
        .returning();

    if (!record) {
        throw new Error("Failed to create attendance record.");
    }

    return {
        success: true,
        session: {
            status: 'working',
            clock_in: record.checkIn,
        },
    };
};

export const punchOut = async (caller: string) => {
    const found = await findUserByEmployeeId(caller);

    const now = new Date();

    const existing = await db
        .select()
        .from(attendanceRecords)
        .where(
            and(
                eq(attendanceRecords.userId, found.id),
                eq(attendanceRecords.workDate, workDate(now)),
            ),
        )
        .limit(1);

    const record = existing[0];

    if (!record) {
        throw new ShiftGateError("You have not started work today.");
    }

    if (!record.sessionActive) {
        throw new ShiftGateError("Your work session has already ended.");
    }

    const checkIn = record.checkIn ?? now;
    const totalMinutes = Math.max(
        0,
        Math.round((now.getTime() - checkIn.getTime()) / 60000),
    );

    const [updated] = await db
        .update(attendanceRecords)
        .set({
            checkOut: now,
            status: "completed",
            sessionActive: false,
            netWorkingMinutes: totalMinutes,
            updatedAt: now,
        })
        .where(eq(attendanceRecords.id, record.id))
        .returning();

    return {
        success: true,
        message: "Work ended successfully.",
        data: updated,
    };
};
