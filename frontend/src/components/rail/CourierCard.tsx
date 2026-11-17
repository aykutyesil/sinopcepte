import Link from "next/link";
import { courierOrderHref } from "@/lib/feed";
import type { Item, LoadState } from "@/lib/types";
import { railListPlaceholder } from "./placeholder";

export function CourierCard({ couriers, state }: { couriers: readonly Item[]; state: LoadState }) {
  return (
    <div className="rounded-xl p-4 bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-xs text-white">🏪 Gece Açık Tekeller</h4>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">SERVİS</span>
      </div>
      <div className="space-y-1.5 text-xs">
        {couriers.length === 0 ? (
          <p className="p-2 text-slate-400">{railListPlaceholder(state === "ok" ? "none" : state)}</p>
        ) : (
          couriers.map((c) => (
            <div
              key={c.id}
              className="p-2 rounded-lg bg-[#0c0e14] hover:bg-slate-900 text-slate-300 border border-slate-800/60 transition flex justify-between items-center gap-2 group"
            >
              <Link
                href={`/mekan/${c.id}`}
                className="font-semibold truncate min-w-0 hover:text-white hover:underline"
                title={`${c.title} profili ve menüsü`}
              >
                {c.title}
              </Link>
              <a
                href={courierOrderHref(c)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-mono font-bold shrink-0 hover:underline text-[11px]"
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
