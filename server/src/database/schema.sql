-- TrackWise schema
-- Idempotent: safe to run repeatedly (CREATE ... IF NOT EXISTS). Applied on
-- startup by src/database/setup.js and runnable manually via:
--   node -e "require('./src/database/setup')()"

-- ---------------------------------------------------------------------------
-- Users — every account (employees + admins) lives in one table.
-- Employees start as `pending` (no password) until they activate their
-- account. Admins are seeded `active` by the bootstrap in src/app.js.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    employee_id    VARCHAR(20) UNIQUE NOT NULL,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) UNIQUE NOT NULL,
    phone          VARCHAR(20),
    department     VARCHAR(100),
    designation    VARCHAR(100),
    joining_date   DATE,
    password       TEXT,
    role           VARCHAR(20) NOT NULL DEFAULT 'employee',
    account_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    token_version  INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Attendance — one row per employee per working day.
-- UNIQUE (user_id, work_date) is the integrity guard against double
-- check-ins (the service also pre-checks, but the constraint is the backstop).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id             SERIAL PRIMARY KEY,
    user_id        INT NOT NULL,
    work_date      DATE NOT NULL,
    check_in       TIMESTAMP,
    check_out      TIMESTAMP,
    total_hours    DECIMAL(5,2),
    working_status VARCHAR(20) DEFAULT 'inactive',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_attendance_user_day UNIQUE (user_id, work_date)
);

-- ---------------------------------------------------------------------------
-- Leave requests — placeholder domain table for future leave workflow.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL,
    leave_date   DATE NOT NULL,
    reason       TEXT NOT NULL,
    status       VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Indexes for the query patterns actually used by the app.
CREATE INDEX IF NOT EXISTS idx_users_role          ON users(role);
CREATE INDEX IF NOT EXISTS idx_attendance_user_day ON attendance(user_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_workday  ON attendance(work_date);
