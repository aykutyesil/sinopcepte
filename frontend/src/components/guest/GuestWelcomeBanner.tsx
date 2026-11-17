"use client";

import { useState } from "react";
import Link from "next/link";

export function GuestWelcomeBanner({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <section className="relative overflow-hidden rounded-xl bg-[#111318] border border-slate-800/80 p-4 sm:p-5 mb-4">
      {/* Kapat butonu */}
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white text-xs p-1 rounded-md transition"
        title="Kapat"
        aria-label="Kapat"
      >
        ✕
      </button>

      <div className="space-y-2.5 pr-6">
        <h2 className="text-base sm:text-lg font-bold text-white font-display tracking-tight">
          Sinop&apos;un Canlı Şehir &amp; Gençlik Portalı
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
          Mekanlar, canlı etkinlikler, gece itirafları, okey masaları ve öğrenci pazarı tek ekranda.
        </p>

        {/* Sade Minimalist Gri Haplar */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Mekan Rehberi</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Gece İtirafları</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">Okeye 4.</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">2. El Pazar</span>
        </div>

        {/* Butonlar */}
        <div className="pt-2 flex items-center gap-2.5 flex-wrap">
          <Link
            href="/kayit"
            className="bg-white text-slate-950 hover:bg-slate-200 font-bold px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            Ücretsiz Kayıt Ol
          </Link>
          <Link
            href="/giris"
            className="border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </section>
  );
}
