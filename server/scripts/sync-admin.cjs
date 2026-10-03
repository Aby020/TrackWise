/**
 * Synchronizes the bootstrap admin credentials across both user tables.
 *
 * The auth flow (login/activate) reads the legacy `public.users` table,
 * while the modern TypeScript stack (drizzle, punch/shift services)
 * writes `modern.users`. Both rows must carry the same password hash
 * and status, otherwise an admin can log in against one schema but not
 * the other.
 *
 * Usage: node scripts/sync-admin.cjs
 * Password, employee id and email come from the environment
 * (ADMIN_PASSWORD / ADMIN_EMPLOYEE_ID / ADMIN_EMAIL).
 * ADMIN_PASSWORD is required — the script refuses to run
 * without it so no fallback credential can leak into the repo.
 */
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Pool } = require("pg");

require("dotenv").config({ quiet: true });

const EMPLOYEE_ID = process.env.ADMIN_EMPLOYEE_ID ?? "ADMIN001";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@trackwise.app";
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error("ADMIN_PASSWORD environment variable is required.");
  process.exit(1);
}
const FIRST_NAME = "System";
const LAST_NAME = "Administrator";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "trackwise_db",
});

const insertLegacy = (values) =>
  pool.query(
    `INSERT INTO public.users
       (employee_id, first_name, last_name, email, role, account_status, password)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (employee_id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           account_status = EXCLUDED.account_status,
           password = EXCLUDED.password,
           updated_at = CURRENT_TIMESTAMP`,
    values,
  );

const insertModern = (values) =>
  pool.query(
    `INSERT INTO modern.users
       (employee_id, first_name, last_name, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (employee_id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           updated_at = CURRENT_TIMESTAMP`,
    values,
  );

const verifyPassword = (schema, column) =>
  pool
    .query(
      `SELECT ${column} AS hash FROM ${schema}.users WHERE employee_id = $1`,
      [EMPLOYEE_ID],
    )
    .then((res) => bcrypt.compare(PASSWORD, res.rows[0]?.hash ?? ""));

(async () => {
  await pool.query("BEGIN");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await insertLegacy([
    EMPLOYEE_ID,
    FIRST_NAME,
    LAST_NAME,
    EMAIL,
    "admin",
    "active",
    passwordHash,
  ]);
  await insertModern([
    EMPLOYEE_ID,
    FIRST_NAME,
    LAST_NAME,
    EMAIL,
    passwordHash,
    "admin",
    "active",
  ]);

  await pool.query("COMMIT");

  const legacyOk = await verifyPassword("public", "password");
  const modernOk = await verifyPassword("modern", "password_hash");

  console.log(`Synchronized ${EMPLOYEE_ID} (${EMAIL}) in public.users and modern.users`);
  console.log(`  public.users  password verifies: ${legacyOk ? "yes" : "NO"}`);
  console.log(`  modern.users  password verifies: ${modernOk ? "yes" : "NO"}`);

  if (!legacyOk || !modernOk) {
    console.error("Sync failed verification — refusing to report success.");
    process.exitCode = 1;
  }

  await pool.end();
})().catch(async (err) => {
  console.error(err.message);
  try {
    await pool.query("ROLLBACK");
  } catch {
    /* rollback already rolled back */
  }
  await pool.end();
  process.exit(1);
});
