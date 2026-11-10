"use client";

import { useEffect, useState } from "react";
import { CATEGORY_INFO, getLobbies, type Lobby } from "@/lib/okeye4";

export function Okeye4Widget({
  onViewAll,
  onOpenCreate,
}: {
  onViewAll: () => void;
  onOpenCreate: () => void;
}) {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLobbies(getLobbies());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const openLobbies = lobbies.filter((l) => l.status === "open").slice(0, 2);

  if (openLobbies.length === 0) return null;

  return (
    <div className="mb-4 rounded-3xl p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/40 via-[#101426] to-purple-950/30 border border-amber-500/30 shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🀄</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-display">
                Okeye 4. Aranıyor
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-[10px] text-slate-400">
              Şu an {lobbies.filter((l) => l.status === "open").length} masada eksik var
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCreate}
            className="hidden xs:inline-flex px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition"
          >
            + İlan Aç
          </button>
          <button
            type="button"
            onClick={onViewAll}
            className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition flex items-center gap-1"
          >
            <span>Tümü ({lobbies.length})</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {openLobbies.map((l) => {
          const cat = CATEGORY_INFO[l.category];
          return (
            <div
              key={l.id}
              onClick={onViewAll}
              className="p-2.5 rounded-2xl bg-[#080b18]/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between gap-2 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs">{cat.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 truncate">
                    {l.venue}
                  </span>
                </div>
                <h4 className="text-[11px] font-bold text-white truncate group-hover:text-amber-300 transition">
                  {l.title}
                </h4>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {l.neededCount} Kişi Lazım
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
