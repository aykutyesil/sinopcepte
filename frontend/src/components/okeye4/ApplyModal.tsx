"use client";

import { useEffect, useState } from "react";
import { applyToLobby, CATEGORY_INFO, type Lobby } from "@/lib/okeye4";
import { fetchMe } from "@/lib/client-api";
import type { AuthUser } from "@/lib/types";
import { addNotification } from "@/lib/notifications";
import { avatarEmoji } from "@/lib/avatars";

const AVATAR_OPTIONS = ["😎", "👨‍🦱", "👩‍🦰", "🧔", "👩‍🎓", "🎸", "☕", "🎲", "🔥"];

export function ApplyModal({
  lobby,
  isOpen,
  onClose,
  onApplied,
  currentUser,
}: {
  lobby: Lobby | null;
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
  currentUser?: AuthUser | null;
}) {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("10 dakikaya oradayım, yer tutun!");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(currentUser ?? null);

  useEffect(() => {
    if (!isOpen) return;

    const fillUser = (u: AuthUser) => {
      setLoggedInUser(u);
      const h = (u.handle || u.username || "").replace(/^@/, "");
      setHandle(h);
      setName(h);
      if (u.avatar) {
        setAvatar(avatarEmoji(u.avatar));
      }
    };

    if (currentUser && (currentUser.handle || currentUser.username)) {
      fillUser(currentUser);
    } else {
      fetchMe().then((u) => {
        if (u && (u.handle || u.username)) {
          fillUser(u);
        }
      });
    }

    const savedPhone = localStorage.getItem("sinopcepte_phone");
    if (savedPhone) setPhone(savedPhone);
  }, [isOpen, currentUser]);

  if (!isOpen || !lobby) return null;

  const cat = CATEGORY_INFO[lobby.category];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanHandle = handle.trim().replace(/^@/, "") || (loggedInUser?.handle || loggedInUser?.username) || "misafir";
    const cleanPhone = phone.trim();
    const cleanWa = cleanPhone.replace(/\D/g, "");

    if (cleanPhone) {
      try {
        localStorage.setItem("sinopcepte_phone", cleanPhone);
      } catch {}
    }

    const res = applyToLobby(
      lobby.id,
      {
        handle: cleanHandle,
        name: name.trim() || cleanHandle,
        avatar,
        phone: cleanPhone,
        wa: cleanWa ? (cleanPhone.startsWith("0") ? "9" + cleanWa : cleanWa) : undefined,
      },
      note,
    );

    if (res.success) {
      addNotification({
        type: "match",
        title: "Katılım İsteğin İletildi! 🙋‍♂️",
        message: `${lobby.venue} masasındaki @${lobby.host.handle}'e katılım talebin gönderildi.`,
        icon: "🙋‍♂️",
        badge: "Başvuru",
        actionUrl: "okeye4",
      });
      setSubmitted(true);
      onApplied();
    } else {
      setError(res.error || "Talep gönderilemedi");
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0c1022] border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🙋‍♂️</span>
            <div>
              <h3 className="text-base font-black text-white font-display">
                Masaya Katılma Talebi
              </h3>
              <p className="text-[11px] text-slate-400">
                Masa sahibine davet isteği gönder
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto animate-bounce">
              🎉
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                Talebin İletildi!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Masa sahibi (<span className="text-rose-400 font-bold">@{lobby.host.handle}</span>) isteğini inceleyecek. Kabul edildiğinde bildirim ve iletişim linki açılacak.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#070914] border border-slate-800 text-[11px] text-slate-400">
              📍 <span className="text-white font-medium">{lobby.venue}</span>
              {lobby.locationDetails && ` (${lobby.locationDetails})`}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-xs"
            >
              Tamamdır, Teşekkürler
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* İlan Özeti */}
            <div className="p-3 rounded-2xl bg-[#080b18] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                  {cat.icon} {cat.label}
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {lobby.neededCount} Kişi Aranıyor
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">{lobby.title}</h4>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>📍 {lobby.venue}</span>
              </p>
              <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-300">
                <span>Masa Sahibi:</span>
                <span className="font-bold text-rose-400">@{lobby.host.handle}</span>
                <span className="text-slate-500">“{lobby.note}”</span>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Avatar Seçici */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Profil Avatarın
                </label>
                {loggedInUser && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    @{loggedInUser.handle || loggedInUser.username}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition ${
                      avatar === av
                        ? "bg-rose-600 scale-110 shadow-sm"
                        : "bg-slate-800/80 hover:bg-slate-700"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Bilgiler */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  İsmin
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="İsmin"
                  className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rumuz / Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Rumuz (@handle)"
                  className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                WhatsApp / İletişim Numarası
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
              />
              <span className="block text-[10px] text-slate-500 mt-0.5">
                Masa sahibi kabul edene kadar kimseyle paylaşılmaz.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Masa Sahibine Notun
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Örn: 5 dakikaya gelirim, 101'de iddialıyım!"
                className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 focus:border-rose-500 focus:outline-hidden text-white"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-black shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-1.5"
              >
                <span>🙋‍♂️ Gelebilir miyim? Gönder</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
