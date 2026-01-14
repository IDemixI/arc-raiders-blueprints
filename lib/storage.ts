export const STORAGE_KEY = "arcraiders_bp_v2_ui";

export function getStatuses(): Record<string, "unknown" | "need" | "learned" | "crafted"> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).statuses ?? {} : {};
  } catch {
    return {};
  }
}

export function saveStatuses(statuses: Record<string, "unknown" | "need" | "learned">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ statuses }));
  } catch {}
}