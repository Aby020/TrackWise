import api from "./api";

export async function getTodayAttendance() {
  const { data } = await api.get("/attendance/today");
  return data;
}

export async function startWork() {
  const { data } = await api.post("/attendance/start");
  return data;
}

export async function endWork() {
  const { data } = await api.post("/attendance/end");
  return data;
}

export async function getAttendanceHistory() {
  const { data } = await api.get("/attendance/history");
  return data;
}
