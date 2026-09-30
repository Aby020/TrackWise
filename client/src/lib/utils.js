/**
 * Join class names, filtering out falsy values.
 * Small replacement for clsx — keeps the bundle lean.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
