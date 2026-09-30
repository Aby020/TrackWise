import api from "./api";

export async function getDashboardStats() {
  const { data } = await api.get("/admin/dashboard");
  return data;
}

export async function getEmployees() {
  const { data } = await api.get("/admin/employees");
  return data;
}

export async function getEmployee(employeeId) {
  const { data } = await api.get(`/admin/employees/${employeeId}`);
  return data;
}

export async function createEmployee(payload) {
  const { data } = await api.post("/admin/employees", payload);
  return data;
}

export async function updateEmployee(employeeId, payload) {
  const { data } = await api.put(`/admin/employees/${employeeId}`, payload);
  return data;
}

export async function toggleEmployeeStatus(employeeId) {
  const { data } = await api.patch(`/admin/employees/${employeeId}/status`);
  return data;
}
