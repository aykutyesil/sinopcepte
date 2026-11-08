import { courierOrderHref } from "@/lib/feed";
import type { Item, LoadState } from "@/lib/types";
import { railListPlaceholder } from "./placeholder";

// Legacy "Gece Açık Tekeller" kartı (index.html:293-309); satırlar `tekel` item'larından.

export function CourierCard({ couriers, state }: { couriers: readonly Item[]; state: LoadState }) {
  return (
    <div className="rounded-3xl p-5 bg-[#0f1428] border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-xs text-white">🏪 Gece Açık Kurye</h4>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">SERVİS</span>
      </div>
      <div className="space-y-1.5 text-xs">
        {couriers.length === 0 ? (
          <p className="p-2 text-slate-400">{railListPlaceholder(state === "ok" ? "none" : state)}</p>
        ) : (
          couriers.map((c) => (
            <a
              key={c.id}
              href={courierOrderHref(c)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#080b18] hover:bg-emerald-600 hover:text-white text-slate-300 transition flex justify-between items-center gap-2"
            >
              <span className="font-bold truncate min-w-0">{c.title}</span>
              <span className="text-emerald-400 font-mono font-bold shrink-0">Sipariş Ver →</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
