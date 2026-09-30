import { cn } from "../../lib/utils";

/**
 * Vertical bar chart for daily hours.
 * Each entry renders a rounded bar; today is highlighted with a
 * primary → violet gradient. Bars expose their value as an accessible
 * image label, and the chart reads as an image with a summary label.
 */
export function HoursBars({
  data = [],
  max = 8,
  unit = "h",
  height = 172,
  className,
}) {
  const ceiling = max > 0 ? max : 1;
  // Reserve space for the value + weekday labels so bars share one baseline.
  const labelHeight = 16;
  const barArea = height - labelHeight * 2 - 12;

  return (
    <div
      className={cn("flex items-end justify-between gap-2 sm:gap-3", className)}
      style={{ height }}
      role="img"
      aria-label="Hours worked per day"
    >
      {data.map(({ label, value = 0, today = false }) => {
        const pct = Math.max(0, Math.min(1, value / ceiling));
        const barHeight =
          value > 0 ? Math.max(4, Math.round(pct * barArea)) : 2;
        const display =
          value > 0
            ? `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`
            : "";
        return (
          <div
            key={label}
            className="group flex h-full min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "h-4 text-[10px] font-medium tabular leading-4",
                today ? "text-primary" : "text-faint",
              )}
            >
              {display}
            </span>
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                role="img"
                aria-label={`${label}: ${value} ${unit}`}
                className={cn(
                  "w-full max-w-9 rounded-t-md transition-[height] duration-500 ease-out motion-reduce:transition-none",
                  today
                    ? "bg-gradient-to-t from-primary to-violet shadow-sm shadow-primary/25"
                    : value > 0
                      ? "bg-primary/15 group-hover:bg-primary/35"
                      : "bg-line",
                )}
                style={{ height: barHeight }}
              />
            </div>
            <span
              className={cn(
                "h-4 text-[10px] font-medium leading-4",
                today ? "font-semibold text-primary" : "text-muted",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
