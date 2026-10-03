import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isDemoLocation } from "../hooks/useDemoMode";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // The live demo is a public session: `?demo=true` drives a fully
  // simulated workspace state, so no token is required and the auth
  // check is bypassed entirely.
  if (!isAuthenticated && !isDemoLocation(location)) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }
  return children;
}
