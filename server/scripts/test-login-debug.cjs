/**
 * Login diagnostics: verifies bcrypt hashing and the live
 * login endpoint against both user schemas.
 *
 * Usage: node scripts/test-login-debug.cjs
 *
 * Checks:
 *   1. Direct bcrypt comparison of the admin password
 *      against the exact hash stored in modern.users and
 *      public.users.
 *   2. Direct HTTP POST /api/auth/login with the
 *      { identifier, password } payload shape.
 *   3. The same login using the legacy { employeeId, password }
 *      payload shape.
 *
 * Expectations:
 *   - bcrypt comparisons return true for both schemas
 *   - Both HTTP logins return HTTP 200 with a JWT token
 */
const axios = require("axios");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

require("dotenv").config({ quiet: true });

const BASE = process.env.API_URL || "http://localhost:5000";
const LOGIN_PATH = "/api/auth/login";
const ADMIN_ID = process.env.ADMIN_EMPLOYEE_ID || "ADMIN001";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Admin@12345";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "trackwise_db",
});

let failures = 0;

const report = (ok, label, detail) => {
  const tag = ok ? "[PASS]" : "[FAIL]";
  console.log(`${tag} ${label}${detail ? `: ${detail}` : ""}`);
  if (!ok) {
    failures += 1;
  }
};

const readHash = async (schema, column) => {
  const result = await pool.query(
    `SELECT ${column} AS hash FROM ${schema}.users WHERE employee_id = $1`,
    [ADMIN_ID],
  );
  return result.rows[0]?.hash ?? null;
};

const verifySchema = async (schema, column) => {
  const hash = await readHash(schema, column);

  if (!hash) {
    report(false, `${schema}.users ${ADMIN_ID} present`, "no row found");
    return;
  }

  const match = await bcrypt.compare(ADMIN_PASS, hash);
  report(match, `${schema}.users bcrypt compare`, `${ADMIN_PASS} vs ${column}`);
};

const postLogin = async (payload) => {
  try {
    const res = await axios.post(new URL(LOGIN_PATH, BASE).href, payload);
    return { status: res.status, data: res.data };
  } catch (err) {
    return {
      status: err.response?.status ?? 0,
      data: err.response?.data ?? { message: err.message },
    };
  }
};

const checkLogin = async (label, payload) => {
  const { status, data } = await postLogin(payload);
  report(status === 200, `${label} → HTTP ${status}`, JSON.stringify(data));
  report(Boolean(data.token), `${label} token present`);
};

(async () => {
  console.log("--- bcrypt verification ---");
  await verifySchema("modern", "password_hash");
  await verifySchema("public", "password");

  console.log("\n--- live endpoint ---");
  await checkLogin(
    "{ identifier, password }",
    { identifier: ADMIN_ID, password: ADMIN_PASS },
  );
  await checkLogin(
    "{ employeeId, password }",
    { employeeId: ADMIN_ID, password: ADMIN_PASS },
  );

  await pool.end();

  console.log(
    failures === 0
      ? "\nAll login debug checks passed."
      : `\n${failures} login debug check(s) failed.`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
})();
