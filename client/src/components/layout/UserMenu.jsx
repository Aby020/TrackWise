import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fullName } from "../../lib/format";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Menu, MenuItem, MenuSeparator } from "../ui/Menu";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = fullName(user?.firstName, user?.lastName);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Menu
      align="end"
      trigger={({ open }) => (
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          className={
            "grid h-9.5 w-9.5 place-items-center rounded-lg border transition-all duration-150 " +
            (open
              ? "border-primary/40 bg-primary-soft"
              : "border-line bg-surface hover:border-line-strong")
          }
        >
          <Avatar name={name} size="sm" />
        </button>
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Avatar name={name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted">
            {user?.employeeId}
            {user?.role === "admin" && (
              <Badge tone="primary" className="!px-1.5 !py-0 !text-[10px]">
                admin
              </Badge>
            )}
          </p>
        </div>
      </div>
      <MenuSeparator />
      <MenuItem icon={LogOut} label="Sign out" danger onSelect={handleLogout} />
    </Menu>
  );
}
