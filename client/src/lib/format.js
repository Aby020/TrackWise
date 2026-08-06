/**
 * Date / time / number formatting helpers for the UI.
 * All formatters are defensive: invalid or empty input returns "--".
 */

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateLongFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateShortFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const dateDayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const dateFullFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const monthFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "9:02 AM" — used for check-in / check-out columns. */
export function formatTime(value) {
  const d = toDate(value);
  return d ? timeFmt.format(d) : "--";
}

/** "Tuesday, August 5, 2026" — topbar / page headers. */
export function formatDateLong(value = new Date()) {
  const d = toDate(value) ?? new Date();
  return dateLongFmt.format(d);
}

/** "Aug 5" — compact labels. */
export function formatDateShort(value) {
  const d = toDate(value);
  return d ? dateShortFmt.format(d) : "--";
}

/** "Tue, Aug 5" — recent activity rows. */
export function formatDateDay(value) {
  const d = toDate(value);
  return d ? dateDayFmt.format(d) : "--";
}

/** "Aug 5, 2026" — table cells. */
export function formatDateFull(value) {
  const d = toDate(value);
  return d ? dateFullFmt.format(d) : "--";
}

/** "7.5 hrs" or "--" for zero / missing. */
export function formatHours(value) {
  if (value === null || value === undefined || value === "") return "--";
  const n = Number(value);
  if (Number.isNaN(n) || n === 0) return "--";
  return `${Number.isInteger(n) ? n : n.toFixed(1)} hrs`;
}

/** "7.5" — plain numeric hours for charts / comparisons. */
export function toHours(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

/** "2026-08" — stable month key used for filtering / grouping. */
export function monthKey(value) {
  const d = toDate(value) ?? new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

/** "August 2026" — from a "YYYY-MM" key or a date. */
export function monthLabel(input) {
  if (typeof input === "string" && /^\d{4}-\d{2}$/.test(input)) {
    const [y, m] = input.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return monthFmt.format(d);
  }
  const d = toDate(input) ?? new Date();
  return monthFmt.format(d);
}

/** Time-aware greeting. */
export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** True when the given ISO date falls on today (local). */
export function isToday(value) {
  const d = toDate(value);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Nice first+last display, falling back gracefully. */
export function fullName(first, last, fallback = "Employee") {
  const parts = [first, last].filter(Boolean).map(String);
  return parts.length ? parts.join(" ") : fallback;
}
