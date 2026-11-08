// API sözleşmesindeki şekiller (backend seed JSON ile birebir alan adları).

export type ItemCategory = "mekan" | "tekel" | "taksi" | "eczane" | "cicek";

/** Sol menüdeki filtreler: `all` + `etkinlik` + item kategorileri. */
export type FeedFilter = "all" | "etkinlik" | ItemCategory;

export const FEED_FILTERS: readonly FeedFilter[] = [
  "all",
  "etkinlik",
  "mekan",
  "taksi",
  "tekel",
  "eczane",
  "cicek",
];

export interface Item {
  id: string;
  /** Backend kategori doğrular; istemci bilinmeyen kategoriyi de gösterebilsin diye string. */
  category: ItemCategory | string;
  title: string;
  badge: string;
  location: string;
  desc: string;
  phone: string;
  wa: string;
  rating?: string | number | null;
  mapUrl?: string | null;
}

export interface LiveEvent {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  badge: string;
  desc: string;
  wa: string;
}

export interface Pharmacy {
  name: string;
  address: string;
  phone: string;
  phoneFormatted: string;
  mapUrl: string;
  lat: number | string;
  lng: number | string;
  updatedAt: string;
}

export interface AuthUser {
  username: string;
  roles: string[];
}

/** Sunucuda çekilen ilk veri. `null` = backend'e ulaşılamadı / hata. */
export interface PortalData {
  items: Item[] | null;
  events: LiveEvent[] | null;
  /** `null` = bugün için kayıt yok (404) veya hata; ayrımı `pharmacyError` verir. */
  pharmacy: Pharmacy | null;
  pharmacyError: boolean;
}

/** Arayüzdeki yükleme durumu: iskelet, dolu, kayıt yok (404), hata. */
export type LoadState = "loading" | "ok" | "none" | "error";
