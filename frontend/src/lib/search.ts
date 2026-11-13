// Tasarım 4 (legacy/tasarim4-canli-radar-feed/index.html:746-790) arama mantığının birebir portu.
// Saf fonksiyonlar; tarayıcı API'si kullanmaz.

import type { Item, LiveEvent } from "./types";

/** Legacy `normalizeTr` — satır satır aynı sıra ile. */
export function normalizeTr(str: unknown): string {
  if (!str) return "";
  return String(str)
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/['’`"-]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Legacy `matchSearch`: sorgudaki her kelime havuzda alt-dizi olarak geçmeli (VE). */
export function matchSearch(textPool: string, query: string): boolean {
  if (!query) return true;
  const normalizedPool = normalizeTr(textPool);
  const queryWords = normalizeTr(query).split(" ").filter(Boolean);
  return queryWords.every((word) => normalizedPool.includes(word));
}

/** Legacy `handleSearch` içindeki etkinlik havuzu: title, venue, location, desc, badge. */
export function eventSearchPool(ev: LiveEvent): string {
  return [ev.title, ev.venue, ev.location, ev.desc, ev.badge].join(" ");
}

/** Legacy `handleSearch` içindeki item havuzu: title, desc, location, badge, category. */
export function itemSearchPool(item: Item): string {
  return [item.title, item.desc, item.location, item.badge, item.category].join(" ");
}

export function searchEvents(events: readonly LiveEvent[], raw: string): LiveEvent[] {
  return events.filter((ev) => matchSearch(eventSearchPool(ev), raw));
}

export function searchItems(items: readonly Item[], raw: string): Item[] {
  return items.filter((item) => matchSearch(itemSearchPool(item), raw));
}
