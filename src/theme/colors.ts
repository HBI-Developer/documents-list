/**
 * ألوان الثيم الداكن — مكان واحد لتعديل مظهر التطبيق.
 */
export const colors = {
  background: "#0f0f1a",
  surface: "#1a1a2e",
  surfaceElevated: "#252538",
  primary: "#6366f1",
  primaryDim: "#4f46e5",
  primaryAlpha: "rgba(99, 102, 241, 0.15)",
  text: "#e2e8f0",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  border: "#334155",
  disabled: "#475569",
  disabledBg: "#1e293b",
  disabledOverlay: "rgba(30, 41, 59, 0.7)",
  error: "#f87171",
  errorAlpha: "rgba(248, 113, 113, 0.2)",
  success: "#34d399",
  fab: "#6366f1",
  fabPressed: "#4f46e5",
  cardDisabled: "#1e293b",
  cardDisabledBorder: "#334155",
  placeholder: "#888888",
} as const;

export type Colors = typeof colors;
