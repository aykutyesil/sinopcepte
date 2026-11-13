// Backend doğrulama kurallarının istemci aynası (graph.md "N7 ayrıntısı").
// Her fonksiyon `null` (geçerli) ya da Türkçe hata mesajı döner. Son söz backend'indir;
// buradaki kontroller yalnız kullanıcıya erken geri bildirim içindir.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 20;
export const PASSWORD_MIN = 8;
/** BCrypt sınırı: 72 UTF-8 bayt. */
export const PASSWORD_MAX_BYTES = 72;
export const EMAIL_MAX = 254;
export const BIO_MAX = 160;
export const INSTAGRAM_MAX = 30;

const HANDLE_RE = /^[a-z0-9_.]+$/;
const INSTAGRAM_RE = /^[A-Za-z0-9_.]{1,30}$/;
// Backend ile aynı ASCII deseni (küçük harfe çevrildikten sonra uygulanır).
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export const RESERVED_HANDLES: readonly string[] = [
  "admin",
  "root",
  "sinopcepte",
  "destek",
  "moderator",
  "api",
  "giris",
  "kayit",
  "profil",
  "kvkk",
];

/** Rumuz küçük harfle saklanır. `toLowerCase()` (Locale.ROOT eşdeğeri): `I` → `i`, Türkçe `ı` değil. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateHandle(raw: string): string | null {
  const h = normalizeHandle(raw);
  if (!h) return "Rumuz gerekli.";
  if (h.length < HANDLE_MIN || h.length > HANDLE_MAX)
    return `Rumuz ${HANDLE_MIN}–${HANDLE_MAX} karakter olmalı.`;
  if (!HANDLE_RE.test(h)) return "Rumuz yalnız küçük harf, rakam, alt çizgi (_) ve nokta (.) içerebilir.";
  if (RESERVED_HANDLES.includes(h)) return "Bu rumuz ayrılmış, başka bir rumuz seçin.";
  return null;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): string | null {
  const e = normalizeEmail(raw);
  if (!e) return "E-posta gerekli.";
  if (e.length > EMAIL_MAX || !EMAIL_RE.test(e)) return "Geçerli bir e-posta adresi girin.";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (!pw) return "Şifre gerekli.";
  if (pw.length < PASSWORD_MIN) return `Şifre en az ${PASSWORD_MIN} karakter olmalı.`;
  if (new TextEncoder().encode(pw).length > PASSWORD_MAX_BYTES)
    return `Şifre en fazla ${PASSWORD_MAX_BYTES} bayt olabilir (Türkçe harf ve emoji birden çok bayt tutar).`;
  return null;
}

/** Uzunluk Unicode kod noktasıyla sayılır (backend: `codePointCount`). Emoji = 1 (ZWJ dizileri birden çok). */
export function bioLength(bio: string): number {
  return Array.from(bio).length;
}

export function validateBio(bio: string): string | null {
  if (bioLength(bio) > BIO_MAX) return `Biyografi en fazla ${BIO_MAX} karakter olabilir.`;
  return null;
}

/** Baştaki/sondaki boşluk ve tek bir baştaki `@` atılır; yalnız kullanıcı adı saklanır. */
export function normalizeInstagram(raw: string): string {
  const t = raw.trim();
  return t.startsWith("@") ? t.slice(1) : t;
}

export function validateInstagram(raw: string): string | null {
  const v = normalizeInstagram(raw);
  if (!v) return null; // boş = bağlantı yok
  if (!INSTAGRAM_RE.test(v))
    return `Instagram için yalnız kullanıcı adını yazın (en fazla ${INSTAGRAM_MAX} karakter: harf, rakam, _ ve .), bağlantı değil.`;
  return null;
}

export function instagramUrl(name: string): string {
  return `https://instagram.com/${encodeURIComponent(name)}`;
}

/**
 * `?next=` yönlendirmesi yalnız aynı site içi göreli yol olabilir.
 * `//evil.com`, `/\evil.com`, `https://…`, kontrol karakterli (`/\t/evil.com` → tarayıcı `//evil.com` yapar)
 * ve `/` ile başlamayan her değer reddedilir → `fallback`.
 */
export function safeNext(raw: string | null | undefined, fallback = "/profil"): string {
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("\\")) return fallback;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return fallback;
  }
  return raw;
}
