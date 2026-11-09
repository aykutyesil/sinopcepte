// "Okeye 4. Aranıyor" ve Sosyal Eşleşme Veri Modeli ve İstemci Durum Yönetimi

export type LobbyCategory = "okey" | "sohbet" | "mac" | "muzik" | "oyun" | "diger";

export interface LobbyUser {
  handle: string;
  name: string;
  avatar: string;
  phone?: string;
  wa?: string;
}

export interface LobbyRequest {
  id: string;
  user: LobbyUser;
  note: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Lobby {
  id: string;
  category: LobbyCategory;
  title: string;
  venue: string;
  locationDetails?: string;
  host: LobbyUser;
  neededCount: number;
  currentCount: number;
  totalCount: number;
  note: string;
  createdAt: string;
  expiresInMinutes: number;
  status: "open" | "filled" | "expired";
  requests: LobbyRequest[];
}

export const CATEGORY_INFO: Record<
  LobbyCategory,
  { label: string; icon: string; badgeClass: string; borderClass: string }
> = {
  okey: {
    label: "Okey & 101 / Tavla",
    icon: "🀄",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    borderClass: "border-amber-500/30",
  },
  sohbet: {
    label: "Kahve & Muhabbet",
    icon: "☕",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    borderClass: "border-emerald-500/30",
  },
  mac: {
    label: "Maç & Derbi İzleme",
    icon: "⚽",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    borderClass: "border-blue-500/30",
  },
  muzik: {
    label: "Konser & Canlı Müzik",
    icon: "🎸",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    borderClass: "border-purple-500/30",
  },
  oyun: {
    label: "PlayStation & Kutu Oyunu",
    icon: "🎮",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    borderClass: "border-rose-500/30",
  },
  diger: {
    label: "Diğer Sosyal Etkinlik",
    icon: "✨",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    borderClass: "border-cyan-500/30",
  },
};

const STORAGE_KEY = "sinopcepte_okeye4_lobbies_v1";
const MY_REQUESTS_KEY = "sinopcepte_okeye4_my_requests_v1";

/** Sinop için gerçekçi varsayılan canlı masalar */
export const INITIAL_LOBBIES: Lobby[] = [
  {
    id: "lobby-1",
    category: "okey",
    title: "101 Okey'e Acil 4. Lazım!",
    venue: "Mathiday's Social Club",
    locationDetails: "Alt kat sigara içilen alan, 7 no'lu masa",
    host: {
      handle: "serhat_snk",
      name: "Serhat K.",
      avatar: "👨‍🦱",
      phone: "0532 578 11 22",
      wa: "905325781122",
    },
    neededCount: 1,
    currentCount: 3,
    totalCount: 4,
    note: "3 kişiyiz, arkadaş son anda ekti. 101 bilen biri gelsin çaylar kaybedenden!",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    expiresInMinutes: 90,
    status: "open",
    requests: [
      {
        id: "req-101",
        user: {
          handle: "ahmet_57",
          name: "Ahmet",
          avatar: "😎",
          phone: "0544 579 22 33",
          wa: "905445792233",
        },
        note: "5 dakikaya gelirim kordondayım, taş çalmam garantili!",
        createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        status: "pending",
      },
    ],
  },
  {
    id: "lobby-2",
    category: "mac",
    title: "Derbiyi Dev Ekranda İzleyecek Masa Arkadaşı",
    venue: "Nihavent Pub & Bistro",
    locationDetails: "Orta salon projeksiyon karşısı",
    host: {
      handle: "deniz_57",
      name: "Deniz Y.",
      avatar: "🎸",
      phone: "0542 570 65 43",
      wa: "905425706543",
    },
    neededCount: 2,
    currentCount: 2,
    totalCount: 4,
    note: "4 kişilik masa ayırttık, 2 arkadaş gelemedi. Maç izleyip muhabbet edecekleri bekleriz.",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    expiresInMinutes: 120,
    status: "open",
    requests: [],
  },
  {
    id: "lobby-3",
    category: "sohbet",
    title: "Kordon'da Deniz Kenarı Kahve & Muhabbet",
    venue: "Porta Marina Coffee",
    locationDetails: "Dış teras deniz gören taraf",
    host: {
      handle: "zeynep_snu",
      name: "Zeynep (SNÜ)",
      avatar: "👩‍🎓",
      phone: "0533 571 33 44",
      wa: "905335713344",
    },
    neededCount: 1,
    currentCount: 1,
    totalCount: 2,
    note: "Vize haftası bitti kafa dağıtmaya çıktım. Kitap, dizi, kampüs sohbeti yapacak arkadaş arıyorum.",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    expiresInMinutes: 60,
    status: "open",
    requests: [],
  },
  {
    id: "lobby-4",
    category: "muzik",
    title: "Akustik Canlı Müzik Gecesi Masa Birleştirme",
    venue: "Cem's Burger & Lounge",
    locationDetails: "Sahne yanı 3 no'lu köşe masa",
    host: {
      handle: "kaan_rock",
      name: "Kaan M.",
      avatar: "🎧",
      phone: "0555 572 33 22",
      wa: "905555723322",
    },
    neededCount: 2,
    currentCount: 2,
    totalCount: 4,
    note: "Canlı performans 21:30'da başlıyor. Enerjik müziksever arkadaşları masamıza bekleriz!",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    expiresInMinutes: 150,
    status: "open",
    requests: [
      {
        id: "req-102",
        user: {
          handle: "merve_art",
          name: "Merve",
          avatar: "🎨",
          phone: "0530 573 11 22",
          wa: "905305731122",
        },
        note: "Biz de 2 kız arkadaş gelmeyi düşünüyorduk, masayı birleştirelim mi?",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: "accepted",
      },
    ],
  },
];

export function getLobbies(): Lobby[] {
  if (typeof window === "undefined") return INITIAL_LOBBIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOBBIES));
      return INITIAL_LOBBIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LOBBIES;
  } catch {
    return INITIAL_LOBBIES;
  }
}

export function saveLobbies(lobbies: Lobby[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lobbies));
  } catch {
    // quota exceeded vs.
  }
}

export function createLobby(lobby: Omit<Lobby, "id" | "createdAt" | "status" | "requests">): Lobby {
  const lobbies = getLobbies();
  const newLobby: Lobby = {
    ...lobby,
    id: "lobby-" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "open",
    requests: [],
  };
  const updated = [newLobby, ...lobbies];
  saveLobbies(updated);
  return newLobby;
}

export function applyToLobby(
  lobbyId: string,
  applicant: LobbyUser,
  note: string,
): { success: boolean; error?: string } {
  const lobbies = getLobbies();
  const target = lobbies.find((l) => l.id === lobbyId);
  if (!target) return { success: false, error: "İlan bulunamadı" };
  if (target.status !== "open") return { success: false, error: "Masa artık açık değil" };

  // Daha önce talep gönderilmiş mi?
  const existing = target.requests.find((r) => r.user.handle === applicant.handle);
  if (existing) return { success: false, error: "Bu ilana zaten başvurdun!" };

  const newReq: LobbyRequest = {
    id: "req-" + Date.now(),
    user: applicant,
    note: note.trim() || "Masaya katılmak istiyorum!",
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  target.requests.unshift(newReq);
  saveLobbies(lobbies);

  // Kendi başvurularımıza da kaydedelim
  saveMyRequest(lobbyId, newReq.id);

  return { success: true };
}

export function respondToRequest(
  lobbyId: string,
  requestId: string,
  accept: boolean,
): { success: boolean; error?: string; lobby?: Lobby } {
  const lobbies = getLobbies();
  const lobby = lobbies.find((l) => l.id === lobbyId);
  if (!lobby) return { success: false, error: "İlan bulunamadı" };

  const req = lobby.requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: "Talep bulunamadı" };

  if (accept) {
    req.status = "accepted";
    // Masadaki kişi sayısını güncelle
    if (lobby.neededCount > 0) {
      lobby.neededCount -= 1;
      lobby.currentCount += 1;
    }
    if (lobby.neededCount <= 0) {
      lobby.status = "filled";
    }
  } else {
    req.status = "rejected";
  }

  saveLobbies(lobbies);
  return { success: true, lobby };
}

function saveMyRequest(lobbyId: string, reqId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MY_REQUESTS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[lobbyId] = reqId;
    localStorage.setItem(MY_REQUESTS_KEY, JSON.stringify(map));
  } catch {}
}

export function getMyRequestId(lobbyId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MY_REQUESTS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[lobbyId] || null;
  } catch {
    return null;
  }
}

export function formatTimeRemaining(createdAtIso: string, durationMinutes: number): {
  text: string;
  isUrgent: boolean;
  isExpired: boolean;
} {
  const created = new Date(createdAtIso).getTime();
  const expiresAt = created + durationMinutes * 60 * 1000;
  const diffMs = expiresAt - Date.now();

  if (diffMs <= 0) {
    return { text: "Süre Doldu", isUrgent: false, isExpired: true };
  }

  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) {
    return {
      text: `Son ${mins} dk`,
      isUrgent: mins <= 20,
      isExpired: false,
    };
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return {
    text: `${hours} sa ${remMins > 0 ? remMins + " dk" : ""}`,
    isUrgent: false,
    isExpired: false,
  };
}
