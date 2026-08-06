import { cn } from "../../lib/utils";

/** Full-page loading state for lazy route boundaries. */
export function PageLoader({ className }) {
  return (
    <div
      className={cn(
        "grid min-h-[60vh] place-items-center",
        className,
      )}
      role="status"
      aria-label="Loading page"
    >
      <span className="flex flex-col items-center gap-3">
        <span className="relative grid h-10 w-10 place-items-center">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-secondary to-violet opacity-15 animate-pulse-soft" />
          <span className="h-5 w-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </span>
        <span className="text-xs font-medium text-faint">Loading…</span>
      </span>
    </div>
  );
}
