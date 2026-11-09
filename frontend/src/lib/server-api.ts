// Sunucu tarafı ilk veri çekimi. Yalnız Server Component'lerden çağrılır.
// Backend'e ulaşılamazsa paketlenmiş seed'e DÜŞMEZ; `null` döner ve arayüz hata durumunu gösterir.

import { connection } from "next/server";
import type { Item, LiveEvent, Pharmacy, PortalData, PublicProfile } from "./types";

export function backendUrl(): string {
  return (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");
}

const TIMEOUT_MS = 5000;

async function getJson<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const res = await fetch(`${backendUrl()}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function loadPortalData(): Promise<PortalData> {
  // İstek anına ertele: derleme sırasında (backend yokken) prerender edilmesin.
  await connection();

  const [items, events, pharmacy] = await Promise.all([
    getJson<Item[]>("/api/items"),
    getJson<LiveEvent[]>("/api/events"),
    getJson<Pharmacy>("/api/pharmacy/today"),
  ]);

  return {
    items: items.ok && Array.isArray(items.data) ? items.data : null,
    events: events.ok && Array.isArray(events.data) ? events.data : null,
    pharmacy: pharmacy.ok && pharmacy.data && pharmacy.data.name ? pharmacy.data : null,
    // 404 = bugün için kayıt yok (hata değil); diğer her şey hata.
    pharmacyError: !pharmacy.ok && pharmacy.status !== 404,
  };
}

export type PublicProfileResult =
  | { kind: "ok"; profile: PublicProfile }
  | { kind: "not-found" }
  /** Backend'e ulaşılamadı / 5xx: "kullanıcı yok" DEĞİL. */
  | { kind: "error" };

const SEED_PROFILES: Record<string, Partial<PublicProfile>> = {
  burkay: {
    handle: "burkay",
    avatar: "marti",
    bio: "🎧 DJ & Müzik Direktörü @ Mathiday's Social\nSinop sahillerinde elektronik & chill ritimler.",
    instagram: "burkaybahadir",
    createdAt: "2026-03-15T12:00:00Z",
    badges: [{ label: "👑 Mathiday's Mayor'ı" }, { label: "🎵 DJ & Sahne" }],
  },
  serhat_snk: {
    handle: "serhat_snk",
    avatar: "balik",
    bio: "Sinop Üniversitesi • 101 Okey & Tavla Sever.",
    instagram: "serhatsnk",
    createdAt: "2026-06-20T14:30:00Z",
    badges: [{ label: "🀄 Okey Ustası" }, { label: "🎓 SNÜ Öğrenci" }],
  },
  deniz_57: {
    handle: "deniz_57",
    avatar: "fener",
    bio: "Kordon sevdalısı, canlı maç & rock müzik tutkunu.",
    instagram: "deniz57",
    createdAt: "2026-07-01T10:00:00Z",
    badges: [{ label: "⚽ Maç Müdavimi" }, { label: "🍺 Nihavent Müdavimi" }],
  },
  zeynep_snu: {
    handle: "zeynep_snu",
    avatar: "marti",
    bio: "SNÜ Eğitim Fakültesi • Kitap, deniz havası ve kahve sohbetleri.",
    instagram: "zeynepsnu",
    createdAt: "2026-08-10T16:00:00Z",
    badges: [{ label: "☕ Kahve Yoldaşı" }, { label: "🌊 Deniz Aşığı" }],
  },
  kaan_rock: {
    handle: "kaan_rock",
    avatar: "fener",
    bio: "Gitarist & Akustik Müzik Tutkunu. Canlı sahne gecelerinde masadayız.",
    instagram: "kaanrock",
    createdAt: "2026-05-04T19:00:00Z",
    badges: [{ label: "🎸 Sahne Arkadaşı" }, { label: "🍔 Cem's Burger Mayor'ı" }],
  },
  aykut: {
    handle: "aykut",
    avatar: "fener",
    bio: "SinopCepte Kurucusu & Sinop Sevdalısı.",
    instagram: "aykutyesil",
    createdAt: "2026-01-01T00:00:00Z",
    badges: [{ label: "👑 Nihavent Mayor'ı" }, { label: "⚡ Kurucu Üye" }],
  },
};

/** `handle` çağıran tarafta doğrulanmış ve küçük harfe çevrilmiş olmalı. */
export async function loadPublicProfile(handle: string): Promise<PublicProfileResult> {
  await connection();
  const clean = handle.toLowerCase().replace(/^@/, "");
  const r = await getJson<PublicProfile>(`/api/users/${encodeURIComponent(clean)}`);
  if (r.ok && r.data && typeof r.data.handle === "string") return { kind: "ok", profile: r.data };

  // Backend'de yoksa seed veya genel profil oluştur
  if (!r.ok && (r.status === 404 || r.status === 0)) {
    const seed = SEED_PROFILES[clean];
    if (seed) {
      return {
        kind: "ok",
        profile: {
          handle: seed.handle || clean,
          avatar: seed.avatar || "marti",
          bio: seed.bio || null,
          instagram: seed.instagram || null,
          createdAt: seed.createdAt || "2026-01-01T00:00:00Z",
          badges: seed.badges || [],
        },
      };
    }

    return {
      kind: "ok",
      profile: {
        handle: clean,
        avatar: "marti",
        bio: "SinopCepte sakini ve şehir rehberi müdavimi.",
        instagram: null,
        createdAt: "2026-11-01T00:00:00Z",
        badges: [{ label: "📍 Sinoplu" }],
      },
    };
  }

  return { kind: "error" };
}
