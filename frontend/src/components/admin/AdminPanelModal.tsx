"use client";

import { useState } from "react";
import { buildAdminPayload, EMPTY_ADMIN_FORM, resetAfterSave, type AdminForm } from "@/lib/admin";
import { ApiError, createEvent, createItem, deleteEvent, deleteItem } from "@/lib/client-api";
import type { Item, LiveEvent } from "@/lib/types";

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
  const [form, setForm] = useState<AdminForm>(EMPTY_ADMIN_FORM);
  const [busy, setBusy] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0f1428] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="font-bold text-lg text-white">Sinop Radar Yönetim Paneli</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-lg" aria-label="Kapat">
            ✕
          </button>
        </div>

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
      </div>
    </div>
  );
}
