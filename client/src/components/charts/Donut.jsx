import { cn } from "../../lib/utils";

/**
 * Multi-segment SVG donut. `segments` are [{ key, value, dot }]; the total is
 * derived from the values, so a zero total renders as an empty ring. Centre
 * content is passed as children.
 */
export function Donut({
  segments = [],
  size = 184,
  stroke = 20,
  label,
  className,
  children,
  ...rest
}) {
  const total = segments.reduce(
    (sum, s) => sum + (Number(s.value) || 0),
    0,
  );
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 3; // px breathing room between segments
  let cursor = 0;

  const arcs = segments
    .filter((s) => (Number(s.value) || 0) > 0)
    .map((seg) => {
      const arcLength = (Number(seg.value) / total) * circumference;
      const dash = Math.max(0, arcLength - gap);
      const element = (
        <circle
          key={seg.key}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={seg.dot}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={-cursor}
          className="transition-all duration-500 ease-out motion-reduce:transition-none"
        />
      );
      cursor += arcLength;
      return element;
    });

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        {total > 0 && arcs}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children}
      </div>
    </div>
  );
}
