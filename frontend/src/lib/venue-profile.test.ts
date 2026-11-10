import { describe, expect, it, beforeEach } from "vitest";
import {
  slugifyVenue,
  venueHref,
  getVenueProfile,
  isVenueOwner,
  assignVenueOwner,
  claimVenue,
  updateVenueClaim,
  createVenueEvent,
  getVenueEvents,
  deleteVenueEvent,
} from "./venue-profile";
import type { Item } from "./types";

const mockItem = {
  id: "m-1",
  category: "mekan",
  title: "Mathiday's Social",
  badge: "🍸 Kokteyl & DJ",
  location: "📍 Liman Mevkii",
  desc: "Burkay Bahadır DJ performansları",
  phone: "05325713457",
  wa: "905325713457",
  rating: "4.9",
  ownerHandle: "burkay",
};

describe("venue-profile helpers", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: () => true,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  it("slugifies turkish characters properly", () => {
    expect(slugifyVenue("Sinop Şehir Kulübü & Kafe")).toBe("sinop-sehir-kulubu-kafe");
    expect(slugifyVenue("Mathiday's Social")).toBe("mathidays-social");
  });

  it("resolves venueHref by id or title", () => {
    expect(venueHref("m-1", [mockItem])).toBe("/mekan/m-1");
    expect(venueHref("Mathiday's Social", [mockItem])).toBe("/mekan/m-1");
    expect(venueHref("Bilinmeyen Mekan", [mockItem])).toBe("/mekan/bilinmeyen-mekan");
  });

  it("generates default profile with menu and photos", () => {
    const prof = getVenueProfile(mockItem);
    expect(prof.itemId).toBe("m-1");
    expect(prof.title).toBe("Mathiday's Social");
    expect(prof.ownerHandle).toBe("burkay");
    expect(prof.photos.length).toBeGreaterThan(0);
    expect(prof.menu.length).toBeGreaterThan(0);
    expect(prof.location).toBe("Liman Mevkii");
  });

  it("checks ownership correctly including master admins and custom owners", () => {
    assignVenueOwner("m-1", "burkay");
    expect(isVenueOwner("aykut", "m-1")).toBe(true);
    expect(isVenueOwner("oguzhan", "m-1")).toBe(true);
    expect(isVenueOwner("burkay", "m-1")).toBe(true);
    expect(isVenueOwner("mehmet", "m-1")).toBe(false);

    assignVenueOwner("m-1", "mehmet");
    expect(isVenueOwner("mehmet", "m-1")).toBe(true);
  });

  it("handles claims flow", () => {
    const claim = claimVenue({
      itemId: "m-1",
      venueTitle: "Mathiday's Social",
      userHandle: "canan_sn",
      note: "İşletmeciyim",
      phone: "05551112233",
    });

    expect(claim.status).toBe("PENDING");
    expect(isVenueOwner("canan_sn", "m-1")).toBe(false);

    updateVenueClaim(claim.id, "APPROVED");
    expect(isVenueOwner("canan_sn", "m-1")).toBe(true);
  });

  it("handles custom venue events", () => {
    const ev = createVenueEvent({
      venueId: "m-1",
      title: "Akustik Gece",
      venue: "Mathiday's Social",
      location: "Liman Mevkii",
      date: "Cuma 21:00",
      badge: "CANLI MÜZİK",
      desc: "Özel canlı akustik performans",
      wa: "905325713457",
    });

    expect(getVenueEvents("m-1").length).toBe(1);
    deleteVenueEvent(ev.id);
    expect(getVenueEvents("m-1").length).toBe(0);
  });
});
