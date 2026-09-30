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

/**
 * Text input with optional label / error / hint and leading/trailing icons.
 * All a11y wiring (aria-invalid, aria-describedby) is handled here.
 */
export function Input({
  label,
  error,
  hint,
  required,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  id: propId,
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

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            controlBase,
            "h-9.5",
            LeftIcon && "pl-10",
            RightIcon && "pr-10",
            error ? invalid : normal,
            className,
          )}
          {...rest}
        />
        {RightIcon && (
          <RightIcon
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
        )}
      </div>
    </Field>
  );
}
