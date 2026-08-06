import { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useClickOutside } from "../../hooks/useClickOutside";

const MenuContext = createContext({ close: () => {} });

/**
 * Dropdown menu. `trigger` may be a node or a render-prop function receiving
 * `{ open, close }`. Panel is positioned below the trigger, end-aligned by
 * default (align="start" for left alignment).
 */
export function Menu({ trigger, align = "end", children, className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const close = () => setOpen(false);

  useClickOutside(rootRef, close);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <MenuContext.Provider value={{ close }}>
      <div ref={rootRef} className="relative">
        {typeof trigger === "function" ? trigger({ open, close }) : trigger}
        {open && (
          <div
            role="menu"
            className={cn(
              "absolute z-40 mt-2 min-w-52 origin-top rounded-xl border border-line bg-surface p-1.5 shadow-pop animate-scale-in",
              align === "end" ? "right-0" : "left-0",
              className,
            )}
          >
            {typeof children === "function" ? children({ close }) : children}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}

export function MenuItem({
  icon: Icon,
  label,
  onSelect,
  danger = false,
  disabled = false,
  className,
  ...rest
}) {
  const { close } = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 " +
          "disabled:pointer-events-none disabled:opacity-50",
        danger
          ? "text-danger hover:bg-danger-soft"
          : "text-ink-soft hover:bg-slate-100 hover:text-ink",
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}

export function MenuLabel({ children, className }) {
  return (
    <p
      className={cn(
        "px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-faint",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MenuSeparator({ className }) {
  return <div className={cn("my-1.5 h-px bg-line", className)} />;
}
