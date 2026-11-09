"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_INFO,
  getLobbies,
  type Lobby,
  type LobbyCategory,
} from "@/lib/okeye4";
import type { AuthUser } from "@/lib/types";
import { LobbyCard } from "./LobbyCard";
import { CreateLobbyModal } from "./CreateLobbyModal";
import { ApplyModal } from "./ApplyModal";
import { HostManageModal } from "./HostManageModal";

export function Okeye4Feed({ me }: { me?: AuthUser | null }) {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [activeCategory, setActiveCategory] = useState<LobbyCategory | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedApplyLobby, setSelectedApplyLobby] = useState<Lobby | null>(null);
  const [selectedManageLobby, setSelectedManageLobby] = useState<Lobby | null>(null);

  const refresh = () => {
    setLobbies(getLobbies());
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = lobbies.filter((l) => {
    if (activeCategory === "all") return true;
    return l.category === activeCategory;
  });

  const openCount = lobbies.filter((l) => l.status === "open").length;

  return (
    <div className="space-y-4">
      {/* Üst Banner & CTA */}
      <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-amber-950/60 via-[#10152c] to-[#0a0d1a] border border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🀄
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-white font-display">
                    Okeye 4. Aranıyor
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    CANLI EŞLEŞME
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sinop mekanlarında eksik masalara katıl veya hemen yeni masa kur!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <span className="text-sm">✨</span>
              <span>+ Yeni Masa İlanı Aç</span>
            </button>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-base sm:text-lg font-black text-emerald-400 font-mono">
                {openCount}
              </span>
              <span className="text-[10px] text-slate-400">Şu An Açık Masa</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-base sm:text-lg font-black text-cyan-400 font-mono">
                &lt; 5 dk
              </span>
              <span className="text-[10px] text-slate-400">Ortalama Eşleşme</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-base sm:text-lg font-black text-amber-400 font-mono">
                Onaylı
              </span>
              <span className="text-[10px] text-slate-400">Güvenli Katılım</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kategori Filtre Çipleri */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-rose-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          ⚡ Tümü ({lobbies.length})
        </button>

        {(Object.keys(CATEGORY_INFO) as LobbyCategory[]).map((cat) => {
          const info = CATEGORY_INFO[cat];
          const isSelected = activeCategory === cat;
          const count = lobbies.filter((l) => l.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className="text-[10px] font-mono opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* İlan Akışı */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#080b18] rounded-3xl border border-slate-800 text-slate-400 text-xs">
            Bu kategoride şu an açık masa bulunmuyor.
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition text-xs"
              >
                İlk İlanı Sen Aç →
              </button>
            </div>
          </div>
        ) : (
          filtered.map((lobby) => (
            <LobbyCard
              key={lobby.id}
              lobby={lobby}
              currentUser={me}
              onApply={(l) => setSelectedApplyLobby(l)}
              onManage={(l) => setSelectedManageLobby(l)}
            />
          ))
        )}
      </div>

      {/* Modallar */}
      <CreateLobbyModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          refresh();
        }}
        currentUser={me}
      />

      <ApplyModal
        lobby={selectedApplyLobby}
        isOpen={Boolean(selectedApplyLobby)}
        onClose={() => setSelectedApplyLobby(null)}
        onApplied={() => {
          refresh();
        }}
        currentUser={me}
      />

      <HostManageModal
        lobby={selectedManageLobby}
        isOpen={Boolean(selectedManageLobby)}
        onClose={() => setSelectedManageLobby(null)}
        onUpdated={() => {
          refresh();
          if (selectedManageLobby) {
            const current = getLobbies().find((l) => l.id === selectedManageLobby.id);
            setSelectedManageLobby(current || null);
          }
        }}
      />
    </div>
  );
}
