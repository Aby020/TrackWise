import api from "./api";

/** GET /shift/current → active company shift policy. */
export async function getActiveShift() {
  const { data } = await api.get("/shift/current");
  return data;
}

/**
 * Parse an "HH:mm[:ss]" server time into minutes since midnight.
 * Returns null for anything that isn't a plain clock time.
 */
export function parseClockMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** "08:30:00" → "08:30 AM" */
export function formatClockLabel(value) {
  const minutes = parseClockMinutes(value);
  if (minutes === null) return "--";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(mins).padStart(2, "0")} ${period}`;
}

/** Minutes remaining until the shift opens, or null when the window is open. */
export function minutesUntilStart(shift, now = new Date()) {
  const start = parseClockMinutes(shift?.startTime);
  if (start === null) return null;
  const current = now.getHours() * 60 + now.getMinutes();
  const grace = Number(shift.earlyCheckinGraceMinutes ?? 0);
  const earliest = start - grace;
  return current < earliest ? earliest - current : null;
}

/** Minutes remaining until the shift closes, or null after it ends. */
export function minutesUntilEnd(shift, now = new Date()) {
  const end = parseClockMinutes(shift?.endTime);
  if (end === null) return null;
  const current = now.getHours() * 60 + now.getMinutes();
  return current < end ? end - current : null;
}
