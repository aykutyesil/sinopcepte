"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { avatarEmoji } from "@/lib/avatars";
import type { AuthUser, Item, LiveEvent } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { EventCard } from "@/components/EventCard";
import { CheckInModal } from "@/components/CheckInModal";

type VenueSubFilter = "all" | "pub" | "kafe" | "etkinlik" | "tekel" | "eczane" | "taksi";

const SUB_FILTERS: { key: VenueSubFilter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "pub", label: "Pub & Bar" },
  { key: "kafe", label: "Kafe & Bistro" },
  { key: "etkinlik", label: "Canlı Sahne & Maç" },
  { key: "tekel", label: "Gece Tekel" },
  { key: "eczane", label: "Nöbetçi Eczane" },
  { key: "taksi", label: "Taksi" },
];

export function VenueFeed({
  items,
  events,
  me,
  query = "",
}: {
  items: readonly Item[];
  events: readonly LiveEvent[];
  me?: AuthUser | null;
  query?: string;
}) {
  const router = useRouter();
  const [subFilter, setSubFilter] = useState<VenueSubFilter>("all");
  const [selectedVenueForCheckin, setSelectedVenueForCheckin] = useState<Item | null>(null);

  const handleQuickCheckinClick = () => {
    if (!me) {
      router.push("/giris");
      return;
    }
    const firstVenue = items.find((i) => i.category === "mekan") || items[0];
    if (firstVenue) {
      setSelectedVenueForCheckin(firstVenue);
    }
  };

  const cleanQ = query.toLowerCase().trim();

  const filteredEvents = events.filter((e) => {
    if (subFilter !== "all" && subFilter !== "etkinlik") return false;
    if (!cleanQ) return true;
    return (
      e.title.toLowerCase().includes(cleanQ) ||
      e.venue.toLowerCase().includes(cleanQ) ||
      e.desc.toLowerCase().includes(cleanQ)
    );
  });

  const filteredItems = items.filter((item) => {
    if (subFilter === "etkinlik") return false;

    if (subFilter === "pub") {
      if (item.category !== "mekan") return false;
      const text = `${item.title} ${item.desc} ${item.badge || ""}`.toLowerCase();
      const isPub = text.includes("pub") || text.includes("bar") || text.includes("bira") || text.includes("kokteyl");
      if (!isPub) return false;
    } else if (subFilter === "kafe") {
      if (item.category !== "mekan") return false;
      const text = `${item.title} ${item.desc} ${item.badge || ""}`.toLowerCase();
      const isPub = text.includes("pub") || text.includes("bar") || text.includes("bira") || text.includes("kokteyl");
      if (isPub) return false;
    } else if (subFilter !== "all" && item.category !== subFilter) {
      return false;
    }

    if (!cleanQ) return true;
    return (
      item.title.toLowerCase().includes(cleanQ) ||
      item.location.toLowerCase().includes(cleanQ) ||
      item.desc.toLowerCase().includes(cleanQ) ||
      item.category.toLowerCase().includes(cleanQ)
    );
  });

  return (
    <div className="space-y-4">
      {/* Twitter (X) Tarzı Sade Check-In Kutusu */}
      <section className="p-3 sm:p-4 rounded-2xl bg-[#0c0f17] border border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-base shrink-0 select-none">
          {me ? avatarEmoji(me.avatar) : "👤"}
        </div>
        <button
          type="button"
          onClick={handleQuickCheckinClick}
          className="flex-1 text-left px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 text-xs sm:text-sm text-slate-400 hover:text-slate-300 transition flex items-center justify-between"
        >
          <span className="truncate">📍 Şu an hangi mekandasın? Bir check-in bırak...</span>
          <span className="hidden xs:inline-block px-2.5 py-1 rounded-lg bg-white text-slate-950 font-bold text-xs shrink-0 ml-2">
            Check-in
          </span>
        </button>
      </section>

      {/* Alt Kategori Filtre Çipleri */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SUB_FILTERS.map((f) => {
          const isSelected = subFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setSubFilter(f.key)}
              className={`transition shrink-0 ${
                isSelected
                  ? "bg-white text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs px-3 py-1.5 rounded-lg border border-transparent"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Akış (Feed) */}
      <div className="space-y-3">
        {/* Canlı Etkinlikler (Üstte) */}
        {filteredEvents.length > 0 && (
          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}

        {/* Mekanlar */}
        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} currentUser={me} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0c0f17] border border-slate-800/80 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Aradığınız kriterde mekan veya etkinlik bulunamadı</p>
            <p className="text-xs text-slate-400">Filtreleri değiştirmeyi veya aramayı temizlemeyi deneyin.</p>
          </div>
        ) : null}
      </div>

      {/* Check-In Modalı */}
      {selectedVenueForCheckin && (
        <CheckInModal
          item={selectedVenueForCheckin}
          currentUser={me}
          onClose={() => setSelectedVenueForCheckin(null)}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
