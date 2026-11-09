import { describe, it, expect, beforeEach } from "vitest";
import {
  getNotifications,
  saveNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  getUnreadCount,
  DEFAULT_NOTIFICATIONS,
} from "./notifications";

describe("notifications", () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    const mockStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    };
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: () => true,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  it("başlangıçta varsayılan bildirimleri döner", () => {
    const list = getNotifications();
    expect(list.length).toBeGreaterThanOrEqual(DEFAULT_NOTIFICATIONS.length);
    expect(list[0].id).toBe("notif-1");
  });

  it("yeni bildirim ekler ve en başa koyar", () => {
    const created = addNotification({
      type: "match",
      title: "Yeni Test Bildirimi",
      message: "Test açıklaması",
    });

    const list = getNotifications();
    expect(list[0].id).toBe(created.id);
    expect(list[0].title).toBe("Yeni Test Bildirimi");
    expect(list[0].read).toBe(false);
  });

  it("bildirimi okundu olarak işaretler", () => {
    markAsRead("notif-1");
    const list = getNotifications();
    const item = list.find((n) => n.id === "notif-1");
    expect(item?.read).toBe(true);
  });

  it("tüm bildirimleri tek seferde okundu yapar", () => {
    markAllAsRead();
    const list = getNotifications();
    expect(list.every((n) => n.read)).toBe(true);
    expect(getUnreadCount(list)).toBe(0);
  });

  it("tüm bildirimleri temizler", () => {
    clearNotifications();
    expect(getNotifications()).toEqual([]);
    expect(getUnreadCount()).toBe(0);
  });
});
