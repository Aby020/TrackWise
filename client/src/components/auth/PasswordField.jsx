import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field } from "../ui/Field";
import { cn } from "../../lib/utils";

/**
 * Password input with a show/hide toggle. Mirrors the Input control's
 * styling and a11y wiring, but exposes an interactive trailing button.
 */
export function PasswordField({
  label = "Password",
  error,
  hint,
  required,
  id: propId,
  className,
  ...rest
}) {
  const autoId = useId();
  const id = propId ?? autoId;
  const [visible, setVisible] = useState(false);
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-9.5 w-full rounded-lg border bg-surface px-3.5 pr-11 text-sm text-ink shadow-sm",
            "placeholder:text-faint transition-colors duration-150 focus:outline-none focus:ring-4",
            error
              ? "border-danger focus:border-danger focus:ring-danger/15"
              : "border-line focus:border-primary focus:ring-primary/15",
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  );
}
