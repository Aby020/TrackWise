import { ClockCheck } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * TrackWise brand mark — solid primary tile + wordmark.
 * variant="light" for the dark sidebar, "dark" for light surfaces.
 */
export function Logo({ variant = "light", className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary shadow-sm">
        <ClockCheck
          className="h-4.5 w-4.5 text-white"
          strokeWidth={2.2}
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
