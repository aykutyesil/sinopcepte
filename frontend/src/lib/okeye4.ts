// "Okeye 4. Aranıyor" ve Sosyal Eşleşme Veri Modeli (PostgreSQL & Backend API Entegre)

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

let inMemoryLobbies: Lobby[] = [];
let isFetchingLobbies = false;

interface BackendLobbyItem {
  lobby: {
    id: string;
    category: string;
    title: string;
    venue: string;
    district: string;
    currentPlayers: number;
    maxPlayers: number;
    startTime: string;
    expiresIn: string;
    hostHandle: string;
    hostName: string;
    hostAvatar: string;
    hostTrustScore: number;
    hostBadge: string;
    hostPhone?: string;
    hostWa?: string;
    note?: string;
    status: string;
    createdAt: string;
  };
  requests: Array<{
    id: string;
    lobbyId: string;
    applicantHandle: string;
    applicantName: string;
    applicantAvatar: string;
    applicantTrustScore: number;
    applicantPhone?: string;
    note?: string;
    status: string;
    createdAt: string;
  }>;
}

export function transformBackendLobbies(items: BackendLobbyItem[]): Lobby[] {
  return items.map((item) => {
    const l = item.lobby;
    const cat = (CATEGORY_INFO[l.category as LobbyCategory] ? l.category : "okey") as LobbyCategory;
    const st = l.status.toLowerCase();
    const status: "open" | "filled" | "expired" =
      st === "open" ? "open" : st === "full" || st === "filled" ? "filled" : "expired";

    const requests: LobbyRequest[] = (item.requests || []).map((r) => ({
      id: r.id,
      user: {
        handle: r.applicantHandle,
        name: r.applicantName,
        avatar: r.applicantAvatar,
        phone: r.applicantPhone,
      },
      note: r.note || "Masaya katılmak istiyorum!",
      createdAt: r.createdAt,
      status: r.status.toLowerCase() === "approved" ? "accepted" : r.status.toLowerCase() === "rejected" ? "rejected" : "pending",
    }));

    return {
      id: l.id,
      category: cat,
      title: l.title,
      venue: l.venue,
      locationDetails: l.district,
      host: {
        handle: l.hostHandle,
        name: l.hostName,
        avatar: l.hostAvatar,
        phone: l.hostPhone,
        wa: l.hostWa,
      },
      neededCount: Math.max(0, l.maxPlayers - l.currentPlayers),
      currentCount: l.currentPlayers,
      totalCount: l.maxPlayers,
      note: l.note || "",
      createdAt: l.createdAt,
      expiresInMinutes: 120,
      status,
      requests,
    };
  });
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

export async function fetchLobbiesFromBackend(): Promise<Lobby[]> {
  if (!canFetch() || isFetchingLobbies) return inMemoryLobbies;
  isFetchingLobbies = true;
  try {
    const res = await fetch("/api/okeye4/lobbies", { cache: "no-store", headers: { Accept: "application/json" } });
    if (res.ok) {
      const data: BackendLobbyItem[] = await res.json();
      const transformed = transformBackendLobbies(data);
      inMemoryLobbies = transformed;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transformed));
      } catch {}
      window.dispatchEvent(new CustomEvent("sinopcepte:okeye4-updated", { detail: transformed }));
      return transformed;
    }
  } catch (err) {
    console.warn("Backend lobileri çekilemedi:", err);
  } finally {
    isFetchingLobbies = false;
  }
  return inMemoryLobbies;
}

export function getLobbies(): Lobby[] {
  if (typeof window === "undefined") return inMemoryLobbies;
  if (inMemoryLobbies.length === 0) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) inMemoryLobbies = JSON.parse(raw);
    } catch {}
    fetchLobbiesFromBackend().catch(() => {});
  }
  return inMemoryLobbies;
}

export function saveLobbies(lobbies: Lobby[]): void {
  inMemoryLobbies = lobbies;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lobbies));
  } catch (e) {
    console.error("Lobbies kaydedilemedi:", e);
  }
  window.dispatchEvent(new CustomEvent("sinopcepte:okeye4-updated", { detail: lobbies }));
}

export function createLobby(lobby: Omit<Lobby, "id" | "createdAt" | "status" | "requests">): Lobby {
  const lobbies = getLobbies();
  const tempId = "lobby-" + Date.now();
  const newLobby: Lobby = {
    ...lobby,
    id: tempId,
    createdAt: new Date().toISOString(),
    status: "open",
    requests: [],
  };
  const updated = [newLobby, ...lobbies];
  saveLobbies(updated);

  // Backend'e asenkron kaydet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch("/api/okeye4/lobbies", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          category: lobby.category,
          title: lobby.title,
          venue: lobby.venue,
          district: lobby.locationDetails || "Merkez",
          maxPlayers: lobby.totalCount,
          startTime: "19:30",
          expiresIn: "2 saat sonra",
          hostPhone: lobby.host.phone,
          hostWa: lobby.host.wa,
          note: lobby.note,
        }),
      });
      await fetchLobbiesFromBackend();
    } catch (err) {
      console.warn("Backend lobby oluşturulamadı:", err);
    }
  })();

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
  saveMyRequest(lobbyId, newReq.id);

  // Backend'e asenkron ilet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/okeye4/lobbies/${encodeURIComponent(lobbyId)}/apply`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          phone: applicant.phone,
          note: newReq.note,
        }),
      });
      await fetchLobbiesFromBackend();
    } catch (e) {
      console.warn("Backend başvuru iletilemedi:", e);
    }
  })();

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

  // Backend'e asenkron ilet
  (async () => {
    if (!canFetch()) return;
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers["X-XSRF-TOKEN"] = token;
      await fetch(`/api/okeye4/lobbies/${encodeURIComponent(lobbyId)}/requests/${encodeURIComponent(requestId)}`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ action: accept ? "APPROVE" : "REJECT" }),
      });
      await fetchLobbiesFromBackend();
    } catch (e) {
      console.warn("Backend başvuru yanıtı iletilemedi:", e);
    }
  })();

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
