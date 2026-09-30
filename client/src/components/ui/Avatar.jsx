import { cn } from "../../lib/utils";

const palette = [
  "bg-primary-soft text-primary-strong",
  "bg-violet-soft text-violet-700",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
  "bg-info-soft text-info",
  "bg-danger-soft text-danger",
];

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

/** Initials avatar with a deterministic, name-derived tint. */
export function Avatar({
  name,
  size = "md",
  className,
  ...rest
}) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold",
        colorFor(name),
        sizes[size],
        className,
      )}
      aria-hidden="true"
      {...rest}
    >
      {initials(name)}
    </span>
  );
}
