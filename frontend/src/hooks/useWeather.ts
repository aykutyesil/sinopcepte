"use client";

import { useEffect, useState } from "react";
import { fetchWeatherNow, WEATHER_REFRESH_MS, type WeatherNow } from "@/lib/weather";

/** Legacy: sayfa açılışında ve 5 dakikada bir Open-Meteo'dan çeker. Hata olursa son değer kalır. */
export function useWeather(): WeatherNow | null {
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = () => {
      fetchWeatherNow(ctrl.signal)
        .then(setWeather)
        .catch((e) => {
          if (!ctrl.signal.aborted) console.log("Hava durumu güncellenemedi", e);
        });
    };
    load();
    const id = setInterval(load, WEATHER_REFRESH_MS);
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, []);

  return weather;
}

/** Veri gelene kadar legacy'nin sabit "9.5°C" değeri yerine nötr yer tutucu. */
export function weatherTemp(w: WeatherNow | null): string {
  return w ? `${w.temp}°C` : "--°C";
}

export function weatherIconOf(w: WeatherNow | null): string {
  return w ? w.icon : "🌤️";
}
