import { ClockCheck } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * TrackWise brand mark — gradient tile + wordmark.
 * variant="light" for the dark sidebar, "dark" for light surfaces.
 */
export function Logo({ variant = "light", className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-secondary to-violet shadow-pop">
        <ClockCheck
          className="h-4.5 w-4.5 text-white"
          strokeWidth={2.2}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-white/20 blur-md"
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          "font-display text-[17px] font-bold tracking-tight",
          variant === "light" ? "text-white" : "text-ink",
        )}
      >
        TrackWise
      </span>
    </span>
  );
}
