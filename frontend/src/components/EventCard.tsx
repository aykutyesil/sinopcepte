import Link from "next/link";
import { eventReserveHref } from "@/lib/feed";
import type { LiveEvent } from "@/lib/types";
import { venueHref } from "@/lib/venue-profile";

export function EventCard({ ev }: { ev: LiveEvent }) {
  return (
    <article className="rounded-xl p-4 sm:p-5 bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition relative overflow-hidden group min-w-0">
      <div className="relative z-10 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 truncate">
              {ev.badge}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md shrink-0">
            {ev.date}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-rose-400 transition font-display break-words">
          {ev.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1 truncate">
          <Link
            href={venueHref(ev.venue)}
            className="hover:underline hover:text-white transition truncate text-cyan-400"
            title={`${ev.venue} mekan profili ve menüsü`}
          >
            📍 {ev.venue}
          </Link>
          <span className="text-slate-500 truncate">• {ev.location}</span>
        </div>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed break-words">{ev.desc}</p>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2.5">
          <span className="text-[11px] font-mono font-medium text-emerald-400 truncate">● Canlı Yayın &amp; Rezervasyon</span>
          <a
            href={eventReserveHref(ev)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            <span>Masa Ayırt</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
