const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Pool } = require("pg");

const adminHash = bcrypt.hashSync("Admin@12345", 10);

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD || "Abi@9037",
  database: "trackwise_db",
});

/** Mirror the seed into the legacy public.users so the auth flow (login/activate) works end-to-end. */
const insertLegacy = (pool, values) =>
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

const insertModern = (pool, values) =>
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

(async () => {
  await pool.query("BEGIN");

  await insertLegacy(pool, [
    "ADMIN001",
    "System",
    "Administrator",
    "admin@trackwise.io",
    "admin",
    "active",
    adminHash,
  ]);
  await insertLegacy(pool, [
    "EMP101",
    "Jane",
    "Doe",
    "jane.doe@company.internal",
    "employee",
    "pending",
    null,
  ]);

  await insertModern(pool, [
    "ADMIN001",
    "System",
    "Administrator",
    "admin@trackwise.io",
    adminHash,
    "admin",
    "active",
  ]);
  await insertModern(pool, [
    "EMP101",
    "Jane",
    "Doe",
    "jane.doe@company.internal",
    null,
    "employee",
    "pending",
  ]);

  await pool.query("COMMIT");
  console.log("Seeded ADMIN001 + EMP101 in modern.users and public.users");
  await pool.end();
})().catch(async (err) => {
  console.error(err.message);
  try {
    await pool.query("ROLLBACK");
  } catch {}
  process.exit(1);
});
