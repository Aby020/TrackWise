import api from "./api";

/**
 * POST /auth/login → { token, user }.
 *
 * The backend accepts a single `identifier` that may be
 * either the employee id or the corporate email.
 */
export async function login(identifier, password) {
  const { data } = await api.post("/auth/login", { identifier, password });
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
