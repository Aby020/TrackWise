import api from "./api";

/** GET /admin/employee-id/next → next sequential employee ID. */
export async function getNextEmployeeId() {
  const { data } = await api.get("/admin/employee-id/next");
  return data;
}

/** GET /admin/employee-id/shifts → shift selector options. */
export async function getEmployeeIdShiftOptions() {
  const { data } = await api.get("/admin/employee-id/shifts");
  return data;
}

/** POST /admin/employee-id → create a pending employee. */
export async function createEmployeeId(payload) {
  const { data } = await api.post("/admin/employee-id", payload);
  return data;
}
