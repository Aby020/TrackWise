import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

/** Friendly empty screen — invites the user to act rather than dead-ends. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary"
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
