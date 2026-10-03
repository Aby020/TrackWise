const pool = require("../database/db");

/** Create a new employee row (no password yet — set during activation). */
const createEmployee = async (employeeData) => {
    const query = `
        INSERT INTO users
        (
            employee_id,
            first_name,
            last_name,
            email,
            phone,
            department,
            designation
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id,
            employee_id,
            first_name,
            last_name,
            email,
            department,
            designation,
            account_status;
    `;

    const values = [
        employeeData.employeeId,
        employeeData.firstName,
        employeeData.lastName,
        employeeData.email,
        employeeData.phone || null,
        employeeData.department || null,
        employeeData.designation || null,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const findByEmployeeId = async (employeeId) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE employee_id = $1",
        [employeeId],
    );

    return result.rows[0];
};

const findByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
    );

    return result.rows[0];
};

/**
 * Locate a login by its identifier, accepting either the employee id
 * or the corporate email, case-insensitively. The login form only has
 * one field, so users may type either — including mixed case such as
 * "admin001" or "Admin@TrackWise.app".
 */
const findByLoginIdentifier = async (identifier) => {
    const normalized = String(identifier ?? "").trim();

    const result = await pool.query(
        `SELECT * FROM users
          WHERE LOWER(employee_id) = LOWER($1)
             OR LOWER(email) = LOWER($1)
          ORDER BY (LOWER(employee_id) = LOWER($1)) DESC
          LIMIT 1`,
        [normalized],
    );

    return result.rows[0];
};

const activateEmployee = async (employeeId, hashedPassword) => {
    const query = `
        UPDATE users
        SET
            password = $1,
            account_status = 'active',
            updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = $2
        RETURNING
            employee_id,
            account_status;
    `;

    const result = await pool.query(query, [hashedPassword, employeeId]);

    return result.rows[0];
};

module.exports = {
    createEmployee,
    findByEmployeeId,
    findByEmail,
    findByLoginIdentifier,
    activateEmployee,
};
