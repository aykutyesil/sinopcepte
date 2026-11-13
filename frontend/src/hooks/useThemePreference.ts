"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

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
  const saved = useSyncExternalStore(subscribe, read, () => null);
  // Kullanıcı açıkça 'dark' seçmediyse varsayılan AÇIK (light) tema
  const isDark = saved === "dark";

  const toggle = useCallback(() => {
    try {
      const next = isDark ? "light" : "dark";
      localStorage.setItem(KEY, next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, [isDark]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return { isDark, icon: isDark ? "🌙" : "☀️", toggle };
}
