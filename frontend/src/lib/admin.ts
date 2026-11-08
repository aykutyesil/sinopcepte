// Legacy `saveAdminItem` (977-1028) alan eşlemesi; saf fonksiyon.

import type { NewEvent, NewItem } from "./client-api";

export interface AdminForm {
  title: string;
  category: string;
  badge: string;
  location: string;
  phone: string;
  wa: string;
  desc: string;
}

export const EMPTY_ADMIN_FORM: AdminForm = {
  title: "",
  category: "etkinlik",
  badge: "",
  location: "",
  phone: "",
  wa: "",
  desc: "",
};

export type AdminPayload =
  | { kind: "event"; data: NewEvent }
  | { kind: "item"; data: NewItem }
  | { kind: "invalid"; message: string };

export function buildAdminPayload(form: AdminForm): AdminPayload {
  const title = form.title.trim();
  const cat = form.category;
  const badge = form.badge.trim() || "Aktif";
  const location = form.location.trim() || "Sinop";
  const phone = form.phone.trim();
  const wa = form.wa.trim() || "905555555555";
  const desc = form.desc.trim() || "Sinop güncel program.";

  if (!title) return { kind: "invalid", message: "Lütfen başlık veya işletme adını girin." };

  if (cat === "etkinlik") {
    // Legacy: "Mekan / Konum" alanı venue'ya, "Rozet / Zaman" alanı date'e gider.
    return {
      kind: "event",
      data: { title, venue: location, location: "Sinop", date: badge, badge: "🔥 CANLI ETKİNLİK", desc, wa },
    };
  }
  return {
    kind: "item",
    data: { category: cat, title, badge, location, desc, phone, wa, rating: "4.8" },
  };
}

/** Legacy kayıttan sonra yalnız başlık, rozet, açıklama ve telefonu temizler. */
export function resetAfterSave(form: AdminForm): AdminForm {
  return { ...form, title: "", badge: "", desc: "", phone: "" };
}
