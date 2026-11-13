"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cancelTaxiLobby,
  fetchTaxiLobbies,
  joinTaxiLobby,
  leaveTaxiLobby,
  type TaxiLobby,
} from "@/lib/taxi";
import type { AuthUser } from "@/lib/types";
import { TaxiLobbyCard } from "./TaxiLobbyCard";
import { CreateTaxiLobbyModal } from "./CreateTaxiLobbyModal";

const DESTINATION_FILTERS = [
  { key: "all", label: "Tüm Güzergahlar" },
  { key: "Havalimanı", label: "✈️ Havalimanı" },
  { key: "Otogar", label: "🚌 Otogar" },
  { key: "Kampüs", label: "🎓 SNÜ Kampüs" },
  { key: "Hamsilos", label: "🌲 Hamsilos & Akliman" },
];

export function SharedTaxiFeed({ currentUser }: { currentUser?: AuthUser | null }) {
  const [lobbies, setLobbies] = useState<TaxiLobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadLobbies = async () => {
    try {
      setLoading(true);
      const data = await fetchTaxiLobbies({
        destination: selectedDest !== "all" ? selectedDest : undefined,
        status: onlyOpen ? "OPEN" : undefined,
      });
      setLobbies(data);
    } catch {
      // sessiz hata yönetimi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLobbies();
  }, [selectedDest, onlyOpen]);

  const handleJoin = async (lobbyId: string, phone?: string) => {
    const updated = await joinTaxiLobby(lobbyId, phone);
    setLobbies((prev) => prev.map((l) => (l.id === lobbyId ? updated : l)));
  };

  const handleLeave = async (lobbyId: string) => {
    const updated = await leaveTaxiLobby(lobbyId);
    setLobbies((prev) => prev.map((l) => (l.id === lobbyId ? updated : l)));
  };

  const handleCancel = async (lobbyId: string) => {
    await cancelTaxiLobby(lobbyId);
    setLobbies((prev) =>
      prev.map((l) => (l.id === lobbyId ? { ...l, status: "COMPLETED" } : l))
    );
  };

  const handleCreated = (newLobby: TaxiLobby) => {
    setLobbies((prev) => [newLobby, ...prev]);
  };

  return (
    <div className="space-y-4">
      {/* Tanıtım / Bilgilendirme Bannerı */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚖</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Canlı Taksi Lobisi &amp; Masraf Paylaşımı
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            Havalimanı, Otogar ve Kampüs yolculuklarında taksi ücretini 4&apos;e böl! Hem bütçeni koru hem de aynı güzergaha giden SinopCepte üyeleriyle güvenle seyahat et.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              alert("Lobi açmak için lütfen giriş yapın.");
              return;
            }
            setModalOpen(true);
          }}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-1.5"
        >
          <span>🚕</span>
          <span>Taksiye Kişi Ara / Lobi Aç</span>
        </button>
      </div>

      {/* Filtre Çubukları */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {DESTINATION_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSelectedDest(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedDest === f.key
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
          />
          <span>Yalnızca Yer Olan Açık Lobiler</span>
        </label>
      </div>

      {/* Lobiler Listesi */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Taksi lobileri taranıyor...</p>
        </div>
      ) : lobbies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3">
          <span className="text-3xl block">🚕💨</span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Şu an bu kriterlerde açık taksi lobisi yok
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gideceğin yeri seçip ilk taksi lobisini sen başlatabilir, taksi masrafını diğer yolcularla bölüşebilirsin.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
          >
            Hemen Lobi Başlat →
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lobbies.map((lobby) => (
            <TaxiLobbyCard
              key={lobby.id}
              lobby={lobby}
              currentUser={currentUser}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Lobi Açma Modalı */}
      <CreateTaxiLobbyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCreated}
        currentUser={currentUser}
      />
    </div>
  );
}
