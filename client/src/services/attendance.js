import api from "./api";

const MODERN_ATTENDANCE = "/modern/attendance";

export async function getTodayAttendance() {
  const { data } = await api.get("/attendance/today");
  return data;
}

export async function getAttendanceHistory() {
  const { data } = await api.get("/attendance/history");
  return data;
}

export async function startWork() {
  const { data } = await api.post(`${MODERN_ATTENDANCE}/punch-in`);
  return data;
}

export async function endWork() {
  const { data } = await api.post(`${MODERN_ATTENDANCE}/punch-out`);
  return data;
}

export async function startBreak(breakType) {
  const { data } = await api.post(`${MODERN_ATTENDANCE}/breaks`, {
    breakType,
  });
  return data;
}

export async function endBreak() {
  const { data } = await api.post(`${MODERN_ATTENDANCE}/breaks/end`);
  return data;
}
