import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import { adminSeedDefaults, shiftSeedDefaults } from "@/config/env";
import { db, pool } from "@/db/client";
import { companyShifts, users } from "@/db/schema";

const seedAdmin = async (): Promise<void> => {
    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.employeeId, adminSeedDefaults.employeeId))
        .limit(1);

    const passwordHash = await bcrypt.hash(adminSeedDefaults.password, 10);

    const first = existing[0];

    if (first) {
        await db
            .update(users)
            .set({
                email: adminSeedDefaults.email,
                passwordHash,
                role: "admin",
                status: "active",
                updatedAt: new Date(),
            })
            .where(eq(users.id, first.id));

        return;
    }

    await db.insert(users).values({
        employeeId: adminSeedDefaults.employeeId,
        firstName: adminSeedDefaults.firstName,
        lastName: adminSeedDefaults.lastName,
        email: adminSeedDefaults.email,
        passwordHash,
        role: "admin",
        status: "active",
    });
};

const seedCompanyShift = async (): Promise<void> => {
    const existing = await db
        .select({ id: companyShifts.id })
        .from(companyShifts)
        .where(eq(companyShifts.isActive, true))
        .limit(1);

    if (existing[0]) {
        return;
    }

    await db.insert(companyShifts).values({
        shiftName: shiftSeedDefaults.shiftName,
        startTime: shiftSeedDefaults.startTime,
        endTime: shiftSeedDefaults.endTime,
        earlyCheckinGraceMinutes: shiftSeedDefaults.earlyCheckinGraceMinutes,
        isStrictEnforced: false,
        isActive: true,
    });
};

const runSeed = async (): Promise<void> => {
    await seedAdmin();
    await seedCompanyShift();

    const seededUsers = await db
        .select({
            employeeId: users.employeeId,
            email: users.email,
            role: users.role,
            status: users.status,
        })
        .from(users)
        .where(eq(users.employeeId, adminSeedDefaults.employeeId));

    const seededShifts = await db
        .select({
            id: companyShifts.id,
            shiftName: companyShifts.shiftName,
            startTime: companyShifts.startTime,
            endTime: companyShifts.endTime,
            earlyCheckinGraceMinutes: companyShifts.earlyCheckinGraceMinutes,
        })
        .from(companyShifts)
        .where(eq(companyShifts.isActive, true));

    console.log("Seed complete.");
    console.log(`  admin : ${JSON.stringify(seededUsers[0] ?? null)}`);
    console.log(`  shift : ${JSON.stringify(seededShifts[0] ?? null)}`);
};

runSeed()
    .then(() => pool.end())
    .then(() => {
        process.exit(0);
    })
    .catch((error: unknown) => {
        console.error("Seed failed:", error);
        void pool.end().finally(() => {
            process.exit(1);
        });
    });
