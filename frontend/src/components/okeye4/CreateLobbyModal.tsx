"use client";

import { useState } from "react";
import {
  CATEGORY_INFO,
  createLobby,
  type Lobby,
  type LobbyCategory,
} from "@/lib/okeye4";

const PRESET_VENUES = [
  "Mathiday's Social Club",
  "Nihavent Pub & Bistro",
  "Porta Marina Coffee",
  "Cem's Burger & Lounge",
  "Kordon Boyu Çay Bahçesi",
  "SNÜ Kampüs Kafeterya",
];

const AVATAR_OPTIONS = ["👨‍🦱", "👩‍🦰", "🧔", "👩‍🎓", "🎸", "🎧", "😎", "☕", "🎲"];

export function CreateLobbyModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (lobby: Lobby) => void;
}) {
  const [category, setCategory] = useState<LobbyCategory>("okey");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState(PRESET_VENUES[0]);
  const [customVenue, setCustomVenue] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [totalCount, setTotalCount] = useState(4);
  const [neededCount, setNeededCount] = useState(1);
  const [note, setNote] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [hostName, setHostName] = useState("Aykut Y.");
  const [hostHandle, setHostHandle] = useState("aykut_57");
  const [hostAvatar, setHostAvatar] = useState("😎");
  const [hostPhone, setHostPhone] = useState("0544 123 45 67");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVenue = venue === "Diğer" ? customVenue.trim() || "Sinop Merkez" : venue;
    const finalTitle =
      title.trim() ||
      `${finalVenue}'da ${CATEGORY_INFO[category].label} için ${neededCount} kişi aranıyor`;

    const newLobby = createLobby({
      category,
      title: finalTitle,
      venue: finalVenue,
      locationDetails: locationDetails.trim() || "Masa başında bekliyoruz",
      host: {
        name: hostName.trim() || "Masa Sahibi",
        handle: hostHandle.trim().replace(/^@/, "") || "sinoplu",
        avatar: hostAvatar,
        phone: hostPhone.trim(),
        wa: hostPhone.replace(/\D/g, "") ? (hostPhone.startsWith("0") ? "9" + hostPhone.replace(/\D/g, "") : hostPhone.replace(/\D/g, "")) : undefined,
      },
      totalCount,
      neededCount,
      currentCount: Math.max(1, totalCount - neededCount),
      note: note.trim() || "Masamıza katılacak samimi arkadaşlar arıyoruz!",
      expiresInMinutes: durationMinutes,
    });

    onCreated(newLobby);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1022] border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🀄
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Yeni Masa İlanı Aç
              </h3>
              <p className="text-[11px] text-slate-400">
                Okeye 4., maç arkadaşı veya kahve yoldaşı bul
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Kategori Seçimi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Etkinlik / Oyun Türü
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_INFO) as LobbyCategory[]).map((cat) => {
                const info = CATEGORY_INFO[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-500 shadow-md font-bold"
                        : "bg-[#080b18] text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-base">{info.icon}</span>
                    <span className="truncate">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* İlan Başlığı */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              İlan Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 101 Okey'e Acil 4. Lazım, Çaylar Bizden!"
              className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
            />
          </div>

          {/* Mekan Seçimi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mekan / Buluşma Yeri
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_VENUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setVenue(v);
                    setCustomVenue("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    venue === v
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setVenue("Diğer")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  venue === "Diğer"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                ✏️ Başka Bir Yer
              </button>
            </div>
            {venue === "Diğer" && (
              <input
                type="text"
                value={customVenue}
                onChange={(e) => setCustomVenue(e.target.value)}
                placeholder="Mekan veya cadde adı yazın (Örn: Aşıklar Parkı)..."
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white mb-2"
                required
              />
            )}
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="Masa konumu (Örn: 8 no'lu masa, alt kat, cam kenarı)..."
              className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
            />
          </div>

          {/* Kontenjan ve Süre */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Toplam Masa
              </label>
              <select
                value={totalCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalCount(val);
                  if (neededCount >= val) setNeededCount(1);
                }}
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white"
              >
                <option value={2}>2 Kişilik</option>
                <option value={4}>4 Kişilik (Standart)</option>
                <option value={6}>6 Kişilik (Grup)</option>
                <option value={8}>8+ Kişilik</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Aranan Kişi
              </label>
              <select
                value={neededCount}
                onChange={(e) => setNeededCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-amber-400 font-bold"
              >
                <option value={1}>1 Kişi Eksik</option>
                <option value={2}>2 Kişi Aranıyor</option>
                <option value={3}>3 Kişi Aranıyor</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                İlan Süresi
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white"
              >
                <option value={45}>45 Dakika</option>
                <option value={90}>1.5 Saat</option>
                <option value={180}>3 Saat</option>
                <option value={300}>Bu Gece Boyunca</option>
              </select>
            </div>
          </div>

          {/* Açıklama / Masa Notu */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Masa Notu & Davet Mesajı
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Örn: Arkadaş son anda sattı, 3 kişiyiz hemen başlayacağız. Çaylar kaybedenden!"
              className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
            />
          </div>

          {/* Profil & İletişim Bilgileri */}
          <div className="p-3 rounded-2xl bg-[#070914] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                👑 İlan Sahibi Bilgileri
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Onay sonrası paylaşılır</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-400">Avatar:</span>
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setHostAvatar(av)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition ${
                    hostAvatar === av
                      ? "bg-rose-600 scale-110 shadow-sm"
                      : "bg-slate-800/80 hover:bg-slate-700"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={hostHandle}
                onChange={(e) => setHostHandle(e.target.value)}
                placeholder="Rumuz (@aykut)"
                className="w-full p-2 rounded-lg bg-[#0b0f20] border border-slate-800 text-white text-[11px]"
                required
              />
              <input
                type="text"
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                placeholder="WhatsApp / Tel no"
                className="w-full p-2 rounded-lg bg-[#0b0f20] border border-slate-800 text-white text-[11px]"
              />
            </div>
          </div>

          {/* Gönder Butonu */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-2"
            >
              <span>🚀 Masayı Canlıya Al</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
