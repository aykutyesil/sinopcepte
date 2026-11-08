// Legacy `fetchWeather` (833-865) portu. Open-Meteo anahtar istemez; tarayıcıdan doğrudan çağrılır.

export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=42.0268&longitude=35.1517&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul";

/** Legacy: 5 dakikada bir yenile (`setInterval(fetchWeather, 300000)`). */
export const WEATHER_REFRESH_MS = 300000;

/**
 * Legacy kod -> emoji eşlemesi, aynı sırayla. Not: legacy'de 45/48 (sis) varsayılan 🌤️,
 * 80+ (sağanak, fırtına) `>= 71` dalına düşüp ❄️ olur; bu davranış bilerek korunuyor.
 */
export function weatherIcon(code: number): string {
  let icon = "🌤️";
  if (code === 0) icon = "☀️";
  else if (code >= 1 && code <= 3) icon = "⛅";
  else if (code >= 51 && code <= 67) icon = "🌧️";
  else if (code >= 71) icon = "❄️";
  return icon;
}

export interface WeatherNow {
  temp: number;
  icon: string;
}

export async function fetchWeatherNow(signal?: AbortSignal): Promise<WeatherNow> {
  const res = await fetch(WEATHER_URL, { signal });
  const data = await res.json();
  const temp = data.current.temperature_2m as number;
  const code = data.current.weather_code as number;
  return { temp, icon: weatherIcon(code) };
}
