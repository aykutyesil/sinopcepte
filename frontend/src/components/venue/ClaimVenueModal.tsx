"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuthUser } from "@/lib/types";
import type { VenueProfileData } from "@/lib/venue-profile";
import { claimVenue } from "@/lib/venue-profile";

export function ClaimVenueModal({
  profile,
  currentUser,
  isOpen,
  onClose,
  onSubmitted,
}: {
  profile: VenueProfileData;
  currentUser?: AuthUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState(profile.phone || "");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleHandle = (currentUser?.handle || currentUser?.username || "").replace(/^@/, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleHandle) return;

    claimVenue({
      itemId: profile.itemId,
      venueTitle: profile.title,
      userHandle: handleHandle,
      note: note.trim() || `${profile.title} işletmecisiyim / mekan sahibiyim.`,
      phone: phone.trim(),
    });

    setSubmitted(true);
    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0c1022] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏪</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Mekan Sahipliği Talebi
              </h3>
              <p className="text-[11px] text-amber-300 font-mono truncate max-w-xs">
                {profile.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {!handleHandle ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-3xl flex items-center justify-center mx-auto">
              🔒
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                Giriş Yapmalısınız
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xs mx-auto">
                Mekan sahipliği / patron yetkisi talep etmek için SinopCepte hesabınıza giriş yapmalısınız.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Vazgeç
              </button>
              <Link
                href="/giris"
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg flex items-center gap-1.5"
              >
                <span>Giriş Yap</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto animate-bounce">
              🎉
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                Yetki Talebin İletildi!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Yöneticilerimiz (<span className="text-amber-400 font-bold">@aykut / @oguzhan</span>) mekan sahipliği başvurunuzu inceleyip onaylayacak.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-xs"
            >
              Tamamdır, Teşekkürler
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200">
              <p className="font-bold">👑 Mekan Patronu Ayrıcalıkları:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-300/90">
                <li>Mekan menüsünü ve fiyatlarını dilediğiniz gibi güncelleyin.</li>
                <li>Fotoğraf galerisi ekleyin veya düzenleyin.</li>
                <li>Mekanınızda gerçekleşecek canlı etkinlikleri ve yayınları duyurun.</li>
              </ul>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Başvuran Kullanıcı
              </label>
              <div className="p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white font-mono font-bold flex items-center justify-between">
                <span>@{handleHandle}</span>
                <span className="text-[10px] text-emerald-400 font-sans">✓ Oturum Açık</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                İletişim / Teyit Telefon Numarası
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                İşletme Bilgisi / Yönetici Notu
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="İşletmenin sahibiyim / müdürüyüm, doğrulama için iletişime geçebilirsiniz..."
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-slate-950 font-black shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-1.5"
              >
                <span>🏪 Patron Yetkisi İste</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
