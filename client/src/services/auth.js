import api from "./api";

/** POST /auth/login → { token, user }. */
export async function login(employeeId, password) {
  const { data } = await api.post("/auth/login", { employeeId, password });
  return data;
}

/** POST /auth/activate → { success, message }. */
export async function activateAccount({ employeeId, password, confirmPassword }) {
  const { data } = await api.post("/auth/activate", {
    employeeId,
    password,
    confirmPassword,
  });
  return data;
}
