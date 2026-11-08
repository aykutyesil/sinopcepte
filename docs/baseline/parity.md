# Tasarım 4 — eşdeğerlik listesi (N0)

Kaynak: `legacy/tasarim4-canli-radar-feed/index.html`. Ekran görüntüleri: `masaustu-koyu.png` (1440 px), `mobil-koyu.png` (390 px). `scripts/screenshot.mjs` ile alındı.

Yeni frontend'in bu maddelerin her birini karşılaması gerekiyor. "Değişir" yazanlar bilerek farklı yapılacak.

| # | Özellik | Kaynak | Not |
|---|---|---|---|
| P1 | 3 kolonlu düzen: sol dock (`w-14 sm:w-20 md:w-60`, sticky), orta akış (`max-w-2xl`), sağ radar kolonu (`hidden lg:block w-80`) | 76, 142, 225 | Mobilde sol dock ikonlara küçülür, sağ kolon gizlenir |
| P2 | Logo, 3 tıkla gizli admin girişi (1200 ms pencere) | `handleSecretClick` 890 | UI tetikleyicisi kalır; giriş backend'e gider |
| P3 | Sol menü filtreleri: `all, etkinlik, mekan, taksi, tekel, eczane, cicek`; aktif buton `bg-rose-600` | 93–122, `filterFeed` 734 | |
| P4 | Akış: önce etkinlik kartları (yalnız `all`/`etkinlik`), sonra item kartları (kategori filtreli) | `renderFeedStream` 624 | |
| P5 | Etkinlik kartı: rozet, tarih, başlık, 📍 mekan • konum, açıklama, "Masa Ayırt" WhatsApp düğmesi | 640–690 | |
| P6 | Item kartı: rozet, ★ puan, başlık, konum, açıklama; kategoriye göre birincil düğme (WhatsApp İletişim / Gece Sipariş Ver / Durağı Ara / Haritada Yol Tarifi Al / Çiçek Siparişi) + 📞 düğmesi; eczane kartı kırmızı vurgulu | 690–730 | |
| P7 | Arama: etkinlikte `title, venue, location, desc, badge`; item'da `title, desc, location, badge, category`; Türkçe normalizasyon; ✕ temizle | `normalizeTr` 746, `matchSearch` 764, `handleSearch` 771, `clearSearch` 795 | Tarayıcı tarafında kalır, Vitest ile test edilir |
| P8 | Başlık: "Sinop Canlı Akışı", alt başlık, CANLI rozeti; mobilde hava durumu rozeti | 144–165 | |
| P9 | Mobil radar şeridi: hava kartı + nöbetçi eczane kartı (haritaya link) | 175–215 | |
| P10 | Sağ kolon: hava & deniz kartı, günün nöbetçi eczanesi (harita + telefon), 7/24 taksi listesi, gece açık kurye listesi | 225–320 | **Değişir:** taksi/kurye listeleri HTML'e elle yazılmış; yeni yapıda `/api/items?category=taksi|tekel`'den gelir |
| P11 | Hava durumu: Open-Meteo `latitude=42.0268&longitude=35.1517&current=temperature_2m,weather_code&timezone=Europe/Istanbul`, kod → emoji | `fetchWeather` 833 | Tarayıcıdan doğrudan |
| P12 | Nöbetçi eczane: `pharmacy.json` okunur; isim, adres, harita, telefon alanları ve `e-1` kartı güncellenir | `fetchDailyDutyPharmacy` 804 | **Değişir:** `/api/pharmacy/today` |
| P13 | Tema düğmesi ("Görünüm Modu") | `toggleTheme` 867 | **Ölçüm:** dosyada 0 adet `dark:` sınıfı var, sayfa her zaman koyu; düğme yalnız ikonu değiştiriyor. Port koyu tek tema olarak yapılır, düğme tercihi kaydeder (açık tema sonra) |
| P14 | Admin paneli: etkinlik veya item ekleme (başlık, kategori, rozet, konum, telefon, WhatsApp, açıklama), listeleme, silme | 337–390, `saveAdminItem` 977, `deleteLiveEvent` 1030, `deleteAdminItem` 1038 | **Değişir:** localStorage yerine `/api/admin/*`, şifre `1234` yerine backend oturumu |
| P15 | Fontlar: Plus Jakarta Sans (400–900), Cabinet Grotesk (800–900, `font-display`) | 10, 18–22 | **Ölçüm gerek:** Cabinet Grotesk Google Fonts'ta yok (tahmin); yedeğe düşüyor olabilir |
| P16 | Özel `xs` kırılımı: 400px | 17 | |
