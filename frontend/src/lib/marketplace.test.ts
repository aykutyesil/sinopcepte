import { describe, it, expect, beforeEach } from "vitest";
import {
  getMarketplaceItems,
  createMarketplaceItem,
  deleteMarketplaceItem,
  markItemAsSold,
  filterMarketplaceItems,
  SEED_MARKETPLACE_ITEMS,
} from "./marketplace";

describe("Marketplace Library", () => {
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

  it("returns default seed items when storage is empty", () => {
    const items = getMarketplaceItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].id).toBe("mkt-1");
  });

  it("creates a new marketplace item and prepends to list", () => {
    const created = createMarketplaceItem({
      title: "Test Ders Notu",
      category: "ders_notu",
      price: 0,
      description: "Açıklama",
      location: "Kampüs",
      sellerHandle: "testuser",
      sellerName: "Test User",
      sellerAvatar: "marti",
      phone: "05551112233",
      wa: "905551112233",
      photos: [],
      condition: "yeni_gibi",
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("active");

    const list = getMarketplaceItems();
    expect(list[0].id).toBe(created.id);
    expect(list[0].title).toBe("Test Ders Notu");
  });

  it("marks an item as sold and toggles", () => {
    const items = getMarketplaceItems();
    const target = items[0];
    expect(target.status).toBe("active");

    const toggled = markItemAsSold(target.id);
    expect(toggled).toBe(true);

    const updated = getMarketplaceItems();
    expect(updated[0].status).toBe("sold");
  });

  it("deletes a marketplace item", () => {
    const items = getMarketplaceItems();
    const countBefore = items.length;
    const targetId = items[0].id;

    const deleted = deleteMarketplaceItem(targetId);
    expect(deleted).toBe(true);

    const updated = getMarketplaceItems();
    expect(updated.length).toBe(countBefore - 1);
    expect(updated.find((i) => i.id === targetId)).toBeUndefined();
  });

  it("filters items by category and query", () => {
    const items = SEED_MARKETPLACE_ITEMS;

    const notlar = filterMarketplaceItems(items, { category: "ders_notu" });
    expect(notlar.every((i) => i.category === "ders_notu")).toBe(true);

    const bisiklet = filterMarketplaceItems(items, { query: "bisiklet" });
    expect(bisiklet.length).toBeGreaterThan(0);
    expect(bisiklet[0].title.toLowerCase()).toContain("bisiklet");
  });
});
