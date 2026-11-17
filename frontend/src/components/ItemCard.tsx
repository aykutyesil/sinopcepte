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
      <article
        className="rounded-xl p-4 sm:p-5 bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group min-w-0"
      >
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isEczane
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-slate-900 text-slate-300 border border-slate-800"
              } truncate`}
            >
              {item.badge}
            </span>
            <span className="text-amber-400 text-xs font-semibold shrink-0">★ {displayRating(item)}</span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition truncate">
            <Link href={`/mekan/${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h4>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-slate-400 truncate">{item.location}</p>
            <Link
              href={`/mekan/${item.id}`}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition shrink-0 hover:underline"
            >
              Mekan Profili &amp; Menü →
            </Link>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed break-words">{item.desc}</p>

          {/* 📍 SWARM MEKAN CHECK-IN ROZETİ */}
          {isMekan && (
            <div
              onClick={() => setModalOpen(true)}
              className="mt-3 p-2.5 rounded-lg bg-[#0c0e14] hover:bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex items-center justify-between gap-2 group/swarm"
              title="Şu an kimler burada gör ve check-in yap"
            >
              <div className="flex items-center gap-2 min-w-0">
                {activeUsers.length > 0 && (
                  <div className="flex -space-x-1.5 shrink-0">
                    {activeUsers.slice(0, 3).map((u) => (
                      <Link
                        key={u.id}
                        href={`/u/${u.handle}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs transition z-10"
                        title={`@${u.handle} profilini görüntüle`}
                      >
                        {u.avatar}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-[11px] font-bold text-white truncate">
                      {activeUsers.length} kişi burada
                    </span>
                    {mayor && (
                      <Link
                        href={`/u/${mayor.handle}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-amber-300 hover:text-amber-200 hover:underline font-mono truncate hidden xs:inline"
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
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 transition flex items-center gap-1 ${
                  isCheckedInHere
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                <span>{isCheckedInHere && myCheckIn ? `✅ Buradasın (${formatTimeAtVenue(myCheckIn.timestamp)})` : "📍 Check-in"}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2 min-w-0">
          <a
            href={primary.href}
            target={primary.target}
            rel={primary.target === "_blank" ? "noopener noreferrer" : undefined}
            className={`flex-1 min-w-0 py-2 px-3 rounded-lg ${
              isEczane
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-800"
            } font-bold text-xs text-center transition truncate`}
          >
            {primary.text}
          </a>
          {item.phone ? (
            <a
              href={`tel:${item.phone}`}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition shrink-0"
              aria-label={`${item.title} telefon`}
            >
              📞
            </a>
          ) : null}
        </div>
      </article>

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
