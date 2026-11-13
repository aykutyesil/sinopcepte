"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { avatarEmoji } from "@/lib/avatars";
import type { AuthUser } from "@/lib/types";
import {
  getMarketplaceItems,
  deleteMarketplaceItem,
  markItemAsSold,
  filterMarketplaceItems,
  MARKETPLACE_CATEGORIES,
  CONDITION_LABELS,
  MARKETPLACE_UPDATED_EVENT,
  type MarketplaceCategory,
  type MarketplaceItem,
} from "@/lib/marketplace";
import { CreateListingModal } from "./CreateListingModal";

export function MarketplaceFeed({
  me,
  initialQuery = "",
}: {
  me?: AuthUser | null;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<MarketplaceItem[]>(getMarketplaceItems);
  const [category, setCategory] = useState<MarketplaceCategory>("all");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setItems(getMarketplaceItems());
    window.addEventListener(MARKETPLACE_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MARKETPLACE_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleOpenCreate = () => {
    if (!me) {
      router.push("/giris");
      return;
    }
    setModalOpen(true);
  };

  const filtered = filterMarketplaceItems(items, { category, query: initialQuery });
  const isAdmin = Boolean(me?.roles?.includes("ADMIN"));
  const myHandle = (me?.handle || me?.username || "").toLowerCase().replace(/^@/, "");

  return (
    <div className="space-y-4">
      {/* Twitter (X) Tarzı Sade İlan Kutusu */}
      <section className="p-3 sm:p-4 rounded-2xl bg-[#0c0f17] border border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-base shrink-0 select-none">
          {me ? avatarEmoji(me.avatar) : "📦"}
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex-1 text-left px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 text-xs sm:text-sm text-slate-400 hover:text-slate-300 transition flex items-center justify-between"
        >
          <span className="truncate">Ders notu, eşya veya 2. el ilanı paylaş...</span>
          <span className="hidden xs:inline-block px-2.5 py-1 rounded-lg bg-white text-slate-950 font-bold text-xs shrink-0 ml-2">
            İlan Ver
          </span>
        </button>
      </section>

      {/* Kategori Filtre Çipleri */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`transition shrink-0 ${
            category === "all"
              ? "bg-white text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs px-3 py-1.5 rounded-lg border border-transparent"
          }`}
        >
          Tümü ({items.length})
        </button>

        {Object.entries(MARKETPLACE_CATEGORIES).map(([catKey, catVal]) => {
          const isSelected = category === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setCategory(catKey as MarketplaceCategory)}
              className={`transition shrink-0 ${
                isSelected
                  ? "bg-white text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs px-3 py-1.5 rounded-lg border border-transparent"
              }`}
            >
              {catVal.label}
            </button>
          );
        })}
      </div>

      {/* İlan Listesi (Feed) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0c0f17] border border-slate-800/80 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Bu kategoride henüz ilan bulunmuyor</p>
            <p className="text-xs text-slate-400">İlk ilanı sen vererek Sinoplu öğrencilere yardımcı olabilirsin!</p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition"
            >
              İlan Oluştur
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const catInfo = MARKETPLACE_CATEGORIES[item.category] || MARKETPLACE_CATEGORIES.diger;
            const condInfo = CONDITION_LABELS[item.condition] || CONDITION_LABELS.iyi;
            const isOwner = myHandle === item.sellerHandle.toLowerCase().replace(/^@/, "");
            const canManage = isOwner || isAdmin;
            const isFree = item.price === 0;

            return (
              <article
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#0c0f17] border transition space-y-3 ${
                  item.status === "sold"
                    ? "border-slate-800/60 opacity-60"
                    : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Üst Satıcı & Kategori Barı */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      href={`/u/${item.sellerHandle}`}
                      className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-base shrink-0 select-none hover:border-slate-500 transition"
                      title={`@${item.sellerHandle} profilini gör`}
                    >
                      {avatarEmoji(item.sellerAvatar)}
                    </Link>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/u/${item.sellerHandle}`}
                          className="font-semibold text-white text-xs sm:text-sm hover:underline truncate"
                        >
                          @{item.sellerHandle}
                        </Link>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          {catInfo.label}
                        </span>
                        {item.status === "sold" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-300 border border-rose-800/60">
                            SATILDI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{item.location}</span>
                        <span>•</span>
                        <span className="text-[10px] text-slate-400">
                          {condInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fiyat Göstergesi */}
                  <div className="text-right shrink-0">
                    {isFree ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/50 inline-block">
                        Ücretsiz
                      </span>
                    ) : (
                      <span className="text-base sm:text-lg font-bold text-white font-mono">
                        {item.price.toLocaleString("tr-TR")} ₺
                      </span>
                    )}
                  </div>
                </div>

                {/* İlan Başlığı & Açıklama */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm sm:text-base text-white leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>

                {/* Fotoğraf (Varsa) */}
                {item.photos && item.photos.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 max-h-64 sm:max-h-80 bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Alt İletişim & Aksiyon Barı */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {item.wa && (
                      <a
                        href={`https://wa.me/${item.wa}?text=${encodeURIComponent(
                          `Selam @${item.sellerHandle}, SinopCepte üzerinden "${item.title}" ilanınız için yazıyorum!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition inline-flex items-center gap-1.5"
                      >
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition inline-flex items-center gap-1.5"
                      >
                        <span>Ara</span>
                      </a>
                    )}
                  </div>

                  {/* Sahibi veya Admin Kontrolleri */}
                  {canManage && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => markItemAsSold(item.id)}
                        className="px-2.5 py-1 rounded-md border border-slate-700 text-slate-300 text-[11px] font-medium transition hover:border-slate-500 hover:text-white"
                      >
                        {item.status === "sold" ? "Yayına Al" : "Satıldı Yap"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
                            deleteMarketplaceItem(item.id);
                          }
                        }}
                        className="px-2 py-1 rounded-md bg-rose-950/40 hover:bg-rose-900 text-rose-300 text-[11px] font-medium border border-rose-800/60 transition"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* İlan Verme Modalı */}
      {modalOpen && me && (
        <CreateListingModal
          me={me}
          onClose={() => setModalOpen(false)}
          onCreated={() => setItems(getMarketplaceItems())}
        />
      )}
    </div>
  );
}
