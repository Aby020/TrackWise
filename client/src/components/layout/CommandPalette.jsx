import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { navForRole } from "../../lib/nav";
import { getEmployees } from "../../services/admin";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";

/**
 * ⌘K quick-search: jumps to pages and (for admins) opens employees.
 * Arrow keys navigate, Enter selects, Esc closes.
 */
export function CommandPalette() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [employees, setEmployees] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((o) => !o);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    setQuery("");
    setActive(0);
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open || user?.role !== "admin" || employees.length) return;
    getEmployees()
      .then((res) => setEmployees(res.data ?? []))
      .catch(() => {});
  }, [open, user?.role, employees.length]);

  const navItems = navForRole(user?.role);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nav = navItems.filter((item) => item.label.toLowerCase().includes(q));
    const emp =
      q && user?.role === "admin"
        ? employees.filter((e) =>
            `${e.first_name} ${e.last_name}`.toLowerCase().includes(q),
          )
        : [];
    return { nav, emp };
  }, [query, user?.role, employees, navItems]);

  const total = results.nav.length + results.emp.length;

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(total - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (event.key === "Enter" && total > 0) {
      if (active < results.nav.length) {
        go(results.nav[active].to);
      } else {
        const e = results.emp[active - results.nav.length];
        go(`/admin/edit-employee/${e.employee_id}`);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9.5 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-faint shadow-sm transition-colors hover:border-line-strong hover:text-muted md:flex"
        aria-haspopup="dialog"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="w-24 text-left">Search…</span>
        <kbd className="inline-flex h-5 items-center rounded border border-line bg-slate-50 px-1.5 text-[10px] font-medium text-muted">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="grid h-9.5 w-9.5 place-items-center rounded-lg border border-line bg-surface text-ink-soft md:hidden"
      >
        <Search className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative mx-auto mt-[12vh] w-full max-w-xl px-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Quick search"
              className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift animate-scale-in"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="h-4.5 w-4.5 text-faint" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search pages or employees…"
                  className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                  aria-label="Search"
                />
                <kbd className="text-[10px] font-medium text-faint">ESC</kbd>
              </div>
              <div className="max-h-[45vh] overflow-y-auto p-1.5">
                {total === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-muted">
                    No results for “{query}”.
                  </p>
                ) : (
                  <>
                    {results.nav.length > 0 && (
                      <>
                        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                          Pages
                        </p>
                        {results.nav.map((item, i) => {
                          const Icon = item.icon;
                          const selected = active === i;
                          return (
                            <button
                              key={item.to}
                              type="button"
                              onClick={() => go(item.to)}
                              onMouseEnter={() => setActive(i)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                selected
                                  ? "bg-primary-soft text-primary-strong"
                                  : "text-ink-soft",
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {item.label}
                              {selected && (
                                <CornerDownLeft
                                  className="ml-auto h-3.5 w-3.5 text-faint"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}
                    {results.emp.length > 0 && (
                      <>
                        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                          Employees
                        </p>
                        {results.emp.map((e, i) => {
                          const idx = results.nav.length + i;
                          const selected = active === idx;
                          return (
                            <button
                              key={e.employee_id}
                              type="button"
                              onClick={() =>
                                go(`/admin/edit-employee/${e.employee_id}`)
                              }
                              onMouseEnter={() => setActive(idx)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                selected
                                  ? "bg-primary-soft text-primary-strong"
                                  : "text-ink-soft",
                              )}
                            >
                              <Avatar
                                name={`${e.first_name} ${e.last_name}`}
                                size="sm"
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {e.first_name} {e.last_name}
                              </span>
                              <span className="truncate text-xs text-faint">
                                {e.department}
                              </span>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
