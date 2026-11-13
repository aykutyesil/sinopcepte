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
      <section className="rounded-2xl bg-[#0c0f17] border border-slate-800/80 p-5 sm:p-6 space-y-2">
        <h2 className="text-lg sm:text-2xl font-bold text-white font-display tracking-tight">
          SinopCepte Özellikler &amp; Şehir Rehberi
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
          Şehir veritabanı, mekanlar, itiraflar, canlı oyun masaları ve 2. el öğrenci pazarı tek ekranda.
        </p>
      </section>

      {/* 4 Büyük Modül Kartları */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 1. Mekan Rehberi */}
        <div className="p-5 rounded-2xl bg-[#0c0f17] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-semibold tracking-wider">01 / MEKANLAR</span>
            </div>
            <h3 className="text-base font-semibold text-white">Mekan Rehberi &amp; Swarm Check-In</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sinop&apos;taki tüm popüler kafeler, pub&apos;lar ve restoranlar. Güncel menüler, fotoğraflar ve konum bilgisi. Mekanlara check-in yap, kimlerin orada olduğunu gör.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("mekan")}
            className="w-full py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Mekan Akışına Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 2. Gece İtirafları */}
        <div className="p-5 rounded-2xl bg-[#0c0f17] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-semibold tracking-wider">02 / SOSYAL</span>
            </div>
            <h3 className="text-base font-semibold text-white">Gizli Gece &amp; Kampüs İtirafları</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tamamen anonim Sinop rumuzlarıyla içini dök. Mekan etiketle, tepkiler bırak ve anonim olarak yorumlaş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("sosyal")}
            className="w-full py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>İtiraflara Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 3. Okeye 4. Aranıyor */}
        <div className="p-5 rounded-2xl bg-[#0c0f17] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-semibold tracking-wider">03 / OYUNLAR</span>
            </div>
            <h3 className="text-base font-semibold text-white">Okeye 4. Aranıyor &amp; Oyun Masaları</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Okey, 101 veya tavla için masa aç veya mevcut masalara katıl. Masa sahibi onaylayınca doğrudan WhatsApp ve telefon iletişimi kurulsun.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("oyunlar")}
            className="w-full py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Masaları Gör</span>
            <span>→</span>
          </button>
        </div>

        {/* 4. 2. El & Öğrenci Pazarı */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-none transition flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-semibold tracking-wider">04 / PAZAR</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">2. El &amp; Öğrenci Paylaşım Pazarı</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ders notları, bisiklet, çalışma masası veya eşyalar. İlan ver, alıcılarla doğrudan WhatsApp veya telefonla görüş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("ilanlar")}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>İlanlar Pazarına Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 5. SNÜ Kampüs & Sınav Notları */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-none transition flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold tracking-wider">05 / KAMPÜS &amp; AKADEMİK</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 font-bold">YENİ</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">🎓 SNÜ Kampüs &amp; Vize-Final Ders Notları</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sinop Üniversitesi fakültelerine göre düzenlenmiş çıkmış sınav soruları, vize-final çözümleri ve ders özetleri. İndir, çalış ve notlarını paylaş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("kampus")}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-500 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Kampüs Notlarına Git</span>
            <span>→</span>
          </button>
        </div>

        {/* 6. Ortak Taksi & Masraf Paylaşımı */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-none transition flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold tracking-wider">06 / ULAŞIM &amp; MASRAF</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-bold">YENİ</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">🚖 Canlı Ortak Taksi Lobisi</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Havalimanı, Otogar ve Kampüs güzergahlarında taksi masrafını bölüş. Taksiye kişi ara veya açık lobilerden birine katılarak tasarruf et.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab?.("taksi")}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Taksi Lobilerine Git</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Aykut Burayı Oku Bannerı */}
      <section className="p-5 rounded-2xl bg-[#0c0f17] border border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-white">Aykut&apos;un Özel Proje Kılavuzu</h3>
          <p className="text-xs text-slate-400">
            Sitede yapılan yenilikleri, Admin Tanrı Modu yetkilerini ve yol haritasını anlatan özet rehber.
          </p>
        </div>
        <Link
          href="/aykut-burayi-oku"
          className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-medium text-xs transition"
        >
          Kılavuzu Oku →
        </Link>
      </section>

      {/* Giriş & Kayıt Çağrısı (Misafirler için) */}
      {!me && (
        <section className="p-6 rounded-2xl bg-[#0c0f17] border border-slate-800/80 text-center space-y-3">
          <h3 className="font-semibold text-base text-white">Tüm Özellikleri Kullanmak İçin Üye Ol</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Check-in yapmak, masa açmak, itiraf paylaşmak ve ilan vermek için hesabını saniyeler içinde oluştur.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/kayit"
              className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition"
            >
              Hemen Kayıt Ol
            </Link>
            <Link
              href="/giris"
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition"
            >
              Giriş Yap
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
