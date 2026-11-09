# 🌊 SinopCepte | Şehir & Gece Hayatı Portalı

Sinop şehrinin canlı etkinliklerini, maç yayınlarını, 7/24 açık taksilerini, gece tekel kuryelerini, çiçekçilerini ve **günün nöbetçi eczanesini** tek bir merkezde toplayan şehir rehberi.

---

## 🚀 Özellikler

* **🚨 Nöbetçi Eczane & Yol Tarifi:** Sinop Merkez nöbetçi eczanesi her sabah 08:30'da (TSİ) backend tarafından otomatik çekilir; harita ve tek dokunuşla arama.
* **🌤️ Canlı Hava Durumu:** Open-Meteo üzerinden canlı sıcaklık.
* **⚽ Canlı Etkinlikler & Maç Yayını:** Mekanların maç yayınları, akustik performanslar ve DJ sahneleri.
* **🚖 7/24 Taksi & Gece İhtiyaçları:** Taksi, gece açık tekel ve çiçekçiler; tek tıkla arama / WhatsApp.
* **🔎 Türkçe Arama:** İ/ı/ş/ğ/ü/ö/ç duyarsız arama ve kategori filtreleri.
* **👤 Üyelik & Profil:** Rumuz veya e-posta ile giriş, Sinop temalı avatarlar, biyo, Instagram, gizlilik ayarları, hesap silme.
* **🛠️ Yönetim Paneli:** Etkinlik ve mekan ekleme/silme (sunucu tarafı oturum + CSRF korumalı).
* **📱 Mobil uyumlu** koyu tema ("Canlı Radar" tasarımı).

---

## 🧱 Mimari

```
tarayıcı ──► nginx (:FRONTEND_PORT, tek giriş) ──► Next.js (frontend/) ──/api/*──► Spring Boot (backend/) ──► PostgreSQL
                                                                                      └─ 08:30 TSİ nöbetçi eczane işi
```

| Klasör | İçerik |
|---|---|
| `frontend/` | Next.js 16 (App Router, TypeScript, Tailwind 4) |
| `backend/` | Spring Boot 4.1, Java 17, Flyway, Spring Security. Ayrıntı: [backend/README.md](backend/README.md) |
| `nginx/` | Kenar vekili. Gerçek istemci IP'sini yazar; hız sınırı buna dayanır |
| `scripts/` | Seed çıkarma, ekran görüntüsü, uçtan uca duman testi, hız sınırı kontrolü |
| `legacy/` | Eski statik HTML sürümü ve 4 tasarım varyasyonu (referans) |
| `docs/` | Eski/yeni ekran görüntüleri ve eşdeğerlik listesi |

---

## ▶️ Yerelde Çalıştırma

Gerekenler: Docker Desktop. Geliştirme için ayrıca Node 24 ve Java 17.

1. Ortam dosyasını oluştur ve şifreleri doldur (`DB_PASSWORD`, `ADMIN_PASSWORD`):
   ```bash
   cp .env.example .env
   ```
2. Yığını başlat:
   ```bash
   docker compose -p sinopcepte up --build -d
   ```
3. Site: `http://localhost:<FRONTEND_PORT>` (varsayılan 3000). Yönetim girişi: logoya 3 kez hızlı tıkla, `.env`'deki `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
4. Durdurmak için:
   ```bash
   docker compose -p sinopcepte down
   ```

---

## ✅ Doğrulama

```bash
cd backend && ./mvnw -q verify
```
```bash
cd frontend && npm run build && npm run typecheck && npm run lint && npm run test
```
Yığın çalışırken (proje kökünde):
```bash
node scripts/smoke.mjs --n7
```

`scripts/ratelimit-check.mjs` hız sınırının sahte IP başlığıyla aşılamadığını ölçer; çalıştıran IP'nin girişini 10 dakika kilitler (sonra `docker compose -p sinopcepte restart backend`).

---

## ⚠️ Canlıya Çıkmadan Önce

* HTTPS: nginx'te sertifika ayarı ve `.env`'de `SESSION_COOKIE_SECURE=true`.
* KVKK aydınlatma metni (`/kvkk` şu an TASLAK) ve kayıt onay ifadesi hukukçu kontrolünden geçmeli.
* E-posta doğrulama ve şifre sıfırlama yok (e-posta altyapısı gerekiyor).

---

## 🗺️ Yol Haritası

Ayrıntı: [ROADMAP.md](ROADMAP.md). Çalışma planı ve durum: [graph.md](graph.md), [progress.md](progress.md).

* ✅ **Kullanıcı Giriş & Profil**
* ⏸️ **Swarm Check-In:** ertelendi.
* ⏸️ **"Okeye 4. Aranıyor" ilanları:** karar bekliyor.
* ❌ **Gizli İtiraf Paneli:** şimdilik kapsam dışı.

---

## 📄 Lisans
MIT License © 2026 Aykut Yeşil
