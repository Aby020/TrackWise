import { History, LayoutDashboard, UserPlus, Users } from "lucide-react";

export const employeeNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance-history", label: "Attendance History", icon: History },
];

export const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/add-employee", label: "Add Employee", icon: UserPlus },
];

export function navForRole(role) {
  return role === "admin" ? adminNav : employeeNav;
}

/** Page title used by the topbar, derived from the current route. */
export function titleForPath(pathname, role) {
  const items = navForRole(role);
  const match = items.find((item) =>
    item.to === "/admin"
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  return match?.label ?? "TrackWise";
}

/** True when a nav item should render as active for the current path. */
export function isNavActive(pathname, to) {
  if (to === "/admin") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
