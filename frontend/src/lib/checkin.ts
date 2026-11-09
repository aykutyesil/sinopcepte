// SinopCepte Swarm Mantığıyla Check-In Sistemi

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

// Başlangıç Sinop Mekanları Swarm Verisi
export const INITIAL_CHECKINS: Record<string, VenueCheckInState> = {
  "m-1": { // Mathiday's Social
    venueId: "m-1",
    totalVisits: 142,
    mayor: {
      handle: "burkay",
      displayName: "Burkay Bahadır",
      avatar: "🎧",
      checkInCount: 19,
    },
    activeUsers: [
      { id: "u-1", handle: "deniz_sn", displayName: "Deniz", avatar: "🌊", note: "Liman terasta kahve keyfi", timestamp: Date.now() - 15 * 60 * 1000 },
      { id: "u-2", handle: "gamze99", displayName: "Gamze", avatar: "✨", note: "DJ setini bekliyoruz", timestamp: Date.now() - 34 * 60 * 1000 },
      { id: "u-3", handle: "mert_k", displayName: "Mert", avatar: "🎸", note: "Kokteyller harika", timestamp: Date.now() - 52 * 60 * 1000 },
      { id: "u-4", handle: "selin_a", displayName: "Selin", avatar: "☕", timestamp: Date.now() - 70 * 60 * 1000 },
    ],
  },
  "m-2": { // Nihavent Restaurant Pub
    venueId: "m-2",
    totalVisits: 285,
    mayor: {
      handle: "aykut",
      displayName: "Aykut Yeşil",
      avatar: "👑",
      checkInCount: 24,
    },
    activeUsers: [
      { id: "u-5", handle: "aykut", displayName: "Aykut", avatar: "👑", note: "Galatasaray maçını dev ekranda izliyoruz!", timestamp: Date.now() - 20 * 60 * 1000 },
      { id: "u-6", handle: "can_s", displayName: "Can", avatar: "⚽", note: "Pub tabağı söyledik", timestamp: Date.now() - 40 * 60 * 1000 },
      { id: "u-7", handle: "onur_57", displayName: "Onur", avatar: "🍺", note: "Fıçı bira soğuk", timestamp: Date.now() - 55 * 60 * 1000 },
      { id: "u-8", handle: "tolga_sn", displayName: "Tolga", avatar: "🎯", timestamp: Date.now() - 80 * 60 * 1000 },
      { id: "u-9", handle: "irem_y", displayName: "İrem", avatar: "🍕", timestamp: Date.now() - 95 * 60 * 1000 },
    ],
  },
  "m-3": { // Cem's Burger
    venueId: "m-3",
    totalVisits: 98,
    mayor: {
      handle: "eren_k",
      displayName: "Eren Kaya",
      avatar: "🍔",
      checkInCount: 14,
    },
    activeUsers: [
      { id: "u-10", handle: "eren_k", displayName: "Eren", avatar: "🍔", note: "Trüflü burger efsane", timestamp: Date.now() - 25 * 60 * 1000 },
      { id: "u-11", handle: "berke_m", displayName: "Berke", avatar: "🍟", timestamp: Date.now() - 45 * 60 * 1000 },
      { id: "u-12", handle: "esra_s", displayName: "Esra", avatar: "🥤", note: "Ders çıkışı yemek molası", timestamp: Date.now() - 60 * 60 * 1000 },
    ],
  },
  "m-4": { // Porta Marina
    venueId: "m-4",
    totalVisits: 176,
    mayor: {
      handle: "melis_t",
      displayName: "Melis Tan",
      avatar: "⛵",
      checkInCount: 16,
    },
    activeUsers: [
      { id: "u-13", handle: "melis_t", displayName: "Melis", avatar: "⛵", note: "Marina gün batımı", timestamp: Date.now() - 30 * 60 * 1000 },
      { id: "u-14", handle: "kerem_57", displayName: "Kerem", avatar: "🍷", timestamp: Date.now() - 65 * 60 * 1000 },
    ],
  },
};

const STORAGE_KEY = "sinopcepte_swarm_v1";
const MY_CHECKIN_KEY = "sinopcepte_my_active_checkin";

export interface MyActiveCheckIn {
  venueId: string;
  venueTitle: string;
  note?: string;
  timestamp: number;
}

export function getCheckInState(): Record<string, VenueCheckInState> {
  if (typeof window === "undefined") return INITIAL_CHECKINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHECKINS));
      return INITIAL_CHECKINS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHECKINS;
  }
}

export function saveCheckInState(data: Record<string, VenueCheckInState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Check-in kaydedilemedi:", e);
  }
}

export function getMyActiveCheckIn(): MyActiveCheckIn | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MY_CHECKIN_KEY);
    if (!raw) return null;
    const item: MyActiveCheckIn = JSON.parse(raw);
    // 3 saatten eskiyse düşür
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
