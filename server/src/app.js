const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const adminRoutes = require("./routes/admin.routes");
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const shiftRoutes = require(path.join(__dirname, "..", "dist", "routes", "shift.routes.js")).default;
const shiftInfoRoutes = require(path.join(__dirname, "..", "dist", "routes", "shiftInfo.routes.js")).default;
const punchRoutes = require(path.join(__dirname, "..", "dist", "routes", "punch.routes.js")).default;
const employeeIdRoutes = require(path.join(__dirname, "..", "dist", "routes", "employeeId.routes.js")).default;

const app = express();

// Support a comma-separated CORS_ORIGIN list, defaulting to the Vite dev origin.
if (!process.env.CORS_ORIGIN && process.env.NODE_ENV === "production") {
    throw new Error("CORS_ORIGIN environment variable must be set in production.");
}
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow same-origin / no-origin requests (curl, Postman, same-site).
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    }),
);

app.use(express.json());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again in 15 minutes.",
    },
});

app.use("/", indexRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin/shifts", shiftRoutes);

// Shift info is exposed under both the legacy (/api/shift) and modern
// (/api/modern/shift) prefixes; the router itself only declares /current.
app.use("/api/shift", shiftInfoRoutes);
app.use("/api/modern/shift", shiftInfoRoutes);

// Punch clock is exposed under both the legacy (/api/attendance) and modern
// (/api/modern/attendance) prefixes; the router declares /punch-in, /punch-out,
// and /breaks endpoints.
app.use("/api/modern/attendance", punchRoutes);
app.use("/api/attendance", punchRoutes);

app.use("/api/admin/employee-id", employeeIdRoutes);

// JSON 404 for unknown API routes (never the HTML catch-all).
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Centralized error handler (validation uses express-validator directly,
// so errors reaching here are unexpected — respond 500 without leaking internals).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed by CORS.",
        });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

module.exports = app;
