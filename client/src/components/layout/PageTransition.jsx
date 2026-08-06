import { useLocation } from "react-router-dom";

/**
 * Wraps routed content so each navigation remounts the page container and
 * replays a subtle fade-up entrance (disabled via CSS under reduced motion).
 */
export function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
