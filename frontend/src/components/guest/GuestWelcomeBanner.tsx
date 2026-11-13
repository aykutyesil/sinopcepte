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
    <section className="relative overflow-hidden rounded-2xl bg-[#0c0f17] border border-slate-800/80 p-5 sm:p-6 shadow-xl mb-4">
      {/* Kapat butonu */}
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs p-1 rounded-md transition"
        title="Kapat"
        aria-label="Kapat"
      >
        ✕
      </button>

      <div className="space-y-3 pr-6">
        <h2 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight">
          Sinop&apos;un Canlı Şehir &amp; Gençlik Portalı
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
          Mekanlar, canlı etkinlikler, gece itirafları, okey masaları ve öğrenci pazarı tek ekranda.
        </p>

        {/* Sade Minimalist Gri Haplar */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80">Mekan Rehberi</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80">Gece İtirafları</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80">Okeye 4.</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80">2. El Pazar</span>
        </div>

        {/* Butonlar */}
        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <Link
            href="/kayit"
            className="bg-white text-slate-950 hover:bg-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Ücretsiz Kayıt Ol
          </Link>
          <Link
            href="/giris"
            className="border border-slate-700 text-slate-300 hover:text-white font-medium px-4 py-2 rounded-xl text-xs transition"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </section>
  );
}
