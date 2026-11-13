// Mekan genişletilmiş profil, sahiplik (patron yetkisi), menü ve galeri veri katmanı (PostgreSQL & Backend API Entegre)
import type { Item, LiveEvent } from "./types";
import { addNotification } from "./notifications";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: string;
  desc?: string;
}

export interface VenueProfileData {
  itemId: string;
  slug: string;
  title: string;
  category: string;
  badge: string;
  location: string;
  desc: string;
  phone: string;
  wa: string;
  mapUrl: string;
  rating: string;
  photos: string[];
  menu: MenuItem[];
  ownerHandle: string | null;
}

export interface VenueClaimRequest {
  id: string;
  itemId: string;
  venueTitle: string;
  userHandle: string;
  note: string;
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface VenueCustomEvent {
  id: string;
  venueId: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  badge: string;
  desc: string;
  wa: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  OVERRIDES: "sinopcepte_venue_overrides",
  CLAIMS: "sinopcepte_venue_claims",
  OWNERS: "sinopcepte_venue_owners",
  EVENTS: "sinopcepte_venue_events",
} as const;

export const VENUE_UPDATED_EVENT = "sinopcepte:venues-updated";

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(VENUE_UPDATED_EVENT));
  }
}

export function slugifyVenue(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[ğ]/g, "g")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Kaliteli yüksek çözünürlüklü Unsplash görselleri
const DEFAULT_PHOTOS: Record<string, string[]> = {
  social: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1000&q=80",
  ],
  pub: [
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1538488881522-4306c3c97165?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80",
  ],
  burger: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=1000&q=80",
  ],
  cafe: [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1000&q=80",
  ],
};

function getCategoryDefaultPhotos(category: string): string[] {
  const cat = category.toLowerCase();
  if (cat.includes("pub") || cat.includes("bar")) return DEFAULT_PHOTOS.pub;
  if (cat.includes("burger") || cat.includes("yemek")) return DEFAULT_PHOTOS.burger;
  if (cat.includes("kahve") || cat.includes("cafe")) return DEFAULT_PHOTOS.cafe;
  if (cat.includes("social") || cat.includes("lounge")) return DEFAULT_PHOTOS.social;
  return DEFAULT_PHOTOS.default;
}

function getCategoryDefaultMenu(category: string): MenuItem[] {
  return [
    { id: "df-1", category: "Öne Çıkanlar", name: "Günün Özel İkramı / Menüsü", price: "Menüde", desc: "İşletmeye özel taze lezzetler" },
    { id: "df-2", category: "İçecekler", name: "Demleme Çay & Kahve Çeşitleri", price: "Menüde", desc: "Günün her saati sıcak servis" },
  ];
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function canFetch(): boolean {
  return typeof window !== "undefined" && !!window.location?.origin && process.env.NODE_ENV !== "test";
}

async function getCsrfToken(): Promise<string | null> {
  if (!canFetch()) return null;
  const prefix = "XSRF-TOKEN=";
  for (const part of (typeof document !== "undefined" ? document.cookie : "").split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
  }
  try {
    await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" });
    for (const part of document.cookie.split(";")) {
      const c = part.trim();
      if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
    }
  } catch {}
  return null;
}

export function getVenueProfile(item: Item): VenueProfileData {
  const overrides = readStorage<Record<string, Partial<VenueProfileData>>>(STORAGE_KEYS.OVERRIDES, {});
  const owners = readStorage<Record<string, string>>(STORAGE_KEYS.OWNERS, {});
  const itemOverride = overrides[item.id] || {};

  const assignedOwner =
    owners[item.id] !== undefined
      ? owners[item.id]
      : (item as unknown as { ownerHandle?: string }).ownerHandle ?? null;

  const itemPhotos = (item as unknown as { photos?: string[] }).photos;
  const photos = itemOverride.photos?.length
    ? itemOverride.photos
    : itemPhotos?.length
    ? itemPhotos
    : getCategoryDefaultPhotos(item.category);

  const itemMenu = (item as unknown as { menu?: MenuItem[] }).menu;
  const menu = itemOverride.menu?.length
    ? itemOverride.menu
    : itemMenu?.length
    ? itemMenu
    : getCategoryDefaultMenu(item.category);

  const cleanLocation = (itemOverride.location || item.location || "Sinop").replace(/^📍\s*/, "");
  const defaultMap = `https://maps.google.com/?q=${encodeURIComponent("Sinop " + (itemOverride.title || item.title) + " " + cleanLocation)}`;

  return {
    itemId: item.id,
    slug: slugifyVenue(itemOverride.title || item.title),
    title: itemOverride.title || item.title,
    category: itemOverride.category || item.category,
    badge: itemOverride.badge || item.badge,
    location: cleanLocation,
    desc: itemOverride.desc || item.desc || "Sinop şehir rehberinde kayıtlı mekan.",
    phone: itemOverride.phone || item.phone || "",
    wa: itemOverride.wa || item.wa || "",
    mapUrl: itemOverride.mapUrl || item.mapUrl || defaultMap,
    rating: itemOverride.rating || (typeof item.rating === "string" ? item.rating : "4.8"),
    photos,
    menu,
    ownerHandle: assignedOwner,
  };
}

export function getVenueProfileById(idOrSlug: string, items: readonly Item[] = []): VenueProfileData | null {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).toLowerCase().trim();

  // 1. Doğrudan Item ID eşlemesi
  const foundById = items.find((i) => i.id.toLowerCase() === decoded);
  if (foundById) return getVenueProfile(foundById);

  // 2. Slug eşlemesi
  const foundBySlug = items.find((i) => slugifyVenue(i.title) === decoded);
  if (foundBySlug) return getVenueProfile(foundBySlug);

  // 3. Başlık kısmi / tam eşlemesi
  const foundByTitle = items.find((i) => i.title.toLowerCase().trim() === decoded);
  if (foundByTitle) return getVenueProfile(foundByTitle);

  // 4. Overrides içinde ID kontrolü
  const overrides = readStorage<Record<string, Partial<VenueProfileData>>>(STORAGE_KEYS.OVERRIDES, {});
  if (overrides[decoded]) {
    const o = overrides[decoded];
    const syntheticItem: Item = {
      id: decoded,
      category: o.category || "mekan",
      title: o.title || decoded,
      badge: o.badge || "Mekan",
      location: o.location || "Sinop",
      desc: o.desc || "",
      phone: o.phone || "",
      wa: o.wa || "",
      rating: o.rating || "4.8",
      mapUrl: o.mapUrl || "",
    };
    return getVenueProfile(syntheticItem);
  }

  return null;
}

export function saveVenueProfile(profile: Partial<VenueProfileData> & { itemId: string }): void {
  const overrides = readStorage<Record<string, Partial<VenueProfileData>>>(STORAGE_KEYS.OVERRIDES, {});
  overrides[profile.itemId] = {
    ...(overrides[profile.itemId] || {}),
    ...profile,
  };
  writeStorage(STORAGE_KEYS.OVERRIDES, overrides);
  notifyUpdate();

  // Backend'e asenkron gönder
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/venues/${encodeURIComponent(profile.itemId)}`, {
        method: "PUT",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          desc: profile.desc,
          phone: profile.phone,
          wa: profile.wa,
          rating: profile.rating,
          mapUrl: profile.mapUrl,
          photos: profile.photos,
          menu: profile.menu,
        }),
      });
    } catch (e) {
      console.warn("Backend mekan profili güncellenemedi:", e);
    }
  })();
}

export function venueHref(idOrTitle: string, items: readonly Item[] = []): string {
  if (!idOrTitle) return "/";
  const trimmed = idOrTitle.trim().replace(/^📍\s*/, "");

  const foundById = items.find((i) => i.id === trimmed);
  if (foundById) return `/mekan/${foundById.id}`;

  const lower = trimmed.toLowerCase();
  const foundByTitle = items.find(
    (i) => i.title.toLowerCase() === lower || lower.includes(i.title.toLowerCase()) || i.title.toLowerCase().includes(lower)
  );
  if (foundByTitle) return `/mekan/${foundByTitle.id}`;

  return `/mekan/${slugifyVenue(trimmed) || encodeURIComponent(trimmed)}`;
}

export function isVenueOwner(userHandle: string | undefined | null, itemId: string): boolean {
  if (!userHandle) return false;
  const h = userHandle.toLowerCase().replace(/^@/, "").trim();
  if (h === "aykut" || h === "oskibash" || h === "oguzhan" || h === "admin") return true;

  const owners = readStorage<Record<string, string>>(STORAGE_KEYS.OWNERS, {});
  const assigned = owners[itemId] !== undefined ? owners[itemId] : null;

  if (!assigned) return false;
  return assigned.toLowerCase().replace(/^@/, "").trim() === h;
}

export function getOwnedVenues(userHandle: string | undefined | null, items: readonly Item[] = []): VenueProfileData[] {
  if (!userHandle) return [];
  const h = userHandle.toLowerCase().replace(/^@/, "").trim();
  if (!h || h === "aykut" || h === "oskibash" || h === "oguzhan" || h === "admin") return [];

  const results: VenueProfileData[] = [];
  items.forEach((item) => {
    const prof = getVenueProfile(item);
    if (prof.ownerHandle && prof.ownerHandle.toLowerCase().replace(/^@/, "").trim() === h) {
      results.push(prof);
    }
  });
  return results;
}

// ================= SAHİPLİK TALEPLERİ (CLAIMS) ================= //

export function getVenueClaims(): VenueClaimRequest[] {
  return readStorage<VenueClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
}

export function claimVenue(data: {
  itemId: string;
  venueTitle: string;
  userHandle: string;
  note: string;
  phone: string;
}): VenueClaimRequest {
  const claims = getVenueClaims();
  const newClaim: VenueClaimRequest = {
    id: "clm-" + Date.now(),
    itemId: data.itemId,
    venueTitle: data.venueTitle,
    userHandle: data.userHandle.replace(/^@/, "").trim(),
    note: data.note.trim(),
    phone: data.phone.trim(),
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  claims.unshift(newClaim);
  writeStorage(STORAGE_KEYS.CLAIMS, claims);

  addNotification({
    type: "system",
    title: "Mekan Sahipliği Talebin Alındı 🏪",
    message: `${data.venueTitle} için yetki talebin yöneticiye iletildi. İncelenip onaylanacak.`,
    icon: "🏪",
    badge: "Talep",
    actionUrl: "all",
  });

  notifyUpdate();

  // Backend'e ilet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/venues/${encodeURIComponent(data.itemId)}/claims`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ phone: data.phone, note: data.note }),
      });
    } catch (e) {
      console.warn("Backend claim gönderilemedi:", e);
    }
  })();

  return newClaim;
}

export function updateVenueClaim(claimId: string, status: "APPROVED" | "REJECTED"): void {
  const claims = getVenueClaims();
  const target = claims.find((c) => c.id === claimId);
  if (!target) return;

  target.status = status;
  writeStorage(STORAGE_KEYS.CLAIMS, claims);

  if (status === "APPROVED") {
    assignVenueOwner(target.itemId, target.userHandle);
    addNotification({
      type: "match",
      title: "Tebrikler! Mekan Patronu Yetkin Onaylandı 🎉",
      message: `${target.venueTitle} mekanının onaylı sahibi oldun! Artık menü, fotoğraf ve etkinlikleri yönetebilirsin.`,
      icon: "👑",
      badge: "Onaylandı",
      actionUrl: "all",
    });
  }

  notifyUpdate();

  // Backend'e ilet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/admin/venue-claims/${encodeURIComponent(claimId)}/resolve`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ action: status }),
      });
    } catch (e) {
      console.warn("Backend claim güncellenemedi:", e);
    }
  })();
}

export function assignVenueOwner(itemId: string, ownerHandle: string | null): void {
  const owners = readStorage<Record<string, string>>(STORAGE_KEYS.OWNERS, {});
  if (ownerHandle) {
    owners[itemId] = ownerHandle.replace(/^@/, "").trim();
  } else {
    delete owners[itemId];
  }
  writeStorage(STORAGE_KEYS.OWNERS, owners);
  notifyUpdate();

  // Backend'e ilet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/admin/venues/${encodeURIComponent(itemId)}/owner`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ ownerHandle }),
      });
    } catch (e) {
      console.warn("Backend mekan sahibi atanamadı:", e);
    }
  })();
}

// ================= MEKAN ETKİNLİKLERİ ================= //

export function getVenueEvents(venueId?: string): VenueCustomEvent[] {
  const all = readStorage<VenueCustomEvent[]>(STORAGE_KEYS.EVENTS, []);
  if (!venueId) return all;
  return all.filter((e) => e.venueId === venueId);
}

export function createVenueEvent(data: Omit<VenueCustomEvent, "id" | "createdAt">): VenueCustomEvent {
  const events = getVenueEvents();
  const newEv: VenueCustomEvent = {
    id: "vev-" + Date.now(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  events.unshift(newEv);
  writeStorage(STORAGE_KEYS.EVENTS, events);

  addNotification({
    type: "city",
    title: `Yeni Mekan Etkinliği: ${newEv.title} ⚡`,
    message: `${newEv.venue} yeni bir canlı program duyurdu: ${newEv.date}`,
    icon: "⚽",
    badge: "Etkinlik",
    actionUrl: "etkinlik",
  });

  notifyUpdate();

  // Backend'e ilet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/venues/${encodeURIComponent(data.venueId)}/events`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          title: data.title,
          date: data.date,
          badge: data.badge,
          desc: data.desc,
        }),
      });
    } catch (e) {
      console.warn("Backend mekan etkinliği eklenemedi:", e);
    }
  })();

  return newEv;
}

export function deleteVenueEvent(eventId: string): void {
  const events = getVenueEvents();
  const target = events.find((e) => e.id === eventId);
  const next = events.filter((e) => e.id !== eventId);
  writeStorage(STORAGE_KEYS.EVENTS, next);
  notifyUpdate();

  if (target) {
    (async () => {
      if (!canFetch()) return;
      try {
        const token = await getCsrfToken();
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers["X-XSRF-TOKEN"] = token;
        await fetch(`/api/venues/${encodeURIComponent(target.venueId)}/events/${encodeURIComponent(eventId)}`, {
          method: "DELETE",
          credentials: "same-origin",
          headers,
        });
      } catch (e) {
        console.warn("Backend etkinlik silinemedi:", e);
      }
    })();
  }
}

export function toLiveEvent(ve: VenueCustomEvent): LiveEvent {
  return {
    id: ve.id,
    title: ve.title,
    venue: ve.venue,
    location: ve.location,
    date: ve.date,
    badge: ve.badge || "⚡ MEKAN ETKİNLİĞİ",
    desc: ve.desc,
    wa: ve.wa,
  };
}
