export interface TaxiLobbyMember {
  id: number;
  lobbyId: string;
  userHandle: string;
  userName: string;
  userAvatar: string;
  userPhone?: string | null;
  joinedAt: string;
}

export interface TaxiLobby {
  id: string;
  hostHandle: string;
  hostName: string;
  hostAvatar: string;
  hostPhone?: string | null;
  destination: string;
  departurePoint: string;
  departureTime: string;
  totalSeats: number;
  occupiedSeats: number;
  estimatedFare?: string | null;
  note?: string | null;
  status: "OPEN" | "FULL" | "COMPLETED" | string;
  createdAt: string;
  members: TaxiLobbyMember[];
  joinedByMe: boolean;
  isHost: boolean;
}

export interface CreateTaxiLobbyPayload {
  destination: string;
  departurePoint: string;
  departureTime: string;
  totalSeats?: number;
  estimatedFare?: string;
  note?: string;
  phone?: string;
}

export const TAXI_POPULAR_DESTINATIONS = [
  "Sinop Havalimanı (SNU)",
  "Sinop Otogarı",
  "SNÜ Merkez Kampüs (Bostancı)",
  "SNÜ KYK Seyyid Bilal / Mahmut Kefevi Yurtları",
  "Hamsilos Tabiat Parkı & Akliman",
  "Ayancık / Gerze / Boyabat Yolu",
  "Tarihi Cezaevi & Ada Burnu",
];

export const TAXI_POPULAR_DEPARTURES = [
  "Sinop Valilik Önü / Meydan",
  "İskele Meydanı Taksi Durağı",
  "Barış Manço Parkı / Aşıklar Caddesi",
  "SNÜ Merkez Kampüs (KYK Önü)",
  "Sinop Otogarı (Geliş Peronu)",
  "Sinop Havalimanı (SNU) Çıkışı",
  "Ada Mahallesi / Karakum",
];

export async function fetchTaxiLobbies(params?: {
  destination?: string;
  status?: string;
}): Promise<TaxiLobby[]> {
  const query = new URLSearchParams();
  if (params?.destination && params.destination !== "all") {
    query.set("destination", params.destination);
  }
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }

  const res = await fetch(`/api/taxi/lobbies?${query.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Taksi lobileri alınamadı: ${res.status}`);
  }

  return (await res.json()) as TaxiLobby[];
}

export async function createTaxiLobby(payload: CreateTaxiLobbyPayload): Promise<TaxiLobby> {
  const res = await fetch("/api/taxi/lobbies", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Taksi lobisi oluşturulamadı");
  }

  return (await res.json()) as TaxiLobby;
}

export async function joinTaxiLobby(lobbyId: string, phone?: string): Promise<TaxiLobby> {
  const res = await fetch(`/api/taxi/lobbies/${lobbyId}/join`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ phone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lobiye katılma başarısız oldu");
  }

  return (await res.json()) as TaxiLobby;
}

export async function leaveTaxiLobby(lobbyId: string): Promise<TaxiLobby> {
  const res = await fetch(`/api/taxi/lobbies/${lobbyId}/leave`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lobiden çıkış başarısız oldu");
  }

  return (await res.json()) as TaxiLobby;
}

export async function cancelTaxiLobby(lobbyId: string): Promise<void> {
  const res = await fetch(`/api/taxi/lobbies/${lobbyId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Lobi iptal edilemedi");
  }
}
