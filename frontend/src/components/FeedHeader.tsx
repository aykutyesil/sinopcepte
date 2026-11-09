"use client";

import type { LoadState, Pharmacy } from "@/lib/types";
import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";
import { useNotifications } from "@/hooks/useNotifications";
import { MobileRadarStrip } from "./MobileRadarStrip";

// Legacy akış başlığı + arama (index.html:144-217).

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
}) {
  // Legacy `handleSearch`: kırpılmış değer boşsa `clearSearch()` kutuyu da boşaltır.
  const handleInput = (val: string) => onQuery((val || "").trim() ? val : "");
  const searching = query.trim() !== "";
  const { unreadCount } = useNotifications();

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#090b14]/90 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-800">
      <div className="flex items-center justify-between gap-1.5 mb-2.5">
        <div className="min-w-0 flex-1">
          <h1 className="text-base xs:text-lg sm:text-2xl font-black text-white font-display truncate">Sinop Canlı Akışı</h1>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">Şehirde şu an ne var? Canlı akış</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 🔔 Mobilde / Üstte Hızlı Bildirimler Butonu */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-950/60 to-purple-950/60 hover:from-rose-900/80 hover:to-purple-900/80 border border-rose-500/50 text-rose-200 font-bold text-xs shadow-md transition active:scale-95"
            title="Canlı Bildirimler"
          >
            <span className="text-xs">🔔</span>
            <span className="hidden xs:inline text-[11px] font-bold">Bildirim</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mobilde Canlı Hava Durumu Rozeti */}
          <div
            className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#101426] border border-cyan-500/40 text-cyan-300 font-mono text-[10px] sm:text-xs shadow-xs"
            title="Sinop Canlı Hava Durumu"
          >
            <span className="text-xs">{weatherIconOf(weather)}</span>
            <span className="font-bold text-white whitespace-nowrap">{weatherTemp(weather)}</span>
          </div>

          {/* Radar Canlı Rozeti */}
          <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>CANLI</span>
          </span>
        </div>
      </div>

      {/* Arama Girişi */}
      <div className="bg-[#101426] border border-slate-800 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:py-2 flex items-center gap-2 focus-within:border-cyan-500 shadow-inner">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Etkinlik, mekan, taksi durağı veya nöbetçi eczane ara..."
          className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden font-medium"
        />
        {searching && (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="text-[10px] font-bold text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800/80 shrink-0"
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
