import type { LoadState, Pharmacy } from "@/lib/types";

export function PharmacyCard({ pharmacy, state }: { pharmacy: Pharmacy | null; state: LoadState }) {
  return (
    <div className="rounded-xl p-4 bg-[#111318] border border-slate-800/80 hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">Günün Nöbetçi Eczanesi</span>
        </div>
        {pharmacy && <span className="text-[9px] font-mono bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">AÇIK</span>}
      </div>

      {pharmacy ? (
        <>
          <h3 className="text-base font-bold text-white">{pharmacy.name}</h3>
          {pharmacy.address && <p className="text-xs text-slate-300 mt-1">{pharmacy.address}</p>}

          <div className="mt-3.5 flex gap-2">
            {pharmacy.mapUrl && (
              <a
                href={pharmacy.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
              >
                <span>📍 Haritada Yol Tarifi</span>
              </a>
            )}
            {pharmacy.phoneFormatted && (
              <a
                href={`tel:${pharmacy.phoneFormatted}`}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-bold text-xs transition"
                aria-label={`${pharmacy.name} telefon`}
              >
                📞
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-400 mt-1">
          {state === "loading"
            ? "Yükleniyor..."
            : state === "error"
              ? "Nöbetçi eczane bilgisi şu an alınamadı."
              : "Bugünün nöbetçi eczanesi henüz yüklenmedi."}
        </p>
      )}
    </div>
  );
}
