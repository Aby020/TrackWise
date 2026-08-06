/**
 * Status → label / tone / dot color mapping.
 * The dot hex is the single source of truth for both badge dots and SVG
 * charts (donut slices, gauges), so colors never drift between UI and charts.
 */
export const accountStatus = {
  active: { label: "Active", tone: "success", dot: "#059669" },
  inactive: { label: "Inactive", tone: "danger", dot: "#e11d48" },
  pending: { label: "Pending", tone: "warning", dot: "#d97706" },
};

export const attendanceStatus = {
  working: { label: "Working", tone: "success", dot: "#059669" },
  not_working: { label: "Completed", tone: "neutral", dot: "#94a3b8" },
  completed: { label: "Completed", tone: "neutral", dot: "#94a3b8" },
  Offline: { label: "Offline", tone: "muted", dot: "#94a3b8" },
  offline: { label: "Offline", tone: "muted", dot: "#94a3b8" },
};

/** Resolve an arbitrary status string to display config. */
export function resolveStatus(status) {
  if (!status) return { label: "—", tone: "neutral" };
  return (
    attendanceStatus[status] ??
    accountStatus[status] ?? {
      label: status.replace(/_/g, " "),
      tone: "neutral",
    }
  );
}

/** Hex colors for the "Today" workforce donut (admin dashboard). */
export const workforceSegments = [
  { key: "workingToday", label: "Working now", dot: "#059669" },
  { key: "completedToday", label: "Completed", dot: "#94a3b8" },
  { key: "notStartedToday", label: "Not started", dot: "#e2e8f0" },
];
