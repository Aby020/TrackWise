import { createHash } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";

import { db, pool } from "@/db/client";
import {
    userRoleEnum,
    users,
    userStatusEnum,
    type UserRole,
    type UserStatus,
} from "@/db/schema";

const LEGACY_SCHEMA = "public";
const LEGACY_TABLE = "users";
const UUID_NAMESPACE = "6f5c1d2e-8b7a-4c39-9a41-2f0e6d3b8c15";

const ROLE_VALUES = new Set<string>(userRoleEnum.enumValues);
const STATUS_VALUES = new Set<string>(userStatusEnum.enumValues);

interface LegacyUserRow {
    readonly id: number;
    readonly employee_id: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly password: string | null;
    readonly role: string;
    readonly account_status: string;
    readonly created_at: Date | null;
    readonly updated_at: Date | null;
}

interface UserMigrationReport {
    readonly legacyRows: number;
    readonly inserted: number;
    readonly updated: number;
    readonly skipped: number;
    readonly skippedDetails: ReadonlyArray<{
        readonly legacyId: number;
        readonly employeeId: string;
        readonly reason: string;
    }>;
}

const deterministicUuid = (legacyId: number): string => {
    const hash = createHash("sha1")
        .update(`${UUID_NAMESPACE}:${legacyId}`)
        .digest();

    const bytes = Buffer.from(hash.subarray(0, 16));

    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

    const hex = bytes.toString("hex");

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join("-");
};

const normalizeRole = (
    raw: string,
): UserRole | undefined => (ROLE_VALUES.has(raw) ? (raw as UserRole) : undefined);

const normalizeStatus = (
    raw: string,
): UserStatus | undefined =>
    STATUS_VALUES.has(raw) ? (raw as UserStatus) : undefined;

const toOptionalDate = (value: Date | null): Date | undefined =>
    value === null ? undefined : value;

const readLegacyUsers = async (): Promise<LegacyUserRow[]> => {
    const result = await pool.query<LegacyUserRow>(
        `SELECT id,
                employee_id,
                first_name,
                last_name,
                email,
                password,
                role,
                account_status,
                created_at,
                updated_at
           FROM ${LEGACY_SCHEMA}.${LEGACY_TABLE}
          ORDER BY id ASC`,
    );

    return result.rows;
};

const emailExistsForOther = async (
    email: string,
    employeeId: string,
): Promise<boolean> => {
    const rows = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), sql`${users.employeeId} <> ${employeeId}`))
        .limit(1);

    return rows.length > 0;
};

const migrateUser = async (
    row: LegacyUserRow,
): Promise<"inserted" | "updated" | "skipped"> => {
    const role = normalizeRole(row.role);
    const status = normalizeStatus(row.account_status);

    if (!role || !status) {
        return "skipped";
    }

    const email = row.email.trim().toLowerCase();
    const employeeId = row.employee_id.trim();

    if (await emailExistsForOther(email, employeeId)) {
        return "skipped";
    }

    const values = {
        id: deterministicUuid(row.id),
        employeeId,
        firstName: row.first_name,
        lastName: row.last_name,
        email,
        passwordHash: row.password,
        role,
        status,
        createdAt: toOptionalDate(row.created_at) ?? new Date(),
        updatedAt: toOptionalDate(row.updated_at) ?? new Date(),
    };

    const updated = await db
        .update(users)
        .set({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            passwordHash: values.passwordHash,
            role: values.role,
            status: values.status,
            updatedAt: values.updatedAt,
        })
        .where(eq(users.employeeId, values.employeeId))
        .returning({ id: users.id });

    if (updated.length > 0) {
        return "updated";
    }

    await db
        .insert(users)
        .values(values)
        .onConflictDoNothing({ target: users.employeeId });

    return "inserted";
};

const countModernUsers = async (): Promise<number> => {
    const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM modern.users`,
    );

    return Number(result.rows[0]?.count ?? "0");
};

export const migrateLegacyUsers = async (): Promise<UserMigrationReport> => {
    const legacyRows = await readLegacyUsers();

    let inserted = 0;
    let updated = 0;
    const skippedDetails: Array<{
        legacyId: number;
        employeeId: string;
        reason: string;
    }> = [];

    for (const row of legacyRows) {
        const outcome = await migrateUser(row);

        if (outcome === "inserted") {
            inserted += 1;
            continue;
        }

        if (outcome === "updated") {
            updated += 1;
            continue;
        }

        const role = normalizeRole(row.role);
        const status = normalizeStatus(row.account_status);

        skippedDetails.push({
            legacyId: row.id,
            employeeId: row.employee_id,
            reason: !role
                ? `unsupported role "${row.role}"`
                : !status
                  ? `unsupported account_status "${row.account_status}"`
                  : `email "${row.email}" already claimed by another employee`,
        });
    }

    return {
        legacyRows: legacyRows.length,
        inserted,
        updated,
        skipped: skippedDetails.length,
        skippedDetails,
    };
};

const run = async (): Promise<void> => {
    const report = await migrateLegacyUsers();
    const modernCount = await countModernUsers();

    console.log("Legacy user migration complete.");
    console.log(`  legacy rows read : ${report.legacyRows}`);
    console.log(`  inserted         : ${report.inserted}`);
    console.log(`  updated          : ${report.updated}`);
    console.log(`  skipped          : ${report.skipped}`);
    console.log(`  modern.users     : ${modernCount}`);

    for (const detail of report.skippedDetails) {
        console.log(
            `  skipped ${detail.employeeId} (legacy id ${detail.legacyId}): ${detail.reason}`,
        );
    }

    if (modernCount < report.legacyRows - report.skipped) {
        throw new Error(
            "Row count mismatch: modern.users is missing migrated legacy users.",
        );
    }
};

run()
    .then(() => pool.end())
    .then(() => {
        process.exit(0);
    })
    .catch((error: unknown) => {
        console.error("Legacy user migration failed:", error);
        void pool.end().finally(() => {
            process.exit(1);
        });
    });
