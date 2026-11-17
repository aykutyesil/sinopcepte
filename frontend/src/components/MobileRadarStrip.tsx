"use client";

import type { LoadState, Pharmacy } from "@/lib/types";
import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";

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
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span className="text-[9px] font-mono font-bold text-rose-400 uppercase truncate">Nöbetçi</span>
        </div>
        <span className="text-xs font-bold text-white truncate block mt-0.5">
          {pharmacy ? pharmacy.name : pharmacyPlaceholder(pharmacyState)}
        </span>
      </div>
      <span className="text-[9px] font-mono bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-sm shrink-0">🗺️</span>
    </>
  );

  const cardClass =
    "rounded-xl p-2 sm:p-2.5 bg-[#111318] border border-slate-800/80 hover:border-slate-700 relative flex items-center justify-between gap-1 group cursor-pointer transition min-w-0";

  return (
    <div className="lg:hidden mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
      {/* 1. Mobil Canlı Hava Durumu Kartı */}
      <div className="rounded-xl p-2 sm:p-2.5 bg-[#111318] border border-slate-800/80 hover:border-slate-700 relative overflow-hidden min-w-0 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-tight truncate">
            {weather?.condition || "Sinop Hava"}
          </span>
          <span className="text-sm shrink-0">{weatherIconOf(weather)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-xs sm:text-sm font-black text-white font-mono leading-none">
            {weatherTemp(weather)}
          </span>
          <div className="text-[9px] text-slate-400 font-mono shrink-0 flex items-center gap-1.5">
            <span title="Rüzgar">💨 {weather ? `${weather.windSpeed}` : "--"}</span>
            <span title="Nem">💧 {weather ? `%${weather.humidity}` : "--"}</span>
          </div>
        </div>
      </div>

      {/* 2. Mobil Nöbetçi Eczane Kartı */}
      {pharmacy?.mapUrl ? (
        <a
          href={pharmacy.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
          title="Nöbetçi Eczaneye Haritada Git"
        >
          {pharmacyInner}
        </a>
      ) : pharmacy?.phoneFormatted ? (
        <a
          href={`tel:${pharmacy.phoneFormatted}`}
          className={cardClass}
          title="Nöbetçi Eczaneyi Ara"
        >
          {pharmacyInner}
        </a>
      ) : (
        <div className={cardClass}>{pharmacyInner}</div>
      )}
    </div>
  );
}
