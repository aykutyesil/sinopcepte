// Sunucu tarafı ilk veri çekimi. Yalnız Server Component'lerden çağrılır.
// Backend'e ulaşılamazsa paketlenmiş seed'e DÜŞMEZ; `null` döner ve arayüz hata durumunu gösterir.

import { connection } from "next/server";
import type { Item, LiveEvent, Pharmacy, PortalData } from "./types";

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
