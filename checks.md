# Kontroller

Doğrulamalar işi yapan alt ajandan ayrı olarak ana oturumda yeniden çalıştırıldı.

düğüm | gereksinim | karar | kanıt
---|---|---|---
N0 | Baseline ekran görüntüleri + parity.md | geçti | `docs/baseline/masaustu-koyu.png`, `mobil-koyu.png`, `parity.md` (P1–P16). Açık tema görüntüsü alınmadı: kaynakta 0 `dark:` sınıfı var, sayfa yalnız koyu (ölçüm: `grep -o 'dark:' \| wc -l` → 0)
N1 | Seed id kümesi = HTML id kümesi | geçti | `node scripts/extract-seed.mjs legacy/tasarim4-canli-radar-feed/index.html backend/src/main/resources/seed` → `items=15 events=4 htmlIds=19 … OK`, exit 0. 1. deneme kaldı: admin kaydetmedeki `'ev-' + Date.now()` şablonu sayılmıştı; kontrol veri bloğuyla sınırlandı
N2 | Eczane fikstürü kaydedildi | geçti | `backend/src/test/resources/pharmacy/sinop-merkez.html`, http=200, 3313 bayt, `<b>Elif Eczanesi</b></span>` bulundu
N3 | Eski dosyalar yalnız rename ile legacy/'de | geçti | `git status --porcelain` → 17 `R`, 0 `D`
N4 | `mvnw -q verify` çıkış 0 | geçti | Ana oturumda: exit 0; `target/surefire-reports` 7 sınıf, 29 test, 0 failure, 0 error, 0 skipped
N4 | Parser testi fikstürle geçer | geçti | `PharmacyParserTest` 4/4
N4 | Admin uç noktaları oturumsuz 401 | geçti | `AdminSecurityTest` 4/4; ayrıca N6 duman testi
N4 | Scheduler `0 30 8 * * *` Europe/Istanbul | geçti | `PharmacyJobScheduleTest` 1/1
N4 | Testler kalabiliyor mu | geçti (ajan raporu) | Ajan 5 bilinçli hata ekledi → 12 test kaldı; geri alındı. Ana oturumda tekrarlanmadı
N5 | build / typecheck / lint / test temiz | geçti | Ana oturumda: 4 komut exit 0; Vitest 2 dosya, 44/44
N5 | Testler kalabiliyor mu | geçti (ajan raporu) | Mutasyonlar: arama alanından `category` çıkarma → 1 kırık, etkinlik filtresi kaldırma → 6 kırık. Ana oturumda tekrarlanmadı
N6 | compose up | geçti | `docker compose -p sinopcepte up --build -d` exit 0; db healthy; `/actuator/health` UP
N6 | Uçtan uca API + sayfa + admin akışı (CSRF dahil) | geçti | `node scripts/smoke.mjs` → 16/16, exit 0 (frontend kökeni üzerinden: seed id sırası, eczane canlı çekildi "Elif Eczanesi", e-1 birleşik, 401'ler, login, item oluştur/sil, çıkış)
N6 | Görsel eşdeğerlik | geçti (model kanaati + ölçüm) | `docs/n6/*.png` ↔ `docs/baseline/*.png`. Ölçüm: sayfa yükseklikleri birebir (1440→4683 px, 390→4828 px). Göz kontrolü: tek fark sağ kolon taksi/kurye listelerinin veriden gelmesi (P10, bilinçli). Piksel karşılaştırması yapılmadı
N7–N10 | Faz 2 | çözülmedi | Faz 1 onayı bekleniyor
N11 | PR (kullanıcı onayıyla) | çözülmedi | push yetkisi yok (`push:false`)
