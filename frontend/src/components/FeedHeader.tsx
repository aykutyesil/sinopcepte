"use client";

import type { LoadState, Pharmacy } from "@/lib/types";
import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";
import { MobileRadarStrip } from "./MobileRadarStrip";

// Legacy akış başlığı + arama (index.html:144-217).

export function FeedHeader({
  query,
  onQuery,
  weather,
  pharmacy,
  pharmacyState,
}: {
  query: string;
  onQuery: (q: string) => void;
  weather: WeatherNow | null;
  pharmacy: Pharmacy | null;
  pharmacyState: LoadState;
}) {
  // Legacy `handleSearch`: kırpılmış değer boşsa `clearSearch()` kutuyu da boşaltır.
  const handleInput = (val: string) => onQuery((val || "").trim() ? val : "");
  const searching = query.trim() !== "";

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#090b14]/90 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-800">
      <div className="flex items-center justify-between gap-1.5 mb-2.5">
        <div className="min-w-0 flex-1">
          <h1 className="text-base xs:text-lg sm:text-2xl font-black text-white font-display truncate">Sinop Canlı Akışı</h1>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">Şehirde şu an ne var? Canlı akış</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
          placeholder="Akışta ara (Galatasaray, DJ Burkay, Taksi, Tekel, Eczane)..."
          aria-label="Akışta ara"
          className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-hidden"
        />
        <button
          type="button"
          onClick={() => onQuery("")}
          className={`${searching ? "" : "hidden "}text-slate-400 hover:text-white text-xs`}
          aria-label="Aramayı temizle"
        >
          ✕
        </button>
      </div>

      <MobileRadarStrip weather={weather} pharmacy={pharmacy} pharmacyState={pharmacyState} />
    </div>
  );
}
