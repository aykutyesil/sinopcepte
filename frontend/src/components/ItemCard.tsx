"use client";

import { useEffect, useState } from "react";
import { displayRating, itemPrimaryAction } from "@/lib/feed";
import type { Item } from "@/lib/types";
import { getCheckInState, getMyActiveCheckIn, type VenueCheckInState } from "@/lib/checkin";
import { CheckInModal } from "./CheckInModal";

export function ItemCard({ item }: { item: Item }) {
  const isEczane = item.category === "eczane";
  const isMekan = item.category === "mekan";
  const primary = itemPrimaryAction(item);

  const [modalOpen, setModalOpen] = useState(false);
  const [checkInState, setCheckInState] = useState<Record<string, VenueCheckInState>>({});
  const [myCheckIn, setMyCheckIn] = useState(() => getMyActiveCheckIn());

  const refreshState = () => {
    setCheckInState(getCheckInState());
    setMyCheckIn(getMyActiveCheckIn());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const venueData = checkInState[item.id];
  const activeUsers = venueData?.activeUsers ?? [];
  const mayor = venueData?.mayor;
  const isCheckedInHere = myCheckIn?.venueId === item.id;

  return (
    <>
      <div
        className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-[#0e1224] border ${
          isEczane ? "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "border-slate-800 hover:border-slate-700"
        } transition flex flex-col justify-between group min-w-0`}
      >
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full ${
                isEczane ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-cyan-400"
              } truncate`}
            >
              {item.badge}
            </span>
            <span className="text-amber-400 text-[11px] sm:text-xs font-bold shrink-0">★ {displayRating(item)}</span>
          </div>

          <h4 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-400 transition truncate">{item.title}</h4>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">{item.location}</p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed break-words">{item.desc}</p>

          {/* 📍 SWARM MEKAN CHECK-IN ROZETİ */}
          {isMekan && (
            <div
              onClick={() => setModalOpen(true)}
              className="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition flex items-center justify-between gap-2 group/swarm"
              title="Şu an kimler burada gör ve check-in yap"
            >
              <div className="flex items-center gap-2 min-w-0">
                {activeUsers.length > 0 && (
                  <div className="flex -space-x-2 shrink-0">
                    {activeUsers.slice(0, 3).map((u) => (
                      <span
                        key={u.id}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-cyan-500/50 text-xs shadow"
                        title={`@${u.handle}`}
                      >
                        {u.avatar}
                      </span>
                    ))}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                    <span className="text-[11px] font-bold text-white truncate">
                      {activeUsers.length} kişi burada
                    </span>
                    {mayor && (
                      <span className="text-[10px] text-amber-300/90 font-mono truncate hidden xs:inline">
                        • 👑 @{mayor.handle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition flex items-center gap-1 ${
                  isCheckedInHere
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 group-hover/swarm:bg-cyan-500 group-hover/swarm:text-slate-950"
                }`}
              >
                <span>{isCheckedInHere ? "✅ Buradasın" : "📍 Check-in"}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <a
            href={primary.href}
            target={primary.target}
            rel={primary.target === "_blank" ? "noopener noreferrer" : undefined}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-3 rounded-xl ${
              isEczane ? "bg-rose-600 hover:bg-rose-500" : "bg-slate-800 hover:bg-cyan-600 hover:text-white"
            } text-slate-200 font-bold text-xs text-center transition truncate`}
          >
            {primary.text}
          </a>
          {item.phone ? (
            <a
              href={`tel:${item.phone}`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition shrink-0"
              aria-label={`${item.title} telefon`}
            >
              📞
            </a>
          ) : null}
        </div>
      </div>

      {modalOpen && (
        <CheckInModal
          item={item}
          onClose={() => setModalOpen(false)}
          onUpdate={() => refreshState()}
        />
      )}
    </>
  );
}
