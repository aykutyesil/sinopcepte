// Şehir içi dolmuş saatleri: GET /api/dolmus (backend, İstanbul saatiyle "sıradaki 3 sefer" hesaplar).

export interface DolmusPoint {
  from: string;
  days: "all" | "weekday" | "weekend" | string;
  firstDeparture: string;
  lastDeparture: string;
  next: string[];
  minutesToNext: number | null;
  /** Bugünün tüm kalkış saatleri. */
  times: string[];
  note: string | null;
}

export interface DolmusLine {
  id: string;
  name: string;
  note: string | null;
  /** Bugün geçerli kalkış noktaları; hat bugün hiç çalışmıyorsa boş. */
  points: DolmusPoint[];
}

export interface DolmusData {
  now: string;
  source: string;
  official: boolean;
  disclaimer: string;
  retrievedAt: string;
  lines: DolmusLine[];
}

export async function fetchDolmus(): Promise<DolmusData> {
  const res = await fetch("/api/dolmus", { cache: "no-store", credentials: "same-origin" });
  if (!res.ok) throw new Error(`Dolmuş saatleri alınamadı (${res.status})`);
  return (await res.json()) as DolmusData;
}

/** Sıradaki sefere kalan süreyi okunur metne çevirir. */
export function formatCountdown(minutes: number | null): string {
  if (minutes === null) return "Bugün sefer kalmadı";
  if (minutes <= 0) return "Şimdi kalkıyor";
  if (minutes < 60) return `${minutes} dk sonra`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} sa sonra` : `${h} sa ${m} dk sonra`;
}

export interface StopDeparture {
  time: string;
  minutes: number;
  lineId: string;
  lineName: string;
  note: string | null;
}

export interface StopGroup {
  stop: string;
  departures: StopDeparture[];
}

/** "SİB (Akliman seferi)" → "SİB"; "Stad / KYK" → ["Stad", "KYK"]. */
export function stopNames(from: string): string[] {
  return from
    .replace(/\s*\(.*?\)\s*/g, " ")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** API'nin "now" alanından (ör. 2026-11-16T10:10+03:00) yerel dakika sayısı. */
export function nowMinutes(now: string): number {
  const m = /T(\d{2}):(\d{2})/.exec(now);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

function toMinutes(hhmm: string): number {
  return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
}

/** Duraktan kalkışlar: her durak için yaklaşan seferler (zamana göre sıralı, en çok `limit`). */
export function groupByStop(data: DolmusData, limit = 8, all = false): StopGroup[] {
  const now = nowMinutes(data.now);
  const map = new Map<string, StopDeparture[]>();
  for (const line of data.lines) {
    for (const p of line.points) {
      for (const stop of stopNames(p.from)) {
        const list = map.get(stop) ?? [];
        for (const t of all ? p.times : p.next) {
          list.push({ time: t, minutes: toMinutes(t) - now, lineId: line.id, lineName: line.name, note: p.note });
        }
        map.set(stop, list);
      }
    }
  }
  return [...map.entries()]
    .map(([stop, deps]) => ({
      stop,
      departures: deps.sort((a, b) => a.minutes - b.minutes || a.lineName.localeCompare(b.lineName, "tr")).slice(0, all ? undefined : limit),
    }))
    .sort((a, b) => b.departures.length - a.departures.length || a.stop.localeCompare(b.stop, "tr"));
}

export function daysLabel(days: string): string | null {
  if (days === "weekday") return "Hafta içi";
  if (days === "weekend") return "Hafta sonu";
  return null;
}
