"use client";

import { useCallback, useSyncExternalStore } from "react";

// Legacy `toggleTheme` / `updateThemeUI` (867-885). Sayfa koyu tek tema (0 adet `dark:` sınıfı);
// düğme yalnız tercihi `sinopcepte_theme` anahtarına yazar ve ikonu değiştirir.

const KEY = "sinopcepte_theme";
const EVENT = "sinopcepte-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function useThemePreference() {
  // Sunucuda ve ilk hidrasyonda null → 🌙 (hidrasyon uyuşmazlığı yok).
  const saved = useSyncExternalStore(subscribe, read, () => null);
  const isDark = saved !== "light";

  const toggle = useCallback(() => {
    try {
      localStorage.setItem(KEY, isDark ? "light" : "dark");
    } catch {
      // Depolama kapalıysa tercih kaydedilemez.
    }
    window.dispatchEvent(new Event(EVENT));
  }, [isDark]);

  return { isDark, icon: isDark ? "🌙" : "☀️", toggle };
}
