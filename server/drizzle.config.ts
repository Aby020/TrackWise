import { defineConfig } from "drizzle-kit";

const num = (raw: string | undefined, fallback: number): number => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const buildUrl = (): string => {
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

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: buildUrl(),
    },
    strict: true,
    verbose: true,
});
