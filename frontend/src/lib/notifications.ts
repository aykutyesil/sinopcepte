// SinopCepte Canlı Bildirim Sistemi

export type NotificationType = "match" | "checkin" | "mayor" | "city" | "system";

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

const STORAGE_KEY = "sinopcepte_notifications_v1";

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "match",
    title: "Okeye 4. Aranıyor! 🀄",
    message: "Nihavent Pub & Bistro'da 1 kişi aranıyor. Masaya katılmak ister misin?",
    timestamp: Date.now() - 12 * 60 * 1000,
    read: false,
    icon: "🀄",
    badge: "Eşleşme",
    actionUrl: "okeye4",
  },
  {
    id: "notif-2",
    type: "mayor",
    title: "Mekan Muhtarlığı Yarışı! 👑",
    message: "Cem's Burger & Lounge'da @eren_k yeni muhtar oldu. Check-in yaparak tahtı kap!",
    timestamp: Date.now() - 45 * 60 * 1000,
    read: false,
    icon: "👑",
    badge: "Swarm",
    actionUrl: "mekan",
  },
  {
    id: "notif-3",
    type: "city",
    title: "Günün Nöbetçi Eczanesi 💊",
    message: "Sinop Merkez'de bugün Şifa Eczanesi gece 08:30'a kadar nöbetçi.",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
    icon: "💊",
    badge: "Sağlık",
    actionUrl: "eczane",
  },
  {
    id: "notif-4",
    type: "system",
    title: "SinopCepte'ye Hoş Geldin! 🌊",
    message: "Canlı şehir akışı, swarm check-in ve masa eşleşmeleri cebinde.",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    icon: "🐬",
    badge: "Sistem",
  },
];

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotifications(list: AppNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Başka bileşenlerin dinleyebilmesi için event fırlat
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

  // En başa ekle, en fazla 50 bildirim sakla
  const updated = [created, ...current.filter((n) => n.id !== created.id)].slice(0, 50);
  saveNotifications(updated);
  return created;
}

export function markAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllAsRead(): void {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function clearNotifications(): void {
  saveNotifications([]);
}

export function getUnreadCount(list?: AppNotification[]): number {
  const target = list || getNotifications();
  return target.filter((n) => !n.read).length;
}
