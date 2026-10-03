import { cn } from "../../lib/utils";

/**
 * Label + error/hint wrapper for form controls.
 * variant="glass" renders light-on-dark labels for the auth card.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  variant = "surface",
  children,
  className,
}) {
  const glass = variant === "glass";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            "block text-[13px] font-medium",
            glass ? "text-slate-300" : "text-ink-soft",
          )}
        >
          {label}
          {required && (
            <span className={glass ? "text-rose-400" : "text-danger"} aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            glass ? "text-rose-400" : "text-danger",
          )}
          id={`${htmlFor}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          className={cn("text-xs", glass ? "text-slate-500" : "text-faint")}
          id={`${htmlFor}-hint`}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
