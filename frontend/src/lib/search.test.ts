// Beklenen değerler legacy `normalizeTr` / `matchSearch` (index.html:746-769) okunarak türetildi.
import { describe, expect, it } from "vitest";
import { matchSearch, normalizeTr, searchEvents, searchItems } from "./search";
import type { Item, LiveEvent } from "./types";
import seedItems from "../../../backend/src/main/resources/seed/items.json";
import seedEvents from "../../../backend/src/main/resources/seed/events.json";

const items = seedItems as Item[];
const events = seedEvents as LiveEvent[];

const ev = (over: Partial<LiveEvent>): LiveEvent => ({
  id: "x",
  title: "",
  venue: "",
  location: "",
  date: "",
  badge: "",
  desc: "",
  wa: "",
  ...over,
});
const item = (over: Partial<Item>): Item => ({
  id: "x",
  category: "mekan",
  title: "",
  badge: "",
  location: "",
  desc: "",
  phone: "",
  wa: "",
  ...over,
});

describe("normalizeTr", () => {
  it("İ -> i, I -> ı -> i (her iki büyük I da i olur)", () => {
    expect(normalizeTr("İSKELE")).toBe("iskele");
    expect(normalizeTr("ISKELE")).toBe("iskele");
    expect(normalizeTr("ıskele")).toBe("iskele");
    expect(normalizeTr("Iğdır")).toBe("igdir");
  });

  it("ğ ü ş ö ç ı katlanır", () => {
    expect(normalizeTr("Çiçek")).toBe("cicek");
    expect(normalizeTr("Şarküteri")).toBe("sarkuteri");
    expect(normalizeTr("doğum")).toBe("dogum");
    expect(normalizeTr("süt")).toBe("sut");
    expect(normalizeTr("Gül")).toBe("gul");
    expect(normalizeTr("ÖZEL")).toBe("ozel");
    expect(normalizeTr("AŞIKLAR")).toBe("asiklar");
  });

  it("kesme/tırnak/tire silinir, diğer işaretler boşluk olur, boşluklar sıkışır", () => {
    expect(normalizeTr("Cem's Burger")).toBe("cems burger");
    expect(normalizeTr("Cem’s")).toBe("cems");
    expect(normalizeTr('"Joker"')).toBe("joker");
    expect(normalizeTr("Galatasaray - Amed SK")).toBe("galatasaray amed sk");
    expect(normalizeTr("Bugün Canlı • 20:00")).toBe("bugun canli 20 00");
    expect(normalizeTr("  📍  Liman   Mevkii ")).toBe("liman mevkii");
  });

  it("Türkçe dışı aksanlı harfler boşluğa döner (â katlanmaz)", () => {
    expect(normalizeTr("Kâğıt")).toBe("k git");
  });

  it("falsy girdi boş dizedir", () => {
    expect(normalizeTr("")).toBe("");
    expect(normalizeTr(null)).toBe("");
    expect(normalizeTr(undefined)).toBe("");
    expect(normalizeTr(0)).toBe("");
  });
});

describe("matchSearch", () => {
  it("Türkçe katlamayla eşleşir", () => {
    expect(matchSearch("İskele Caddesi", "iskele")).toBe(true);
    expect(matchSearch("ıskele", "ISKELE")).toBe(true);
    expect(matchSearch("Sinop Gül Çiçekçilik", "cicek")).toBe(true);
    expect(matchSearch("Deniz Tekel & Şarküteri", "sarkuteri")).toBe(true);
    expect(matchSearch("doğum günü buketleri", "dogum")).toBe(true);
    expect(matchSearch("Soğuk süt", "sut")).toBe(true);
    expect(matchSearch("Sinop Gül Çiçekçilik", "gul")).toBe(true);
  });

  it("boş sorgu her şeyle eşleşir; yalnız boşluk da (kelime yok -> every = true)", () => {
    expect(matchSearch("herhangi", "")).toBe(true);
    expect(matchSearch("herhangi", "   ")).toBe(true);
    expect(matchSearch("", "")).toBe(true);
  });

  it("eşleşmeyen sorgu false", () => {
    expect(matchSearch("Deniz Tekel & Şarküteri", "pizza")).toBe(false);
    expect(matchSearch("", "a")).toBe(false);
  });

  it("kelimeler VE ile, alt-dizi olarak aranır", () => {
    expect(matchSearch("Deniz Tekel & Şarküteri", "deniz tekel")).toBe(true);
    expect(matchSearch("Deniz Tekel & Şarküteri", "tekel deniz")).toBe(true);
    expect(matchSearch("Deniz Tekel & Şarküteri", "deniz otogar")).toBe(false);
    expect(matchSearch("Deniz Tekel", "tek")).toBe(true);
  });

  it("kesme işaretli sorgu havuzla aynı biçimde normalize edilir", () => {
    expect(matchSearch("Cem's Burger", "cems")).toBe(true);
    expect(matchSearch("Cem's Burger", "cem's")).toBe(true);
    expect(matchSearch("Cem's Burger", "cem s")).toBe(true);
  });
});

describe("aranan alanlar", () => {
  it("etkinlik yalnız venue üzerinden eşleşir", () => {
    const only = ev({ id: "v", title: "Gece", venue: "Zeytinlik Sahne" });
    expect(searchEvents([only], "zeytinlik").map((e) => e.id)).toEqual(["v"]);
    expect(searchEvents(events, "mathidays").map((e) => e.id)).toEqual(["ev-2"]);
  });

  it("etkinlikte date ve wa aranmaz", () => {
    const e1 = ev({ id: "d", title: "Gece", date: "Özel Tarih", wa: "905001112233" });
    expect(searchEvents([e1], "ozel")).toEqual([]);
    expect(searchEvents([e1], "905001112233")).toEqual([]);
  });

  it("item yalnız category üzerinden eşleşir", () => {
    const only = item({ id: "c", category: "cicek", title: "Ada Botanik" });
    expect(searchItems([only], "cicek").map((i) => i.id)).toEqual(["c"]);
  });

  it("item'da phone, wa, rating, id aranmaz", () => {
    const i1 = item({ id: "zz-9", title: "Büfe", phone: "05445555001", wa: "905445555001", rating: "4.9" });
    expect(searchItems([i1], "05445555001")).toEqual([]);
    expect(searchItems([i1], "905445555001")).toEqual([]);
    expect(searchItems([i1], "4 9")).toEqual([]);
    expect(searchItems([i1], "zz")).toEqual([]);
  });

  it("seed üzerinde 'ISKELE' aranınca İskele geçen kayıtlar gelir", () => {
    expect(searchEvents(events, "ISKELE").map((e) => e.id)).toEqual(["ev-1"]);
    expect(searchItems(items, "ISKELE").map((i) => i.id)).toEqual(["m-2", "t-1", "tx-2"]);
  });
});
