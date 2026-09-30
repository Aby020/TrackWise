import "dotenv/config";

const num = (raw: string | undefined, fallback: number): number => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export interface DatabaseSettings {
    readonly connectionString: string | undefined;
    readonly host: string;
    readonly port: number;
    readonly user: string | undefined;
    readonly password: string | undefined;
    readonly database: string;
    readonly ssl: boolean;
    readonly poolMax: number;
}

const buildDatabaseUrl = (): string => {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }

    const host = process.env.DB_HOST ?? "localhost";
    const port = num(process.env.DB_PORT, 5432);
    const user = process.env.DB_USER ?? "postgres";
    const password = process.env.DB_PASSWORD ?? "";
    const database = process.env.DB_NAME ?? "trackwise_db";

    const credentials =
        password.length > 0
            ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
            : encodeURIComponent(user);

    return `postgresql://${credentials}@${host}:${port}/${database}`;
};

export const databaseSettings: DatabaseSettings = {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? "localhost",
    port: num(process.env.DB_PORT, 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? "trackwise_db",
    ssl: process.env.PGSSL === "true",
    poolMax: num(process.env.DB_POOL_MAX, 10),
};

export const databaseUrl: string = buildDatabaseUrl();

export const modernSchemaName = "modern";

export const adminSeedDefaults = {
    employeeId: process.env.ADMIN_EMPLOYEE_ID ?? "ADMIN001",
    email: process.env.ADMIN_EMAIL ?? "admin@trackwise.app",
    password: process.env.ADMIN_PASSWORD ?? "TrackwiseDev2026",
    firstName: "Admin",
    lastName: "User",
} as const;

export const shiftSeedDefaults = {
    shiftName: "Standard Office Hours",
    startTime: "08:30:00",
    endTime: "17:00:00",
    earlyCheckinGraceMinutes: 15,
} as const;

export const jwtSecret = process.env.JWT_SECRET ?? "";
