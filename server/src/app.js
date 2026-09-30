const express = require("express");
const cors = require("cors");

const adminRoutes = require("./routes/admin.routes");
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();

// Support a comma-separated CORS_ORIGIN list, defaulting to the Vite dev origin.
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

app.use("/", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);

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
