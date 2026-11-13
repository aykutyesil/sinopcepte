"use client";

import { useState } from "react";
import type { VenueProfileData } from "@/lib/venue-profile";
import { createVenueEvent } from "@/lib/venue-profile";

export function CreateVenueEventModal({
  profile,
  isOpen,
  onClose,
  onCreated,
}: {
  profile: VenueProfileData;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("Bu Akşam • 21:00");
  const [badge, setBadge] = useState("⚡ CANLI PROGRAM");
  const [desc, setDesc] = useState("");
  const [wa, setWa] = useState(profile.wa || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createVenueEvent({
      venueId: profile.itemId,
      venue: profile.title,
      location: profile.location,
      title: title.trim(),
      date: date.trim() || "Canlı Etkinlik",
      badge: badge.trim() || "⚡ CANLI PROGRAM",
      desc: desc.trim() || `${profile.title} mekanında özel etkinlik ve canlı yayın.`,
      wa: wa.trim() || profile.wa || "",
    });

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0c1022] border border-rose-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Yeni Mekan Etkinliği Oluştur
              </h3>
              <p className="text-[11px] text-rose-300 font-mono truncate max-w-xs">
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Etkinlik / Canlı Yayın Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Akustik Rock Gecesi & DJ Set"
              className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Tarih & Saat
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Örn: Bu Akşam • 20:30"
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Rozet / Kategori
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Örn: 🎸 CANLI SAHNE"
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Etkinlik Detayı / Açıklaması
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Giriş şartları, rezervasyon uyarısı, özel indirimler vb..."
              className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Rezervasyon WhatsApp Numarası
            </label>
            <input
              type="text"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="905xxxxxxxxx"
              className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-rose-500 focus:outline-hidden"
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
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-95 text-white font-black shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-1.5"
            >
              <span>🚀 Etkinliği Yayına Al</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
