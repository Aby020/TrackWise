import { resolveStatus } from "../../lib/status";
import { Badge } from "./Badge";

/** Renders a known attendance/account status as a colored pill. */
export function StatusBadge({
  status,
  showDot = true,
  className,
  ...rest
}) {
  const config = resolveStatus(status);
  return (
    <Badge
      tone={config.tone}
      dotColor={showDot ? config.dot : undefined}
      className={className}
      {...rest}
    >
      {config.label}
    </Badge>
  );
}
