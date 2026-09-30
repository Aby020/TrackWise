const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

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

module.exports = router;