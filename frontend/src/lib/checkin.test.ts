import { describe, it, expect, beforeEach } from "vitest";
import {
  transformBackendCheckins,
  formatTimeAgo,
  getCheckInState,
  saveCheckInState,
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
});
