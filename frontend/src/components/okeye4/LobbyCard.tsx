"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORY_INFO,
  formatTimeRemaining,
  getMyRequestId,
  type Lobby,
} from "@/lib/okeye4";

export function LobbyCard({
  lobby,
  onApply,
  onManage,
}: {
  lobby: Lobby;
  onApply: (lobby: Lobby) => void;
  onManage: (lobby: Lobby) => void;
}) {
  const [asHost, setAsHost] = useState(false);
  const cat = CATEGORY_INFO[lobby.category];

  const timeInfo = useMemo(
    () => formatTimeRemaining(lobby.createdAt, lobby.expiresInMinutes),
    [lobby.createdAt, lobby.expiresInMinutes]
  );

  const myReqId = getMyRequestId(lobby.id);
  const myReq = lobby.requests.find((r) => r.id === myReqId);

  const pendingCount = lobby.requests.filter((r) => r.status === "pending").length;

  // Masa sandalyeleri dizisi
  const seats = useMemo(() => {
    const list: { type: "host" | "filled" | "empty"; label: string; avatar?: string }[] = [];
    list.push({ type: "host", label: "Masa Sahibi", avatar: lobby.host.avatar });
    for (let i = 1; i < lobby.currentCount; i++) {
      list.push({ type: "filled", label: "Katılımcı", avatar: "👤" });
    }
    for (let i = 0; i < lobby.neededCount; i++) {
      list.push({ type: "empty", label: "Aranıyor" });
    }
    return list;
  }, [lobby]);

  return (
    <article className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#0e1329] to-[#080b18] border border-slate-800 hover:border-slate-700 shadow-xl transition-all relative overflow-hidden group">
      {/* Üst Kategori ve Durum Şeridi */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${cat.badgeClass} flex items-center gap-1`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </span>

          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
            📍 {lobby.venue}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              timeInfo.isUrgent
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            <span>⏳</span>
            <span>{timeInfo.text}</span>
          </span>
        </div>
      </div>

      {/* İlan Başlığı */}
      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-rose-400 transition leading-snug">
        {lobby.title}
      </h3>

      {/* Masa Notu / Host Mesajı */}
      <div className="mt-2.5 p-3 rounded-2xl bg-[#070914] border border-slate-800/90 text-xs text-slate-300 relative">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/u/${lobby.host.handle}`}
            className="flex items-center gap-1.5 hover:opacity-90 group/host"
            title={`@${lobby.host.handle} profilini görüntüle`}
          >
            <span className="text-base group-hover/host:scale-110 transition">{lobby.host.avatar}</span>
            <span className="font-bold text-white text-[11px] group-hover/host:text-amber-300 group-hover/host:underline transition">
              @{lobby.host.handle}
            </span>
          </Link>
          <span className="text-[10px] text-amber-400 font-mono">👑 Masa Sahibi</span>
          {lobby.locationDetails && (
            <span className="text-[10px] text-slate-400 truncate ml-auto">
              ({lobby.locationDetails})
            </span>
          )}
        </div>
        <p className="text-slate-300 text-[11px] sm:text-xs italic leading-relaxed">
          &ldquo;{lobby.note}&rdquo;
        </p>
      </div>

      {/* Masa Düzeni / Sandalye Görünümü */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Masa:
          </span>
          <div className="flex items-center -space-x-1 sm:space-x-1">
            {seats.map((s, idx) => (
              <div
                key={idx}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition border ${
                  s.type === "host"
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20"
                    : s.type === "filled"
                    ? "bg-slate-800 border-slate-700 text-slate-300"
                    : "border-dashed border-rose-500/60 bg-rose-500/10 text-rose-400 animate-pulse font-bold"
                }`}
                title={s.label}
              >
                {s.type === "empty" ? "?" : s.avatar || "👤"}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-400 ml-1">
            ({lobby.currentCount}/{lobby.totalCount})
          </span>
        </div>

        {/* Doluluk Durum Rozeti */}
        <div>
          {lobby.status === "filled" ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              🎉 Masa Doldu
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{lobby.neededCount} Kişi Lazım</span>
            </span>
          )}
        </div>
      </div>

      {/* Kullanıcı Katılım / Durum Alanı */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
        {myReq && myReq.status === "accepted" ? (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  Tebrikler! Masaya Kabul Edildin
                </p>
                <p className="text-[10px] text-slate-300">
                  Masa sahibi @{lobby.host.handle} seni bekliyor.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {lobby.host.wa && (
                <a
                  href={`https://wa.me/${lobby.host.wa}?text=${encodeURIComponent(
                    `Selam @${lobby.host.handle}, SinopCepte'den onayladığın ${lobby.title} için geliyorum!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1"
                >
                  <span>💬 WhatsApp</span>
                </a>
              )}
              {lobby.host.phone && (
                <a
                  href={`tel:${lobby.host.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1"
                >
                  <span>📞 Ara</span>
                </a>
              )}
            </div>
          </div>
        ) : myReq && myReq.status === "pending" ? (
          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Katılım talebin masa sahibine iletildi, onay bekleniyor...</span>
            </div>
          </div>
        ) : asHost ? (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onManage(lobby)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>👑 Masayı Yönet</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-rose-600 text-[10px] font-black">
                  {pendingCount} İstek
                </span>
              )}
            </button>
          </div>
        ) : lobby.status === "open" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onApply(lobby)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <span>🙋‍♂️ Gelebilir miyim?</span>
              <span className="text-[10px] font-mono opacity-80">(Katılım İsteği Gönder)</span>
            </button>
            <button
              type="button"
              onClick={() => onManage(lobby)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center gap-1"
              title="Masa Sahibi Gözüyle İncele / Yönet"
            >
              <span>👑 Yönet</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            Bu masa doldu veya süresi bitti.
          </div>
        )}

        {/* Demo Modu Değiştirici */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>İlan ID: #{lobby.id.slice(-4)}</span>
          <button
            type="button"
            onClick={() => setAsHost((prev) => !prev)}
            className="hover:text-cyan-400 transition underline underline-offset-2"
          >
            {asHost ? "👁️ Katılımcı Gözüyle Gör" : "⚙️ Masa Sahibi Rolüne Geç"}
          </button>
        </div>
      </div>
    </article>
  );
}
