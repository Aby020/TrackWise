import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field } from "../ui/Field";
import { cn } from "../../lib/utils";

const controlBase =
  "h-9.5 w-full rounded-lg border bg-surface px-3.5 pr-11 text-sm text-ink shadow-sm " +
  "placeholder:text-faint transition-colors duration-150 focus:outline-none focus:ring-4";

const normal =
  "border-line focus:border-primary focus:ring-primary/15";
const invalid =
  "border-danger focus:border-danger focus:ring-danger/15";

const glassBase =
  "w-full rounded-xl border bg-slate-950/70 px-4 py-3 pr-11 text-white shadow-none " +
  "placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2";

const glassNormal =
  "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20";
const glassInvalid =
  "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20";

/**
 * Password input with a show/hide toggle. Mirrors the Input control's
 * styling and a11y wiring, but exposes an interactive trailing button.
 * variant="glass" renders the dark auth-card control.
 */
export function PasswordField({
  label = "Password",
  error,
  hint,
  required,
  id: propId,
  variant = "surface",
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
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            glass
              ? cn(glassBase, error ? glassInvalid : glassNormal)
              : cn(controlBase, error ? invalid : normal),
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className={cn(
            "absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2",
            glass
              ? "text-slate-500 hover:text-slate-300 focus-visible:ring-indigo-500/40"
              : "text-faint hover:text-muted focus-visible:ring-primary/30",
          )}
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
