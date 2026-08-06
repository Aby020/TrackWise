import { useEffect } from "react";

/**
 * Lock the body scroll while `locked` is true (modals, drawers).
 */
export function useLockBodyScroll(locked = true) {
  useEffect(() => {
    if (!locked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
