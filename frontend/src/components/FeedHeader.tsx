"use client";

import type { LoadState, Pharmacy } from "@/lib/types";
import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";
import { useNotifications } from "@/hooks/useNotifications";
import { MobileRadarStrip } from "./MobileRadarStrip";

export type MainTab = "mekan" | "sosyal" | "oyunlar" | "ilanlar" | "kampus" | "taksi" | "dolmus" | "kesfet";

export const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "mekan", label: "Mekanlar" },
  { key: "sosyal", label: "Sosyal & İtiraf" },
  { key: "oyunlar", label: "Oyun Masaları" },
  { key: "ilanlar", label: "2. El İlanlar" },
  { key: "kampus", label: "🎓 SNÜ Notlar" },
  { key: "taksi", label: "🚖 Ortak Taksi" },
  { key: "dolmus", label: "🚐 Dolmuş Saatleri" },
  { key: "kesfet", label: "Keşfet & Rehber" },
];

export function FeedHeader({
  query,
  onQuery,
  weather,
  pharmacy,
  pharmacyState,
  onOpenNotifications,
}: {
  query: string;
  onQuery: (q: string) => void;
  weather: WeatherNow | null;
  pharmacy: Pharmacy | null;
  pharmacyState: LoadState;
  onOpenNotifications?: () => void;
  activeTab?: MainTab;
  onTabChange?: (tab: MainTab) => void;
}) {
  const handleInput = (val: string) => onQuery((val || "").trim() ? val : "");
  const searching = query.trim() !== "";
  const { unreadCount } = useNotifications();

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#090a0f]/90 pb-2 mb-3 border-b border-slate-800/80">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        {/* Sol: Başlık + Minik Canlı Noktası */}
        <div className="min-w-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Canlı Akış Aktif" />
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
            Sinop Canlı Akışı
          </h1>
        </div>

        {/* Sağ Butonlar: Sade & Minimal */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hava Durumu Sade Text Rozet */}
          <div
            className="lg:hidden inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-800 bg-[#111318] text-slate-300 font-mono text-[11px]"
            title={weather ? `${weather.condition} • Rüzgar: ${weather.windSpeed} km/s • Nem: %${weather.humidity}` : "Sinop Canlı Hava Durumu"}
          >
            <span>{weatherTemp(weather)}</span>
            <span>{weatherIconOf(weather)}</span>
          </div>

          {/* Bildirim Butonu */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg border border-slate-800 bg-[#111318] text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Bildirimler"
            aria-label="Bildirimler"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>
      </div>

      {/* Minimalist Arama Girişi */}
      <div className="bg-[#111318] border border-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-2.5 focus-within:border-slate-600 transition">
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Mekan, etkinlik, nöbetçi eczane veya 2. el ara..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden font-normal"
        />
        {searching && (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 shrink-0"
            aria-label="Aramayı temizle"
          >
            ✕
          </button>
        )}
      </div>

      <MobileRadarStrip weather={weather} pharmacy={pharmacy} pharmacyState={pharmacyState} />
    </div>
  );
}
