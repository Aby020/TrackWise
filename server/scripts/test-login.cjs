/**
 * Verifies ADMIN001 login end-to-end.
 *
 * Usage: node scripts/test-login.cjs
 *
 * Expectations:
 *   - POST /api/auth/login with ADMIN001 / Admin@12345 returns HTTP 200
 *   - Body contains a valid JWT in the token field
 *   - The decoded token carries employeeId: ADMIN001 and role: admin
 */
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { URL } = require("url");

const ADMIN_ID = process.env.ADMIN_EMPLOYEE_ID || "ADMIN001";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Admin@12345";
const BASE = process.env.API_URL || "http://localhost:5000";
const AUTH_SECRET = process.env.JWT_SECRET;

const loginUrl = new URL("/api/auth/login", BASE).href;

(async () => {
  try {
    const res = await axios.post(loginUrl, {
      employeeId: ADMIN_ID,
      password: ADMIN_PASS,
    });

    if (res.status !== 200) {
      console.error(`Expected HTTP 200, got ${res.status}: ${JSON.stringify(res.data)}`);
      process.exitCode = 1;
      return;
    }

    console.log(`[PASS] HTTP ${res.status}: ${res.data.message}`);

    if (!res.data.token) {
      console.error("[FAIL] response body lacks a JWT token");
      process.exitCode = 1;
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(res.data.token, AUTH_SECRET);
    } catch (e) {
      console.error(`[FAIL] JWT verify failed: ${e.message}`);
      process.exitCode = 1;
      return;
    }
    console.log("[PASS] JWT valid and verified with JWT_SECRET");

    if (decoded.employeeId !== ADMIN_ID) {
      console.error(`[FAIL] token employeeId is '${decoded.employeeId}', expected '${ADMIN_ID}'`);
      process.exitCode = 1;
    } else {
      console.log(`[PASS] token.employeeId = ${decoded.employeeId}`);
    }

    if (decoded.role !== "admin") {
      console.error(`[FAIL] token role is '${decoded.role}', expected 'admin'`);
      process.exitCode = 1;
    } else {
      console.log(`[PASS] token.role = admin`);
    }

    console.log("[PASS] All admin login checks succeeded");
  } catch (err) {
    if (err.response) {
      console.error(`[FAIL] HTTP ${err.response.status}: ${err.response.data?.message || JSON.stringify(err.response.data)}`);
    } else {
      console.error(`[FAIL] request error: ${err.message}`);
    }
    process.exitCode = 1;
  } finally {
    process.exit(process.exitCode ?? 0);
  }
})();
