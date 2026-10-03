import { useId } from "react";
import { cn } from "../../lib/utils";
import { Field } from "./Field";

const controlBase =
  "w-full rounded-lg border bg-surface px-3.5 text-sm text-ink shadow-sm " +
  "placeholder:text-faint transition-colors duration-150 " +
  "focus:outline-none focus:ring-4";

const normal =
  "border-line focus:border-primary focus:ring-primary/15";
const invalid =
  "border-danger focus:border-danger focus:ring-danger/15";

const glassBase =
  "rounded-xl border bg-slate-950/70 px-4 py-3 text-white shadow-none " +
  "placeholder:text-slate-500 transition-all duration-150 " +
  "focus:outline-none focus:ring-2";

const glassNormal =
  "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20";
const glassInvalid =
  "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20";

/**
 * Text input with optional label / error / hint and leading/trailing icons.
 * All a11y wiring (aria-invalid, aria-describedby) is handled here.
 * variant="glass" renders the dark auth-card control.
 */
export function Input({
  label,
  error,
  hint,
  required,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  id: propId,
  variant = "surface",
  className,
  ...rest
}) {
  const autoId = useId();
  const id = propId ?? autoId;
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;
  const glass = variant === "glass";

  return (
    <Field
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      required={required}
      variant={variant}
    >
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
              glass ? "text-slate-500" : "text-faint",
            )}
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            glass
              ? cn(
                  glassBase,
                  glass ? (error ? glassInvalid : glassNormal) : "",
                )
              : cn(
                  controlBase,
                  "h-9.5",
                  LeftIcon && "pl-10",
                  RightIcon && "pr-10",
                  error ? invalid : normal,
                ),
            glass && LeftIcon && "pl-10",
            glass && RightIcon && "pr-10",
            className,
          )}
          {...rest}
        />
        {RightIcon && (
          <RightIcon
            className={cn(
              "pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
              glass ? "text-slate-500" : "text-faint",
            )}
            aria-hidden="true"
          />
        )}
      </div>
    </Field>
  );
}
