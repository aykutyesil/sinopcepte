"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";
import {
  CONFESSION_CATEGORIES,
  CONFESSIONS_UPDATED_EVENT,
  fetchConfessionsFromBackend,
  getConfessions,
  type Confession,
  type ConfessionCategory,
} from "@/lib/confessions";
import { ConfessionCard } from "./ConfessionCard";
import { CreateConfessionModal } from "./CreateConfessionModal";

export function ConfessionFeed({ me }: { me?: AuthUser | null }) {
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [sort, setSort] = useState<"new" | "hot">("new");
  const [activeCategory, setActiveCategory] = useState<ConfessionCategory | "all">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(me && (me.handle || me.username));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConfessionsFromBackend(
        sort,
        activeCategory === "all" ? undefined : activeCategory
      );
      setConfessions(data);
    } catch {
      setConfessions(getConfessions());
    } finally {
      setLoading(false);
    }
  }, [sort, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    const onUpdated = () => loadData();
    window.addEventListener(CONFESSIONS_UPDATED_EVENT, onUpdated);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONFESSIONS_UPDATED_EVENT, onUpdated);
    };
  }, [loadData]);

  const handleOpenCreate = () => {
    if (!isLoggedIn) {
      router.push("/giris");
      return;
    }
    setCreateModalOpen(true);
  };

  const handleConfessionCreated = (newConfession: Confession) => {
    setConfessions((prev) => [newConfession, ...prev.filter((c) => c.id !== newConfession.id)]);
  };

  const handleConfessionDeleted = (id: string) => {
    setConfessions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleConfessionUpdated = (updated: Confession) => {
    setConfessions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <div className="space-y-4">
      {/* Üst Banner & CTA */}
      <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-indigo-950/70 via-[#10142e] to-[#0a0d1a] border border-indigo-500/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🤫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-white font-display">
                    Sinop Gece İtirafları
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    %100 ANONİM
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kimliğini gizle, Sinop gecesinde olup bitenleri veya kimseye diyemediklerini anlat!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <span>+ İtiraf Yaz</span>
              <span>🤫</span>
            </button>
          </div>

          {/* İstatistik & Bilgi Çubuğu */}
          <div className="pt-2 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-200/80 font-mono">
            <span>🌙 Karadeniz dalgaları sırrını saklar</span>
            <span>🔒 Sıfır isim sızıntısı garantisi</span>
          </div>
        </div>
      </div>

      {/* Filtre ve Sıralama Çubuğu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Kategori Hapları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
              activeCategory === "all"
                ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                : "bg-slate-900/90 text-slate-400 hover:text-white border-slate-800"
            }`}
          >
            Tümü ({confessions.length})
          </button>
          {(Object.keys(CONFESSION_CATEGORIES) as ConfessionCategory[]).map((catKey) => {
            const info = CONFESSION_CATEGORIES[catKey];
            const isSel = activeCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border flex items-center gap-1 ${
                  isSel
                    ? `${info.badgeClass} ring-1 ring-white/30`
                    : "bg-slate-900/90 text-slate-400 hover:text-white border-slate-800"
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sıralama Toggles (En Yeniler / Trendler) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSort("new")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
              sort === "new" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            ✨ En Yeniler
          </button>
          <button
            type="button"
            onClick={() => setSort("hot")}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
              sort === "hot" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            🔥 Trendler
          </button>
        </div>
      </div>

      {/* İtiraf Akışı */}
      {loading && confessions.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-mono text-xs">
          İtiraflar yükleniyor...
        </div>
      ) : confessions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#090c1a] border border-slate-800 text-center space-y-3">
          <div className="text-4xl">🤫</div>
          <h3 className="text-white font-bold text-base">Bu kategoride henüz itiraf yok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            İlk itirafı sen yaz, Sinop gecesi hareketlensin!
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            + İlk İtirafı Sen Yaz
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {confessions.map((confession) => (
            <ConfessionCard
              key={confession.id}
              confession={confession}
              me={me}
              onDeleted={() => handleConfessionDeleted(confession.id)}
              onUpdated={handleConfessionUpdated}
            />
          ))}
        </div>
      )}

      {/* İtiraf Ekle Modalı */}
      <CreateConfessionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleConfessionCreated}
      />
    </div>
  );
}
