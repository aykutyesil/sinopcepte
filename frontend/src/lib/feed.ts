// Akış kurma mantığı: legacy `renderFeedStream` (624), `filterFeed` (734), `handleSearch` (771).

import { searchEvents, searchItems } from "./search";
import type { FeedFilter, Item, LiveEvent } from "./types";

export interface FeedInput {
  events: readonly LiveEvent[];
  items: readonly Item[];
  filter: FeedFilter;
  query: string;
}

export interface FeedResult {
  events: LiveEvent[];
  items: Item[];
}

/**
 * - Arama (kırpılmış sorgu boş değilse): legacy gibi filtreyi YOK SAYAR; tüm etkinlik ve
 *   tüm item'lar içinde arar (`renderFeedStream(filteredEvents, filteredItems)`).
 * - Aksi halde: etkinlikler yalnız `all`/`etkinlik` için; item'lar `all` ise hepsi, değilse
 *   kategoriye eşit olanlar. Sıra: önce etkinlikler, sonra item'lar (sunucu sırası korunur).
 */
export function buildFeed({ events, items, filter, query }: FeedInput): FeedResult {
  const raw = (query || "").trim();
  if (raw) {
    return { events: searchEvents(events, raw), items: searchItems(items, raw) };
  }
  return {
    events: filter === "all" || filter === "etkinlik" ? [...events] : [],
    items: filter === "all" ? [...items] : items.filter((i) => i.category === filter),
  };
}

export interface PrimaryAction {
  text: string;
  href: string;
  target: "_blank" | "_self";
}

const DEFAULT_PHARMACY_MAP = "https://www.google.com/maps?daddr=42.0032747,35.0787668";

/** Legacy item kartı (677-694, 712): kategoriye göre birincil düğme metni, bağlantısı ve hedefi. */
export function itemPrimaryAction(item: Item): PrimaryAction {
  const isEczane = item.category === "eczane";
  const isPhonePrimary = item.category === "taksi";

  let text = "WhatsApp İletişim";
  let href = `https://wa.me/${item.wa}?text=${encodeURIComponent(
    item.title + " hakkında bilgi almak istiyorum",
  )}`;

  if (isEczane) {
    text = "📍 Haritada Yol Tarifi Al";
    href = item.mapUrl || DEFAULT_PHARMACY_MAP;
  } else if (item.category === "taksi") {
    text = "🚖 Durağı Ara";
    href = `tel:${item.phone}`;
  } else if (item.category === "tekel") {
    text = "🛵 Gece Sipariş Ver";
  } else if (item.category === "cicek") {
    text = "💐 Çiçek Siparişi";
  }

  const target = isEczane ? "_blank" : isPhonePrimary ? "_self" : "_blank";
  return { text, href, target };
}

/** Legacy etkinlik kartı "Masa Ayırt" bağlantısı (665). */
export function eventReserveHref(ev: LiveEvent): string {
  return `https://wa.me/${ev.wa}?text=${encodeURIComponent(
    ev.venue + " mekanındaki " + ev.title + " için yer ayırtmak istiyorum",
  )}`;
}

/** Sağ kolon kurye satırı bağlantısı (legacy 300: `?text=Sipariş%20vermek%20istiyorum`). */
export function courierOrderHref(item: Item): string {
  return `https://wa.me/${item.wa}?text=${encodeURIComponent("Sipariş vermek istiyorum")}`;
}

/** Legacy `item.rating || '4.8'`. */
export function displayRating(item: Item): string {
  return item.rating ? String(item.rating) : "4.8";
}

/**
 * Sağ kolondaki elle yazılmış biçim: "03682611010" -> "0368 261 10 10" (4-3-2-2).
 * 11 haneli ve 0 ile başlamayan değerler olduğu gibi döner.
 */
export function formatPhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  return phone;
}
