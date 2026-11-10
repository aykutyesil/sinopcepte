"use client";

import Link from "next/link";
import { addNotification } from "@/lib/notifications";
import {
  respondToRequest,
  type Lobby,
} from "@/lib/okeye4";
import { venueHref } from "@/lib/venue-profile";

export function HostManageModal({
  lobby,
  isOpen,
  onClose,
  onUpdated,
}: {
  lobby: Lobby | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  if (!isOpen || !lobby) return null;

  const handleAction = (requestId: string, accept: boolean) => {
    const targetReq = lobby.requests.find((r) => r.id === requestId);
    const res = respondToRequest(lobby.id, requestId, accept);
    if (res.success) {
      if (accept && targetReq) {
        addNotification({
          type: "match",
          title: "Katılımcıyı Masaya Kabul Ettin! 🎉",
          message: `@${targetReq.user.handle} masana katıldı. WhatsApp bağlantısı hazır.`,
          icon: "🎉",
          badge: "Kabul",
          actionUrl: "okeye4",
        });
      }
      onUpdated();
    }
  };

  const pendingRequests = lobby.requests.filter((r) => r.status === "pending");
  const acceptedRequests = lobby.requests.filter((r) => r.status === "accepted");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1022] border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <div>
              <h3 className="text-base font-black text-white font-display">
                Masa & Aday Yönetimi
              </h3>
              <p className="text-[11px] text-slate-400">
                Gelen katılım taleplerini onayla veya yönet
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

        {/* Masa Durum Özeti */}
        <div className="p-4 rounded-2xl bg-[#080b18] border border-slate-800 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate">{lobby.title}</span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                lobby.status === "filled"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {lobby.status === "filled" ? "🎉 MASA DOLDU" : `🟢 ${lobby.neededCount} KİŞİ ARANIYOR`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Mekan:{" "}
              <Link
                href={venueHref(lobby.venue)}
                className="font-bold text-amber-300 hover:underline"
              >
                {lobby.venue}
              </Link>
            </span>
            <span>
              Doluluk: <strong className="text-amber-400">{lobby.currentCount}/{lobby.totalCount} Kişi</strong>
            </span>
          </div>
        </div>

        {/* Gelen Başvurular */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Başvuran Adaylar ({lobby.requests.length})
            </h4>
            {pendingRequests.length > 0 && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {pendingRequests.length} Yeni İstek
              </span>
            )}
          </div>

          {lobby.requests.length === 0 ? (
            <div className="p-8 text-center bg-[#070914] rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
              Henüz bu masaya katılım talebi gelmedi.
              <p className="text-[11px] text-slate-600 mt-1">
                İlanın akışta aktif, kullanıcılar &quot;Gelebilir miyim?&quot; dedikçe burada görünecek.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lobby.requests.map((req) => {
                const isPending = req.status === "pending";
                const isAccepted = req.status === "accepted";
                const isRejected = req.status === "rejected";

                return (
                  <div
                    key={req.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      isAccepted
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : isRejected
                        ? "bg-slate-900/30 border-slate-800 opacity-60"
                        : "bg-[#0b0e1e] border-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/u/${req.user.handle}`}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 hover:scale-105 transition"
                          title={`@${req.user.handle} profilini gör`}
                        >
                          {req.user.avatar || "👤"}
                        </Link>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/u/${req.user.handle}`}
                              className="font-bold text-xs text-white hover:text-rose-400 hover:underline transition"
                            >
                              {req.user.name}
                            </Link>
                            <Link
                              href={`/u/${req.user.handle}`}
                              className="text-[11px] text-rose-400 font-mono hover:underline"
                            >
                              @{req.user.handle}
                            </Link>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            “{req.note}”
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isAccepted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ Masaya Kabul Edildi
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            Pas Geçildi
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ⏳ Yanıt Bekliyor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* İletişim & Aksiyonlar */}
                    {isAccepted ? (
                      <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-emerald-400 font-medium">
                          İletişim Köprüsü Açıldı:
                        </span>
                        <div className="flex items-center gap-2">
                          {req.user.wa && (
                            <a
                              href={`https://wa.me/${req.user.wa}?text=${encodeURIComponent(
                                `Selam @${req.user.handle}, SinopCepte üzerinden masamıza katılma talebini onayladım! Bekliyoruz.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <span>💬 WhatsApp</span>
                            </a>
                          )}
                          {req.user.phone && (
                            <a
                              href={`tel:${req.user.phone}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <span>📞 Ara ({req.user.phone})</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : isPending ? (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleAction(req.id, false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition"
                        >
                          Pas Geç
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(req.id, true)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                        >
                          <span>✅ Kabul Et / Masaya Çağır</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alt Kapat Düğmesi */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-xs"
          >
            Pencereyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
