// Beklenen değerler graph.md "N7 ayrıntısı" kurallarından ve N7a'nın teyit ettiği backend
// kurallarından elle yazıldı (modül sabitlerinden türetilmedi).
import { describe, expect, it } from "vitest";
import {
  bioLength,
  instagramUrl,
  normalizeHandle,
  normalizeInstagram,
  safeNext,
  validateBio,
  validateEmail,
  validateHandle,
  validateInstagram,
  validatePassword,
} from "./validation";
import { AVATARS, avatarEmoji, isAvatarKey } from "./avatars";
import { formatJoinDate } from "./format";

describe("validateHandle", () => {
  it("geçerli rumuzlar", () => {
    expect(validateHandle("ali.veli_1")).toBeNull();
    expect(validateHandle("abc")).toBeNull(); // 3 = alt sınır
    expect(validateHandle("a".repeat(20))).toBeNull(); // 20 = üst sınır
    expect(validateHandle("hamsi55")).toBeNull();
    expect(validateHandle("_._")).toBeNull();
  });

  it("büyük harf ve kenar boşlukları normalize edilir", () => {
    expect(normalizeHandle("  Ali_55 ")).toBe("ali_55");
    expect(validateHandle("Ali_55")).toBeNull();
    expect(validateHandle("ALI.VELI_1")).toBeNull();
    // Locale.ROOT: "I" → "i" (Türkçe "ı" değil)
    expect(normalizeHandle("ISKELE")).toBe("iskele");
  });

  it("uzunluk dışı", () => {
    expect(validateHandle("ab")).toBe("Rumuz 3–20 karakter olmalı.");
    expect(validateHandle("a".repeat(21))).toBe("Rumuz 3–20 karakter olmalı.");
    expect(validateHandle("   ")).toBe("Rumuz gerekli.");
    expect(validateHandle("")).toBe("Rumuz gerekli.");
  });

  it("izinsiz karakterler", () => {
    const msg = "Rumuz yalnız küçük harf, rakam, alt çizgi (_) ve nokta (.) içerebilir.";
    expect(validateHandle("ali-veli")).toBe(msg);
    expect(validateHandle("ali veli")).toBe(msg);
    expect(validateHandle("şule")).toBe(msg);
    expect(validateHandle("ali@x")).toBe(msg);
    // "İ".toLowerCase() = "i̇" (birleşik nokta) → regex dışı
    expect(validateHandle("İlker")).toBe(msg);
  });

  it("ayrılmış rumuzlar (büyük/küçük harf duyarsız)", () => {
    const msg = "Bu rumuz ayrılmış, başka bir rumuz seçin.";
    for (const h of ["admin", "root", "sinopcepte", "destek", "moderator", "api", "giris", "kayit", "profil", "kvkk"]) {
      expect(validateHandle(h)).toBe(msg);
    }
    expect(validateHandle("ADMIN")).toBe(msg);
    expect(validateHandle(" Kvkk ")).toBe(msg);
    expect(validateHandle("admin1")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("en az 8 karakter", () => {
    expect(validatePassword("1234567")).toBe("Şifre en az 8 karakter olmalı.");
    expect(validatePassword("12345678")).toBeNull();
    expect(validatePassword("")).toBe("Şifre gerekli.");
  });

  it("en fazla 72 UTF-8 bayt (BCrypt)", () => {
    expect(validatePassword("a".repeat(72))).toBeNull();
    expect(validatePassword("a".repeat(73))).toMatch(/^Şifre en fazla 72 bayt/);
    // "ş" 2 bayt: 36 × 2 = 72 geçer, 37 × 2 = 74 kalır
    expect(validatePassword("ş".repeat(36))).toBeNull();
    expect(validatePassword("ş".repeat(37))).toMatch(/^Şifre en fazla 72 bayt/);
  });
});

describe("validateEmail", () => {
  it("geçerli (küçük harfe çevrilip kırpılır)", () => {
    expect(validateEmail("ali@example.com")).toBeNull();
    expect(validateEmail("  Ali.Veli+test@Mail.Example.COM ")).toBeNull();
  });

  it("geçersiz", () => {
    const msg = "Geçerli bir e-posta adresi girin.";
    expect(validateEmail("")).toBe("E-posta gerekli.");
    expect(validateEmail("ali")).toBe(msg);
    expect(validateEmail("ali@")).toBe(msg);
    expect(validateEmail("ali@example")).toBe(msg);
    expect(validateEmail("ali veli@example.com")).toBe(msg);
    expect(validateEmail("ali@exa_mple.com")).toBe(msg);
    expect(validateEmail("şule@example.com")).toBe(msg);
    expect(validateEmail(`${"a".repeat(243)}@example.com`)).toBe(msg); // 255 karakter
  });
});

describe("validateBio", () => {
  it("160 kod noktasına kadar", () => {
    expect(validateBio("")).toBeNull();
    expect(validateBio("x".repeat(160))).toBeNull();
    expect(validateBio("x".repeat(161))).toBe("Biyografi en fazla 160 karakter olabilir.");
  });

  it("emoji 1 kod noktası sayılır (UTF-16'da 2 birim)", () => {
    expect(bioLength("🐟")).toBe(1);
    expect("🐟".length).toBe(2);
    expect(validateBio("🐟".repeat(160))).toBeNull();
    expect(validateBio("🐟".repeat(161))).toBe("Biyografi en fazla 160 karakter olabilir.");
  });
});

describe("validateInstagram", () => {
  it("boş = bağlantı yok", () => {
    expect(validateInstagram("")).toBeNull();
    expect(validateInstagram("   ")).toBeNull();
  });

  it("geçerli kullanıcı adları", () => {
    expect(validateInstagram("a.b_c")).toBeNull();
    expect(validateInstagram("Sinop_Cepte.57")).toBeNull();
    expect(validateInstagram("a".repeat(30))).toBeNull();
  });

  it("baştaki tek @ istemcide atılır", () => {
    expect(normalizeInstagram(" @sinopcepte ")).toBe("sinopcepte");
    expect(validateInstagram("@sinopcepte")).toBeNull();
    expect(validateInstagram("@@sinopcepte")).not.toBeNull();
  });

  it("URL, 31 karakter ve izinsiz karakter geçersiz", () => {
    expect(validateInstagram("https://instagram.com/ali")).not.toBeNull();
    expect(validateInstagram("instagram.com/ali")).not.toBeNull();
    expect(validateInstagram("a".repeat(31))).not.toBeNull();
    expect(validateInstagram("ali veli")).not.toBeNull();
    expect(validateInstagram("ali-veli")).not.toBeNull();
  });

  it("profil bağlantısı", () => {
    expect(instagramUrl("sinop.cepte")).toBe("https://instagram.com/sinop.cepte");
  });
});

describe("safeNext", () => {
  it("site içi göreli yollar geçer", () => {
    expect(safeNext("/profil")).toBe("/profil");
    expect(safeNext("/u/ali?tab=rozet#x")).toBe("/u/ali?tab=rozet#x");
    expect(safeNext("/")).toBe("/");
  });

  it("dış adresler ve hileler varsayılana düşer", () => {
    expect(safeNext("//evil.com")).toBe("/profil");
    expect(safeNext("///evil.com")).toBe("/profil");
    expect(safeNext("/\\evil.com")).toBe("/profil");
    expect(safeNext("\\\\evil.com")).toBe("/profil");
    expect(safeNext("https://evil.com")).toBe("/profil");
    expect(safeNext("javascript:alert(1)")).toBe("/profil");
    expect(safeNext("profil")).toBe("/profil");
    expect(safeNext("/\t/evil.com")).toBe("/profil");
    expect(safeNext("/\n/evil.com")).toBe("/profil");
    expect(safeNext("")).toBe("/profil");
    expect(safeNext(null)).toBe("/profil");
    expect(safeNext(undefined)).toBe("/profil");
  });

  it("varsayılan değiştirilebilir", () => {
    expect(safeNext("//evil.com", "/")).toBe("/");
  });
});

describe("avatars", () => {
  it("12 anahtar, sözleşmedeki sırayla ve emojilerle", () => {
    expect(AVATARS.map((a) => `${a.key} ${a.emoji}`)).toEqual([
      "marti 🕊️",
      "hamsi 🐟",
      "fener 🗼",
      "kale 🏰",
      "dalga 🌊",
      "capa ⚓",
      "balik 🐠",
      "yildiz ⭐",
      "gunes ☀️",
      "ay 🌙",
      "kedi 🐱",
      "yunus 🐬",
    ]);
  });

  it("bilinmeyen anahtar martıya düşer", () => {
    expect(avatarEmoji("hamsi")).toBe("🐟");
    expect(avatarEmoji("yok")).toBe("🕊️");
    expect(avatarEmoji(undefined)).toBe("🕊️");
    expect(isAvatarKey("yunus")).toBe(true);
    expect(isAvatarKey("Yunus")).toBe(false);
  });
});

describe("formatJoinDate", () => {
  it("Türkçe ay adı, İstanbul saat dilimi", () => {
    expect(formatJoinDate("2026-11-08T10:00:00Z")).toBe("8 Kasım 2026");
    // UTC 31 Ara 22:30 = İstanbul 1 Oca 01:30
    expect(formatJoinDate("2025-12-31T22:30:00Z")).toBe("1 Ocak 2026");
    expect(formatJoinDate("2026-02-14T00:00:00+03:00")).toBe("14 Şubat 2026");
  });

  it("okunamayan tarih null", () => {
    expect(formatJoinDate("")).toBeNull();
    expect(formatJoinDate(null)).toBeNull();
    expect(formatJoinDate("dün")).toBeNull();
  });
});
