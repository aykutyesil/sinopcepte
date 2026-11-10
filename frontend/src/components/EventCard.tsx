import Link from "next/link";
import { eventReserveHref } from "@/lib/feed";
import type { LiveEvent } from "@/lib/types";
import { venueHref } from "@/lib/venue-profile";

// Legacy etkinlik kartı (index.html:635-671).

export function EventCard({ ev }: { ev: LiveEvent }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-linear-to-br/srgb from-[#18132e] via-[#101426] to-[#090c18] border border-rose-500/30 shadow-2xl relative overflow-hidden group min-w-0">
      <div className="absolute -right-12 -top-12 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
            <span className="text-[9px] sm:text-[10px] font-mono font-black px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 truncate">
              {ev.badge}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 shrink-0">
            {ev.date}
          </span>
        </div>

        <h3 className="text-base sm:text-2xl font-black text-white group-hover:text-rose-400 transition font-display break-words">
          {ev.title}
        </h3>

        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-cyan-400 mt-1.5 truncate">
          <Link
            href={venueHref(ev.venue)}
            className="hover:underline hover:text-cyan-300 transition truncate"
            title={`${ev.venue} mekan profili ve menüsü`}
          >
            📍 {ev.venue}
          </Link>
          <span className="text-slate-400 truncate">• {ev.location}</span>
        </div>

        <p className="text-xs text-slate-300 mt-2.5 sm:mt-3 leading-relaxed break-words">{ev.desc}</p>

        <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-white/10 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 truncate">● Canlı Yayın & Rezervasyon</span>
          <a
            href={eventReserveHref(ev)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full xs:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-linear-to-r/srgb from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Masa Ayırt</span>
            <span>⚡</span>
          </a>
        </div>
      </div>
    </div>
  );
}
