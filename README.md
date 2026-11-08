# 🌊 SinopCepte | Şehir & Gece Hayatı Portalı

Sinop şehrinin canlı etkinliklerini, maç yayınlarını, 7/24 açık nöbetçi taksilerini, gece tekel kuryelerini, çiçekçilerini ve **canlı nöbetçi eczanesini** tek bir merkezde toplayan modern şehir rehberi platformu.

---

## 🚀 Öne Çıkan Özellikler

* **🚨 Canlı Nöbetçi Eczane & Yol Tarifi:** Sinop Merkez günün nöbetçi eczanesini her gün otomatik çeker, harita konumu ve tek dokunuşla navigasyon sağlar.
* **🌤️ Canlı Sinop Hava Durumu:** Open-Meteo API entegrasyonuyla canlı sıcaklık ve hava durumu durumu.
* **⚽ Canlı Etkinlikler & Maç Yayını:** Mekanların canlı maç yayınları, akustik performanslar ve DJ sahneleri.
* **🚖 7/24 Taksi & Acil İhtiyaçlar:** Meydan Taksi, Barış Taksi, gece açık nöbetçi tekel ve çiçekçiler tek tıkla arama / WhatsApp sipariş imkanı.
* **🌓 Koyu / Açık Tema:** Gece kullanımına özel optimize edilmiş modern karanlık mod.
* **📱 %100 Mobil Uyumlu:** Telefon ekranlarına tam oturan sıfır taşmalı arayüz.

---

## 🎨 Tasarım Varyasyonları & Mimari

Proje, farklı kullanıcı deneyimlerini test etmek üzere 4 farklı arayüz mimarisiyle geliştirilmiştir:

1. **Ana Portal (`index.html`):** Şehrin tüm dinamiklerini listeleyen tam donanımlı ana akış.
2. **Tasarım 1 (`tasarim1-harita-explorer/`):** Leaflet.js tabanlı, harita merkezli konum keşif arayüzü.
3. **Tasarım 2 (`tasarim2-bento-dashboard/`):** Modern Bento Grid mimarisiyle tek ekranda yüksek yoğunluklu şehir panosu.
4. **Tasarım 3 (`tasarim3-zaman-cizelgesi/`):** 24 saatlik yatay zaman çizelgesiyle akıllı şehir akışı.
5. **Tasarım 4 (`tasarim4-canli-radar-feed/`):** Reels tarzı odaklanmış kart akışı, sol dock menü ve canlı radar göstergesi.
6. **Tasarım Kataloğu (`katalog.html`):** Tüm tasarımların canlı karşılaştırma paneli.

---

## 🤖 Otomasyon & GitHub Actions

Depoda bulunan `.github/workflows/daily-pharmacy.yml` iş akışı sayesinde:
* Her sabah **08:30 (TSİ)**'da otomatik çalışır.
* Sinop Merkez'in güncel nöbetçi eczanesini çeker.
* `pharmacy.json` dosyasını ve tüm HTML sayfalarını güncelleyerek depoya otomatik commit atar.

Yerel bilgisayarda çalıştırmak için:
```powershell
powershell -ExecutionPolicy Bypass -File .\update-pharmacy.ps1
```

---

## 🗺️ Gelecek Özellikler (Yol Haritası)
Detaylı plan için [ROADMAP.md](ROADMAP.md) belgesini inceleyebilirsiniz:
* **📍 Swarm Check-In:** Mekanlarda check-in, anlık mekandakiler ve Mekan Mayor'ı unvanları.
* **🤫 Gizli İtiraf Paneli:** Anonim dedikodu ve itiraf akışı.
* **👤 Kullanıcı Giriş & Profil:** Rozetler, istatistikler ve avatar yönetimi.
* **🀄 "Okeye 4. Aranıyor" Feed'i:** "Gelebilir miyim? 🙋‍♂️" onaylı eşleşme ve aktivite bulma sistemi.
* **🎓 SNÜ Kampüs & Not Paylaşımı:** Sinop Üniversitesi öğrencilerine özel fakülte/bölüm filtreli ders notları, çıkmış sorular ve akademik dayanışma havuzu.

---

## 📄 Lisans
MIT License © 2026 Aykut Yeşil
