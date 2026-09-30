import { useId } from "react";
import { cn } from "../../lib/utils";
import { Field } from "./Field";

const controlBase =
  "w-full rounded-lg border bg-surface px-3.5 text-sm text-ink shadow-sm " +
  "placeholder:text-faint transition-colors duration-150 " +
  "focus:outline-none focus:ring-4";
const normal = "border-line focus:border-primary focus:ring-primary/15";
const invalid = "border-danger focus:border-danger focus:ring-danger/15";

export function Textarea({
  label,
  error,
  hint,
  required,
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
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          controlBase,
          "min-h-24 py-2.5",
          error ? invalid : normal,
          className,
        )}
        {...rest}
      />
    </Field>
  );
}
