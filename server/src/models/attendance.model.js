const pool = require("../database/db");

const findTodayAttendance = async (userId) => {
  const query = `
        SELECT *
        FROM attendance
        WHERE user_id = $1
        AND work_date = CURRENT_DATE
    `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};
const createAttendance = async (userId) => {
  const query = `
        INSERT INTO attendance
        (
            user_id,
            work_date,
            check_in,
            working_status
        )

        VALUES
        (
            $1,
            CURRENT_DATE,
            CURRENT_TIMESTAMP,
            'working'
        )

        RETURNING *;
    `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};
const endWork = async (attendanceId, totalHours) => {
  const query = `
        UPDATE attendance
        SET
            check_out = CURRENT_TIMESTAMP,
            total_hours = $2,
            working_status = 'not_working',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

  const result = await pool.query(query, [attendanceId, totalHours]);

  return result.rows[0];
};
const getAttendanceHistory = async (userId) => {
  const query = `
        SELECT
            work_date,
            check_in,
            check_out,
            total_hours,
            working_status
        FROM attendance
        WHERE user_id = $1
        ORDER BY work_date DESC;
    `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};

module.exports = {
  findTodayAttendance,
  createAttendance,
  endWork,
  getAttendanceHistory,
};
