Work only in:
D:\AbiLabs\TrackWise

Task:
Create the master execution tracker file `task.md` for Phase 1 of the TrackWise Enterprise Modernization.

Instructions:
Create a file named `task.md` in the root directory with the following contents, formatted cleanly with Markdown check-boxes for real-time progress tracking:

# TrackWise Enterprise Modernization — Phase 1: Foundation & Data Architecture

## Status Overview
- Current Phase: Phase 1 (TypeScript, Drizzle ORM, Dynamic Shift Engine)
- Target Stack: TypeScript 5.8+, Drizzle ORM, PostgreSQL (pg), Zod, Express 5 / Fastify

---

## 1. Tooling & Environment Setup
- [x] Initialize/Audit `tsconfig.json` with strict mode, ESNext module resolution, and path aliases (`@/*`)
- [x] Install production dependencies: `drizzle-orm`, `pg`, `zod`, `dotenv`
- [x] Install dev dependencies: `drizzle-kit`, `tsx`, `@types/pg`, `@types/node`, `typescript`
- [x] Configure `drizzle.config.ts` targeting PostgreSQL connection pool
- [x] Add migration scripts to `package.json` (`db:generate`, `db:push`, `db:seed`, `db:studio`)

---

## 2. Drizzle Relational Schema Definition (`src/db/schema.ts`)
- [x] `users`: UUID primary key, employeeId (unique), firstName, lastName, email (unique), passwordHash, role enum ('admin', 'employee'), status enum ('pending', 'active', 'inactive'), timestamps
- [x] `companyShifts`: Serial ID, shiftName, startTime ('08:30:00'), endTime ('17:00:00'), earlyCheckinGraceMinutes (15), isStrictEnforced (boolean), updatedAt
- [x] `userBiometrics`: Serial ID, userId (FK users.id ON DELETE CASCADE), faceDescriptor (JSONB 128-float array), enrolledAt
- [x] `attendanceRecords`: UUID primary key, userId (FK users.id ON DELETE CASCADE), workDate, checkIn, checkOut, netWorkingMinutes, breakMinutes, status enum ('working', 'on_break', 'completed', 'flagged'), sessionActive (boolean)
- [x] `attendanceBreaks`: Serial ID, attendanceId (FK attendanceRecords.id ON DELETE CASCADE), userId (FK users.id), breakType ('lunch', 'tea', 'personal_gap'), startedAt, endedAt, durationMinutes
- [x] `faceVerificationLogs`: Serial ID, attendanceId (FK attendanceRecords.id ON DELETE CASCADE), userId (FK users.id), status ('PASSED', 'MISSED', 'FAILED'), confidenceScore, checkedAt
- [x] Define type exports: `$inferSelect` and `$inferInsert` for all tables

---

## 3. Database Bootstrap & Seeding (`src/db/seed.ts`)
- [x] Create idempotent bootstrap runner:
  - [x] Connect via connection pool
  - [x] Seed default Admin (`ADMIN001`, `TrackwiseDev2026`, role: 'admin') if not present
  - [x] Seed default Company Shift (`08:30:00` to `17:00:00`, 15-min grace period) if not present
- [x] Verify script exits cleanly with exit code 0 on repeated runs

---

## 4. Dynamic Shift Engine & Admin API
- [x] Create Zod schemas for shift update payload (`src/validations/shift.schema.ts`)
- [x] Implement Shift Service (`src/services/shift.service.ts`):
  - [x] `getActiveShift()`: fetch the currently active shift configuration
  - [x] `updateActiveShift(data)`: update start/end times and enforcement parameters
- [x] Implement Shift Controller & Route handlers:
  - [x] `GET /api/admin/shifts/current`: protected by admin role guard
  - [x] `PUT /api/admin/shifts/current`: validates with Zod, commits update, returns modified record
- [x] Mount shift routes onto the main application router

---

## 5. Verification & Quality Gates
- [x] Run `npx drizzle-kit push` / migration to verify PostgreSQL table creation
- [x] Execute `npm run db:seed` and verify database entries
- [x] Run `npx tsc --noEmit` and confirm 0 type errors
- [x] Test `GET` and `PUT` endpoints with curl / test script
- [x] Ensure ZERO inline "#" comments in code
- [x] Confirm ZERO AI attribution in git log or comments

---

Write `task.md` directly. Do not start implementation yet. Report when the file is created.