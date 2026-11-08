"use client";

import type { LoadState, Pharmacy } from "@/lib/types";
import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";

// Legacy mobil hızlı radar şeridi (index.html:186-216): hava kartı + nöbetçi eczane kartı.

export function pharmacyPlaceholder(state: LoadState): string {
  if (state === "loading") return "Yükleniyor...";
  if (state === "error") return "Bilgi alınamadı";
  return "Henüz yüklenmedi";
}

export function MobileRadarStrip({
  weather,
  pharmacy,
  pharmacyState,
}: {
  weather: WeatherNow | null;
  pharmacy: Pharmacy | null;
  pharmacyState: LoadState;
}) {
  const pharmacyInner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 leading-none">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-rose-400 uppercase truncate">Nöbetçi</span>
        </div>
        <span className="text-[11px] sm:text-xs font-extrabold text-white truncate block mt-0.5">
          {pharmacy ? pharmacy.name : pharmacyPlaceholder(pharmacyState)}
        </span>
      </div>
      <span className="text-[8px] sm:text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-sm shrink-0">🗺️</span>
    </>
  );

  const cardClass =
    "rounded-xl sm:rounded-2xl p-2 sm:p-2.5 bg-linear-to-br/srgb from-rose-950/70 to-[#12162a] border border-rose-500/40 relative flex items-center justify-between gap-1 group cursor-pointer hover:border-rose-400 transition min-w-0";

  return (
    <div className="lg:hidden mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
      {/* 1. Mobil Canlı Hava Durumu Kartı */}
      <div className="radar-sweep rounded-xl sm:rounded-2xl p-2 sm:p-2.5 bg-[#0f1428] border border-cyan-500/30 relative overflow-hidden min-w-0">
        <div className="relative z-10 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <span className="block text-[8px] sm:text-[9px] font-mono font-bold text-cyan-400 uppercase leading-none truncate">Hava & Deniz</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono mt-0.5 block truncate">Sinop {weatherTemp(weather)}</span>
          </div>
          <span className="text-sm sm:text-base shrink-0">{weatherIconOf(weather)}</span>
        </div>
      </div>

      {/* 2. Mobil Nöbetçi Eczane Kartı */}
      {pharmacy?.mapUrl ? (
        <a
          href={pharmacy.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
          title="Sinop Merkez Günün Nöbetçi Eczanesi - Haritada Gör"
        >
          {pharmacyInner}
        </a>
      ) : (
        <div className={cardClass.replace(" cursor-pointer", "")} title="Sinop Merkez Günün Nöbetçi Eczanesi">
          {pharmacyInner}
        </div>
      )}
    </div>
  );
}
