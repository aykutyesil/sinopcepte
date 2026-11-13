"use client";

import { useEffect, useState } from "react";
import { avatarEmoji } from "@/lib/avatars";
import {
  CONFESSION_CATEGORIES,
  CONFESSIONS_UPDATED_EVENT,
  getConfessions,
  type Confession,
} from "@/lib/confessions";

export function ConfessionWidget({
  onViewAll,
  onOpenCreate,
}: {
  onViewAll: () => void;
  onOpenCreate: () => void;
}) {
  const [confessions, setConfessions] = useState<Confession[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setConfessions(getConfessions());
    }, 0);
    const onUpdated = () => setConfessions(getConfessions());
    window.addEventListener(CONFESSIONS_UPDATED_EVENT, onUpdated);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONFESSIONS_UPDATED_EVENT, onUpdated);
    };
  }, []);

  const topConfessions = confessions.slice(0, 2);
  if (topConfessions.length === 0) return null;

  return (
    <div className="mb-4 rounded-3xl p-3.5 sm:p-4 bg-gradient-to-r from-indigo-950/40 via-[#101426] to-rose-950/30 border border-indigo-500/30 shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤫</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-display">
                Sinop Gece İtirafları
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            </div>
            <p className="text-[10px] text-slate-400">
              {confessions.length} anonim itiraf yayında
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCreate}
            className="hidden xs:inline-flex px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition"
          >
            + İtiraf Et
          </button>
          <button
            type="button"
            onClick={onViewAll}
            className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1"
          >
            <span>Tümü ({confessions.length})</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {topConfessions.map((c) => {
          const cat = CONFESSION_CATEGORIES[c.category] || CONFESSION_CATEGORIES.gece;
          const totalReactions = c.fireCount + c.laughCount + c.shockCount + c.heartCount;
          return (
            <div
              key={c.id}
              onClick={onViewAll}
              className="p-2.5 rounded-2xl bg-[#080b18]/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between gap-2 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{avatarEmoji(c.aliasAvatar)}</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-300 truncate">
                    {c.aliasName}
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {cat.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 line-clamp-1 group-hover:text-white transition">
                  {c.body}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <span>🔥</span>
                <span>{totalReactions}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
