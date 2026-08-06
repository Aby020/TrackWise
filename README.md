# 📄 TrackWise

<div align="center">

### Professional Employee Attendance Management Platform

A modern full-stack Employee Attendance Management System that streamlines workforce attendance tracking, employee administration, and daily attendance monitoring through secure authentication, role-based dashboards, and an intuitive user experience.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&style=flat-square)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

<p align="center">
  <img src="screenshots/home-page.gif" alt="TrackWise in action — from login to dashboard" width="100%">
</p>

## 📖 Project Overview

TrackWise is a full-stack **Employee Attendance Management System** designed to simplify workforce attendance tracking and employee administration through a centralized, secure, and user-friendly platform.

The platform enables employees to **activate their accounts**, securely **log in**, **record daily attendance**, and **review attendance history** — while providing administrators with powerful tools for **managing employees**, **monitoring attendance statistics**, **controlling account activation**, and **overseeing daily workforce operations**.

Built with **React, Node.js, Express.js, and PostgreSQL**, TrackWise focuses on security, scalability, and maintainability. It demonstrates a production-grade implementation of JWT authentication, RESTful APIs, role-based access control, full CRUD operations, input validation, and responsive web design — all inside a thoughtfully designed interface.

Whether you manage a small team or a growing organization, TrackWise provides an efficient, digital solution for workforce attendance management.

---

## ✨ Key Features

| Area | Feature | What it does | Why it matters |
|------|---------|--------------|----------------|
| 👤 **Employee Module** | Secure account activation | Employees activate pending accounts with their Employee ID and set their own password | Keeps accounts secure from day one — admins never see employee passwords |
| | JWT login & authentication | Signed 8-hour bearer tokens issued per session | Stateless, secure sessions that expire automatically |
| | Daily check-in / check-out | One-click start/end of the working day with office-hours enforcement | Simple, consistent daily attendance capture |
| | Personal dashboard | Live clock, current status, working-hours gauge, weekly chart | Employees see exactly where their day stands at a glance |
| | Attendance history | Month-filterable table of every check-in/check-out | Full transparency and self-service record keeping |
| 👨‍💼 **Admin Module** | Dashboard statistics | Total employees, working today, completed today, not started | A real-time pulse of the whole workforce |
| | Employee management | Searchable, filterable employee directory | Rapid access to any team member |
| | Add / edit employees | Full profile creation and updates with inline validation | Keeps workforce data accurate and current |
| | Activate / deactivate accounts | Toggle employee access at any time | Admins keep full control over who can sign in |
| | Pending employee monitoring | Track who has not yet activated their account | No lost employees — follow up on activations |
| 📊 **Attendance Module** | Working-hour calculations | Automatic check-out total-hour computation | Eliminates manual math and spreadsheet errors |
| | Work-status tracking | `inactive → working → completed` lifecycle per day | Always know who is present, active, or done |
| | Office-hours guardrails | Enforced 9:00 AM – 5:00 PM window (early check-in at 8:30) | Realistic, policy-aligned attendance rules |
| | Workforce monitoring | Live team snapshot with check-in times and status badges | At-a-glance visibility across the organization |
| 🔒 **Security** | JWT authentication | Signed tokens with role claims and 8-hour expiry | Stateless, tamper-resistant session management |
| | Password hashing | bcrypt with 10 salt rounds | Industry-standard password storage |
| | Role-based authorization | Dedicated `adminOnly` middleware on admin routes | Least-privilege access — employees cannot reach admin endpoints |
| | Input validation | `express-validator` on every mutating route | Prevents malformed and malicious payloads |
| | CORS allow-listing | Configurable comma-separated origin list | Restricts which browsers may call the API |

---

## 📸 Screenshots

### 🔐 Employee Login

Employees and administrators sign in with their Employee ID and password on a polished split-screen page — with the product value proposition presented alongside the form.

<p align="center">
  <img src="screenshots/login-page.png" width="100%" alt="TrackWise employee login page">
</p>

---

### 📊 Administrator Dashboard

The admin dashboard gives a real-time overview of the workforce: total employees, how many are working today, how many have completed their day, and how many have not yet started — alongside a "Today's workforce breakdown" donut chart and a live team snapshot.

<p align="center">
  <img src="screenshots/admin-dashboard.png" width="100%" alt="TrackWise administrator dashboard">
</p>

---

### 👥 Employee Management

Administrators manage the whole team from a centralized, searchable directory — filter by status (All / Active / Inactive / Pending), edit profiles, and activate or deactivate accounts with a confirmation prompt.

<p align="center">
  <img src="screenshots/employee-management-page.png" width="100%" alt="TrackWise employee management page">
</p>

---

### ➕ Add Employee

Registering a new employee is straightforward. New accounts start in a **pending** state — the employee activates their own password before their first sign-in.

<p align="center">
  <img src="screenshots/add-employee-page.png" width="100%" alt="TrackWise add employee page">
</p>

---

### ✏️ Edit Employee

Updating an employee's details is just as simple. The pre-filled form keeps the **Employee ID** read-only — the unique identifier can never be changed — while name, email, phone, department, and designation remain fully editable. Changes apply immediately on save.

<p align="center">
  <img src="screenshots/edit-employee.png" width="100%" alt="TrackWise edit employee page">
</p>

---

### 🔑 Account Activation

New employees activate their pending account using the Employee ID issued by their administrator. Setting their own password completes sign-up and moves the account to an **active** state — admins never see employee passwords.

<p align="center">
  <img src="screenshots/account-activation-page.png" width="100%" alt="TrackWise account activation page">
</p>

---

### 👨‍💼 Employee Dashboard

Employees monitor their day through a personalized dashboard — current work status, check-in time, working hours toward an 8-hour target, a weekly bar chart, and recent days.

<p align="center">
  <img src="screenshots/employee-dashboard.png" width="100%" alt="TrackWise employee dashboard">
</p>

---

### 📅 Attendance History

Every check-in and check-out, month by month. Employees filter by month and see days worked, hours logged, average hours per day, and the full detailed breakdown.

<p align="center">
  <img src="screenshots/employee-attendance-history.png" width="100%" alt="TrackWise employee attendance history">
</p>

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 19 | Component-based UI |
| | React Router 7 | Client-side routing & route guards |
| | Axios | HTTP client with interceptors |
| | Tailwind CSS 4 | Utility-first styling with design tokens |
| | Vite 8 | Build tooling & dev server |
| | lucide-react | Lightweight icon set |
| | react-toastify | In-app notifications |
| **Backend** | Node.js + Express 5 | REST API server |
| | PostgreSQL (pg) | Relational database |
| | jsonwebtoken | JWT signing & verification |
| | bcrypt | Password hashing |
| | express-validator | Request validation |
| | cors | Cross-origin resource sharing |
| | dotenv | Environment configuration |
| **Dev Tools** | nodemon | Auto-restarting dev server |

---

## 🏗️ System Architecture

```text
                       React Frontend (Vite + Tailwind)
                              │
                              ▼
                  React Router (lazy-loaded routes)
                              │
                              ▼
                   Axios HTTP Requests (REST API)
                   └── 401 interceptor → auto-logout
                              │
                              ▼
                 Express.js Backend (Node.js)
                    └── CORS allow-list + JWT middleware
                              │
      ┌───────────────────────┼────────────────────────┐
      ▼                       ▼                        ▼
 Authentication         Attendance Module          Admin Module
  /api/auth             /api/attendance            /api/admin
 (JWT + bcrypt)         (office-hours guard)   (adminOnly middleware)
      │                       │                        │
      └───────────────────────┼────────────────────────┘
                              ▼
                       PostgreSQL Database
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
            users        attendance      leave_requests
```

---

## 📂 Project Structure

```text
TrackWise/
│
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable UI (RadialGauge, StatusBadge, …)
│   │   ├── context/                 # AuthContext (session state)
│   │   ├── pages/
│   │   │   ├── admin/               # Dashboard, Employees, Add/Edit Employee
│   │   │   ├── employee/            # Dashboard, Attendance History
│   │   │   └── Landing, Login, Activate, 404
│   │   ├── routes/                  # Lazy-loaded route definitions + guards
│   │   ├── services/                # Axios API client + auth service
│   │   ├── styles/                  # Tailwind v4 design tokens (@theme)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # companyPolicy (office hours)
│   │   ├── controllers/             # auth, admin, attendance
│   │   ├── database/                # schema.sql + setup.js (idempotent bootstrap)
│   │   ├── middleware/              # auth (JWT), adminOnly, validation
│   │   ├── models/                  # Data access layer
│   │   ├── routes/                  # /api/auth, /api/admin, /api/attendance
│   │   ├── services/                # Business logic
│   │   ├── validations/             # express-validator schemas
│   │   ├── app.js                   # Express app + CORS + error handling
│   │   └── server.js                # Entry point
│   └── .env.example
│
├── screenshots/                     # README screenshots
├── README.md
├── LICENSE
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 1️⃣ Prerequisites

- **Node.js** 20+ and **npm**
- **PostgreSQL** 14+ running locally

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/Aby020/TrackWise.git
cd TrackWise
```

### 3️⃣ Install Backend Dependencies

```bash
cd server
npm install
```

### 4️⃣ Install Frontend Dependencies

Open a new terminal.

```bash
cd client
npm install
```

### 5️⃣ Configure Environment Variables

Inside the **server** folder, copy the example file and fill in your database credentials:

```bash
cd server
cp .env.example .env
```

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/trackwise_db
JWT_SECRET=your_secret_key
```

Then inside the **client** folder:

```bash
cd client
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 6️⃣ Set Up the Database

The schema and admin account are **bootstrapped automatically** on the first server start — the setup is idempotent, so it is safe to run on every boot. You can also trigger it manually:

```bash
cd server
npm run db:setup
```

### 7️⃣ Start the Backend Server

```bash
cd server
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

### 8️⃣ Start the Frontend

```bash
cd client
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: `5000`) |
| `NODE_ENV` | Environment mode | No (default: `development`) |
| `DATABASE_URL` | PostgreSQL connection string | Yes* |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Individual database variables (used if `DATABASE_URL` is not set) | Yes* |
| `JWT_SECRET` | Secret key for JWT tokens (32+ random bytes) | Yes |
| `CORS_ORIGIN` | Comma-separated allowed browser origins | No (default: `http://localhost:5173`) |
| `ADMIN_EMAIL` | Bootstrap admin email | No (default: `admin@trackwise.app`) |
| `ADMIN_EMPLOYEE_ID` | Bootstrap admin employee ID | No (default: `ADMIN001`) |
| `ADMIN_PASSWORD` | Bootstrap admin password | No (default: `TrackwiseDev2026`) |
| `ATTENDANCE_ENFORCE_HOURS` | Enforce office-hours check-in/check-out (`true`/`false`) | No (default: `true`) |

*Either `DATABASE_URL` **or** all `DB_*` variables are required.

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (`client/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL (includes the `/api` prefix) | No (default: `http://localhost:5000/api`) |

---

## 🚀 Running the Project

1. Ensure PostgreSQL is running and the database exists (see [Installation](#installation--setup)).
2. Start the backend: `cd server && npm run dev` → `http://localhost:5000`
3. Start the frontend: `cd client && npm run dev` → `http://localhost:5173`
4. Open `http://localhost:5173` in your browser.

> The admin account is **created automatically** on the first server start from your environment variables. Use it to log in, add employees, and explore the dashboard.

---

## 🧑‍💼 Default Admin Credentials

> ⚠️ **Development only.** These defaults ship for local development. **Change them in production** by setting `ADMIN_EMAIL`, `ADMIN_EMPLOYEE_ID`, and `ADMIN_PASSWORD` in `server/.env` — the account is re-synced from these variables on every server start.

| Credential | Value |
|------------|-------|
| **Employee ID** | `ADMIN001` |
| **Password** | `TrackwiseDev2026` |
| **Email** | `admin@trackwise.app` |
| **Role** | Admin |

---

## 👥 User Roles

| | 👨‍💼 Admin | 👤 Employee |
|---|---|---|
| **Sign in** | ✅ | ✅ (after activation) |
| **Personal attendance dashboard** | ❌ | ✅ |
| **Check in / check out** | ❌ | ✅ |
| **Attendance history** | ❌ | ✅ |
| **Dashboard statistics** | ✅ | ❌ |
| **Add / edit employees** | ✅ | ❌ |
| **Activate / deactivate accounts** | ✅ | ❌ |
| **Monitor pending employees** | ✅ | ❌ |

Admin routes are protected by both `authenticate` (JWT) and `adminOnly` (role check) middleware — an employee token cannot reach admin endpoints.

---

## 🔄 Feature Workflow

### 🧑‍💼 Employee Lifecycle

```text
Admin creates employee ──► status = pending ──► Employee activates account
      (no password)              │                    (sets own password)
                                 ▼
                        status = active ──► Can log in & mark attendance
                                 │
                                 └──► Admin can deactivate at any time (login blocked)
```

### 📅 Daily Attendance Flow

```text
Before 8:30 AM ──► Check-in blocked (office hours not open)
8:30 AM – 5:00 PM ──► Check-in allowed
After 5:00 PM ──► Check-out allowed (working day complete)
```

| Step | Action | Result |
|------|--------|--------|
| 1 | Employee clicks **Start work** | `working_status` → `working`, check-in timestamp recorded |
| 2 | Employee works through the day | Dashboard shows live status + hours toward the 8-hour target |
| 3 | Employee clicks **End work** (after 5:00 PM) | `working_status` → `completed`, `total_hours` auto-calculated |
| 4 | Any time | Employee reviews **Attendance History** month by month |

### 👨‍💼 Admin Management

1. **Add employee** → new account created as `pending`
2. **Monitor pending** employees until they activate
3. **Edit profiles** as details change
4. **Deactivate** accounts when someone leaves → their login is immediately blocked

---

## 🔌 API Overview

All routes return JSON. Mutating routes validate the request body with `express-validator`. Admin routes require the `admin` role.

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/activate` | Activate a pending account (set password) | — |
| `POST` | `/api/auth/login` | Sign in, returns a JWT | — |

### 👨‍💼 Admin — `/api/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/dashboard` | Workforce statistics | Admin |
| `GET` | `/api/admin/employees` | List all employees | Admin |
| `GET` | `/api/admin/employees/:employeeId` | Employee details | Admin |
| `POST` | `/api/admin/employees` | Create a new employee | Admin |
| `PUT` | `/api/admin/employees/:employeeId` | Update employee profile | Admin |
| `PATCH` | `/api/admin/employees/:employeeId/status` | Activate / deactivate account | Admin |

### 📊 Attendance — `/api/attendance`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/attendance/today` | Today's attendance record | Employee |
| `GET` | `/api/attendance/history` | Attendance history (month-filterable) | Employee |
| `POST` | `/api/attendance/start` | Check in (start work) | Employee |
| `POST` | `/api/attendance/end` | Check out (end work) | Employee |

**Example — login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"ADMIN001","password":"TrackwiseDev2026"}'
```

**Example — protected route (Bearer token):**

```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 🗄️ Database Overview

Three tables make up the PostgreSQL schema (`server/src/database/schema.sql`), applied idempotently on server start.

### 👥 `users`

One row per account — employees and admins live in a single table.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `employee_id` | VARCHAR(20) | **UNIQUE** — used for login & activation |
| `first_name` / `last_name` | VARCHAR(100) | Employee name |
| `email` | VARCHAR(150) | **UNIQUE** |
| `phone` | VARCHAR(20) | Optional |
| `department` / `designation` | VARCHAR(100) | Role within the company |
| `joining_date` | DATE | Optional |
| `password` | TEXT | bcrypt hash; `NULL` while pending |
| `role` | VARCHAR(20) | `admin` or `employee` |
| `account_status` | VARCHAR(20) | `pending` → `active` / `inactive` |
| `token_version` | INT | Session invalidation counter |
| `created_at` / `updated_at` | TIMESTAMP | Auditing |

### 📅 `attendance`

One row per employee per working day.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `user_id` | INT | FK → `users(id)`, `ON DELETE CASCADE` |
| `work_date` | DATE | With `user_id`, forms the **UNIQUE** constraint |
| `check_in` / `check_out` | TIMESTAMP | Punch times |
| `total_hours` | DECIMAL(5,2) | Auto-calculated on check-out |
| `working_status` | VARCHAR(20) | `inactive` / `working` / `completed` |

### 🏖️ `leave_requests`

Placeholder domain table reserved for a future leave-management workflow.

### 🔍 Indexes

```text
idx_users_role            ON users(role)
idx_attendance_user_day   ON attendance(user_id, work_date DESC)
idx_attendance_workday    ON attendance(work_date)
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT authentication** | Signed tokens with `{ id, employeeId, role }` claims and an **8-hour expiry** |
| **Password hashing** | bcrypt with **10 salt rounds** — raw passwords are never stored |
| **Role-based access control** | `adminOnly` middleware denies employee tokens on admin routes |
| **Deny-by-default sessions** | `account_status` gates login; `pending` and `inactive` accounts are rejected |
| **Input validation** | `express-validator` on every mutating endpoint |
| **CORS allow-list** | Only configured origins may call the API (`CORS_ORIGIN`) |
| **401 auto-logout** | Axios response interceptor clears the session and redirects to login |
| **Token invalidation** | `token_version` supports revoking issued tokens |
| **No secrets in code** | All configuration via environment variables (`.env` is git-ignored) |

---

## 🚀 Future Enhancements

- 📱 **Mobile application** — native iOS & Android companions
- 📊 **Advanced attendance analytics** — trends, reports, and exports
- 📍 **GPS-based attendance tracking** — location-verified check-ins
- 🖐️ **Biometric attendance integration** — fingerprint / face recognition
- 📧 **Email notifications** — activation reminders and daily digests
- 📈 **Employee performance dashboard** — productivity insights
- 🐳 **Docker deployment** — containerized server + database
- ☁️ **Cloud deployment** — production-ready hosting guide
- 🌐 **API documentation** — OpenAPI / Swagger specification
- 🏖️ **Leave management** — end-to-end leave request workflow

---

## 🌟 Project Highlights

- **Secure by design** — JWT + bcrypt + role-based authorization + validated input, end to end
- **Real office-hour enforcement** — configurable 9–5 attendance window with early check-in
- **Idempotent bootstrapping** — schema and admin account self-configure on every start
- **Polished design system** — Tailwind v4 design tokens with a modern indigo/violet brand
- **Reactive session handling** — expired tokens log the user out gracefully via a custom event
- **Complete role separation** — distinct employee and admin experiences with strict access control
- **Responsive and modern** — mobile-friendly, component-driven React architecture

---

## 📄 License

This project is licensed under the **MIT License**.

See the **[LICENSE](LICENSE)** file for more information.

---

## 👨‍💻 Author

<div align="center">

### Abi Thomas

**Backend Developer | Python, Django & Node.js Developer**

Passionate about building scalable backend systems, RESTful APIs, modern web applications, and production-ready software using Python, Django, Node.js, Express.js, PostgreSQL, and React.

<p>

<a href="https://github.com/Aby020">
<img src="https://img.shields.io/badge/GitHub-Aby020-181717?logo=github">
</a>

<a href="https://linkedin.com/in/abithomas-dev">
<img src="https://img.shields.io/badge/LinkedIn-Abi%20Thomas-0A66C2?logo=linkedin">
</a>

</p>

</div>

## ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

Your support motivates me to continue building and improving high-quality open-source software.

If you have suggestions, feedback, or would like to collaborate, feel free to connect with me on GitHub or LinkedIn.
