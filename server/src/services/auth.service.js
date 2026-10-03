const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const userModel = require("../models/user.model");

const LEGACY_TABLE = "public.users";
const MODERN_TABLE = "modern.users";

/** Postgres error code for a missing table/schema. */
const UNDEFINED_TABLE = "42P01";

/**
 * Clean and normalize the login identifier.
 *
 * Accepts whichever key the caller used (identifier,
 * employeeId or email), trims whitespace, and strips
 * hyphens so "EMP-101", "emp101" and "EMP101" all
 * resolve to the same normalized form.
 */
const cleanIdentifier = (loginData) => {
    const raw = String(
        loginData.identifier ?? loginData.employeeId ?? loginData.email ?? "",
    );

    return {
        raw: raw.trim(),
        normalizedId: raw.replace(/-/g, "").trim().toUpperCase(),
    };
};

/** True when the identifier looks like a corporate email. */
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * Unify the two user-table shapes into one object.
 *
 * `modern.users` stores the hash in `password_hash` and the
 * state in `status`; `public.users` uses `password` and
 * `account_status`. Normalizing here lets the rest of the
 * service read a single shape regardless of the source row.
 */
const normalizeRow = (row) => ({
    id: row.id,
    employee_id: row.employee_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    password: row.password_hash || row.password,
    role: row.role,
    account_status: row.status || row.account_status,
});

/**
 * Locate the user across both user stores.
 *
 * The modern TypeScript stack writes `modern.users` while the
 * legacy auth stack reads `public.users`, so a login must
 * resolve against whichever schema holds the row. The modern
 * table is preferred; a missing schema or no match falls
 * through to the legacy table.
 */
const findUser = async (loginData) => {
    const { raw, normalizedId } = cleanIdentifier(loginData);

    if (!raw) {
        return null;
    }

    let modernRow;

    try {
        const modernResult = await pool.query(
            `SELECT id, employee_id, first_name, last_name, email,
                    password_hash, role, status
               FROM ${MODERN_TABLE}
              WHERE UPPER(REPLACE(employee_id, '-', '')) = $1
                 OR LOWER(email) = LOWER($2)
              ORDER BY (UPPER(REPLACE(employee_id, '-', '')) = $1) DESC
              LIMIT 1`,
            [normalizedId, raw],
        );

        modernRow = modernResult.rows[0];
    } catch (error) {
        // A database without the modern schema is a legacy-only
        // deployment — keep going with the legacy table below.
        if (error?.code !== UNDEFINED_TABLE) {
            throw error;
        }
    }

    if (modernRow) {
        return normalizeRow(modernRow);
    }

    const legacyResult = await pool.query(
        `SELECT id, employee_id, first_name, last_name, email,
                password, role, account_status
           FROM ${LEGACY_TABLE}
          WHERE UPPER(REPLACE(employee_id, '-', '')) = $1
             OR LOWER(email) = LOWER($2)
          ORDER BY (UPPER(REPLACE(employee_id, '-', '')) = $1) DESC
          LIMIT 1`,
        [normalizedId, raw],
    );

    const legacyRow = legacyResult.rows[0];

    return legacyRow ? normalizeRow(legacyRow) : null;
};

const activateAccount = async (employeeData) => {
    // Check whether employee exists
    const employee = await userModel.findByEmployeeId(employeeData.employeeId);

    if (!employee) {
        throw new Error("Employee ID not found.");
    }

    if (employee.account_status === "inactive") {
        throw new Error(
            "Your account has been deactivated. Please contact the administrator.",
        );
    }

    // Check if account is already active
    if (employee.account_status === "active") {
        throw new Error("Account is already active. Please sign in.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // Activate account
    const activatedEmployee = await userModel.activateEmployee(
        employeeData.employeeId,
        hashedPassword,
    );

    return {
        success: true,

        message: "Account activated successfully.",

        data: {
            employeeId: activatedEmployee.employee_id,
            accountStatus: activatedEmployee.account_status,
        },
    };
};

/**
 * Fail an authentication attempt.
 *
 * The controller maps this typed error to a 401 so a bad
 * password is distinguishable from validation (400) and
 * not-yet-activated (needsActivation) failures.
 */
const invalidCredentials = () => {
    const error = new Error("Invalid Employee ID or Password.");
    error.name = "InvalidCredentialsError";
    return error;
};

const login = async (loginData) => {
    // One login field accepts either the employee id or the
    // corporate email, matched case-insensitively. Hyphens are
    // stripped so "EMP-101" and "emp101" both resolve to EMP101.
    const employee = await findUser(loginData);

    if (!employee) {
        throw invalidCredentials();
    }

    const hash = employee.password;

    // A pending account (or one without a password) has never
    // completed activation, so reject with a typed error the
    // controller can translate into a needsActivation response.
    if (employee.account_status === "pending" || !hash) {
        const error = new Error(
            "Account not activated yet. Please activate your account first.",
        );
        error.name = "AccountNotActivatedError";
        error.needsActivation = true;
        error.employeeId = employee.employee_id;
        throw error;
    }

    if (employee.account_status === "inactive") {
        throw new Error(
            "Your account has been deactivated. Please contact the administrator"
        );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(loginData.password, hash);

    if (!passwordMatch) {
        throw invalidCredentials();
    }

    // The token carries both the legacy integer primary key and the
    // employee identifier so every downstream resolver (legacy public
    // schema and modern UUID schema alike) can locate the caller.
    const token = jwt.sign(
        {
            id: employee.id,
            employeeId: employee.employee_id,
            employee_id: employee.employee_id,
            role: employee.role,
            accountStatus: employee.account_status,
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "8h",
        },
    );

    return {
        success: true,

        message: "Login Successful",

        token,

        user: {
            employeeId: employee.employee_id,

            firstName: employee.first_name,

            lastName: employee.last_name,

            role: employee.role,
        },
    };
};

module.exports = {
    activateAccount,

    login,
};
