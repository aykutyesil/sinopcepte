import { formatPhone } from "@/lib/feed";
import type { Item, LoadState } from "@/lib/types";
import { railListPlaceholder } from "./placeholder";

// Legacy "7/24 Taksi Hızlı Arama" (index.html:271-291); satırlar `taksi` item'larından.

export function TaxiCard({ taxis, state }: { taxis: readonly Item[]; state: LoadState }) {
  return (
    <div className="rounded-3xl p-5 bg-[#0f1428] border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-xs text-white">🚖 7/24 Taksi Durakları</h4>
        <span className="text-[10px] font-mono text-amber-400 font-bold">HAZIR</span>
      </div>
      <div className="space-y-1.5 text-xs">
        {taxis.length === 0 ? (
          <p className="p-2 text-slate-400">{railListPlaceholder(state === "ok" ? "none" : state)}</p>
        ) : (
          taxis.map((t) => (
            <a
              key={t.id}
              href={`tel:${t.phone}`}
              className="p-2 rounded-xl bg-[#080b18] hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition flex justify-between items-center gap-2"
            >
              <span className="font-bold truncate min-w-0">{t.title}</span>
              <span className="font-mono font-bold text-amber-400 shrink-0">{formatPhone(t.phone)}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
