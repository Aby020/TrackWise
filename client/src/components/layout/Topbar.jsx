import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { titleForPath } from "../../lib/nav";
import { formatDateLong } from "../../lib/format";
import { IconButton } from "../ui/IconButton";
import { CommandPalette } from "./CommandPalette";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const title = titleForPath(location.pathname, user?.role);

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <IconButton
          label="Open menu"
          icon={Menu}
          onClick={onMenuClick}
          className="lg:hidden"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[17px] font-bold text-ink">
            {title}
          </h1>
          <p className="hidden text-xs text-muted sm:block">
            {formatDateLong()}
          </p>
        </div>
        <CommandPalette />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
