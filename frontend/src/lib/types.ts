// API sözleşmesindeki şekiller (backend seed JSON ile birebir alan adları).

export type ItemCategory = "mekan" | "tekel" | "taksi" | "eczane" | "cicek";

/** Sol menüdeki filtreler: `all` + `okeye4` + `itiraf` + `etkinlik` + `ilan` + `kesfet` + item kategorileri. */
export type FeedFilter = "all" | "okeye4" | "itiraf" | "etkinlik" | "ilan" | "kesfet" | ItemCategory;

export const FEED_FILTERS: readonly FeedFilter[] = [
  "all",
  "okeye4",
  "itiraf",
  "etkinlik",
  "ilan",
  "kesfet",
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

/** `GET /api/auth/me` (`Me`). N7 öncesi backend yalnız `{username, roles}` döndürdüğü için `handle`/`avatar` isteğe bağlı. */
export interface AuthUser {
  /** Geriye dönük uyum: N7'den sonra `handle` ile aynı. */
  username: string;
  roles: string[];
  handle?: string;
  avatar?: string;
  phone?: string | null;
}

export type CheckinVisibility = "PUBLIC" | "HIDDEN";

/** `GET/PUT /api/me/profile`. */
export interface OwnProfile {
  handle: string;
  /** N7 öncesi admin satırında boş olabilir. */
  email: string | null;
  avatar: string;
  bio: string | null;
  instagram: string | null;
  checkinVisibility: CheckinVisibility;
  anonymousMode: boolean;
  createdAt: string;
  roles: string[];
}

/** `PUT /api/me/profile` gövdesi (5 alanın hepsi gönderilir). */
export interface ProfileUpdate {
  avatar: string;
  bio: string;
  instagram: string;
  checkinVisibility: CheckinVisibility;
  anonymousMode: boolean;
}

/** `GET /api/users/{handle}`. Asla e-posta, rol veya gizlilik ayarı içermez. Rozet şekli N8'de belirlenecek. */
export interface PublicProfile {
  handle: string;
  avatar: string;
  bio: string | null;
  instagram: string | null;
  createdAt: string;
  badges: unknown[];
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
