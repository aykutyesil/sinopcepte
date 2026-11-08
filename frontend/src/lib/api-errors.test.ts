// Gövde örnekleri N7a'nın teyit ettiği sözleşmeden (400/409/401/429) ve Faz 1'in mevcut
// `ApiExceptionHandler` biçiminden (`details: ["alan: mesaj"]`) elle yazıldı.
import { describe, expect, it } from "vitest";
import { parseRetryAfter, toFormErrors, waitMessage } from "./api-errors";

describe("toFormErrors", () => {
  it("400 errors listesi alanlara dağılır, ilk mesaj kazanır", () => {
    const body = {
      status: 400,
      error: "Bad Request",
      message: "Doğrulama hatası",
      errors: [
        { field: "handle", message: "Rumuz 3–20 karakter olmalı" },
        { field: "password", message: "Şifre en az 8 karakter olmalı" },
        { field: "handle", message: "ikinci mesaj" },
      ],
    };
    expect(toFormErrors(400, body)).toEqual({
      fields: { handle: "Rumuz 3–20 karakter olmalı", password: "Şifre en az 8 karakter olmalı" },
      form: null,
    });
  });

  it("409 alan adını taşır", () => {
    const body = { status: 409, message: "Bu rumuz zaten alınmış", errors: [{ field: "handle", message: "Bu rumuz zaten alınmış" }] };
    expect(toFormErrors(409, body)).toEqual({ fields: { handle: "Bu rumuz zaten alınmış" }, form: null });
  });

  it("alan bilgisi olmayan 409 mesajdan tahmin edilir", () => {
    expect(toFormErrors(409, { message: "Bu e-posta adresiyle kayıtlı bir hesap var" })).toEqual({
      fields: { email: "Bu e-posta adresiyle kayıtlı bir hesap var" },
      form: null,
    });
    expect(toFormErrors(409, { message: "Rumuz dolu" }).fields).toEqual({ handle: "Rumuz dolu" });
    expect(toFormErrors(409, { message: "Çakışma" })).toEqual({ fields: {}, form: "Çakışma" });
  });

  it("mesajsız alan hatası üst mesajı kullanır (401 mevcut şifre)", () => {
    const body = { status: 401, message: "Mevcut şifre hatalı", errors: [{ field: "currentPassword" }] };
    expect(toFormErrors(401, body)).toEqual({ fields: { currentPassword: "Mevcut şifre hatalı" }, form: null });
  });

  it("Faz 1 details dizisi ve çıplak dizi de okunur", () => {
    const phase1 = { status: 400, message: "Doğrulama hatası", details: ["bio: çok uzun", "title: boş olamaz"] };
    expect(toFormErrors(400, phase1).fields).toEqual({ bio: "çok uzun", title: "boş olamaz" });
    expect(toFormErrors(400, [{ field: "email", message: "geçersiz" }]).fields).toEqual({ email: "geçersiz" });
  });

  it("alan yoksa genel mesaj", () => {
    expect(toFormErrors(400, { message: "Geçersiz JSON gövdesi" })).toEqual({ fields: {}, form: "Geçersiz JSON gövdesi" });
    expect(toFormErrors(400, { message: "Doğrulama hatası" })).toEqual({ fields: {}, form: "Girilen bilgileri kontrol edin." });
    expect(toFormErrors(500, null)).toEqual({ fields: {}, form: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
    expect(toFormErrors(0, null).form).toBe("Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
  });

  it("429 bekleme mesajı (gövde yok sayılır)", () => {
    expect(toFormErrors(429, { message: "x", errors: [{ field: "handle", message: "y" }] }, 30)).toEqual({
      fields: {},
      form: "Çok fazla deneme yapıldı. Lütfen 30 saniye sonra tekrar deneyin.",
    });
  });
});

describe("Retry-After", () => {
  it("saniye ve HTTP tarihi", () => {
    const now = Date.parse("2026-11-08T12:00:00Z");
    expect(parseRetryAfter("120", now)).toBe(120);
    expect(parseRetryAfter("Sun, 08 Nov 2026 12:01:30 GMT", now)).toBe(90);
    expect(parseRetryAfter("Sun, 08 Nov 2026 11:00:00 GMT", now)).toBe(0);
    expect(parseRetryAfter(null, now)).toBeNull();
    expect(parseRetryAfter("yakında", now)).toBeNull();
  });

  it("bekleme mesajı saniye/dakika", () => {
    expect(waitMessage(45)).toBe("Çok fazla deneme yapıldı. Lütfen 45 saniye sonra tekrar deneyin.");
    expect(waitMessage(600)).toBe("Çok fazla deneme yapıldı. Lütfen yaklaşık 10 dakika sonra tekrar deneyin.");
    expect(waitMessage(61)).toBe("Çok fazla deneme yapıldı. Lütfen yaklaşık 2 dakika sonra tekrar deneyin.");
    expect(waitMessage(null)).toBe("Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.");
  });
});
