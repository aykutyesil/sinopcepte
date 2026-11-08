"use client";

import { useCallback, useEffect, useRef } from "react";

/** Legacy `handleSecretClick` (888-898): 1200 ms içinde 3 tık → tetikle. Her tık zamanlayıcıyı yeniler. */
export function useSecretClick(onTrigger: () => void, clicks = 3, windowMs = 1200) {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(() => {
    count.current++;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      count.current = 0;
    }, windowMs);
    if (count.current >= clicks) {
      count.current = 0;
      onTrigger();
    }
  }, [onTrigger, clicks, windowMs]);
}
