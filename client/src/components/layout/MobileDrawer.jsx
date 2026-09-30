import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import { IconButton } from "../ui/IconButton";
import { SidebarContent, SidebarGlass } from "./Sidebar";

/** Slide-in navigation drawer for small screens. */
export function MobileDrawer({ open, onClose }) {
  useLockBodyScroll(open);

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={cn(
          "relative h-full w-72 max-w-[85vw] shadow-lift transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarGlass>
          <div className="absolute right-3 top-4 z-20">
            <IconButton
              label="Close menu"
              icon={X}
              onClick={onClose}
              className="text-slate-400 hover:bg-white/10 hover:text-white"
            />
          </div>
          <SidebarContent onNavigate={onClose} />
        </SidebarGlass>
      </aside>
    </div>
  );
}
