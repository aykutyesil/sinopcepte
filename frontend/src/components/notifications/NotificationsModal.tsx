"use client";

import { useEffect, useState } from "react";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  clearNotifications,
  type AppNotification,
  type NotificationType,
} from "@/lib/notifications";
import { formatTimeAgo } from "@/lib/checkin";
import type { FeedFilter } from "@/lib/types";

export function NotificationsModal({
  isOpen,
  onClose,
  onNavigateFilter,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigateFilter?: (filter: FeedFilter) => void;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterType, setFilterType] = useState<"all" | NotificationType>("all");

  const refresh = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filterType === "all"
    ? notifications
    : notifications.filter((n) => n.type === filterType);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClickItem = (notif: AppNotification) => {
    markAsRead(notif.id);
    refresh();

    if (notif.actionUrl && onNavigateFilter) {
      if (
        notif.actionUrl === "all" ||
        notif.actionUrl === "okeye4" ||
        notif.actionUrl === "etkinlik" ||
        notif.actionUrl === "mekan" ||
        notif.actionUrl === "taksi" ||
        notif.actionUrl === "tekel" ||
        notif.actionUrl === "eczane" ||
        notif.actionUrl === "cicek"
      ) {
        onNavigateFilter(notif.actionUrl as FeedFilter);
        onClose();
      }
    }
  };

  const handleMarkAll = () => {
    markAllAsRead();
    refresh();
  };

  const handleClearAll = () => {
    if (confirm("Tüm bildirimleri silmek istediğinize emin misiniz?")) {
      clearNotifications();
      refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0e1e] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          title="Kapat"
        >
          ✕
        </button>

        {/* Başlık Alanı */}
        <div className="flex items-center justify-between gap-3 mb-4 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <div>
              <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
                <span>Bildirimler</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                    {unreadCount} Yeni
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">İşlemlerine ve şehre dair canlı anlık bildirimler</p>
            </div>
          </div>
        </div>

        {/* Aksiyon Barı (Tümünü Oku / Temizle) */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
          {/* Tip Filtreleri */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                filterType === "all"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Tümü ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType("match")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                filterType === "match"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              🀄 Masa & Oyun
            </button>
            <button
              onClick={() => setFilterType("mayor")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                filterType === "mayor"
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              👑 Swarm
            </button>
            <button
              onClick={() => setFilterType("city")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                filterType === "city"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              🌊 Şehir
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition whitespace-nowrap"
                title="Tümünü Okundu Say"
              >
                ✓ Tümünü Oku
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                title="Tüm Bildirimleri Sil"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Bildirim Listesi */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <span className="text-3xl block mb-2 opacity-60">🔕</span>
              {filterType === "all"
                ? "Henüz yeni bir bildirim yok."
                : "Bu kategoride bildirim bulunmuyor."}
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClickItem(notif)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 relative group ${
                  notif.read
                    ? "bg-[#080b18]/70 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100"
                    : "bg-[#0e1428] border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-cyan-950/20"
                }`}
              >
                {/* Okunmadı Noktası */}
                {!notif.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}

                {/* İkon */}
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition shadow">
                  {notif.icon || "🔔"}
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">
                      {notif.title}
                    </span>
                    {notif.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {notif.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed break-words">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-800/50">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTimeAgo(notif.timestamp)}
                    </span>
                    {notif.actionUrl && (
                      <span className="text-[10px] text-cyan-400 group-hover:underline font-bold">
                        Görüntüle →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alt Kısım */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>SinopCepte Canlı Bildirim Merkezi</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-white hover:text-rose-400 transition"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
