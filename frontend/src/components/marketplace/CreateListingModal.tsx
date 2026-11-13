"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/types";
import {
  createMarketplaceItem,
  MARKETPLACE_CATEGORIES,
  CONDITION_LABELS,
  type ItemCondition,
  type MarketplaceCategory,
} from "@/lib/marketplace";

const INPUT =
  "w-full bg-[#0a0d1d] border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition font-medium";

export function CreateListingModal({
  me,
  onClose,
  onCreated,
}: {
  me: AuthUser;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Exclude<MarketplaceCategory, "all">>("ders_notu");
  const [price, setPrice] = useState<string>("0");
  const [condition, setCondition] = useState<ItemCondition>("iyi");
  const [location, setLocation] = useState("Sinop Üniversitesi Kampüs");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [phone, setPhone] = useState(me.phone || "05");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert("Lütfen ilan başlığı girin.");
      return;
    }
    const cleanDesc = description.trim();
    if (!cleanDesc) {
      alert("Lütfen ilan açıklaması girin.");
      return;
    }

    const numPrice = Number(price.replace(/[^0-9]/g, "")) || 0;
    const cleanPhone = phone.trim();
    const cleanWa = cleanPhone.replace(/[^0-9]/g, "");

    setSubmitting(true);
    try {
      createMarketplaceItem({
        title: cleanTitle,
        category,
        price: numPrice,
        condition,
        location: location.trim() || "Sinop Merkez",
        description: cleanDesc,
        sellerHandle: me.handle || me.username,
        sellerName: me.handle || me.username,
        sellerAvatar: me.avatar || "marti",
        phone: cleanPhone,
        wa: cleanWa.startsWith("90") ? cleanWa : cleanWa.startsWith("0") ? "9" + cleanWa : "90" + cleanWa,
        photos: photoUrl.trim() ? [photoUrl.trim()] : [],
      });
      onCreated();
      onClose();
    } catch {
      alert("İlan kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0f1428] border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white font-display flex items-center gap-2">
              <span>📢</span>
              <span>2. El &amp; Öğrenci İlanı Ver</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ders notu, bisiklet, eşya veya elektronik eşyalarını Sinoplu öğrencilere ulaştır
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Başlık */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              İlan Başlığı <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2. Sınıf Veri Yapıları Vize Notları veya Bisan Dağ Bisikleti"
              className={INPUT}
              required
            />
          </div>

          {/* Kategori & Fiyat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<MarketplaceCategory, "all">)}
                className={INPUT}
              >
                {Object.entries(MARKETPLACE_CATEGORIES).map(([catKey, catVal]) => (
                  <option key={catKey} value={catKey}>
                    {catVal.icon} {catVal.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Fiyat (₺) <span className="text-slate-500 font-normal">(0 = Ücretsiz)</span>
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Örn: 250 veya 0"
                className={INPUT}
              />
            </div>
          </div>

          {/* Durum & Konum */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Ürün Durumu</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className={INPUT}
              >
                {Object.entries(CONDITION_LABELS).map(([condKey, condVal]) => (
                  <option key={condKey} value={condKey}>
                    {condVal.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Teslim / Konum</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Örn: SNÜ Kampüs, Kefevi Mah., İskele"
                className={INPUT}
              />
            </div>
          </div>

          {/* İletişim Telefonu */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              İletişim Telefon / WhatsApp <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Örn: 0532 571 34 57"
              className={INPUT}
              required
            />
          </div>

          {/* Görsel URL (Opsiyonel) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Fotoğraf Bağlantısı (URL) <span className="text-slate-500 font-normal">(Opsiyonel)</span>
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (boş bırakılabilir)"
              className={INPUT}
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Açıklama &amp; Detaylar <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ürünün temizliği, varsa eksikleri, ders notunun içeriği vb. detayları yazın..."
              className={INPUT}
              required
            />
          </div>

          {/* Gönder Butonu */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs transition shadow-lg shadow-cyan-950/40 active:scale-98 disabled:opacity-50"
            >
              {submitting ? "Kaydediliyor..." : "📢 İlanı Yayınla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
