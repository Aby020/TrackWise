import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

/** Error screen — explains what happened and offers a recovery path. */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this data. Please try again.",
  onRetry,
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
        className="grid h-12 w-12 place-items-center rounded-xl bg-danger-soft text-danger"
        aria-hidden="true"
      >
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={RefreshCw}
          className="mt-5"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
