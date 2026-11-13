// Türkçe tarih biçimi. Saat dilimi sabit (Europe/Istanbul): sunucu ve tarayıcı aynı metni üretir,
// hidrasyon uyuşmazlığı olmaz.

const JOIN_DATE = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

/** ISO tarih → "8 Kasım 2026". Okunamazsa `null`. */
export function formatJoinDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return JOIN_DATE.format(d);
}
