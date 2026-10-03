import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { companyShifts, users } from "@/db/schema";

const EMPLOYEE_ID_PATTERN = /^EMP(\d+)$/i;

const EMPLOYEE_ID_PREFIX = "EMP";
const FIRST_EMPLOYEE_NUMBER = 100;

interface PendingEmployeeInput {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly shiftId?: number | undefined;
}

interface EmployeeIdResult {
    readonly success: true;
    readonly message: string;
    readonly data: {
        readonly employeeId: string;
        readonly firstName: string;
        readonly lastName: string;
        readonly email: string;
        readonly status: string;
        readonly activationLink: string;
    };
}

interface ShiftOption {
    readonly id: number;
    readonly shiftName: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly isActive: boolean;
}

const employeeExists = async (email: string): Promise<boolean> => {
    const rows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return rows.length > 0;
};

const fetchShiftOptions = async (): Promise<ShiftOption[]> => {
    const rows = await db
        .select({
            id: companyShifts.id,
            shiftName: companyShifts.shiftName,
            startTime: companyShifts.startTime,
            endTime: companyShifts.endTime,
            isActive: companyShifts.isActive,
        })
        .from(companyShifts)
        .orderBy(asc(companyShifts.id));

    return rows;
};

/**
 * Highest existing "EMP###" employee ID, incremented by one.
 * Falls back to EMP100 when no employee IDs exist yet.
 */
export const getNextEmployeeId = async (): Promise<string> => {
    const rows = await db
        .select({ employeeId: users.employeeId })
        .from(users)
        .where(sql`${users.employeeId} ~ '^EMP[0-9]+$'`);

    const highest = rows.reduce((max, row) => {
        const match = EMPLOYEE_ID_PATTERN.exec(row.employeeId);
        const number = match ? Number(match[1]) : 0;
        return Math.max(max, number);
    }, 0);

    const nextNumber = highest > 0 ? highest + 1 : FIRST_EMPLOYEE_NUMBER;

    return `${EMPLOYEE_ID_PREFIX}${nextNumber}`;
};

/**
 * Create a pending employee with no password — they activate
 * themselves via /activate. Returns the generated ID and the
 * activation link for the admin's summary card.
 */
export const createPendingEmployee = async (
    input: PendingEmployeeInput,
): Promise<EmployeeIdResult> => {
    const email = input.email.trim().toLowerCase();

    if (await employeeExists(email)) {
        throw new Error("An account with this corporate email already exists.");
    }

    const employeeId = await getNextEmployeeId();

    const [created] = await db
        .insert(users)
        .values({
            employeeId,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email,
            passwordHash: null,
            role: "employee",
            status: "pending",
        })
        .returning({
            employeeId: users.employeeId,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            status: users.status,
        });

    if (!created) {
        throw new Error("Could not create the employee record.");
    }

    return {
        success: true,
        message: "Employee ID created.",
        data: {
            employeeId: created.employeeId,
            firstName: created.firstName,
            lastName: created.lastName,
            email: created.email,
            status: created.status,
            activationLink: "/activate",
        },
    };
};

/** Shift options for the onboarding modal's selector. */
export const listShiftOptions = async (): Promise<ShiftOption[]> => {
    const shifts = await fetchShiftOptions();

    return shifts;
};

export const shiftExists = async (shiftId: number): Promise<boolean> => {
    const rows = await db
        .select({ id: companyShifts.id })
        .from(companyShifts)
        .where(
            and(eq(companyShifts.id, shiftId)),
        )
        .limit(1);

    return rows.length > 0;
};
