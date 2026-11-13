"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { displayRating, itemPrimaryAction } from "@/lib/feed";
import type { AuthUser, Item } from "@/lib/types";
import { getCheckInState, getMyActiveCheckIn, formatTimeAtVenue, type MyActiveCheckIn, type VenueCheckInState } from "@/lib/checkin";
import { CheckInModal } from "./CheckInModal";

export function ItemCard({
  item,
  currentUser,
}: {
  item: Item;
  currentUser?: AuthUser | null;
}) {
  const isEczane = item.category === "eczane";
  const isMekan = item.category === "mekan";
  const primary = itemPrimaryAction(item);

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkInState, setCheckInState] = useState<Record<string, VenueCheckInState>>({});
  const [myCheckIn, setMyCheckIn] = useState<MyActiveCheckIn | null>(null);

  const refreshState = () => {
    setCheckInState(getCheckInState());
    setMyCheckIn(getMyActiveCheckIn());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      refreshState();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const venueData = checkInState[item.id];
  const activeUsers = venueData?.activeUsers ?? [];
  const mayor = venueData?.mayor;

  const currentHandle = (currentUser?.handle || currentUser?.username || "").toLowerCase();
  // Hydration mismatch önleme: SSR sırasında ve ilk renderda mounted=false iken sunucuyla aynı (Check-in) render edilir
  const isCheckedInHere =
    mounted &&
    myCheckIn?.venueId === item.id &&
    (!currentHandle || (myCheckIn?.handle || "").toLowerCase() === currentHandle);

  return (
    <>
      <div
        className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-[#0e1224] border ${
          isEczane
            ? "border-rose-300 dark:border-rose-500/50 shadow-sm dark:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-none"
        } transition flex flex-col justify-between group min-w-0`}
      >
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full ${
                isEczane
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-transparent"
                  : "bg-slate-100 text-cyan-800 dark:bg-slate-800 dark:text-cyan-400 border border-slate-200/60 dark:border-transparent"
              } truncate`}
            >
              {item.badge}
            </span>
            <span className="text-amber-500 dark:text-amber-400 text-[11px] sm:text-xs font-bold shrink-0">★ {displayRating(item)}</span>
          </div>

          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition truncate">
            <Link href={`/mekan/${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h4>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{item.location}</p>
            <Link
              href={`/mekan/${item.id}`}
              className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition shrink-0 hover:underline"
            >
              Mekan Profili & Menü →
            </Link>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed break-words">{item.desc}</p>

          {/* 📍 SWARM MEKAN CHECK-IN ROZETİ */}
          {isMekan && (
            <div
              onClick={() => setModalOpen(true)}
              className="mt-3 p-2.5 rounded-xl bg-cyan-50/70 hover:bg-cyan-100/70 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 border border-cyan-200/80 dark:border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition flex items-center justify-between gap-2 group/swarm"
              title="Şu an kimler burada gör ve check-in yap"
            >
              <div className="flex items-center gap-2 min-w-0">
                {activeUsers.length > 0 && (
                  <div className="flex -space-x-2 shrink-0">
                    {activeUsers.slice(0, 3).map((u) => (
                      <Link
                        key={u.id}
                        href={`/u/${u.handle}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-cyan-500/50 hover:border-cyan-300 text-xs shadow hover:scale-110 transition z-10"
                        title={`@${u.handle} profilini görüntüle`}
                      >
                        {u.avatar}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping shrink-0"></span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                      {activeUsers.length} kişi burada
                    </span>
                    {mayor && (
                      <Link
                        href={`/u/${mayor.handle}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-amber-700 dark:text-amber-300/90 hover:text-amber-600 dark:hover:text-amber-200 hover:underline font-mono truncate hidden xs:inline"
                        title={`@${mayor.handle} profilini görüntüle`}
                      >
                        • 👑 @{mayor.handle}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition flex items-center gap-1 ${
                  isCheckedInHere
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                    : "bg-cyan-100/90 text-cyan-900 border border-cyan-300/90 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 group-hover/swarm:bg-cyan-600 group-hover/swarm:text-white dark:group-hover/swarm:bg-cyan-500 dark:group-hover/swarm:text-slate-950"
                }`}
              >
                <span>{isCheckedInHere && myCheckIn ? `✅ Buradasın (${formatTimeAtVenue(myCheckIn.timestamp)})` : "📍 Check-in"}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <a
            href={primary.href}
            target={primary.target}
            rel={primary.target === "_blank" ? "noopener noreferrer" : undefined}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-3 rounded-xl ${
              isEczane
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-cyan-600 dark:text-slate-200 dark:hover:text-white"
            } font-bold text-xs text-center transition truncate shadow-xs`}
          >
            {primary.text}
          </a>
          {item.phone ? (
            <a
              href={`tel:${item.phone}`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold transition shrink-0"
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
          currentUser={currentUser}
          onClose={() => setModalOpen(false)}
          onUpdate={() => refreshState()}
        />
      )}
    </>
  );
}
