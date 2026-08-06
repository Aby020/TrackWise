import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Field } from "./Field";

const controlBase =
  "w-full appearance-none rounded-lg border bg-surface px-3.5 text-sm text-ink shadow-sm " +
  "cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-4";
const normal = "border-line focus:border-primary focus:ring-primary/15";
const invalid = "border-danger focus:border-danger focus:ring-danger/15";

export function Select({
  label,
  error,
  hint,
  required,
  id: propId,
  className,
  children,
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
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            controlBase,
            "h-9.5 pr-10",
            error ? invalid : normal,
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
