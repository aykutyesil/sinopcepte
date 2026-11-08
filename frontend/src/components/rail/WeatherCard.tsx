import type { WeatherNow } from "@/lib/weather";
import { weatherIconOf, weatherTemp } from "@/hooks/useWeather";

// Legacy "Radar Sweep Canlı Durum Kartı" (index.html:227-237).

export function WeatherCard({ weather }: { weather: WeatherNow | null }) {
  return (
    <div className="radar-sweep rounded-3xl p-5 bg-[#0f1428] border border-cyan-500/30 shadow-xl relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Sinop Hava & Deniz</span>
          <span className="text-xl">{weatherIconOf(weather)}</span>
        </div>
        <span className="text-3xl font-black text-white font-mono">Sinop {weatherTemp(weather)}</span>
        <p className="text-xs text-slate-400 mt-1">Hükümet Meydanı & Liman Canlı</p>
      </div>
    </div>
  );
}
