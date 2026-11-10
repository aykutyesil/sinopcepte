"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser, Item, LiveEvent } from "@/lib/types";
import { fetchMe } from "@/lib/client-api";
import {
  getVenueProfile,
  isVenueOwner,
  getVenueEvents,
  deleteVenueEvent,
  toLiveEvent,
  type VenueProfileData,
  VENUE_UPDATED_EVENT,
} from "@/lib/venue-profile";
import { getCheckInState, type VenueCheckInState } from "@/lib/checkin";
import { CheckInModal } from "@/components/CheckInModal";
import { EditVenueModal } from "./EditVenueModal";
import { CreateVenueEventModal } from "./CreateVenueEventModal";
import { ClaimVenueModal } from "./ClaimVenueModal";

export function VenueProfileClient({
  item,
  initialProfile,
  allEvents = [],
}: {
  item: Item;
  initialProfile: VenueProfileData;
  allItems?: readonly Item[];
  allEvents?: readonly LiveEvent[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<VenueProfileData>(initialProfile);
  const [me, setMe] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "photos" | "events" | "swarm">("menu");

  const [editOpen, setEditOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [checkInState, setCheckInState] = useState<Record<string, VenueCheckInState>>({});

  const refreshProfile = () => {
    setProfile(getVenueProfile(item));
    setCheckInState(getCheckInState());
  };

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      if (alive) refreshProfile();
    }, 0);

    fetchMe().then((u) => {
      if (alive) setMe(u);
    }).catch(() => {});

    const onUpdate = () => refreshProfile();
    window.addEventListener(VENUE_UPDATED_EVENT, onUpdate);
    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener(VENUE_UPDATED_EVENT, onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const currentHandle = me?.handle || me?.username;
  const isOwner = isVenueOwner(currentHandle, profile.itemId);

  // Mekana ait etkinlikler (Portal etkinlikleri + mekan sahibinin ekledikleri)
  const venueEvents = useMemo(() => {
    const fromPortal = allEvents.filter(
      (e) =>
        e.venue.toLowerCase().includes(profile.title.toLowerCase()) ||
        profile.title.toLowerCase().includes(e.venue.toLowerCase())
    );
    const custom = getVenueEvents(profile.itemId).map(toLiveEvent);
    return [...custom, ...fromPortal];
  }, [allEvents, profile.itemId, profile.title]);

  const venueSwarm = checkInState[profile.itemId];
  const activeUsers = venueSwarm?.activeUsers || [];
  const mayor = venueSwarm?.mayor;

  // Menüyü kategorilerine göre grupla
  const groupedMenu = useMemo(() => {
    const map = new Map<string, typeof profile.menu>();
    profile.menu.forEach((m) => {
      const list = map.get(m.category) || [];
      list.push(m);
      map.set(m.category, list);
    });
    return Array.from(map.entries());
  }, [profile.menu]);

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 pb-20">
      {/* Üst Navigasyon */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090b14]/90 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition border border-slate-800"
          >
            <span>←</span>
            <span>Geri Dön</span>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <span className="font-display font-black text-white text-sm hidden xs:inline">
              Sinop<span className="text-rose-500">Cepte</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1.5"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Mekanı Yönet</span>
              </button>
            ) : !profile.ownerHandle ? (
              <button
                type="button"
                onClick={() => setClaimOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <span>🏪</span>
                <span className="hidden sm:inline">Patron Yetkisi İste</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-5 sm:pt-7 space-y-6">
        {/* Mekan Başlık & Kahraman Kartı */}
        <section className="rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#121630] via-[#0c1022] to-[#080b18] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {profile.badge}
                </span>
                <span className="text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  ★ {profile.rating}
                </span>

                {profile.ownerHandle && (
                  <Link
                    href={`/u/${profile.ownerHandle}`}
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1"
                    title="Mekan Sahibinin Profilini Gör"
                  >
                    <span>👑 Patron:</span>
                    <span className="font-mono">@{profile.ownerHandle}</span>
                    <span>↗</span>
                  </Link>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white font-display">
                {profile.title}
              </h1>

              <p className="text-xs sm:text-sm text-cyan-300/90 font-medium flex items-center gap-1.5">
                <span>📍</span>
                <span>{profile.location}</span>
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl pt-1">
                {profile.desc}
              </p>
            </div>

            {/* Hızlı Aksiyon Butonları */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow"
                >
                  <span>📞</span>
                  <span>{profile.phone}</span>
                </a>
              )}
              {profile.wa && (
                <a
                  href={`https://wa.me/${profile.wa.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow"
                >
                  <span>💬 WhatsApp</span>
                </a>
              )}
              <a
                href={profile.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow"
              >
                <span>🗺️ Haritada Aç</span>
              </a>
            </div>
          </div>

          {/* Patron Yetkisi Çubuğu */}
          {isOwner && (
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <span className="text-base">👑</span>
                <span>Bu mekanın onaylı patronusunuz. Bilgileri ve menüyü doğrudan düzenleyebilirsiniz.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEventOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1 shadow"
                >
                  <span>➕ Yeni Etkinlik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 shadow"
                >
                  <span>⚙️ Bilgileri Düzenle</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Sekme Butonları */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0b0e1e] rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "menu" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🍽️</span>
            <span>Menü & Fiyatlar ({profile.menu.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "photos" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📸</span>
            <span>Fotoğraflar ({profile.photos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "events" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎉</span>
            <span>Etkinlikler ({venueEvents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("swarm")}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "swarm" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📍</span>
            <span>Şu An Buradalar ({activeUsers.length})</span>
          </button>
        </div>

        {/* 1. SEKME: MENÜ BÖLÜMÜ */}
        {activeTab === "menu" && (
          <section className="space-y-6">
            {groupedMenu.length === 0 ? (
              <div className="p-12 text-center bg-[#090c1a] rounded-3xl border border-slate-800 text-slate-400 text-xs">
                Mekan henüz menü kalemi eklemedi.
              </div>
            ) : (
              groupedMenu.map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-base font-black text-white font-display flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>{category}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-[#0c1022] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white">{m.name}</h4>
                          <span className="text-sm font-black font-mono text-amber-400 shrink-0">
                            {m.price}
                          </span>
                        </div>
                        {m.desc && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {m.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* 2. SEKME: FOTOĞRAFLAR / GALERİ */}
        {activeTab === "photos" && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.photos.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPhoto(url)}
                  className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-400/50 cursor-pointer transition group relative shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${profile.title} mekan görseli ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    🔍 Büyüt
                  </div>
                </div>
              ))}
            </div>

            {profile.photos.length === 0 && (
              <div className="p-12 text-center bg-[#090c1a] rounded-3xl border border-slate-800 text-slate-400 text-xs">
                Mekan henüz fotoğraf yüklemedi.
              </div>
            )}
          </section>
        )}

        {/* 3. SEKME: MEKAN ETKİNLİKLERİ */}
        {activeTab === "events" && (
          <section className="space-y-4">
            {isOwner && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEventOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
                >
                  <span>➕ Yeni Canlı Program / Etkinlik Ekle</span>
                </button>
              </div>
            )}

            {venueEvents.length === 0 ? (
              <div className="p-12 text-center bg-[#090c1a] rounded-3xl border border-slate-800 text-slate-400 text-xs">
                Bu mekana ait planlanmış canlı yayın veya etkinlik bulunmuyor.
              </div>
            ) : (
              venueEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#121630] to-[#080b18] border border-rose-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {ev.badge}
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        ⏳ {ev.date}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white">{ev.title}</h4>
                    <p className="text-xs text-slate-300">{ev.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {ev.wa && (
                      <a
                        href={`https://wa.me/${ev.wa.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Merhaba ${profile.title}, ${ev.title} için masa ayırtmak istiyorum.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition text-center shadow"
                      >
                        ⚡ Masa Ayırt
                      </a>
                    )}
                    {isOwner && ev.id.startsWith("vev-") && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteVenueEvent(ev.id);
                          refreshProfile();
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs font-bold transition"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* 4. SEKME: SWARM & CHECK-IN */}
        {activeTab === "swarm" && (
          <section className="space-y-4">
            {/* Muhtar Kartı */}
            {mayor && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/50 via-amber-900/20 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👑</span>
                  <div>
                    <div className="text-[10px] uppercase font-mono font-bold text-amber-400">
                      Mekan Muhtarı (Mayor)
                    </div>
                    <Link
                      href={`/u/${mayor.handle}`}
                      className="text-sm font-black text-white hover:text-amber-300 transition flex items-center gap-1.5"
                    >
                      <span>{mayor.displayName || mayor.handle}</span>
                      <span className="text-xs text-slate-400 font-mono">(@{mayor.handle})</span>
                      <span className="text-xs text-amber-400">↗</span>
                    </Link>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {mayor.checkInCount} check-in
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Şu An Mekanda Olanlar ({activeUsers.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setCheckInOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow flex items-center gap-1"
              >
                <span>📍 Check-in Yap</span>
              </button>
            </div>

            <div className="space-y-2">
              {activeUsers.length === 0 ? (
                <div className="p-8 text-center bg-[#090c1a] rounded-3xl border border-slate-800 text-slate-400 text-xs">
                  Şu an bu mekanda aktif check-in bulunmuyor. İlk sen ol!
                </div>
              ) : (
                activeUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl bg-[#0c1022] border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/u/${u.handle}`}
                      className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition flex-1"
                    >
                      <span className="text-xl shrink-0 p-1 rounded-lg bg-slate-800">{u.avatar}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {u.displayName || u.handle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            @{u.handle}
                          </span>
                        </div>
                        {u.note && (
                          <p className="text-[11px] text-cyan-300/90 truncate italic">
                            “{u.note}”
                          </p>
                        )}
                      </div>
                    </Link>
                    <Link
                      href={`/u/${u.handle}`}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-slate-800 transition shrink-0"
                    >
                      Profili Gör →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox / Fotoğraf Büyütme Modalı */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Büyütülmüş fotoğraf"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modallar */}
      <EditVenueModal
        profile={profile}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={refreshProfile}
      />

      <CreateVenueEventModal
        profile={profile}
        isOpen={eventOpen}
        onClose={() => setEventOpen(false)}
        onCreated={refreshProfile}
      />

      <ClaimVenueModal
        profile={profile}
        currentUser={me}
        isOpen={claimOpen}
        onClose={() => setClaimOpen(false)}
        onSubmitted={refreshProfile}
      />

      {checkInOpen && (
        <CheckInModal
          item={item}
          currentUser={me}
          onClose={() => setCheckInOpen(false)}
          onUpdate={refreshProfile}
        />
      )}
    </div>
  );
}
