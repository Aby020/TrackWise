/**
 * One-time activation of the standard test accounts.
 *
 * Sets up instantly-verifiable credentials in BOTH user tables:
 *
 *   EMP101  Jane Doe            Welcome@1234   (employee, active)
 *   EMP102  Alex Morgan         Welcome@1234   (employee, active)
 *   ADMIN001 System Administrator Admin@12345  (admin, active)
 *
 * The auth flow (login/activate) reads the legacy `public.users`
 * table while the modern TypeScript stack writes `modern.users`,
 * so every row must carry the same bcrypt hash and active status
 * in both schemas or the login works against one schema only.
 *
 * Usage: node scripts/quick-activate.cjs
 *
 * Passwords come from the environment (EMP_PASSWORD /
 * ADMIN_PASSWORD). Both are required — the script refuses to
 * run without them so no fallback credential can leak into
 * the repo.
 */
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

require("dotenv").config({ quiet: true });

const EMP_PASSWORD = process.env.EMP_PASSWORD;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMP_PASSWORD || !ADMIN_PASSWORD) {
  console.error(
    "EMP_PASSWORD and ADMIN_PASSWORD environment variables are required.",
  );
  process.exit(1);
}

const ACCOUNTS = [
  {
    employeeId: "EMP101",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@trackwise.app",
    password: EMP_PASSWORD,
    role: "employee",
  },
  {
    employeeId: "EMP102",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@trackwise.app",
    password: EMP_PASSWORD,
    role: "employee",
  },
  {
    employeeId: "ADMIN001",
    firstName: "System",
    lastName: "Administrator",
    email: "admin@trackwise.app",
    password: ADMIN_PASSWORD,
    role: "admin",
  },
];

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "trackwise_db",
});

const upsertLegacy = (values) =>
  pool.query(
    `INSERT INTO public.users
       (employee_id, first_name, last_name, email, role, account_status, password)
     VALUES ($1, $2, $3, $4, $5, 'active', $6)
     ON CONFLICT (employee_id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           account_status = 'active',
           password = EXCLUDED.password,
           updated_at = CURRENT_TIMESTAMP`,
    values,
  );

const upsertModern = (values) =>
  pool.query(
    `INSERT INTO modern.users
       (employee_id, first_name, last_name, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     ON CONFLICT (employee_id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           status = 'active',
           updated_at = CURRENT_TIMESTAMP`,
    values,
  );

const verifyPassword = (schema, column, employeeId, password) =>
  pool
    .query(
      `SELECT ${column} AS hash FROM ${schema}.users WHERE employee_id = $1`,
      [employeeId],
    )
    .then((res) => bcrypt.compare(password, res.rows[0]?.hash ?? ""));

(async () => {
  await pool.query("BEGIN");

  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 10);

    await upsertLegacy([
      account.employeeId,
      account.firstName,
      account.lastName,
      account.email,
      account.role,
      passwordHash,
    ]);
    await upsertModern([
      account.employeeId,
      account.firstName,
      account.lastName,
      account.email,
      passwordHash,
      account.role,
    ]);
  }

  await pool.query("COMMIT");

  console.log("Quick activation complete. Credentials ready for login:");
  for (const account of ACCOUNTS) {
    const legacyOk = await verifyPassword(
      "public",
      "password",
      account.employeeId,
      account.password,
    );
    const modernOk = await verifyPassword(
      "modern",
      "password_hash",
      account.employeeId,
      account.password,
    );

    console.log(
      `  ${account.employeeId.padEnd(9)} / ${account.password.padEnd(12)} (${account.role})`,
    );
    console.log(
      `    public.users verifies: ${legacyOk ? "yes" : "NO"}   modern.users verifies: ${modernOk ? "yes" : "NO"}`,
    );

    if (!legacyOk || !modernOk) {
      console.error(
        `Activation failed verification for ${account.employeeId} — refusing to report success.`,
      );
      process.exitCode = 1;
    }
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
