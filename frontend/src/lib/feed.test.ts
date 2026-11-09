// Beklenenler legacy `renderFeedStream` / `filterFeed` / `handleSearch` ve seed JSON okunarak yazıldı.
import { describe, expect, it } from "vitest";
import { buildFeed, displayRating, formatPhone, itemPrimaryAction } from "./feed";
import { buildAdminPayload, EMPTY_ADMIN_FORM } from "./admin";
import { weatherIcon } from "./weather";
import type { FeedFilter, Item, LiveEvent } from "./types";
import seedItems from "../../../backend/src/main/resources/seed/items.json";
import seedEvents from "../../../backend/src/main/resources/seed/events.json";

const items = seedItems as Item[];
const events = seedEvents as LiveEvent[];
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);
const feed = (filter: FeedFilter, query = "") => buildFeed({ events, items, filter, query });

describe("buildFeed — filtre", () => {
  it("seed boyutları: 4 etkinlik, 15 item", () => {
    expect(events).toHaveLength(4);
    expect(items).toHaveLength(15);
  });

  it("all: tüm etkinlikler ve tüm item'lar, seed sırasıyla", () => {
    const r = feed("all");
    expect(ids(r.events)).toEqual(["ev-1", "ev-2", "ev-3", "ev-4"]);
    expect(ids(r.items)).toEqual(ids(items));
  });

  it("etkinlik: yalnız etkinlikler, item yok", () => {
    const r = feed("etkinlik");
    expect(r.events).toHaveLength(4);
    expect(r.items).toEqual([]);
  });

  it("taksi: 3 taksi item'ı, etkinlik yok", () => {
    const r = feed("taksi");
    expect(r.events).toEqual([]);
    expect(ids(r.items)).toEqual(["tx-1", "tx-2", "tx-3"]);
  });

  it.each([
    ["mekan", ["m-1", "m-2", "m-3", "m-4", "m-5", "m-6"]],
    ["tekel", ["t-1", "t-2", "t-3"]],
    ["eczane", ["e-1"]],
    ["cicek", ["c-1", "c-2"]],
  ] as const)("%s: yalnız o kategori, etkinlik yok", (filter, expected) => {
    const r = feed(filter);
    expect(r.events).toEqual([]);
    expect(ids(r.items)).toEqual([...expected]);
  });
});

describe("buildFeed — arama", () => {
  it("dolu sorgu filtreyi yok sayar (legacy handleSearch tüm veride arar)", () => {
    const r = feed("mekan", "taksi");
    expect(r.events).toEqual([]);
    expect(ids(r.items)).toEqual(["tx-1", "tx-2", "tx-3"]);
  });

  it("etkinlik filtresinde bile item'lar aranır", () => {
    const r = feed("etkinlik", "nihavent");
    expect(ids(r.events)).toEqual(["ev-1"]);
    expect(ids(r.items)).toEqual(["m-2"]);
  });

  it("yalnız boşluk sorgu = arama yok, filtre görünümü", () => {
    const r = feed("taksi", "   ");
    expect(r.events).toEqual([]);
    expect(ids(r.items)).toEqual(["tx-1", "tx-2", "tx-3"]);
  });

  it("eşleşme yoksa iki liste de boş", () => {
    const r = feed("all", "xyzqwe");
    expect(r.events).toEqual([]);
    expect(r.items).toEqual([]);
  });
});

describe("kart yardımcıları", () => {
  const byId = (id: string) => items.find((i) => i.id === id)!;

  it("kategoriye göre birincil düğme", () => {
    expect(itemPrimaryAction(byId("m-1")).text).toBe("WhatsApp İletişim");
    expect(itemPrimaryAction(byId("t-1")).text).toBe("🛵 Gece Sipariş Ver");
    expect(itemPrimaryAction(byId("c-1")).text).toBe("💐 Çiçek Siparişi");

    const taxi = itemPrimaryAction(byId("tx-1"));
    expect(taxi).toEqual({ text: "🚖 Durağı Ara", href: "tel:03682611010", target: "_self" });

    const ecz = itemPrimaryAction(byId("e-1"));
    expect(ecz).toEqual({
      text: "📍 Haritada Yol Tarifi Al",
      href: "https://www.google.com/maps?daddr=42.0257925,35.1457768",
      target: "_blank",
    });
  });

  it("WhatsApp bağlantısı legacy metnini encodeURIComponent ile taşır", () => {
    expect(itemPrimaryAction(byId("m-3")).href).toBe(
      "https://wa.me/905335738857?text=Cem's%20Burger%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum",
    );
  });

  it("mapUrl yoksa eczane varsayılan harita bağlantısına düşer", () => {
    const e = { ...byId("e-1"), mapUrl: undefined };
    expect(itemPrimaryAction(e).href).toBe("https://www.google.com/maps?daddr=42.0032747,35.0787668");
  });

  it("puan yoksa 4.8", () => {
    expect(displayRating({ ...byId("m-1"), rating: undefined })).toBe("4.8");
    expect(displayRating(byId("m-1"))).toBe("4.9");
  });

  it("telefon biçimi sağ kolondaki elle yazılmışla aynı", () => {
    expect(formatPhone("03682611010")).toBe("0368 261 10 10");
    expect(formatPhone("03682612020")).toBe("0368 261 20 20");
    expect(formatPhone("12345")).toBe("12345");
  });
});

describe("hava kodu -> emoji (legacy sırası)", () => {
  it.each([
    [0, "☀️"],
    [1, "⛅"],
    [3, "⛅"],
    [45, "🌤️"],
    [51, "🌧️"],
    [67, "🌧️"],
    [68, "🌤️"],
    [71, "❄️"],
    [95, "❄️"],
  ])("%i -> %s", (code, icon) => {
    expect(weatherIcon(code)).toBe(icon);
  });
});

describe("admin formu -> API gövdesi (legacy saveAdminItem)", () => {
  it("başlık boşsa geçersiz", () => {
    expect(buildAdminPayload({ ...EMPTY_ADMIN_FORM, title: "  " })).toEqual({
      kind: "invalid",
      message: "Lütfen başlık veya işletme adını girin.",
    });
  });

  it("etkinlik: konum -> venue, rozet -> date, sabit rozet ve konum", () => {
    expect(
      buildAdminPayload({ ...EMPTY_ADMIN_FORM, category: "etkinlik", title: "DJ", badge: "Bu Gece • 22:00", location: "Joker Pub" }),
    ).toEqual({
      kind: "event",
      data: {
        title: "DJ",
        venue: "Joker Pub",
        location: "Sinop",
        date: "Bu Gece • 22:00",
        badge: "🔥 CANLI ETKİNLİK",
        desc: "Sinop güncel program.",
        wa: "905555555555",
      },
    });
  });

  it("item: varsayılanlar ve puan 4.8", () => {
    expect(buildAdminPayload({ ...EMPTY_ADMIN_FORM, category: "tekel", title: "Büfe" })).toEqual({
      kind: "item",
      data: {
        category: "tekel",
        title: "Büfe",
        badge: "Aktif",
        location: "Sinop",
        desc: "Sinop güncel program.",
        phone: "",
        wa: "905555555555",
        rating: "4.8",
      },
    });
  });
});
