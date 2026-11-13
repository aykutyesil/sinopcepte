"use client";

import { useMemo, useState, useEffect } from "react";
import type { Item, AuthUser } from "@/lib/types";
import { matchSearch, itemSearchPool } from "@/lib/search";
import {
  getCheckInState,
  getMyActiveCheckIn,
  isCheckinActive,
  formatTimeRemaining,
  formatTimeAtVenue,
  type VenueCheckInState,
} from "@/lib/checkin";

export function SelectVenueModal({
  isOpen,
  onClose,
  venues,
  onSelectVenue,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  venues: readonly Item[];
  onSelectVenue: (venue: Item) => void;
  currentUser?: AuthUser | null;
}) {
  const [search, setSearch] = useState("");
  const [checkInStates, setCheckInStates] = useState<Record<string, VenueCheckInState>>({});
  const myCheckIn = getMyActiveCheckIn();

  useEffect(() => {
    if (isOpen) {
      setCheckInStates(getCheckInState());
    }
  }, [isOpen]);

  // Yalnızca mekan kategorisindeki yerleri listele (yoksa tüm öğeler)
  const venueList = useMemo(() => {
    const list = venues.filter((v) => v.category === "mekan");
    return list.length > 0 ? list : venues;
  }, [venues]);

  const filteredVenues = useMemo(() => {
    if (!search.trim()) return venueList;
    return venueList.filter((v) => matchSearch(itemSearchPool(v), search));
  }, [venueList, search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0b0e1e] border border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
          aria-label="Kapat"
        >
          ✕
        </button>

        {/* Modal Başlığı */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📍</span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">
              Şu An Hangi Mekandasın?
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check-in yapmak veya mekandakileri görmek istediğin mekanı seç:
          </p>
        </div>

        {/* Kullanıcının mevcut check-in'i varsa bilgilendirme */}
        {myCheckIn && isCheckinActive(myCheckIn.timestamp) && (
          <div className="mb-3 p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between text-xs text-cyan-900 dark:text-cyan-200">
            <span className="truncate">
              Şu an <strong>{myCheckIn.venueName}</strong> mekanındasın ({formatTimeAtVenue(myCheckIn.timestamp)}).
            </span>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono font-bold shrink-0 ml-2">Aktif</span>
          </div>
        )}

        {/* Mekan Arama Girişi */}
        <div className="relative mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mekan ara... (örn: Mathilda's, Nihavent, Porta Marina)"
            className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition pr-9"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mekan Listesi */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {filteredVenues.length === 0 ? (
            <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
              <span className="text-2xl block mb-2">🔍</span>
              &quot;{search}&quot; ile eşleşen bir mekan bulunamadı.
            </div>
          ) : (
            filteredVenues.map((venue) => {
              const state = checkInStates[venue.id];
              const activeCount = state?.activeUsers?.length || 0;
              const isHere = Boolean(myCheckIn && myCheckIn.venueId === venue.id && isCheckinActive(myCheckIn.timestamp));

              return (
                <div
                  key={venue.id}
                  onClick={() => onSelectVenue(venue)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 group ${
                    isHere
                      ? "bg-cyan-50/80 border-cyan-300 dark:bg-cyan-950/30 dark:border-cyan-500/60 hover:bg-cyan-100/80 dark:hover:bg-cyan-950/50"
                      : "bg-slate-50 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/80 dark:bg-[#0f1424] dark:border-slate-800/80 dark:hover:border-cyan-500/40 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition truncate">
                        {venue.title}
                      </span>
                      {venue.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60 shrink-0">
                          {venue.badge}
                        </span>
                      )}
                      {isHere && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shrink-0">
                          Buradasın ({formatTimeAtVenue(myCheckIn!.timestamp)})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate">{venue.location}</span>
                      {activeCount > 0 ? (
                        <>
                          <span className="text-slate-400 dark:text-slate-600">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                            🟢 {activeCount} kişi burada
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400 dark:text-slate-600">•</span>
                          <span className="text-slate-400 dark:text-slate-500 shrink-0">İlk sen ol</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                      isHere
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                        : "bg-cyan-100/90 text-cyan-900 border border-cyan-300/80 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 group-hover:bg-cyan-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950"
                    }`}
                  >
                    <span>{isHere ? "Yönet" : "Check-in"}</span>
                    <span>→</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
