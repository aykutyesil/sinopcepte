"use client";

import { useState } from "react";
import { avatarEmoji } from "@/lib/avatars";
import type { TaxiLobby } from "@/lib/taxi";
import type { AuthUser } from "@/lib/types";

export function TaxiLobbyCard({
  lobby,
  currentUser,
  onJoin,
  onLeave,
  onCancel,
}: {
  lobby: TaxiLobby;
  currentUser?: AuthUser | null;
  onJoin: (lobbyId: string, phone?: string) => Promise<void>;
  onLeave: (lobbyId: string) => Promise<void>;
  onCancel: (lobbyId: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [phonePromptOpen, setPhonePromptOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(currentUser?.username || "");
  const [showMembers, setShowMembers] = useState(false);

  const isFull = lobby.occupiedSeats >= lobby.totalSeats || lobby.status === "FULL";
  const isOpen = lobby.status === "OPEN" && !isFull;
  const isCompleted = lobby.status === "COMPLETED";

  const handleJoinClick = () => {
    if (!currentUser) {
      alert("Taksi lobisine katılmak için lütfen giriş yapın.");
      return;
    }
    setPhonePromptOpen(true);
  };

  const confirmJoin = async () => {
    setLoading(true);
    try {
      await onJoin(lobby.id, phoneInput.trim() || undefined);
      setPhonePromptOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Katılım başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Taksi lobisinden ayrılmak istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      await onLeave(lobby.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lobiden çıkış başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bu taksi lobisini iptal etmek / kapatmak istiyor musunuz?")) return;
    setLoading(true);
    try {
      await onCancel(lobby.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lobi iptal edilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Koltuk listesi görselleştirme
  const seats = Array.from({ length: lobby.totalSeats }).map((_, idx) => {
    const member = lobby.members[idx];
    return {
      index: idx,
      isOccupied: idx < lobby.occupiedSeats,
      member: member || null,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0f17] p-4 sm:p-5 shadow-sm hover:border-amber-500/40 dark:hover:border-amber-500/40 transition flex flex-col justify-between gap-4">
      {/* Üst Kısım: Rota ve Durum Rozeti */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl shrink-0">{avatarEmoji(lobby.hostAvatar)}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {lobby.hostName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  @{lobby.hostHandle}
                </span>
                {lobby.isHost && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                    Senin Lobin
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {lobby.createdAt ? new Date(lobby.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>
          </div>

          <div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                ⚪ Kapandı
              </span>
            ) : isFull ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                🟡 Tam Dolu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                🟢 {lobby.totalSeats - lobby.occupiedSeats} Koltuk Boş
              </span>
            )}
          </div>
        </div>

        {/* Güzergah Blok: Kalkış -> Varış */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="text-emerald-500 font-bold shrink-0">📍 Kalkış:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{lobby.departurePoint}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="text-rose-500 font-bold shrink-0">🏁 Hedef:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{lobby.destination}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
            <div className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <span>⏰</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{lobby.departureTime}</span>
            </div>

            {lobby.estimatedFare && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px]">
                <span>💰 {lobby.estimatedFare}</span>
              </div>
            )}
          </div>
        </div>

        {/* Not / Açıklama */}
        {lobby.note && (
          <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
            &ldquo;{lobby.note}&rdquo;
          </p>
        )}
      </div>

      {/* Alt Kısım: Koltuk Durumu & Katılımcılar */}
      <div className="space-y-3 pt-1">
        {/* Koltuk Görsel Şeridi */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Koltuklar ({lobby.occupiedSeats}/{lobby.totalSeats}):
            </span>
            <div className="flex items-center gap-1">
              {seats.map((seat) => (
                <span
                  key={seat.index}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                    seat.isOccupied
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold"
                      : "bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400"
                  }`}
                  title={seat.member ? `@${seat.member.userHandle} (${seat.member.userName})` : "Boş Koltuk"}
                >
                  {seat.isOccupied ? (seat.member ? avatarEmoji(seat.member.userAvatar) : "👤") : "○"}
                </span>
              ))}
            </div>
          </div>

          {lobby.members && lobby.members.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMembers(!showMembers)}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium"
            >
              {showMembers ? "Yolcuları Gizle" : "Yolcuları Gör"}
            </button>
          )}
        </div>

        {/* Açılabilir Yolcu Listesi */}
        {showMembers && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              Lobideki Yolcular:
            </div>
            {lobby.members.map((m, i) => (
              <div key={m.id || i} className="flex items-center justify-between gap-2 py-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span>{avatarEmoji(m.userAvatar)}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{m.userName}</span>
                  <span className="text-slate-500 text-[11px]">@{m.userHandle}</span>
                  {m.userHandle === lobby.hostHandle && (
                    <span className="text-[10px] px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Host
                    </span>
                  )}
                </div>
                {/* İletişim: Lobiye dahil olanlar veya host için telefon göster */}
                {(lobby.joinedByMe || lobby.isHost) && m.userPhone && (
                  <a
                    href={`tel:${m.userPhone}`}
                    className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                  >
                    📞 {m.userPhone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Katıl / Ayrıl / İptal Aksiyon Butonları */}
        <div className="flex items-center gap-2 pt-1">
          {phonePromptOpen ? (
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="İletişim Tel (05xx xxx xx xx)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={confirmJoin}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {loading ? "..." : "Onayla"}
              </button>
              <button
                type="button"
                onClick={() => setPhonePromptOpen(false)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              {lobby.joinedByMe && !lobby.isHost && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-semibold text-xs transition"
                >
                  {loading ? "İşleniyor..." : "Lobiden Ayrıl"}
                </button>
              )}

              {!lobby.joinedByMe && isOpen && (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <span>🚖 Lobiye Katıl (Koltuk Ayır)</span>
                </button>
              )}

              {lobby.isHost && !isCompleted && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition"
                >
                  {loading ? "..." : "Lobiyi Kapat"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
