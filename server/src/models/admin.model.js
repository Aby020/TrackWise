const pool = require("../database/db");

const getDashboardStatistics = async () => {

    const query = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'employee') AS total_employees,

            (SELECT COUNT(*)
             FROM attendance
             WHERE work_date = CURRENT_DATE
             AND working_status = 'working') AS working_today,

            (SELECT COUNT(*)
             FROM attendance
             WHERE work_date = CURRENT_DATE
             AND working_status = 'not_working') AS completed_today;
    `;

    const result = await pool.query(query);

    return result.rows[0];

};
const getEmployees = async () => {

    const query = `
        SELECT
            employee_id,
            first_name,
            last_name,
            email,
            department,
            designation,
            account_status
        FROM users
        WHERE role = 'employee'
        ORDER BY employee_id;
    `;

    const result = await pool.query(query);

    return result.rows;

};
const getEmployeeByEmployeeId = async (employeeId) => {

    const query = `
        SELECT
            employee_id,
            first_name,
            last_name,
            email,
            phone,
            department,
            designation,
            account_status
        FROM users
        WHERE employee_id = $1
        AND role = 'employee';
    `;

    const result = await pool.query(query, [

        employeeId

    ]);

    return result.rows[0];

};
const updateEmployee = async (

    employeeId,

    employeeData

) => {

    const query = `
        UPDATE users
        SET
            first_name = $2,
            last_name = $3,
            email = $4,
            phone = $5,
            department = $6,
            designation = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = $1
        RETURNING *;
    `;

    const values = [

        employeeId,

        employeeData.firstName,

        employeeData.lastName,

        employeeData.email,

        employeeData.phone,

        employeeData.department,

        employeeData.designation

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

};

const toggleEmployeeStatus = async (employeeId) => {

    const query = `
        UPDATE users
        SET
            account_status =
                CASE
                    WHEN account_status = 'active'
                    THEN 'inactive'
                    ELSE 'active'
                END,

            updated_at = CURRENT_TIMESTAMP

        WHERE employee_id = $1
        AND role = 'employee'

        RETURNING
            employee_id,
            first_name,
            last_name,
            account_status;
    `;

    const result = await pool.query(query, [

        employeeId

    ]);

    return result.rows[0];

};

module.exports = {

    getDashboardStatistics,

    getEmployees,

    getEmployeeByEmployeeId,

    updateEmployee,

    toggleEmployeeStatus

};