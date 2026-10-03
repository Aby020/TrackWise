const express = require("express");
const path = require("path");

const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

const punchController = require(path.join(
    __dirname,
    "..",
    "..",
    "dist",
    "controllers",
    "punch.controller",
));

const authenticate = require("../middleware/auth.middleware");

router.get(
    "/today",
    authenticate,
    attendanceController.getTodayAttendance
);

router.get(
    "/history",
    authenticate,
    attendanceController.getAttendanceHistory
);

router.post(
    "/start",
    authenticate,
    attendanceController.startWork
);

router.post(
    "/end",
    authenticate,
    attendanceController.endWork
);

// Modern punch verbs, mounted on the legacy base path too so
// clients that call /api/attendance/punch-in and
// /api/modern/attendance/punch-in reach the same handler.
router.post(
    "/punch-in",
    authenticate,
    punchController.startWork
);

router.post(
    "/punch-out",
    authenticate,
    punchController.endWork
);

module.exports = router;