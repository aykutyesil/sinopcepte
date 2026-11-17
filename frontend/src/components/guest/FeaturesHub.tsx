"use client";

import Link from "next/link";
import type { AuthUser } from "@/lib/types";
import type { MainTab } from "@/components/FeedHeader";

export function FeaturesHub({
  me,
  onSwitchTab,
}: {
  me?: AuthUser | null;
  onSwitchTab?: (tab: MainTab) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Başlık Banner */}
      <section className="rounded-xl bg-[#111318] border border-slate-800/80 p-4 sm:p-5 space-y-2">
        <h2 className="text-base sm:text-xl font-bold text-white font-display tracking-tight">
          SinopCepte Özellikler &amp; Şehir Rehberi
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
          Şehir veritabanı, mekanlar, itiraflar, canlı oyun masaları, kampüs notları ve ortak taksi tek ekranda.
        </p>
      </section>

      {/* 6 Büyük Modül Kartları */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 1. Mekan Rehberi */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">01 / MEKANLAR</span>
            <h3 className="text-sm sm:text-base font-bold text-white">Mekan Rehberi &amp; Swarm Check-In</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sinop&apos;taki tüm popüler kafeler, pub&apos;lar ve restoranlar. Güncel menüler, fotoğraflar ve konum bilgisi. Mekanlara check-in yap, kimlerin orada olduğunu gör.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("mekan")}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Mekan Akışına Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 2. Gece İtirafları */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">02 / SOSYAL</span>
            <h3 className="text-sm sm:text-base font-bold text-white">Gizli Gece &amp; Kampüs İtirafları</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tamamen anonim Sinop rumuzlarıyla içini dök. Mekan etiketle, tepkiler bırak ve anonim olarak yorumlaş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("sosyal")}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>İtiraflara Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 3. Okeye 4. Aranıyor */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">03 / OYUNLAR</span>
            <h3 className="text-sm sm:text-base font-bold text-white">Okeye 4. Aranıyor &amp; Oyun Masaları</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Okey, 101 veya tavla için masa aç veya mevcut masalara katıl. Masa sahibi onaylayınca doğrudan WhatsApp ve telefon iletişimi kurulsun.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("oyunlar")}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Masaları Gör</span>
            <span>→</span>
          </button>
        </div>

        {/* 4. 2. El & Öğrenci Pazarı */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">04 / PAZAR</span>
            <h3 className="text-sm sm:text-base font-bold text-white">2. El &amp; Öğrenci Paylaşım Pazarı</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ders notları, bisiklet, çalışma masası veya eşyalar. İlan ver, alıcılarla doğrudan WhatsApp veya telefonla görüş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("ilanlar")}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>İlanlar Pazarına Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 5. SNÜ Notlar */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">05 / KAMPÜS</span>
            <h3 className="text-sm sm:text-base font-bold text-white">SNÜ Kampüs &amp; Sınav Notları</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sinop Üniversitesi fakültelerine göre çıkmış sınav soruları, vize-final çözümleri ve ders özetleri.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("kampus")}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Kampüs Notlarına Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 6. Ortak Taksi */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-amber-400 font-semibold tracking-wider">06 / TAKSİ</span>
            <h3 className="text-sm sm:text-base font-bold text-white">🚖 Canlı Ortak Taksi Lobisi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Havalimanı, Otogar ve Kampüs güzergahlarında taksi masrafını bölüş. Taksiye kişi ara veya açık lobilerden birine katıl.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("taksi")}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-amber-400 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Taksi Lobilerine Git</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Giriş & Kayıt Çağrısı (Misafirler için) */}
      {!me && (
        <section className="p-5 sm:p-6 rounded-xl bg-[#111318] border border-slate-800/80 text-center space-y-3">
          <h3 className="font-bold text-base text-white">Tüm Özellikleri Kullanmak İçin Üye Ol</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Check-in yapmak, masa açmak, itiraf paylaşmak ve ilan vermek için hesabını saniyeler içinde oluştur.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/kayit"
              className="px-4 py-2 rounded-lg bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition"
            >
              Hemen Kayıt Ol
            </Link>
            <Link
              href="/giris"
              className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-medium text-xs transition"
            >
              Giriş Yap
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
