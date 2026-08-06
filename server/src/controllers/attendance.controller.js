const attendanceService = require("../services/attendance.service");

const startWork = async (req, res) => {
  try {
    const result = await attendanceService.startWork(req.user.id);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
const endWork = async (req, res) => {
  try {
    const result = await attendanceService.endWork(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
const getTodayAttendance = async (req, res) => {
  try {
    const result = await attendanceService.getTodayAttendance(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const result = await attendanceService.getAttendanceHistory(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  startWork,

  endWork,

  getTodayAttendance,

  getAttendanceHistory,
};
