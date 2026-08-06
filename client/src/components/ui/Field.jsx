import { cn } from "../../lib/utils";

/** Label + error/hint wrapper for form controls. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[13px] font-medium text-ink-soft"
        >
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p
          className="flex items-center gap-1.5 text-xs font-medium text-danger"
          id={`${htmlFor}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-faint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
