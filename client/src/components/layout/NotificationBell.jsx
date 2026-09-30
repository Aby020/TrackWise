import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { formatDateDay } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Menu, MenuSeparator } from "../ui/Menu";

const typeIcon = {
  success: { icon: CheckCircle2, cls: "text-success" },
  error: { icon: XCircle, cls: "text-danger" },
  warning: { icon: AlertTriangle, cls: "text-warning" },
  info: { icon: Info, cls: "text-info" },
};

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <Menu
      align="end"
      trigger={({ open }) => (
        <button
          type="button"
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "relative grid h-9.5 w-9.5 place-items-center rounded-lg border transition-all duration-150",
            open
              ? "border-primary/40 bg-primary-soft text-primary"
              : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
          )}
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface"
              aria-hidden="true"
            />
          )}
        </button>
      )}
    >
      <div className="w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <p className="text-sm font-semibold text-ink">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <MenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-10 text-center text-[13px] text-muted">
            No notifications yet.
            <p className="mt-1 text-xs text-faint">
              Events like check-in and employee changes will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto pb-1.5">
            {notifications.map((n) => {
              const { icon: Icon, cls } = typeIcon[n.type] ?? typeIcon.info;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-3 py-2.5 transition-colors",
                    !n.read && "bg-primary-soft/40",
                  )}
                >
                  <Icon
                    className={cn("mt-0.5 h-4 w-4 shrink-0", cls)}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-faint">
                      {formatDateDay(n.time)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Menu>
  );
}
