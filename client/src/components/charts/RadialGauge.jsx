import { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * SVG circular progress gauge for a value in [0, 1].
 * Painted with a primary → violet gradient and a rounded line cap. Center
 * content is passed as children. Exposes progressbar semantics for AT.
 */
export function RadialGauge({
  value = 0,
  size = 176,
  stroke = 13,
  from = "var(--color-primary)",
  to = "var(--color-violet)",
  label,
  className,
  children,
  ...rest
}) {
  // useId can contain characters invalid inside SVG url(#…) fragments.
  const gradientId = `gauge-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
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
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
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
          stroke={`url(#${gradientId})`}
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
