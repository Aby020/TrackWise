import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgSchema,
    serial,
    time,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import { modernSchemaName } from "@/config/env";

export const modernSchema = pgSchema(modernSchemaName);

export const userRoleEnum = modernSchema.enum("user_role", [
    "admin",
    "employee",
]);

export const userStatusEnum = modernSchema.enum("user_status", [
    "pending",
    "active",
    "inactive",
]);

export const attendanceStatusEnum = modernSchema.enum("attendance_status", [
    "working",
    "on_break",
    "completed",
    "flagged",
]);

export const breakTypeEnum = modernSchema.enum("break_type", [
    "lunch",
    "tea",
    "personal_gap",
]);

export const faceVerificationStatusEnum = modernSchema.enum(
    "face_verification_status",
    ["PASSED", "MISSED", "FAILED"],
);

export const users = modernSchema.table(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        employeeId: varchar("employee_id", { length: 20 }).notNull(),
        firstName: varchar("first_name", { length: 100 }).notNull(),
        lastName: varchar("last_name", { length: 100 }).notNull(),
        email: varchar("email", { length: 150 }).notNull(),
        passwordHash: varchar("password_hash", { length: 255 }),
        role: userRoleEnum("role").notNull().default("employee"),
        status: userStatusEnum("status").notNull().default("pending"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("users_employee_id_unique").on(table.employeeId),
        uniqueIndex("users_email_unique").on(table.email),
        index("users_role_idx").on(table.role),
        index("users_status_idx").on(table.status),
    ],
);

export const companyShifts = modernSchema.table(
    "company_shifts",
    {
        id: serial("id").primaryKey(),
        shiftName: varchar("shift_name", { length: 100 })
            .notNull()
            .default("Standard Office Hours"),
        startTime: time("start_time", { withTimezone: false })
            .notNull()
            .default("08:30:00"),
        endTime: time("end_time", { withTimezone: false })
            .notNull()
            .default("17:00:00"),
        earlyCheckinGraceMinutes: integer("early_checkin_grace_minutes")
            .notNull()
            .default(15),
        isStrictEnforced: boolean("is_strict_enforced").notNull().default(false),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("company_shifts_is_active_idx").on(table.isActive),
        uniqueIndex("company_shifts_single_active_unique")
            .on(table.isActive)
            .where(sql`${table.isActive} = true`),
    ],
);

export const userBiometrics = modernSchema.table(
    "user_biometrics",
    {
        id: serial("id").primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        faceDescriptor: jsonb("face_descriptor")
            .$type<readonly number[]>()
            .notNull(),
        enrolledAt: timestamp("enrolled_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [index("user_biometrics_user_id_idx").on(table.userId)],
);

export const attendanceRecords = modernSchema.table(
    "attendance_records",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        workDate: varchar("work_date", { length: 10 }).notNull(),
        checkIn: timestamp("check_in", { withTimezone: true }),
        checkOut: timestamp("check_out", { withTimezone: true }),
        netWorkingMinutes: integer("net_working_minutes").notNull().default(0),
        breakMinutes: integer("break_minutes").notNull().default(0),
        status: attendanceStatusEnum("status").notNull().default("working"),
        sessionActive: boolean("session_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        uniqueIndex("attendance_records_user_day_unique").on(
            table.userId,
            table.workDate,
        ),
        index("attendance_records_work_date_idx").on(table.workDate),
    ],
);

export const attendanceBreaks = modernSchema.table(
    "attendance_breaks",
    {
        id: serial("id").primaryKey(),
        attendanceId: uuid("attendance_id")
            .notNull()
            .references(() => attendanceRecords.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        breakType: breakTypeEnum("break_type").notNull(),
        startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
        endedAt: timestamp("ended_at", { withTimezone: true }),
        durationMinutes: integer("duration_minutes").notNull().default(0),
    },
    (table) => [
        index("attendance_breaks_attendance_id_idx").on(table.attendanceId),
        index("attendance_breaks_user_id_idx").on(table.userId),
    ],
);

export const faceVerificationLogs = modernSchema.table(
    "face_verification_logs",
    {
        id: serial("id").primaryKey(),
        attendanceId: uuid("attendance_id")
            .notNull()
            .references(() => attendanceRecords.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        status: faceVerificationStatusEnum("status").notNull(),
        confidenceScore: integer("confidence_score").notNull(),
        checkedAt: timestamp("checked_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("face_verification_logs_attendance_id_idx").on(
            table.attendanceId,
        ),
        index("face_verification_logs_user_id_idx").on(table.userId),
    ],
);

export const usersRelations = relations(users, ({ many }) => ({
    biometrics: many(userBiometrics),
    attendanceRecords: many(attendanceRecords),
    breaks: many(attendanceBreaks),
    faceVerificationLogs: many(faceVerificationLogs),
}));

export const userBiometricsRelations = relations(
    userBiometrics,
    ({ one }) => ({
        user: one(users, {
            fields: [userBiometrics.userId],
            references: [users.id],
        }),
    }),
);

export const attendanceRecordsRelations = relations(
    attendanceRecords,
    ({ one, many }) => ({
        user: one(users, {
            fields: [attendanceRecords.userId],
            references: [users.id],
        }),
        breaks: many(attendanceBreaks),
        faceVerificationLogs: many(faceVerificationLogs),
    }),
);

export const attendanceBreaksRelations = relations(
    attendanceBreaks,
    ({ one }) => ({
        attendance: one(attendanceRecords, {
            fields: [attendanceBreaks.attendanceId],
            references: [attendanceRecords.id],
        }),
        user: one(users, {
            fields: [attendanceBreaks.userId],
            references: [users.id],
        }),
    }),
);

export const faceVerificationLogsRelations = relations(
    faceVerificationLogs,
    ({ one }) => ({
        attendance: one(attendanceRecords, {
            fields: [faceVerificationLogs.attendanceId],
            references: [attendanceRecords.id],
        }),
        user: one(users, {
            fields: [faceVerificationLogs.userId],
            references: [users.id],
        }),
    }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CompanyShift = typeof companyShifts.$inferSelect;
export type NewCompanyShift = typeof companyShifts.$inferInsert;
export type UserBiometric = typeof userBiometrics.$inferSelect;
export type NewUserBiometric = typeof userBiometrics.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type AttendanceBreak = typeof attendanceBreaks.$inferSelect;
export type NewAttendanceBreak = typeof attendanceBreaks.$inferInsert;
export type FaceVerificationLog = typeof faceVerificationLogs.$inferSelect;
export type NewFaceVerificationLog = typeof faceVerificationLogs.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type AttendanceStatus = (typeof attendanceStatusEnum.enumValues)[number];
export type BreakType = (typeof breakTypeEnum.enumValues)[number];
export type FaceVerificationStatus =
    (typeof faceVerificationStatusEnum.enumValues)[number];
