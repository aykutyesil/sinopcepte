"use client";

import { useState } from "react";
import type { MenuItem, VenueProfileData } from "@/lib/venue-profile";
import { saveVenueProfile } from "@/lib/venue-profile";

export function EditVenueModal({
  profile,
  isOpen,
  onClose,
  onSaved,
}: {
  profile: VenueProfileData;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(profile.title);
  const [location, setLocation] = useState(profile.location);
  const [phone, setPhone] = useState(profile.phone);
  const [wa, setWa] = useState(profile.wa);
  const [mapUrl, setMapUrl] = useState(profile.mapUrl);
  const [desc, setDesc] = useState(profile.desc);
  const [badge, setBadge] = useState(profile.badge);
  const [photos, setPhotos] = useState<string[]>(profile.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const [menu, setMenu] = useState<MenuItem[]>(profile.menu || []);
  const [newMenuCat, setNewMenuCat] = useState("Öne Çıkanlar");
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuDesc, setNewMenuDesc] = useState("");

  const [activeTab, setActiveTab] = useState<"info" | "photos" | "menu">("info");

  if (!isOpen) return null;

  const handleAddPhoto = () => {
    const url = newPhotoUrl.trim();
    if (url) {
      setPhotos([...photos, url]);
      setNewPhotoUrl("");
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleAddMenuItem = () => {
    if (!newMenuName.trim() || !newMenuPrice.trim()) return;
    const item: MenuItem = {
      id: "menu-" + Date.now(),
      category: newMenuCat.trim() || "Diğer",
      name: newMenuName.trim(),
      price: newMenuPrice.trim(),
      desc: newMenuDesc.trim() || undefined,
    };
    setMenu([...menu, item]);
    setNewMenuName("");
    setNewMenuPrice("");
    setNewMenuDesc("");
  };

  const handleRemoveMenuItem = (id: string) => {
    setMenu(menu.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveVenueProfile({
      itemId: profile.itemId,
      title: title.trim() || profile.title,
      location: location.trim() || profile.location,
      phone: phone.trim(),
      wa: wa.trim(),
      mapUrl: mapUrl.trim(),
      desc: desc.trim(),
      badge: badge.trim() || profile.badge,
      photos,
      menu,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0c1022] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-display">
                Mekan Profilini Düzenle
              </h3>
              <p className="text-[11px] text-amber-300 font-mono">
                {profile.title} • Patron Yetkisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Butonları */}
        <div className="flex gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === "info" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🏢 Temel Bilgiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === "photos" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            📸 Fotoğraflar ({photos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === "menu" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🍽️ Menü ({menu.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {activeTab === "info" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Mekan Başlığı</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Kategori / Rozet</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Açık Adres / Konum</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Örn: İskele Caddesi No:12"
                    className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Telefon Numarası</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">WhatsApp Sipariş / Rezerve</label>
                  <input
                    type="text"
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    placeholder="905xxxxxxxxx"
                    className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Google Maps / Harita Linki</label>
                <input
                  type="text"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Mekan Açıklaması & Konsepti</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === "photos" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Fotoğraf URL'si ekle (https://...)"
                  className="flex-1 p-2.5 rounded-xl bg-[#080b18] border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
                >
                  + Ekle
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {photos.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-slate-800 group h-28 bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Mekan fotoğrafı ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 text-white text-xs flex items-center justify-center opacity-80 hover:opacity-100 transition shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#080b18] border border-slate-800 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMenuCat}
                    onChange={(e) => setNewMenuCat(e.target.value)}
                    placeholder="Kategori (Örn: Kokteyller)"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="Ürün Adı"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={newMenuPrice}
                    onChange={(e) => setNewMenuPrice(e.target.value)}
                    placeholder="Fiyat (Örn: 220 ₺)"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs col-span-2 sm:col-span-1"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMenuDesc}
                    onChange={(e) => setNewMenuDesc(e.target.value)}
                    placeholder="İçerik açıklaması (İsteğe bağlı)"
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMenuItem}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs shrink-0"
                  >
                    + Ürünü Ekle
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {menu.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {m.category}
                        </span>
                        <span className="font-bold text-white truncate">{m.name}</span>
                        <span className="text-emerald-400 font-mono font-bold shrink-0">{m.price}</span>
                      </div>
                      {m.desc && <p className="text-[11px] text-slate-400 truncate mt-0.5">{m.desc}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMenuItem(m.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 text-xs shrink-0"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-slate-950 font-black shadow-lg shadow-amber-950/40 transition"
            >
              💾 Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
