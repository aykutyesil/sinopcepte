// Legacy `fetchWeather` (833-865) portu. Open-Meteo anahtar istemez; tarayıcıdan doğrudan çağrılır.

export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=42.0268&longitude=35.1517&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul";

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

/** WMO hava durumu kodu metin karşılığı */
export function weatherConditionText(code: number): string {
  if (code === 0) return "Açık";
  if (code === 1) return "Çoğunlukla Açık";
  if (code === 2) return "Parçalı Bulutlu";
  if (code === 3) return "Çok Bulutlu";
  if (code === 45 || code === 48) return "Sisli";
  if (code >= 51 && code <= 55) return "Çisenti";
  if (code >= 56 && code <= 57) return "Dondurucu Çisenti";
  if (code === 61) return "Hafif Yağmurlu";
  if (code === 63) return "Yağmurlu";
  if (code === 65) return "Kuvvetli Yağmur";
  if (code >= 66 && code <= 67) return "Dondurucu Yağmur";
  if (code >= 71 && code <= 77) return "Karlı";
  if (code >= 80 && code <= 82) return "Sağanak Yağış";
  if (code >= 85 && code <= 86) return "Kar Sağanağı";
  if (code >= 95) return "Fırtına";
  return "Bulutlu";
}

export interface WeatherNow {
  temp: number;
  icon: string;
  condition: string;
  windSpeed: number;
  humidity: number;
}

export async function fetchWeatherNow(signal?: AbortSignal): Promise<WeatherNow> {
  const res = await fetch(WEATHER_URL, { signal });
  const data = await res.json();
  const temp = Math.round((data.current.temperature_2m as number) * 10) / 10;
  const code = (data.current.weather_code as number) ?? 0;
  const humidity = Math.round((data.current.relative_humidity_2m as number) ?? 0);
  const windSpeed = Math.round(((data.current.wind_speed_10m as number) ?? 0) * 10) / 10;
  return {
    temp,
    icon: weatherIcon(code),
    condition: weatherConditionText(code),
    windSpeed,
    humidity,
  };
}
