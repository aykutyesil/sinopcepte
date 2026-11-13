"use client";

import { useState } from "react";
import {
  createTaxiLobby,
  TAXI_POPULAR_DEPARTURES,
  TAXI_POPULAR_DESTINATIONS,
  type TaxiLobby,
} from "@/lib/taxi";
import type { AuthUser } from "@/lib/types";

export function CreateTaxiLobbyModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lobby: TaxiLobby) => void;
  currentUser?: AuthUser | null;
}) {
  const [departurePoint, setDeparturePoint] = useState(TAXI_POPULAR_DEPARTURES[0]);
  const [customDeparture, setCustomDeparture] = useState("");
  const [destination, setDestination] = useState(TAXI_POPULAR_DESTINATIONS[0]);
  const [customDestination, setCustomDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState(4);
  const [estimatedFare, setEstimatedFare] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalDeparture = departurePoint === "custom" ? customDeparture.trim() : departurePoint;
    const finalDestination = destination === "custom" ? customDestination.trim() : destination;

    if (!finalDeparture) {
      setError("Lütfen kalkış noktasını belirtin.");
      return;
    }
    if (!finalDestination) {
      setError("Lütfen varış noktasını (hedef) belirtin.");
      return;
    }
    if (!departureTime.trim()) {
      setError("Lütfen tahmini kalkış saatini yazın (örn: Bugün 18:30).");
      return;
    }

    setSubmitting(true);
    try {
      let fareFormatted = estimatedFare.trim();
      if (fareFormatted && !fareFormatted.includes("₺")) {
        fareFormatted = `${fareFormatted} ₺`;
      }

      const created = await createTaxiLobby({
        departurePoint: finalDeparture,
        destination: finalDestination,
        departureTime: departureTime.trim(),
        totalSeats,
        estimatedFare: fareFormatted || undefined,
        note: note.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lobi oluşturulurken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🚖</span> Ortak Taksi Lobisi Aç
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uzak mesafelerde masrafı bölüşmek için diğer SinopCepte üyelerini davet et.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kalkış Noktası */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              📍 Kalkış Noktası
            </label>
            <select
              value={departurePoint}
              onChange={(e) => setDeparturePoint(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              {TAXI_POPULAR_DEPARTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="custom">✏️ Farklı bir yer yaz...</option>
            </select>
            {departurePoint === "custom" && (
              <input
                type="text"
                value={customDeparture}
                onChange={(e) => setCustomDeparture(e.target.value)}
                placeholder="Örn: Ada Mahallesi Muhtarlık Önü"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                required
              />
            )}
          </div>

          {/* Varış Noktası (Hedef) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              🏁 Varış Yeri (Hedef)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              {TAXI_POPULAR_DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value="custom">✏️ Farklı bir yer yaz...</option>
            </select>
            {destination === "custom" && (
              <input
                type="text"
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
                placeholder="Örn: Erfelek Şelaleleri Girişi"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                required
              />
            )}
          </div>

          {/* Saat & Koltuk Yan Yana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ⏰ Kalkış Saati / Günü
              </label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="Örn: Bugün 18:30 veya Cuma 16:00"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                👥 Toplam Koltuk Sayısı
              </label>
              <select
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value={2}>2 Kişilik (Sen + 1)</option>
                <option value={3}>3 Kişilik (Sen + 2)</option>
                <option value={4}>4 Kişilik Standart Taksi (Sen + 3)</option>
                <option value={5}>5 Kişilik Geniş Taksi</option>
                <option value={6}>6 Kişilik Minibüs/VIP</option>
              </select>
            </div>
          </div>

          {/* Tahmini Ücret & Telefon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                💰 Tahmini Taksimetre Ücreti
              </label>
              <input
                type="text"
                value={estimatedFare}
                onChange={(e) => setEstimatedFare(e.target.value)}
                placeholder="Örn: 400 ₺ (Kişi başı ~100 ₺)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                📞 İletişim Telefonu (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Örn: 05xx xxx xx xx"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Not / Açıklama */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              📝 Not &amp; Bagaj Bilgisi (İsteğe bağlı)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Örn: 19:40 İstanbul THY uçağına gideceğiz. Bagajım var, bagajı olanlar gelebilir."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition"
            >
              {submitting ? "Oluşturuluyor..." : "Lobiyi Başlat 🚖"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
