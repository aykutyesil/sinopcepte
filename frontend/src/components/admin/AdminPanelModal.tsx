"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildAdminPayload, EMPTY_ADMIN_FORM, resetAfterSave, type AdminForm } from "@/lib/admin";
import { ApiError, createEvent, createItem, deleteEvent, deleteItem } from "@/lib/client-api";
import type { Item, LiveEvent } from "@/lib/types";
import {
  getVenueClaims,
  updateVenueClaim,
  assignVenueOwner,
  getVenueProfile,
  type VenueClaimRequest,
  VENUE_UPDATED_EVENT,
} from "@/lib/venue-profile";

// Legacy "YÖNETİM PANELİ MODALI" (index.html:336-391) + saveAdminItem/deleteLiveEvent/deleteAdminItem.
// localStorage yerine /api/admin/*; her değişiklikten sonra sunucu verisi yenilenir.

const INPUT = "w-full bg-[#080b18] border border-slate-800 rounded-xl p-2.5 text-white";

export function AdminPanelModal({
  events,
  items,
  onClose,
  onChanged,
  onUnauthorized,
}: {
  events: readonly LiveEvent[];
  items: readonly Item[];
  onClose: () => void;
  onChanged: () => void;
  onUnauthorized: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"catalog" | "claims">("catalog");
  const [form, setForm] = useState<AdminForm>(EMPTY_ADMIN_FORM);
  const [busy, setBusy] = useState(false);

  // Sahiplik & Talepler State
  const [claims, setClaims] = useState<VenueClaimRequest[]>([]);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || "");
  const [assignHandle, setAssignHandle] = useState("");

  const refreshClaims = () => {
    setClaims(getVenueClaims());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshClaims();
    }, 0);
    const onUpdate = () => refreshClaims();
    window.addEventListener(VENUE_UPDATED_EVENT, onUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(VENUE_UPDATED_EVENT, onUpdate);
    };
  }, []);

  const set = (k: keyof AdminForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fail = (e: unknown) => {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      alert("Oturum süresi doldu, lütfen tekrar giriş yapın.");
      onUnauthorized();
      return;
    }
    alert("İşlem başarısız oldu. Lütfen tekrar deneyin.");
  };

  const save = async () => {
    const payload = buildAdminPayload(form);
    if (payload.kind === "invalid") {
      alert(payload.message);
      return;
    }
    setBusy(true);
    try {
      if (payload.kind === "event") await createEvent(payload.data);
      else await createItem(payload.data);
      onChanged();
      setForm(resetAfterSave(form));
      alert("Kayıt başarıyla eklendi ve akışa verildi!");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const removeEvent = async (id: string) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      await deleteEvent(id);
      onChanged();
    } catch (e) {
      fail(e);
    }
  };

  const removeItem = async (id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await deleteItem(id);
      onChanged();
    } catch (e) {
      fail(e);
    }
  };

  const handleClaimAction = (claimId: string, status: "APPROVED" | "REJECTED") => {
    updateVenueClaim(claimId, status);
    refreshClaims();
    onChanged();
  };

  const handleAssignOwner = () => {
    if (!selectedItemId || !assignHandle.trim()) return;
    assignVenueOwner(selectedItemId, assignHandle.trim());
    setAssignHandle("");
    refreshClaims();
    alert("Mekan patronu başarıyla atandı!");
    onChanged();
  };

  const handleRemoveOwner = (itemId: string) => {
    assignVenueOwner(itemId, null);
    refreshClaims();
    onChanged();
  };

  const pendingClaims = claims.filter((c) => c.status === "PENDING");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0f1428] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-white">SinopCepte Yönetim Paneli</h3>
            <p className="text-[11px] text-slate-400 font-mono">Yetkili Yönetici: @aykut & @oguzhan</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-lg" aria-label="Kapat">
            ✕
          </button>
        </div>

        {/* Panel Sekmeleri */}
        <div className="flex gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "catalog" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⚡ İçerik & Akış Yönetimi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("claims")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "claims" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🏪 Mekan Patronu Yetkileri</span>
            {pendingClaims.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse">
                {pendingClaims.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "catalog" ? (
          <>
            <div className="space-y-4 text-xs font-mono">
              <h4 className="font-bold text-rose-400">+ Yeni Kayıt Ekle (Etkinlik veya İşletme)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1" htmlFor="adminTitle">Başlık / Etkinlik Adı</label>
                  <input id="adminTitle" type="text" value={form.title} onChange={set("title")} placeholder="Örn: Galatasaray - Amed Maçı veya DJ Burkay" className={INPUT} />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1" htmlFor="adminCategory">Kategori / Alan</label>
                  <select id="adminCategory" value={form.category} onChange={set("category")} className={INPUT}>
                    <option value="etkinlik">🔥 Canlı Sahne & Maç Yayını</option>
                    <option value="mekan">🍸 Mekan & Kafe</option>
                    <option value="tekel">🏪 Tekel & Gece Açık</option>
                    <option value="taksi">🚖 Taksi Durağı</option>
                    <option value="eczane">💊 Nöbetçi Eczane</option>
                    <option value="cicek">💐 Çiçek & Hediye</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1" htmlFor="adminBadge">Rozet / Zaman</label>
                  <input id="adminBadge" type="text" value={form.badge} onChange={set("badge")} placeholder="Örn: ⚽ CANLI MAÇ veya Bugün • 20:00" className={INPUT} />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1" htmlFor="adminLocation">Mekan / Konum</label>
                  <input id="adminLocation" type="text" value={form.location} onChange={set("location")} placeholder="Örn: Nihavent Pub • İskele" className={INPUT} />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1" htmlFor="adminPhone">Telefon</label>
                  <input id="adminPhone" type="text" value={form.phone} onChange={set("phone")} placeholder="Örn: 05441234567" className={INPUT} />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1" htmlFor="adminWa">WhatsApp No</label>
                  <input id="adminWa" type="text" value={form.wa} onChange={set("wa")} placeholder="Örn: 905441234567" className={INPUT} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1" htmlFor="adminDesc">Açıklama</label>
                  <input id="adminDesc" type="text" value={form.desc} onChange={set("desc")} placeholder="Akış açıklaması..." className={INPUT} />
                </div>
              </div>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition disabled:opacity-60"
              >
                Kaydet ve Akışta Yayınla
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 font-mono">
              <h4 className="font-bold text-slate-400 text-xs mb-2">Kayıtlı Canlı Etkinlikler & Mekanlar</h4>
              <div className="space-y-1.5 max-h-52 overflow-y-auto text-xs">
                {events.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-white">
                    <div>
                      <span className="font-bold">{ev.title}</span>
                      <span className="text-rose-400 ml-1">({ev.venue})</span>
                    </div>
                    <button type="button" onClick={() => removeEvent(ev.id)} className="text-rose-400 font-bold px-2 py-0.5 hover:bg-rose-500/20 rounded-sm">
                      Sil
                    </button>
                  </div>
                ))}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="text-slate-400 ml-1">({item.category})</span>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="text-rose-500 font-bold px-2 py-0.5 hover:bg-rose-500/10 rounded-sm">
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Bekleyen Talepler */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] font-mono">
                  Bekleyen Sahiplik Talepleri ({pendingClaims.length})
                </h4>
              </div>

              {pendingClaims.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-center">
                  Şu an bekleyen onay talebi bulunmuyor.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {pendingClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-sm">{claim.venueTitle}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Link
                              href={`/u/${claim.userHandle}`}
                              className="font-mono text-cyan-400 hover:underline"
                            >
                              @{claim.userHandle}
                            </Link>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{claim.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleClaimAction(claim.id, "APPROVED")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                          >
                            ✓ Onayla
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClaimAction(claim.id, "REJECTED")}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition"
                          >
                            ✕ Reddet
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 italic bg-[#0c1022] p-2 rounded-xl">
                        &ldquo;{claim.note}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doğrudan Patron Ata */}
            <div className="p-4 rounded-2xl bg-[#080b18] border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">
                👑 Doğrudan Mekan Patronu Ata / Yetkilendir
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Mekan Seç</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className={INPUT}
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title} ({i.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Kullanıcı Rumuzu (Handle)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={assignHandle}
                      onChange={(e) => setAssignHandle(e.target.value)}
                      placeholder="Örn: burkay"
                      className="flex-1 bg-[#0c1022] border border-slate-800 rounded-xl px-2.5 py-2 text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAssignOwner}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
                    >
                      Ata
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mevcut Mekan Patronları Listesi */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                Mevcut Mekan Patronları & Temsilcileri
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {items.map((i) => {
                  const prof = getVenueProfile(i);
                  return (
                    <div
                      key={i.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Link href={`/mekan/${i.id}`} className="font-bold text-white hover:text-amber-300 truncate">
                          {i.title}
                        </Link>
                        {prof.ownerHandle ? (
                          <Link href={`/u/${prof.ownerHandle}`} className="text-amber-400 font-mono font-bold shrink-0">
                            👑 @{prof.ownerHandle}
                          </Link>
                        ) : (
                          <span className="text-slate-600 italic shrink-0">Sahipsiz</span>
                        )}
                      </div>
                      {prof.ownerHandle && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOwner(i.id)}
                          className="text-rose-400 hover:text-rose-300 text-[10px] px-2 py-0.5 rounded bg-slate-900 shrink-0 ml-2"
                        >
                          Yetkiyi Kaldır
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
