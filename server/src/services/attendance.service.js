const attendanceModel = require("../models/attendance.model");
const companyPolicy = require("../config/companyPolicy");

/**
 * Office-hours guardrails. Enforced by default; set
 * ATTENDANCE_ENFORCE_HOURS=false to disable (staging / demos).
 */
const enforceHours = () => process.env.ATTENDANCE_ENFORCE_HOURS !== "false";

const minutesNow = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const policyMinutes = (hour, minute) => hour * 60 + minute;

const startWork = async (userId) => {
    if (enforceHours()) {
        const current = minutesNow();
        const earliest = policyMinutes(
            companyPolicy.EARLY_CHECKIN_HOUR,
            companyPolicy.EARLY_CHECKIN_MINUTE,
        );
        const officeEnd = policyMinutes(
            companyPolicy.OFFICE_END_HOUR,
            companyPolicy.OFFICE_END_MINUTE,
        );

        if (current < earliest) {
            throw new Error("Work can only be started after 08:30 AM.");
        }
        if (current >= officeEnd) {
            throw new Error("Office hours have ended. You cannot start work now.");
        }
    }

    const attendance = await attendanceModel.findTodayAttendance(userId);
    if (attendance) {
        throw new Error("Attendance already started today.");
    }

    const newAttendance = await attendanceModel.createAttendance(userId);

    return {
        success: true,
        message: "Work started successfully.",
        data: newAttendance,
    };
};

const endWork = async (userId) => {
    if (enforceHours()) {
        const officeEnd = policyMinutes(
            companyPolicy.OFFICE_END_HOUR,
            companyPolicy.OFFICE_END_MINUTE,
        );
        if (minutesNow() < officeEnd) {
            throw new Error("You cannot end your work before 05:00 PM.");
        }
    }

    const attendance = await attendanceModel.findTodayAttendance(userId);
    if (!attendance) {
        throw new Error("You have not started work today.");
    }
    if (attendance.working_status !== "working") {
        throw new Error("You are not currently working.");
    }

    // Calculate total hours (rounded to 2 decimals).
    const checkIn = new Date(attendance.check_in);
    const totalHours = Number(
        ((Date.now() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2),
    );

    const updatedAttendance = await attendanceModel.endWork(
        attendance.id,
        totalHours,
    );

    return {
        success: true,
        message: "Work ended successfully.",
        data: updatedAttendance,
    };
};

const getTodayAttendance = async (userId) => {
    const attendance = await attendanceModel.findTodayAttendance(userId);

    if (!attendance) {
        return {
            success: true,
            data: {
                status: "Offline",
                checkIn: null,
                checkOut: null,
                totalHours: 0,
                breakHours: 0,
            },
        };
    }

    return {
        success: true,
        data: {
            status: attendance.working_status,
            checkIn: attendance.check_in,
            checkOut: attendance.check_out,
            totalHours: attendance.total_hours,
            breakHours: 0, // breaks are not tracked yet; kept for a stable API contract
        },
    };
};

const getAttendanceHistory = async (userId) => {
    const history = await attendanceModel.getAttendanceHistory(userId);

    return {
        success: true,
        data: history,
    };
};

module.exports = {
    startWork,
    endWork,
    getTodayAttendance,
    getAttendanceHistory,
};
