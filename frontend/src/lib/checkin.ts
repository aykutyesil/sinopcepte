// SinopCepte Swarm Mantığıyla Check-In Sistemi (PostgreSQL & Backend API Entegre)

export interface CheckInUser {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  note?: string;
  timestamp: number;
}

export interface MayorInfo {
  handle: string;
  displayName: string;
  avatar: string;
  checkInCount: number;
}

export interface VenueCheckInState {
  venueId: string;
  totalVisits: number;
  mayor: MayorInfo;
  activeUsers: CheckInUser[];
}

export interface BackendCheckin {
  id: string;
  itemId: string;
  handle: string;
  displayName: string;
  avatar: string;
  note?: string | null;
  mood?: string | null;
  checkedInAt: string;
}

const STORAGE_KEY = "sinopcepte_swarm_v1";
const MY_CHECKIN_KEY = "sinopcepte_my_active_checkin";

let inMemoryState: Record<string, VenueCheckInState> = {};
let isFetching = false;

export interface MyActiveCheckIn {
  venueId: string;
  venueTitle: string;
  venueName?: string;
  handle?: string;
  note?: string;
  timestamp: number;
}

export function transformBackendCheckins(list: BackendCheckin[]): Record<string, VenueCheckInState> {
  const grouped: Record<string, BackendCheckin[]> = {};
  for (const c of list) {
    if (!grouped[c.itemId]) grouped[c.itemId] = [];
    grouped[c.itemId].push(c);
  }

  const result: Record<string, VenueCheckInState> = {};
  for (const [venueId, items] of Object.entries(grouped)) {
    // Mayor hesapla
    const counts: Record<string, { count: number; displayName: string; avatar: string }> = {};
    for (const it of items) {
      if (!counts[it.handle]) {
        counts[it.handle] = { count: 0, displayName: it.displayName, avatar: it.avatar };
      }
      counts[it.handle].count++;
    }

    let topHandle = "";
    let topCount = 0;
    for (const [h, data] of Object.entries(counts)) {
      if (data.count > topCount) {
        topCount = data.count;
        topHandle = h;
      }
    }

    const mayor: MayorInfo = topHandle
      ? {
          handle: topHandle,
          displayName: counts[topHandle].displayName,
          avatar: counts[topHandle].avatar,
          checkInCount: topCount,
        }
      : {
          handle: "sinoplu",
          displayName: "Sinoplu",
          avatar: "📍",
          checkInCount: 1,
        };

    const activeUsers: CheckInUser[] = items.map((it) => ({
      id: it.id,
      handle: it.handle,
      displayName: it.displayName,
      avatar: it.avatar,
      note: it.note || undefined,
      timestamp: new Date(it.checkedInAt).getTime(),
    }));

    result[venueId] = {
      venueId,
      totalVisits: items.length,
      mayor,
      activeUsers,
    };
  }

  return result;
}

export async function fetchCheckinsFromBackend(): Promise<Record<string, VenueCheckInState>> {
  if (typeof window === "undefined" || !window.location?.origin || process.env.NODE_ENV === "test" || isFetching) {
    return inMemoryState;
  }
  isFetching = true;
  try {
    const res = await fetch("/api/checkins", { cache: "no-store", headers: { Accept: "application/json" } });
    if (res.ok) {
      const data: BackendCheckin[] = await res.json();
      const transformed = transformBackendCheckins(data);
      inMemoryState = transformed;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transformed));
      } catch {}
      window.dispatchEvent(new CustomEvent("sinopcepte:checkins-updated", { detail: transformed }));
      return transformed;
    }
  } catch (err) {
    console.warn("Backend checkin verisi çekilemedi:", err);
  } finally {
    isFetching = false;
  }
  return inMemoryState;
}

export function getCheckInState(): Record<string, VenueCheckInState> {
  if (typeof window === "undefined") return inMemoryState;

  if (Object.keys(inMemoryState).length === 0) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) inMemoryState = JSON.parse(raw);
    } catch {}
    // Arka planda backend'den taze veriyi çek
    fetchCheckinsFromBackend().catch(() => {});
  }
  return inMemoryState;
}

export async function submitCheckInToBackend(
  itemId: string,
  displayName: string,
  avatar: string,
  note?: string,
  mood?: string
): Promise<BackendCheckin | null> {
  try {
    // CSRF token al
    let token: string | null = null;
    const prefix = "XSRF-TOKEN=";
    for (const part of document.cookie.split(";")) {
      const c = part.trim();
      if (c.startsWith(prefix)) {
        token = decodeURIComponent(c.slice(prefix.length));
        break;
      }
    }
    if (!token) {
      await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" });
      for (const part of document.cookie.split(";")) {
        const c = part.trim();
        if (c.startsWith(prefix)) {
          token = decodeURIComponent(c.slice(prefix.length));
          break;
        }
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) headers["X-XSRF-TOKEN"] = token;

    const res = await fetch("/api/checkins", {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({ itemId, displayName, avatar, note, mood }),
    });

    if (res.ok) {
      const saved: BackendCheckin = await res.json();
      await fetchCheckinsFromBackend();
      return saved;
    }
  } catch (e) {
    console.error("Check-in gönderilemedi:", e);
  }
  return null;
}

export function saveCheckInState(data: Record<string, VenueCheckInState>) {
  inMemoryState = data;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Check-in kaydedilemedi:", e);
  }
  window.dispatchEvent(new CustomEvent("sinopcepte:checkins-updated", { detail: data }));
}

export function getMyActiveCheckIn(): MyActiveCheckIn | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MY_CHECKIN_KEY);
    if (!raw) return null;
    const item: MyActiveCheckIn = JSON.parse(raw);
    if (Date.now() - item.timestamp > 3 * 60 * 60 * 1000) {
      clearMyActiveCheckIn();
      return null;
    }
    return item;
  } catch {
    return null;
  }
}

export function setMyActiveCheckIn(item: MyActiveCheckIn) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MY_CHECKIN_KEY, JSON.stringify(item));
}

export function clearMyActiveCheckIn() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MY_CHECKIN_KEY);
}

export function formatTimeAgo(timestamp: number): string {
  const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / (60 * 1000)));
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours} saat önce`;
}
