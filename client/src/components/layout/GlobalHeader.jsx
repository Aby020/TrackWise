import { motion, useReducedMotion } from "framer-motion";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Logo } from "../brand/Logo";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";

const NAV_ANCHORS = [
  { to: "/#home", label: "Home" },
  { to: "/#features", label: "Features" },
  { to: "/#how-it-works", label: "How it works" },
];

const SPRING = { type: "spring", stiffness: 420, damping: 34 };

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-9 w-[74px] shrink-0 items-center rounded-full border border-slate-700/60 bg-slate-900/70 px-1 shadow-sm",
        "transition-colors duration-150 hover:border-slate-500",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
      )}
    >
      <motion.span
        aria-hidden="true"
        className="absolute h-[26px] w-[26px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 shadow-sm"
        animate={{ x: isDark ? 34 : 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      />
      <span
        className={cn(
          "relative z-10 grid h-7 w-7 place-items-center rounded-full transition-colors duration-150",
          !isDark ? "text-white" : "text-muted",
        )}
      >
        <Sun className="h-4 w-4" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "relative z-10 ml-auto grid h-7 w-7 place-items-center rounded-full transition-colors duration-150",
          isDark ? "text-white" : "text-muted",
        )}
      >
        <Moon className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}

function NavLinkItem({ to, label }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHash = to.includes("#");
  const target = isHash ? "/" : to;
  const hash = isHash ? to.split("#")[1] : null;
  const active = !isHash && location.pathname === target;

  const handleClick = (event) => {
    if (!isHash) return;
    if (hash === "home") {
      event.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    if (location.pathname !== "/") {
      event.preventDefault();
      window.location.href = to;
      return;
    }
    event.preventDefault();
    document
      .getElementById(hash)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <NavLink
      to={target}
      onClick={handleClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "bg-slate-800/60 text-white"
          : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
      )}
    >
      {label}
    </NavLink>
  );
}

export function GlobalHeader() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-3 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/70">
        <Link
          to="/"
          aria-label="TrackWise home"
          onClick={(event) => {
            event.preventDefault();
            if (location.pathname !== "/") {
              navigate("/");
              window.setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 60);
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="rounded-lg transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Logo variant={theme === "dark" ? "light" : "dark"} />
        </Link>

        <nav
          aria-label="Primary"
          className="ml-2 hidden items-center gap-1 md:flex"
        >
          {NAV_ANCHORS.map((item) => (
            <NavLinkItem
              key={item.label}
              to={item.to}
              label={item.label}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              className="inline-flex h-9 items-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-150 hover:from-indigo-600 hover:to-indigo-700 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
            >
              Go to portal
            </Link>
          ) : (
            <>
              <Link
                to="/activate"
                className="hidden h-9 items-center rounded-full border border-slate-700/60 px-4 text-sm font-semibold text-slate-300 transition-all duration-150 hover:border-slate-400 hover:text-white sm:inline-flex focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/20"
              >
                Activate account
              </Link>
              <Link
                to="/dashboard?demo=true"
                className="hidden h-9 items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-300 transition-all duration-150 hover:border-cyan-400/50 hover:text-cyan-200 sm:inline-flex focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20"
              >
                Explore Live Demo
              </Link>
              <Link
                to="/login"
                className="inline-flex h-9 items-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-150 hover:from-indigo-600 hover:to-indigo-700 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>
      <span
        className="sr-only"
        aria-live="polite"
      >{`Theme set to ${theme} mode`}</span>
    </div>
  );
}
