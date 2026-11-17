"use client";

import Link from "next/link";
import { formatPhone } from "@/lib/feed";
import type { Item, LoadState } from "@/lib/types";
import { railListPlaceholder } from "./placeholder";

export function TaxiCard({
  taxis,
  state,
  onOpenTaxiLobby,
}: {
  taxis: readonly Item[];
  state: LoadState;
  onOpenTaxiLobby?: () => void;
}) {
  const handleLobbyClick = () => {
    if (onOpenTaxiLobby) {
      onOpenTaxiLobby();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sinop:switch-tab", { detail: "taksi" }));
    }
  };

  return (
    <div className="rounded-xl p-4 bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-white">🚖 7/24 Taksi Durakları</h4>
        <span className="text-[10px] font-mono text-amber-400 font-bold">HAZIR</span>
      </div>

      {/* 🚖 Ortak Taksi Hızlı Geçiş Butonu */}
      <button
        type="button"
        onClick={handleLobbyClick}
        className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition flex items-center justify-between gap-1"
      >
        <span className="truncate">🚕 Ortak Taksi Masraf Paylaşımı</span>
        <span className="shrink-0 text-sm">→</span>
      </button>

      <div className="space-y-1.5 text-xs">
        {taxis.length === 0 ? (
          <p className="p-2 text-slate-400">{railListPlaceholder(state === "ok" ? "none" : state)}</p>
        ) : (
          taxis.map((t) => (
            <div
              key={t.id}
              className="p-2 rounded-lg bg-[#0c0e14] hover:bg-slate-900 text-slate-300 border border-slate-800/60 transition flex justify-between items-center gap-2 group"
            >
              <Link
                href={`/mekan/${t.id}`}
                className="font-semibold truncate min-w-0 hover:text-white hover:underline"
                title={`${t.title} profili ve konumu`}
              >
                {t.title}
              </Link>
              <a
                href={`tel:${t.phone}`}
                className="font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0 text-[11px]"
                aria-label={`${t.title} ara`}
              >
                {formatPhone(t.phone)}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
