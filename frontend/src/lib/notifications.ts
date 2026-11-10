// SinopCepte Canlı Bildirim Sistemi (PostgreSQL & Backend API Entegre)

export type NotificationType = "match" | "checkin" | "mayor" | "city" | "system" | "okeye4_request" | "okeye4_approved" | "claim";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
  badge?: string;
  actionUrl?: string;
}

export interface BackendNotification {
  id: string;
  recipientHandle?: string | null;
  type: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  href?: string | null;
  actionLabel?: string | null;
  createdAt: string;
}

const STORAGE_KEY = "sinopcepte_notifications_v1";

let inMemoryNotifications: AppNotification[] = [];
let isFetchingNotifications = false;

function mapType(t: string): NotificationType {
  if (t === "match" || t === "okeye4_request" || t === "okeye4_approved") return "match";
  if (t === "checkin") return "checkin";
  if (t === "mayor" || t === "claim" || t === "venue_claim_approved") return "mayor";
  if (t === "city") return "city";
  return "system";
}

function mapIcon(t: string): string {
  if (t.includes("okeye4") || t === "match") return "🀄";
  if (t === "mayor" || t === "claim" || t.includes("venue")) return "👑";
  if (t === "checkin") return "📍";
  if (t === "city") return "🌊";
  return "🔔";
}

export function transformBackendNotifications(list: BackendNotification[]): AppNotification[] {
  return list.map((n) => ({
    id: n.id,
    type: mapType(n.type),
    title: n.title,
    message: n.body,
    timestamp: new Date(n.createdAt).getTime(),
    read: n.read,
    icon: mapIcon(n.type),
    badge: n.actionLabel || "Bildirim",
    actionUrl: n.href || undefined,
  }));
}

async function getCsrfToken(): Promise<string | null> {
  const prefix = "XSRF-TOKEN=";
  for (const part of (typeof document !== "undefined" ? document.cookie : "").split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
  }
  try {
    await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" });
    for (const part of document.cookie.split(";")) {
      const c = part.trim();
      if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
    }
  } catch {}
  return null;
}

function canFetch(): boolean {
  return typeof window !== "undefined" && !!window.location?.origin && process.env.NODE_ENV !== "test";
}

export async function fetchNotificationsFromBackend(): Promise<AppNotification[]> {
  if (!canFetch() || isFetchingNotifications) return inMemoryNotifications;
  isFetchingNotifications = true;
  try {
    const res = await fetch("/api/notifications", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data: BackendNotification[] = await res.json();
      const transformed = transformBackendNotifications(data);
      inMemoryNotifications = transformed;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transformed));
      } catch {}
      window.dispatchEvent(new Event("sinopcepte_notif_changed"));
      return transformed;
    }
  } catch (err) {
    console.warn("Backend bildirimleri çekilemedi:", err);
  } finally {
    isFetchingNotifications = false;
  }
  return inMemoryNotifications;
}

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return inMemoryNotifications;
  if (inMemoryNotifications.length === 0) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) inMemoryNotifications = parsed;
      }
    } catch {}
    fetchNotificationsFromBackend().catch(() => {});
  }
  return inMemoryNotifications;
}

export function saveNotifications(list: AppNotification[]): void {
  inMemoryNotifications = list;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("sinopcepte_notif_changed"));
  } catch (e) {
    console.error("Bildirimler kaydedilemedi:", e);
  }
}

export function addNotification(
  notif: Omit<AppNotification, "id" | "timestamp" | "read"> & {
    id?: string;
    timestamp?: number;
    read?: boolean;
  }
): AppNotification {
  const current = getNotifications();
  const created: AppNotification = {
    id: notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    timestamp: notif.timestamp || Date.now(),
    read: notif.read || false,
    icon: notif.icon || "🔔",
    badge: notif.badge,
    actionUrl: notif.actionUrl,
  };

  const updated = [created, ...current.filter((n) => n.id !== created.id)].slice(0, 50);
  saveNotifications(updated);
  return created;
}

export function markAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);

  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: "POST",
        credentials: "same-origin",
        headers,
      });
    } catch {}
  })();
}

export function markAllAsRead(): void {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);

  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch("/api/notifications/read-all", {
        method: "POST",
        credentials: "same-origin",
        headers,
      });
    } catch {}
  })();
}

export function clearNotifications(): void {
  saveNotifications([]);
}

export function getUnreadCount(list?: AppNotification[]): number {
  const target = list || getNotifications();
  return target.filter((n) => !n.read).length;
}
