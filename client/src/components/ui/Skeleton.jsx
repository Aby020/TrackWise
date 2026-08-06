import { cn } from "../../lib/utils";

/** Shimmer loading placeholder. */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}
