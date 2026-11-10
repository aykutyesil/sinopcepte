"use client";

import { useState } from "react";
import {
  CONFESSION_CATEGORIES,
  createConfession,
  type Confession,
  type ConfessionCategory,
} from "@/lib/confessions";

const ALIAS_THEMES = [
  { key: "marti", label: "🕊️ Gizli Martı" },
  { key: "hamsi", label: "🐟 Hamsi Dedektifi" },
  { key: "kordon", label: "👤 Kordon Gölgesi" },
  { key: "iskele", label: "⚓ İskele Bekçisi" },
  { key: "karakum", label: "💨 Karakum Rüzgarı" },
  { key: "kale", label: "🏰 Kale Muhafızı" },
  { key: "fener", label: "🗼 Fener Hayaleti" },
  { key: "cinaralti", label: "☕ Çınaraltı Bilgesi" },
];

export function CreateConfessionModal({
  isOpen,
  onClose,
  onSuccess,
  defaultVenueId,
  defaultVenueTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (confession: Confession) => void;
  defaultVenueId?: string;
  defaultVenueTitle?: string;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ConfessionCategory>("gece");
  const [venueTitle, setVenueTitle] = useState(defaultVenueTitle || "");
  const [customAliasTheme, setCustomAliasTheme] = useState("marti");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const charCount = body.length;
  const remaining = 500 - charCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Lütfen itirafını yaz.");
      return;
    }
    if (trimmed.length > 500) {
      setError("İtiraf en fazla 500 karakter olabilir.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const created = await createConfession({
        body: trimmed,
        category,
        venueId: defaultVenueId,
        venueTitle: venueTitle.trim() || undefined,
        customAliasTheme,
      });
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        setError("İtiraf paylaşmak için giriş yapmalısın.");
      } else {
        setError(err instanceof Error ? err.message : "İtiraf paylaşılamadı.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#0c0f20] border border-indigo-500/30 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        {/* Başlık ve Kapat */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤫</span>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Anonim Gece İtirafı Yaz
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Kimliğin %100 gizli kalır, Sinop duyar!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-lg"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* İtiraf Metni */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold px-1">
              <span>İtirafın</span>
              <span className={`font-mono text-[11px] ${remaining < 50 ? "text-rose-400" : "text-slate-500"}`}>
                {remaining} karakter kaldı
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Sinop gecesinde ne oldu? Kimseye söyleyemediğin bir anın, bir mekanda gördüğün olay, kampüs dedikodusu veya platonik aşkın..."
              className="w-full bg-[#070a16] border border-slate-800 focus:border-indigo-500 rounded-2xl p-3 text-white text-xs sm:text-sm placeholder-slate-600 focus:outline-hidden transition resize-none"
            />
          </div>

          {/* Kategori Seçimi */}
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold px-1">Kategori</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CONFESSION_CATEGORIES) as ConfessionCategory[]).map((catKey) => {
                const info = CONFESSION_CATEGORIES[catKey];
                const selected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      selected
                        ? `${info.badgeClass} ring-1 ring-white/30 font-bold shadow-xs`
                        : "bg-[#070a16] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{info.icon}</span>
                    <span className="text-[11px]">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mekan / Konum Etiketi (Opsiyonel) */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold px-1">
              İlgili Mekan veya Konum (İsteğe bağlı)
            </label>
            <input
              type="text"
              value={venueTitle}
              onChange={(e) => setVenueTitle(e.target.value)}
              placeholder="Örn: Mathiday's, Nihavent Pub, Kordon Boyu, SNÜ Kampüs..."
              className="w-full bg-[#070a16] border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-600 focus:outline-hidden"
            />
          </div>

          {/* Sinop Rumuz Konsepti Seçimi */}
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold px-1">
              Anonim Sinop Rumuzun (Otomatik Numara Verilir)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ALIAS_THEMES.map((th) => {
                const isSel = customAliasTheme === th.key;
                return (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setCustomAliasTheme(th.key)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition text-left truncate ${
                      isSel
                        ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/60 shadow-xs"
                        : "bg-[#070a16] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {th.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gizlilik Garantisi Bilgilendirmesi */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200/90 text-[11px] flex items-start gap-2.5">
            <span className="text-base shrink-0">🛡️</span>
            <p className="leading-relaxed">
              <strong>Sıfır İsim Sızıntısı:</strong> İtirafın akışta sadece seçtiğin anonim Sinop rumuzuyla yayınlanır. Gerçek kullanıcı profilin hiçbir şekilde gösterilmez.
            </p>
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold transition shadow-lg flex items-center gap-1.5"
            >
              <span>{busy ? "Paylaşılıyor..." : "İtirafı Paylaş"}</span>
              <span>🤫</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
