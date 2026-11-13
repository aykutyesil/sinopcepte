import Link from "next/link";
import { courierOrderHref } from "@/lib/feed";
import type { Item, LoadState } from "@/lib/types";
import { railListPlaceholder } from "./placeholder";

// Legacy "Gece Açık Tekeller" kartı (index.html:293-309); satırlar `tekel` item'larından.

export function CourierCard({ couriers, state }: { couriers: readonly Item[]; state: LoadState }) {
  return (
    <div className="rounded-3xl p-5 bg-white dark:bg-[#0f1428] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white">🏪 Gece Açık Kurye</h4>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">SERVİS</span>
      </div>
      <div className="space-y-1.5 text-xs">
        {couriers.length === 0 ? (
          <p className="p-2 text-slate-500 dark:text-slate-400">{railListPlaceholder(state === "ok" ? "none" : state)}</p>
        ) : (
          couriers.map((c) => (
            <div
              key={c.id}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 dark:bg-[#080b18] dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-transparent transition flex justify-between items-center gap-2 group"
            >
              <Link
                href={`/mekan/${c.id}`}
                className="font-bold truncate min-w-0 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline"
                title={`${c.title} profili ve menüsü`}
              >
                {c.title}
              </Link>
              <a
                href={courierOrderHref(c)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-mono font-bold shrink-0 hover:underline text-[11px]"
              >
                Sipariş Ver →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
