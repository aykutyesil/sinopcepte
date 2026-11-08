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
N7a | `mvnw -q clean verify` çıkış 0 | geçti | Ana oturumda: exit 0; 13 sınıf, 53 test (Faz 1'in 29'u dahil), 0 failure/error/skipped
N7a | Testler kalabiliyor mu | geçti (ajan raporu) | 7 mutasyon (rumuz küçültme, PublicProfile'a e-posta, hız sınırı, admin silme koruması, id yerine rumuzla çözümleme, avatar doğrulama, ayrılmış rumuz) → hepsi yakalandı; geri yükleme sha256 ile doğrulandı. Ana oturumda tekrarlanmadı
N7b | build / typecheck / lint / test temiz | geçti | Ana oturumda: 4 komut exit 0; Vitest 4 dosya, 76/76 (Faz 1'in 44'ü dahil)
N7b | Testler kalabiliyor mu | geçti (ajan raporu) | 3 mutasyon → 4 test kırıldı, geri alındı
N7c | compose up + V10 migration canlı DB'de | geçti | Flyway: `Migrating schema "public" to version "10 - user profile"` → `now at version v10`
N7c | Uçtan uca duman testi | geçti | `node scripts/smoke.mjs --n7` → 34/34, exit 0 (Faz 1'in 16'sı + N7'nin 18'i)
N7c | Hız sınırı sahte IP ile aşılamaz | geçti (2. deneme) | 1. ölçüm kaldı: farklı sahte `X-Forwarded-For` ile 12. deneme 401. Kök neden (ölçüldü, başlık yansıtan konteynerle): Next rewrite istemcinin XFF'ini aynen iletiyor, gerçek IP eklemiyor; backend `framework` stratejisiyle en soldakine koşulsuz güveniyordu; başlık yoksa herkes frontend IP'sini (172.22.0.4) paylaşıyordu. Düzeltme: `nginx/nginx.conf` XFF'i `$remote_addr` ile eziyor, compose'da yalnız nginx dışarı açık; backend `forward-headers-strategy: native` (RemoteIpValve: yalnız iç vekilden güven, sağdan oku). Kanıt: yeni test `RateLimitTest.spoofedLeftmostForwardedForDoesNotBypassLimit` eski kodda KALDI (sahte IP ile 200), düzeltmede geçti; `mvnw clean verify` 54/54; `node scripts/ratelimit-check.mjs` → farklı sahte IP'lerle 12. ve 13. deneme 429, exit 0; backend :8180 ve frontend doğrudan erişilemiyor; `smoke.mjs --n7` 34/34
N7c | Farklı gerçek IP'ler ayrı sayaçta | geçti (yalnız test) | `RateLimitTest` (her istemci ayrı 198.18.x IP). Yerelde ölçülemedi: host'tan gelen her istek nginx'te aynı docker ağ geçidi IP'si görünüyor
N8–N10 | Faz 2 devamı | çözülmedi | sırada
N11 | PR (kullanıcı onayıyla) | çözülmedi | push yetkisi yok (`push:false`)
