import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
  "transition-all duration-150 ease-out select-none " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-strong",
  secondary: "bg-primary-soft text-primary hover:bg-primary-softer",
  outline:
    "border border-line-strong bg-surface text-ink-soft hover:border-primary hover:text-primary",
  ghost: "text-muted hover:bg-slate-100 hover:text-ink",
  danger: "bg-danger text-white shadow-sm hover:bg-rose-700",
  dangerSubtle: "bg-danger-soft text-danger hover:bg-rose-100",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9.5 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

/**
 * Primary action button. `loading` swaps the leading icon for a spinner and
 * disables the control (keeps its width via the label).
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  className,
  ...rest
}) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || rest.disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        LeftIcon && <LeftIcon className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{children}</span>
      {!loading && RightIcon && (
        <RightIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
