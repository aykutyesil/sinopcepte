import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";

export function WeatherCard({ weather }: { weather: WeatherNow | null }) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md">
      {/* Üst Kısım: Başlık ve Mevcut Hava Durumu */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
          Sinop Hava Durumu
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
          <span className="text-base">{weatherIconOf(weather)}</span>
          <span>{weather?.condition || "Yükleniyor..."}</span>
        </div>
      </div>

      {/* Ana Sıcaklık Gösterimi */}
      <div className="flex items-baseline justify-between my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {weatherTemp(weather)}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Merkez & Liman
        </span>
      </div>

      {/* Sade 2'li Izgara: Rüzgar Hızı & Nem Miktarı */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60">
          <span className="text-sm">💨</span>
          <div>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">Rüzgar</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {weather ? `${weather.windSpeed} km/s` : "--"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60">
          <span className="text-sm">💧</span>
          <div>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">Nem</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {weather ? `%${weather.humidity}` : "--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
