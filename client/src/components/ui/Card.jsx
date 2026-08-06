import { cn } from "../../lib/utils";

/**
 * Surface panel. Default is a quiet bordered card; `hover` adds a gentle
 * lift for clickable cards.
 */
export function Card({
  children,
  hover = false,
  className,
  as: Tag = "div",
  ...rest
}) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-line bg-surface shadow-card",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
