import axios from "axios";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const api = axios.create({
  // Overridable via client/.env: VITE_API_URL=http://localhost:5000/api
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Session handling: an expired/invalid token surfaces as a 401 from protected
 * routes. Clear the persisted session and broadcast an event so AuthContext
 * can reset its in-memory state and the router can send the user back to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new CustomEvent("tw:session-expired"));
    }
    return Promise.reject(error);
  },
);

export default api;
