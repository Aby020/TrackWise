import { cn } from "../../lib/utils";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

const iconTones = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-slate-100 text-slate-600",
};

/** Dashboard metric card: label, big value, optional icon + hint. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  loading = false,
  className,
  ...rest
}) {
  return (
    <Card className={cn("p-5", className)} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{label}</p>
          <div className="mt-1.5 text-2xl font-bold tracking-tight text-ink tabular">
            {loading ? <Skeleton className="h-7 w-16" /> : value}
          </div>
          {hint && <p className="mt-1 truncate text-xs text-faint">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
              iconTones[tone],
            )}
            aria-hidden="true"
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
        )}
      </div>
    </Card>
  );
}
