// Backend hata gövdelerini forma uygun hale getirir (saf fonksiyon).
// N7 sözleşmesi (N7a ile teyitli):
//   400 → {status, error, message, errors: [{field, message}]}
//   409 → aynı şekil, `errors[0].field` = "handle" | "email"
//   401 (PUT /api/me/password) → {message, errors: [{field: "currentPassword"}]}
//   429 → {message} + `Retry-After` başlığı (saniye)
// Savunmacı: Faz 1'in `details: ["alan: mesaj"]` dizisi, çıplak dizi ve yalnız `message` de okunur.

export interface FormErrors {
  /** Alan adı → mesaj (ilk mesaj kazanır). */
  fields: Record<string, string>;
  /** Alana bağlanamayan genel mesaj. */
  form: string | null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function addField(out: Record<string, string>, field: string | null, message: string | null, fallback: string | null) {
  if (!field) return;
  const msg = message ?? fallback;
  if (msg && !(field in out)) out[field] = msg;
}

function readList(list: unknown, out: Record<string, string>, fallback: string | null) {
  if (!Array.isArray(list)) return;
  for (const e of list) {
    if (typeof e === "string") {
      const i = e.indexOf(": ");
      if (i > 0) addField(out, e.slice(0, i).trim(), str(e.slice(i + 2)), fallback);
    } else if (e && typeof e === "object") {
      const o = e as Record<string, unknown>;
      addField(out, str(o.field), str(o.message) ?? str(o.defaultMessage), fallback);
    }
  }
}

/** Alan bilgisi olmayan 409 mesajını içeriğinden rumuz/e-posta alanına yönlendir. */
function guessConflictField(message: string): string | null {
  const m = message.toLocaleLowerCase("tr");
  if (m.includes("rumuz") || m.includes("handle") || m.includes("kullanıcı adı")) return "handle";
  if (m.includes("e-posta") || m.includes("eposta") || m.includes("email") || m.includes("mail")) return "email";
  return null;
}

/** `Retry-After` saniye veya HTTP tarihi olabilir; okunamazsa `null`. */
export function parseRetryAfter(header: string | null | undefined, nowMs: number): number | null {
  if (!header) return null;
  const t = header.trim();
  if (/^\d+$/.test(t)) return Number(t);
  const at = Date.parse(t);
  if (Number.isNaN(at)) return null;
  return Math.max(0, Math.ceil((at - nowMs) / 1000));
}

export function waitMessage(retryAfterSec: number | null): string {
  if (retryAfterSec === null || retryAfterSec <= 0) return "Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.";
  if (retryAfterSec < 60) return `Çok fazla deneme yapıldı. Lütfen ${retryAfterSec} saniye sonra tekrar deneyin.`;
  const min = Math.ceil(retryAfterSec / 60);
  return `Çok fazla deneme yapıldı. Lütfen yaklaşık ${min} dakika sonra tekrar deneyin.`;
}

export function toFormErrors(status: number, body: unknown, retryAfterSec: number | null = null): FormErrors {
  const fields: Record<string, string> = {};

  if (status === 429) return { fields, form: waitMessage(retryAfterSec) };
  if (status === 0) return { fields, form: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin." };

  let message: string | null = null;
  if (Array.isArray(body)) {
    readList(body, fields, null);
  } else if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    message = str(o.message);
    readList(o.errors, fields, message);
    readList(o.fieldErrors, fields, message);
    readList(o.details, fields, message);
  }

  if (status === 409 && Object.keys(fields).length === 0 && message) {
    const f = guessConflictField(message);
    if (f) return { fields: { [f]: message }, form: null };
  }

  if (Object.keys(fields).length > 0) return { fields, form: null };
  if (message && message !== "Doğrulama hatası") return { fields, form: message };
  if (status === 400) return { fields, form: "Girilen bilgileri kontrol edin." };
  if (status === 409) return { fields, form: "Bu rumuz veya e-posta zaten kullanılıyor." };
  if (status >= 500) return { fields, form: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." };
  return { fields, form: "İşlem başarısız oldu. Lütfen tekrar deneyin." };
}
