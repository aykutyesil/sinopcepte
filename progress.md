# İlerleme

## Faz 2 / N7 — kullanıcı giriş & profil: tamamlandı (2026-11-08)

- **Grafik:** N7a, N7b, N7c geçti. Hız sınırı açığı ikinci denemede kapandı (nginx kenarı + RemoteIpValve). N8, N9, N10 bekliyor.
- **Çıktılar:** `backend/` V10 migration + kayıt/giriş/profil/şifre/silme/hız sınırı (53 test); `frontend/` `/giris`, `/kayit`, `/profil`, `/u/[handle]`, `/kvkk` (TASLAK) + dock hesap düğmesi (76 test); `scripts/smoke.mjs --n7` (34 kontrol).
- **Kararlar:** misafir = hesapsız gezinme; avatar sabit listeden; e-posta doğrulama/şifre sıfırlama yok; ADMIN profili herkese kapalı (404).
- **Bekleyenler:**
  - Canlıda HTTPS sonlandırma nginx'te yapılacaksa sertifika ayarı ve `SESSION_COOKIE_SECURE=true` gerekli (yapılmadı).
  - Şifre değişince diğer cihazlardaki oturumlar kapanmıyor; hız sınırı sayaçları bellekte (yeniden başlatınca sıfırlanır).
  - KVKK metni ve onay kutusu ifadesi hukukçu kontrolünden geçmeli.
- **Sonraki adım:** Kullanıcı mevcut hali yerelde inceliyor. N9 (itiraf) kapsam dışı, N8 (check-in) ertelendi, N10 karar bekliyor (2026-11-09).

## Faz 1 — tamamlandı (2026-11-08)

- **Grafik:** N0, N1, N2, N3, N4, N5, N6 geçti. N7–N11 bekliyor.
- **Çıktılar:**
  - `backend/` — Spring Boot 4.1.2, Java 17, Postgres, Flyway V1–V2, Spring Security (oturum çerezi + CSRF), eczane işi (Jsoup, 08:30 TSİ)
  - `frontend/` — Next.js 16.4.5, React 19.3, Tailwind 4.3.5, Tasarım 4 portu
  - `docker-compose.yml`, `.env.example` (gerçek `.env` git dışı)
  - `scripts/extract-seed.mjs`, `scripts/screenshot.mjs`, `scripts/smoke.mjs`
  - `docs/baseline/` (eski site), `docs/n6/` (yeni site) ekran görüntüleri, `docs/baseline/parity.md`
  - `legacy/` — eski statik dosyalar (silinmedi)
- **Kararlar:** `graph.md` "Öğrenilen kurallar" bölümüne yazıldı (Boot 4 / Tailwind 4 / rewrite / port çakışması).
- **Bekleyenler:**
  - Push yetkisi yok (`push:false`) → PR için collaborator yetkisi ya da fork.
  - Eski `legacy/automation/daily-pharmacy.yml` artık gereksiz; eczane işi backend'de.
  - tahmin: eczaneler.gen.tr sayfa yapısı değişirse ayrıştırma WARN loglar, son kayıt gösterilir; alarm yok.
  - Açık tema yok (kaynakta da yoktu).
- **Sonraki adım:** Kullanıcı onayıyla Faz 2 → N7 (kullanıcı giriş & profil).
