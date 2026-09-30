import { cn } from "../../lib/utils";

const sizes = {
  sm: "h-8 w-8",
  md: "h-9.5 w-9.5",
  lg: "h-11 w-11",
};

const variants = {
  ghost: "text-muted hover:bg-slate-100 hover:text-ink",
  solid: "border border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
  primary: "bg-primary text-white hover:bg-primary-strong",
  subtle: "bg-primary-soft text-primary hover:bg-primary-softer",
};

/**
 * Square icon-only button. Always requires a human-readable `label`
 * (rendered as aria-label + tooltip).
 */
export function IconButton({
  icon: Icon,
  label,
  size = "md",
  variant = "ghost",
  className,
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid place-items-center rounded-lg transition-all duration-150 active:scale-95 " +
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 " +
          "disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
    </button>
  );
}
