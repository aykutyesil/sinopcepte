import type { LoadState, Pharmacy } from "@/lib/types";

// Legacy "Nöbetçi Eczane Radar Kartı" (index.html:239-269). Veri: GET /api/pharmacy/today.

export function PharmacyCard({ pharmacy, state }: { pharmacy: Pharmacy | null; state: LoadState }) {
  return (
    <div className="rounded-3xl p-5 bg-linear-to-br/srgb from-rose-950/70 to-[#12162a] border border-rose-500/40 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Günün Nöbetçi Eczanesi</span>
        </div>
        {/* Legacy'deki `py-0.2` v3'te sınıf üretmiyordu (dikey dolgu yok); v4'te 0.8px üreteceği için çıkarıldı. */}
        {pharmacy && <span className="text-[9px] font-mono bg-rose-500 text-white font-bold px-1.5 rounded-sm">AÇIK</span>}
      </div>

      {pharmacy ? (
        <>
          <h3 className="text-base font-black text-white">{pharmacy.name}</h3>
          {pharmacy.address && <p className="text-xs text-slate-300 mt-1">{pharmacy.address}</p>}

          <div className="mt-4 flex gap-2">
            {pharmacy.mapUrl && (
              <a
                href={pharmacy.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
              >
                <span>📍 Haritada Yol Tarifi</span>
              </a>
            )}
            {pharmacy.phoneFormatted && (
              <a
                href={`tel:${pharmacy.phoneFormatted}`}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                aria-label={`${pharmacy.name} telefon`}
              >
                📞
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-300 mt-1">
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
