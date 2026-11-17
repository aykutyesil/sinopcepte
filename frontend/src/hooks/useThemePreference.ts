"use client";

import { useEffect } from "react";

const KEY = "sinopcepte_theme";

export function useThemePreference() {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, "dark");
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return {
    isDark: true,
    toggle: () => {},
  };
}
