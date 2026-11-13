import { describe, it, expect, beforeEach } from "vitest";
import {
  transformBackendCheckins,
  formatTimeAgo,
  formatTimeRemaining,
  formatTimeAtVenue,
  isCheckinActive,
  getCheckInState,
  saveCheckInState,
  getMyActiveCheckIn,
  setMyActiveCheckIn,
  clearMyActiveCheckIn,
  CHECKIN_DURATION_MS,
  type BackendCheckin,
} from "./checkin";

describe("checkin module", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: () => true,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  it("transforms backend checkin records correctly", () => {
    const list: BackendCheckin[] = [
      {
        id: "c-1",
        itemId: "m-1",
        handle: "deniz",
        displayName: "Deniz",
        avatar: "marti",
        note: "Harika mekan",
        checkedInAt: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: "c-2",
        itemId: "m-1",
        handle: "deniz",
        displayName: "Deniz",
        avatar: "marti",
        checkedInAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "c-3",
        itemId: "m-1",
        handle: "ali",
        displayName: "Ali",
        avatar: "fener",
        checkedInAt: new Date().toISOString(),
      },
    ];

    const res = transformBackendCheckins(list);
    expect(res["m-1"]).toBeDefined();
    expect(res["m-1"].totalVisits).toBe(3);
    expect(res["m-1"].mayor.handle).toBe("deniz");
    expect(res["m-1"].mayor.checkInCount).toBe(2);
    expect(res["m-1"].activeUsers.length).toBe(3);
  });

  it("formats time ago", () => {
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    expect(formatTimeAgo(tenMinsAgo)).toBe("10 dk önce");

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoHoursAgo)).toBe("2 saat önce");
  });

  it("saves and retrieves check-in state", () => {
    saveCheckInState({
      "m-1": {
        venueId: "m-1",
        totalVisits: 5,
        mayor: { handle: "berk", displayName: "Berk", avatar: "hamsi", checkInCount: 4 },
        activeUsers: [],
      },
    });

    const state = getCheckInState();
    expect(state["m-1"].mayor.handle).toBe("berk");
  });

  it("considers check-ins within 2 hours active and older ones expired", () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoHoursOneMinAgo = now - (2 * 60 * 60 * 1000 + 60 * 1000);

    expect(isCheckinActive(oneHourAgo, now)).toBe(true);
    expect(isCheckinActive(twoHoursOneMinAgo, now)).toBe(false);
  });

  it("excludes check-ins older than 2 hours from activeUsers in transformBackendCheckins", () => {
    const now = Date.now();
    const list: BackendCheckin[] = [
      {
        id: "c-active",
        itemId: "m-1",
        handle: "aktif_kullanici",
        displayName: "Aktif",
        avatar: "marti",
        checkedInAt: new Date(now - 30 * 60 * 1000).toISOString(), // 30 dk önce
      },
      {
        id: "c-expired",
        itemId: "m-1",
        handle: "eski_kullanici",
        displayName: "Eski",
        avatar: "fener",
        checkedInAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 saat önce
      },
    ];

    const res = transformBackendCheckins(list);
    expect(res["m-1"].totalVisits).toBe(2); // Toplam ziyarette sayılır
    expect(res["m-1"].activeUsers.length).toBe(1); // Yalnızca 30 dk önceki aktif
    expect(res["m-1"].activeUsers[0].handle).toBe("aktif_kullanici");
  });

  it("getMyActiveCheckIn clears expired check-in after 2 hours", () => {
    const expiredTimestamp = Date.now() - (2 * 60 * 60 * 1000 + 5000); // 2 saat 5 saniye önce
    setMyActiveCheckIn({
      venueId: "m-1",
      venueTitle: "Mathilda",
      handle: "deniz",
      timestamp: expiredTimestamp,
    });

    const active = getMyActiveCheckIn();
    expect(active).toBeNull();
  });

  it("formats time remaining correctly", () => {
    const now = Date.now();
    const thirtyMinsAgo = now - 30 * 60 * 1000; // 90 dakika kaldı = 1 sa 30 dk kaldı
    expect(formatTimeRemaining(thirtyMinsAgo, now)).toBe("1 sa 30 dk kaldı");

    const oneHourFiftyMinsAgo = now - (110 * 60 * 1000); // 10 dakika kaldı
    expect(formatTimeRemaining(oneHourFiftyMinsAgo, now)).toBe("10 dk kaldı");

    const twoHoursAgo = now - CHECKIN_DURATION_MS - 1000;
    expect(formatTimeRemaining(twoHoursAgo, now)).toBe("Süresi doldu");
  });

  it("formats time at venue correctly as requested (şu kadar saat ve şu kadar dakikadır burada)", () => {
    const now = Date.now();
    expect(formatTimeAtVenue(now - 10 * 60 * 1000, now)).toBe("10 dakikadır burada");
    expect(formatTimeAtVenue(now - 45 * 60 * 1000, now)).toBe("45 dakikadır burada");
    expect(formatTimeAtVenue(now - 60 * 60 * 1000, now)).toBe("1 saattir burada");
    expect(formatTimeAtVenue(now - 75 * 60 * 1000, now)).toBe("1 saat 15 dakikadır burada");
    expect(formatTimeAtVenue(now - 110 * 60 * 1000, now)).toBe("1 saat 50 dakikadır burada");
  });

  it("automatically removes user from previous venue when moving to a new venue", () => {
    const now = Date.now();
    const list: BackendCheckin[] = [
      {
        id: "c-old",
        itemId: "m-1", // Mathilda
        handle: "aykut",
        displayName: "Aykut",
        avatar: "marti",
        checkedInAt: new Date(now - 15 * 60 * 1000).toISOString(), // 15 dk önce Mathilda'daydı
      },
      {
        id: "c-new",
        itemId: "m-2", // Nihavent
        handle: "aykut",
        displayName: "Aykut",
        avatar: "marti",
        checkedInAt: new Date(now - 2 * 60 * 1000).toISOString(), // 2 dk önce Nihavent'e geçti
      },
    ];

    const res = transformBackendCheckins(list, now);
    // Eski mekandan otomatik silinmeli
    expect(res["m-1"].activeUsers.some((u) => u.handle === "aykut")).toBe(false);
    // Yeni mekanda aktif olmalı
    expect(res["m-2"].activeUsers.some((u) => u.handle === "aykut")).toBe(true);
    expect(res["m-2"].activeUsers[0].handle).toBe("aykut");
  });
});
