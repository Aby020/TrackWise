import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Logo } from "../brand/Logo";
import { useAuth } from "../../context/AuthContext";
import { isNavActive, navForRole } from "../../lib/nav";
import { fullName } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

function NavItem({ item, onNavigate }) {
  const location = useLocation();
  const active = isNavActive(location.pathname, item.to);
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-secondary to-violet shadow-[0_0_8px_rgba(99,102,241,0.9)]"
          aria-hidden="true"
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-secondary" : "text-slate-500 group-hover:text-slate-300",
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
      {item.label}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navForRole(user?.role);
  const name = fullName(user?.firstName, user?.lastName);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className="px-2">
        <Logo variant="light" />
      </div>

      <p className="mb-2 mt-9 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Menu
      </p>
      <nav aria-label="Main" className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {name}
              </p>
              <Badge tone={user?.role === "admin" ? "primary" : "neutral"} className="mt-0.5">
                {user?.role}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dark glass shell wrapper — ambient indigo/violet glow + frosted blur.
 * Shared by the fixed desktop sidebar and the mobile drawer.
 */
export function SidebarGlass({ children, className }) {
  return (
    <div
      className={cn(
        "dark-shell relative flex h-full flex-col overflow-hidden border-r border-white/10 bg-sidebar/95 backdrop-blur-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-secondary/25 blur-3xl animate-glow-drift" />
        <div
          className="absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-violet/20 blur-3xl animate-glow-drift"
          style={{ animationDelay: "-5s" }}
        />
      </div>
      {children}
    </div>
  );
}

/** Desktop fixed sidebar (hidden below lg). */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
      <SidebarGlass>
        <SidebarContent />
      </SidebarGlass>
    </aside>
  );
}
