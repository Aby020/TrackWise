import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Logo } from "../brand/Logo";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";

const NAV_ANCHORS = [
  { to: "/", label: "Home" },
  { to: "/#features", label: "Features" },
  { to: "/#how-it-works", label: "How it works" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-9 w-[74px] items-center rounded-full border border-line bg-surface px-1 shadow-sm",
        "transition-colors duration-150 hover:border-line-strong",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute h-[26px] w-[26px] rounded-full bg-primary shadow-sm transition-transform duration-200 ease-out",
          isDark ? "translate-x-[34px]" : "translate-x-0",
        )}
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
  const isHash = to.includes("#");
  const target = isHash ? "/" : to;
  const hash = isHash ? to.split("#")[1] : null;
  const active =
    !isHash && location.pathname === target;

  const handleClick = (event) => {
    if (!isHash) return;
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
        "h-9 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "bg-primary-soft text-primary"
          : "text-muted hover:bg-slate-100 hover:text-ink",
      )}
    >
      {label}
    </NavLink>
  );
}

export function GlobalHeader() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-6 lg:px-8">
        <Link
          to="/"
          aria-label="TrackWise home"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Logo variant="dark" />
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
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              Go to portal
            </Link>
          ) : (
            <>
              <Link
                to="/activate"
                className="hidden h-9 items-center rounded-lg px-4 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Activate account
              </Link>
              <Link
                to="/login"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-primary-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
      <span
        className="sr-only"
        aria-live="polite"
      >{`Theme set to ${theme} mode`}</span>
    </header>
  );
}
