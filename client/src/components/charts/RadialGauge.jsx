import { cn } from "../../lib/utils";

/**
 * SVG circular progress gauge for a value in [0, 1].
 * Painted with a solid primary stroke and a rounded line cap.
 * Center content is passed as children. Exposes progressbar
 * semantics for AT.
 */
export function RadialGauge({
  value = 0,
  size = 176,
  stroke = 13,
  color = "var(--color-primary)",
  label,
  className,
  children,
  ...rest
}) {
  const clamped = Math.max(0, Math.min(1, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children}
      </div>
    </div>
  );
}
