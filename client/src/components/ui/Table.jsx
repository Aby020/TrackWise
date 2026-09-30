import { cn } from "../../lib/utils";

/** Responsive table shell (scrolls horizontally on small screens). */
export function Table({ children, className, ...rest }) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-line bg-surface", className)}>
      <table className="w-full min-w-max text-left text-sm" {...rest}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children, className }) {
  return (
    <thead
      className={cn(
        "bg-slate-50/70 text-[11px] uppercase tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </thead>
  );
}

export function Th({ children, className, ...rest }) {
  return (
    <th
      className={cn("px-5 py-3 font-semibold whitespace-nowrap", className)}
      scope="col"
      {...rest}
    >
      {children}
    </th>
  );
}

export function TBody({ children, className }) {
  return (
    <tbody className={cn("divide-y divide-line", className)}>{children}</tbody>
  );
}

export function Tr({ children, className, ...rest }) {
  return (
    <tr
      className={cn("transition-colors hover:bg-slate-50/70", className)}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className, ...rest }) {
  return (
    <td
      className={cn("px-5 py-3.5 align-middle text-ink-soft", className)}
      {...rest}
    >
      {children}
    </td>
  );
}
