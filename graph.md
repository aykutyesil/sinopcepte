# SinopCepte → Next.js + Java dönüşüm grafiği

> Not: `Desktop/CLAUDE.md` içindeki "Acıktım 55" proje bölümü (PayTR, fatura) **başka bir projeye** ait.
> Bu repoda yalnızca oradaki *çalışma yöntemi* (düğüm grafiği, kapılar, progress.md) kullanılır.

## Girdiler

| Alan | Değer |
|---|---|
| Görev | Statik HTML portalı, **Tasarım 4 (Canlı Radar Feed)** arayüzüyle Next.js + Spring Boot uygulamasına dönüştürmek; ardından ROADMAP'teki 4 sosyal modülü eklemek |
| Teslim | `frontend/` (Next.js, App Router, TS, Tailwind), `backend/` (Spring Boot 3.x, Java 17, Maven), `docker-compose.yml` (Postgres + backend + frontend), eski dosyalar `legacy/` altında |
| Başlangıç materyali | `tasarim4-canli-radar-feed/index.html` (arayüz + `defaultData` / `defaultLiveEvents`), `update-pharmacy.ps1` (eczane kaynağı), `ROADMAP.md` |
| Kapsam (izinli değişiklik) | Yalnız bu repo, `feat/nextjs-java-migration` dalı. Eski dosyalar silinmez, `git mv` ile `legacy/`'e taşınır |
| Yürütme limiti | Faz başına dur ve rapor ver. Faz 1 bitmeden Faz 2'ye geçilmez. Bir düğümde en fazla 3 düzeltme denemesi, sonra `blocked` |
| Kararlar (kullanıcı) | Arayüz: Tasarım 4 · Kapsam: mevcut + tüm ROADMAP · DB: PostgreSQL + Docker · Git: dal + PR |

## Mevcut durumdan bilinenler (ölçüldü)

- Veri tarayıcının `localStorage`'ında duruyor; admin panelinden eklenenler yalnızca o tarayıcıda var, **taşınamaz**. Seed, HTML içindeki `defaultData` / `defaultLiveEvents` dizilerinden alınacak.
- Admin "girişi" tamamen istemci tarafında; varsayılan şifre `1234` (`tasarim4.../index.html:900`). Backend'de gerçek kimlik doğrulama şart.
- Eczane güncelleme betiği HTML'i regex ile yeniden yazıyor ve `C:\Users\Aykut\...` yollarına bağlı. Workflow `automation/` altında, `.github/workflows/` altında değil → **şu an çalışmıyor** (README aksini söylüyor).
- Tasarım 4'ün sağ kolonundaki taksi ve tekel listeleri veriden değil, HTML'e elle yazılmış (`index.html:270-315`). Yeni yapıda API'den gelecek.
- Tailwind CDN'den yükleniyor; yeni yapıda derleme zamanı Tailwind.
- `gh api` sonucu: `Devoguzkaya` hesabının `aykutyesil/sinopcepte` üzerinde **push yetkisi yok** (`push:false`). PR için ya yetki verilmeli ya fork kullanılmalı → kullanıcıya soruldu.

## Mimari

```
tarayıcı ──► Next.js (frontend/, :3000) ──/api/* rewrite──► Spring Boot (backend/, :8080) ──► PostgreSQL (:5432)
                                                              └─ @Scheduled 08:30 Europe/Istanbul → eczaneler.gen.tr (Jsoup)
Open-Meteo hava durumu: tarayıcıdan doğrudan (anahtar gerektirmiyor)
```

- Aynı köken: Next.js `rewrites` ile `/api/*` backend'e gider; çerez tabanlı oturum CORS derdi olmadan çalışır.
- Auth: Spring Security, BCrypt, HttpOnly oturum çerezi. Roller `ADMIN`, `USER`. Admin şifresi ortam değişkeninden, repoda değil.
- Şema: Flyway. Sürüm aralıkları modüllere ayrılır ki paralel düğümler çakışmasın: `V1–V9` çekirdek, `V10–V19` auth, `V20–V29` check-in, `V30–V39` itiraf, `V40–V49` ilan.
- Test: backend JUnit + Testcontainers (Postgres), frontend Vitest; uçtan uca kontrol tarayıcı panelinde.

## API sözleşmesi (Faz 1) — N4 ve N5 bunu paylaşır

| Metot | Yol | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/items?category=` | herkes | Mekan/tekel/taksi/eczane/çiçek kartları |
| GET | `/api/events` | herkes | Canlı etkinlik/maç akışı |
| GET | `/api/pharmacy/today` | herkes | Günün nöbetçi eczanesi |
| POST/PUT/DELETE | `/api/admin/items[/{id}]`, `/api/admin/events[/{id}]` | ADMIN | Admin paneli CRUD |
| POST | `/api/auth/login`, `/api/auth/logout`, GET `/api/auth/me` | — | Oturum |

Alan adları seed JSON ile birebir: `id, category, title, badge, location, phone, wa, mapUrl, desc, ...` (N1 çıktısındaki alanlar esas alınır).

## Düğümler

### Faz 1 — Mevcut özelliklerle eşdeğerlik (Tasarım 4)

| # | Düğüm | Girdi | Çıktı | Kontrol (geçti/kaldı) | Tür |
|---|---|---|---|---|---|
| N0 | Başlangıç ölçümü | `tasarim4.../index.html` | `docs/baseline/` altında açık/koyu/mobil ekran görüntüleri + `docs/baseline/parity.md` özellik listesi | 3 PNG ve parity.md var; parity.md'deki her madde bir fonksiyona/satıra referans veriyor | model + tarayıcı |
| N1 | Seed çıkarma | `tasarim4.../index.html` | `backend/src/main/resources/seed/items.json`, `events.json` | Node `vm` betiği dizileri değerlendirir; JSON'daki id kümesi = HTML'deki id kümesi (betik çıkış kodu 0) | **kod** |
| N2 | Eczane fikstürü | eczaneler.gen.tr (tek GET) | `backend/src/test/resources/pharmacy/sinop-merkez.html` | Dosya var, içinde eczane adı regex'le bulunuyor | **kod** |
| N3 | Eski dosyaları taşı | kök dosyalar | `legacy/` | `git status` yalnız rename gösteriyor (`R`), silme yok | **kod** |
| N4 | Backend çekirdek | N1, N2, API sözleşmesi | `backend/` | `mvn -q verify` 0 ile çıkar: parser testi fikstürle geçer; `/api/items` id'leri = seed id'leri; `/api/admin/*` oturumsuz 401 döner; scheduler cron'u `0 30 8 * * *` + `Europe/Istanbul` | model |
| N5 | Frontend portu | N0, N1 (tipler), API sözleşmesi | `frontend/` | `npm run build`, `tsc --noEmit`, `npm run lint` temiz; `normalizeTr` Vitest testleri (İ/ı/ş/ğ/ü/ö/ç) geçer | model |
| N6 | Bütünleştirme | N4, N5 | `docker-compose.yml`, `.env.example` | `docker compose up` sonrası `/api/items` 200; sayfada feed kartları ve eczane kartı dolu; ekran görüntüleri N0 ile yan yana karşılaştırıldı | kod + tarayıcı |

### Faz 2 — ROADMAP modülleri (Faz 1 kapısı geçtikten sonra)

| # | Düğüm | Girdi | Kontrol | Not |
|---|---|---|---|---|
| N7 | Kullanıcı giriş & profil | N6 | Kayıt/giriş/çıkış entegrasyon testleri; parola BCrypt; profil düzenleme yalnız sahibine açık (başkası 403) | Rumuz, avatar, biyo, sosyal link, gizlilik ayarı |
| N8 | Check-in & Mayor | N7 | Check-in oluştur/listele testleri; "son 30 günde en çok check-in" Mayor hesabı birim testiyle; gizli profil check-in listesinde görünmüyor | Konum: önce tek tık sanal check-in, GPS sonra |
| N9 | Gizli itiraf paneli | N7 | Anonim takma ad API yanıtında kullanıcı kimliği sızdırmıyor (test); tepki tekilleştirme; şikayet + admin gizleme uç noktası | Moderasyon zorunlu (aşağıya bak) |
| N10 | "Okeye 4." ilan akışı | N7 | Süresi dolan ilan listede yok; "Gelebilir miyim?" isteği; yalnız ilan sahibi kabul/ret yapabiliyor; iletişim bilgisi yalnız kabul edilen adaya açılıyor | Kontenjan dolunca bekleyenlere bildirim |
| N11 | Belgeler & PR | hepsi | README güncel; `checks.md` tüm satırlar dolu; PR açıldı (push öncesi kullanıcı onayı) | |

### N7 ayrıntısı — Kullanıcı giriş & profil

N7, iki paralel alt düğüme bölündü: **N7a backend**, **N7b frontend**. İkisi aşağıdaki sözleşmeyi paylaşır, birbirinin klasörüne dokunmaz. Sonra ana oturum duman testini genişletir (**N7c**).

**Kapsam kararları** (ROADMAP §3'ten; gerekçeleriyle):
- **"Misafir modu"** = hesapsız gezinme. Site zaten hesapsız geziliyor; misafir hesabı açılmaz. Kimlik gerektiren işlemler (check-in, itiraf, ilan) girişe yönlendirir.
- **Avatar** = sabit listeden seçim. Dosya yükleme yok: depolama ve görsel moderasyon yükü doğmaz.
- **E-posta doğrulama ve şifre sıfırlama yok.** Bunlar için posta altyapısı gerekiyor → açık iş olarak kaydedildi.
- **KVKK:** kayıtta aydınlatma metni onayı zorunlu. `kvkk_accepted_at` ve `kvkk_version` saklanır. `/kvkk` sayfası **TASLAK** yer tutucudur, gerçek metin hukukçudan gelecek.
- **Hesap silme var:** KVKK silme hakkı.
- **Kaba kuvvet koruması:** giriş ve kayıtta IP başına hız sınırı.
- **Mevcut admin hesabı çalışmaya devam eder.** `username` kolonu rumuz (handle) olarak kullanılır.

**Rumuz kuralları:**
- 3–20 karakter, `^[a-z0-9_.]+$`. Küçük harfe çevrilerek saklanır, büyük/küçük harf duyarsız tekildir.
- Ayrılmış rumuzlar: `admin, root, sinopcepte, destek, moderator, api, giris, kayit, profil, kvkk`.
- Şifre en az 8 karakter. E-posta tekil, küçük harf.

**Avatar anahtarları:** `marti 🕊️, hamsi 🐟, fener 🗼, kale 🏰, dalga 🌊, capa ⚓, balik 🐠, yildiz ⭐, gunes ☀️, ay 🌙, kedi 🐱, yunus 🐬`. Varsayılan `marti`.

| Metot | Yol | Yetki | Gövde → Yanıt |
|---|---|---|---|
| POST | `/api/auth/register` | herkes | `{handle,email,password,kvkkAccepted}` → 201 `Me`, oturum açılmış olarak. 400 doğrulama (`{field,message}` listesi), 409 rumuz veya e-posta dolu |
| POST | `/api/auth/login` | herkes | `{username,password}`. `username` rumuz **veya** e-posta → 200 `Me` / 401 / 429 |
| GET | `/api/auth/me` | — | 200 `Me` / 401 |
| GET | `/api/me/profile` | USER/ADMIN | 200 `OwnProfile` |
| PUT | `/api/me/profile` | USER/ADMIN | `{avatar,bio,instagram,checkinVisibility,anonymousMode}` → 200 `OwnProfile` |
| PUT | `/api/me/password` | USER/ADMIN | `{currentPassword,newPassword}` → 204 / 400 / 401 (mevcut şifre yanlış) |
| DELETE | `/api/me` | USER | `{password}` → 204, oturum kapanır. ADMIN kendini silemez → 403 |
| GET | `/api/users/{handle}` | herkes | 200 `PublicProfile` / 404 |

**Tipler:**
- `Me`: `{username, roles, handle, avatar}`. `username` = `handle`; `username` geriye dönük uyum için kalır.
- `OwnProfile`: `{handle, email, avatar, bio, instagram, checkinVisibility, anonymousMode, createdAt, roles}`.
- `PublicProfile`: `{handle, avatar, bio, instagram, createdAt, badges: []}`. **Asla e-posta, rol veya gizlilik ayarı içermez.**
- `checkinVisibility`: `PUBLIC | HIDDEN`. N8 bunu kullanacak.

**Alan sınırları:**
- `bio` en fazla 160 karakter.
- `instagram` boş ya da `^[A-Za-z0-9_.]{1,30}$`. Yalnız kullanıcı adı saklanır, URL değil.

**Hız sınırı (IP başına):**
- login: 10 dakikada 10 başarısız deneme → 429.
- register: saatte 5 → 429.
- Sınırlar ayarla değiştirilebilir; testlerde düşük değerle sınanır.

**Migration:** `V10__user_profile.sql`. Mevcut satırlar (admin) korunur.

**Frontend sayfaları:**
- `/giris`, `/kayit`, `/profil` (kendi profilin, düzenleme), `/u/[handle]` (herkese açık profil), `/kvkk` (TASLAK).
- Sol dock'ta tema düğmesinin üstünde: oturum yoksa "Giriş Yap", varsa avatar + rumuz → `/profil`.
- Admin'in gizli 3 tık girişi aynen kalır.

| # | Düğüm | Kontrol |
|---|---|---|
| N7a | Backend | `./mvnw -q verify` exit 0. Faz 1 testleri hâlâ geçer. Yeni testler: kayıt başarı ve oturum; rumuz çakışması büyük/küçük harf duyarsız 409; e-posta 409; geçersiz rumuz, ayrılmış rumuz, kısa şifre, `kvkkAccepted=false` → 400; rumuz ve e-posta ile giriş; USER → `/api/admin/**` 403; `PublicProfile` JSON anahtar kümesi tam olarak sözleşmedeki küme; geçersiz avatar 400; şifre değiştirme mevcut şifreyi ister; silme sonrası giriş 401; admin silinemez 403; hız sınırı 429; V10 sonrası admin girişi çalışır |
| N7b | Frontend | build, typecheck, lint, test exit 0. Rumuz/şifre/instagram doğrulama yardımcılarının birim testleri (backend kurallarıyla aynı örnekler). Faz 1 testleri hâlâ geçer |
| N7c | Bütünleştirme | compose up. `scripts/smoke.mjs` Faz 1'in 16 kontrolü + kayıt, giriş, profil düzenle, herkese açık profilde e-posta yok, USER admin'e 403, hesap sil → hepsi geçer |

## Kenarlar

```
N0 ─┐
N1 ─┼─► N4 ─┐
N2 ─┘       ├─► N6 ─► N7 ─┬─► N8 ─┐
N0,N1 ─► N5 ┘             ├─► N9 ─┼─► N11
N3 (bağımsız) ────────────┼─► N10 ┘
```

- Paralel: N0, N1, N2, N3 · N4 ∥ N5 (API sözleşmesi sabit olduğu için) · N8 ∥ N9 ∥ N10 (ayrı Flyway aralıkları, ayrı paketler; paylaşılan dosya: sol menü — tek tek birleştirilir).

## Kod düğümleri (deterministik, alt ajana gitmez)

- N1 seed çıkarma (`scripts/extract-seed.mjs`, Node `vm`)
- N2 fikstür indirme
- N3 `git mv`
- Seed id kümesi ↔ API yanıtı karşılaştırması (N4 testi içinde)

## Kapılar

| Kenar | Kapı |
|---|---|
| N4 → N6 | `mvn -q verify` çıkış 0 |
| N5 → N6 | build + tsc + lint + vitest çıkış 0 |
| N6 → N7 (Faz geçişi) | N6 kontrolleri + kullanıcıya rapor + onay |
| N9 → N11 | Moderasyon uç noktaları testli |
| N11 push/PR | **Kullanıcı onayı** (geri alınamaz, dışa dönük) |

## Açık riskler / sorular

1. **Push yetkisi yok** (`push:false`). PR için: Aykut'tan collaborator yetkisi, ya da fork.
2. **İtiraf paneli hukuki yük taşıyor.** Anonim, mekan etiketli içerik → kişilik hakkı ihlali riski; 5651 sayılı kanun kapsamında içerik kaldırma ve erişim kaydı tutma yükümlülükleri olabilir (tahmin: hukukçuya danışılmalı). Kayıt olmadan paylaşım kapalı, şikayet butonu ve admin kaldırma şart.
3. **KVKK.** Kullanıcı hesabı, check-in (konum) ve iletişim paylaşımı kişisel veri → aydınlatma metni ve açık rıza metni gerekecek. Metin yazımı bu grafiğin kapsamında değil.
4. Seed'deki telefonlar (ör. `0555...`) yer tutucu görünüyor (tahmin). Gerçek veriler admin panelinden girilecek.

## Öğrenilen kurallar

Faz 1'den (kabul edilen sonuçlardan) çıkan kurallar. Sonraki düğümler bunlardan başlar.

**Sürümler (ölçüldü):** Spring Boot 4.1.2 (Security 7.1, Hibernate 7.4, Flyway 12.4, Jackson 3.1, Testcontainers 2.0.5), Next.js 16.4.5, React 19.3, Tailwind 4.3.5. Mimari bölümündeki "Boot 3.x" yerine 4.1.2 seçildi.

- **Boot 4 / Jackson 3:** paketler `tools.jackson.*`, anotasyonlar hâlâ `com.fasterxml.jackson.annotation`. Starter'lar modüler (`spring-boot-starter-webmvc`, `spring-boot-starter-flyway`). Testcontainers 2: `org.testcontainers.postgresql.PostgreSQLContainer`.
- **start.spring.io pom'a `4.1.2.RELEASE` yazıyor;** Central'da yok, `4.1.2` olmalı.
- **CSRF:** Security 7'de `csrf.spa()`. İstemci `XSRF-TOKEN` çerezini **her yazmadan önce taze** okumalı. Login sonrası token yenilenir, eski token 403 alır.
- **401/403:** oturumsuz + CSRF eksik → 401; oturum var + CSRF eksik → 403.
- **Flyway:** Seed Java migration'dır (`db/migration/V2__load_seed.java`, `on conflict do nothing`). JSON `desc` → kolon `description`, `date` → `date_label`. Yeni kategori = yeni migration (DB `check` kısıtı var). Modül aralıkları: V10 auth, V20 check-in, V30 itiraf, V40 ilan.
- **Next rewrites build anında sabitlenir.** `BACKEND_URL` Docker build ARG'ı olarak verilir; adres değişirse frontend imajı yeniden derlenir. Sunucu tarafı veri çekimi ise çalışma anında okur.
- **Tailwind 4 portu:** v3 sınıfları birebir çalışmaz (`shadow-sm→shadow-xs`, `rounded→rounded-sm`, `bg-gradient-to-*→bg-linear-to-*/srgb`, `focus:outline-none→focus:outline-hidden`, `placeholder-*→placeholder:text-*`). Eski HTML'den kart taşırken bu tabloya bak.
- **Fontlar:** Cabinet Grotesk Google Fonts'ta yok (eski site de yedeğe düşüyordu). Plus Jakarta Sans en fazla 800.
- **Bu makinede port çakışması:** 8080 (başka Spring projesi) ve 3000 (`isg-frontend` konteyneri) dolu. Yerel `.env`: `DB_PORT=5440 BACKEND_PORT=8180 FRONTEND_PORT=3100`. Başka projenin sürecine dokunma.
- **Frontend testleri** seed JSON'u `../backend/...` yolundan okur; bu yüzden `*.test.ts` Docker bağlamına girmez, testler yerelde/CI'da koşar.
- **N7 (ölçüldü):** Kimlik çözümlemesi id ile yapılır (`CurrentUser.require(auth)`); silinen hesabın oturumu 401 alır. Kullanıcı silinmeden önce `UserDeletionEvent` yayınlanır: N8 check-in'leri `on delete cascade`, N9/N10 içerikleri `set null` + anonimleştirme. Hata gövdesi `{status,error,message,errors:[{field,message}]}`, 429'da `Retry-After`. ADMIN'in herkese açık profili 404.
- **Next PPR ile `notFound()` HTTP 200 + noindex döner** (akış başladıktan sonra çalışıyor). Testlerde sayfa durumuna değil API'nin 404'üne bak.
- **`X-Forwarded-For` istemciden geçiyor** (ölçüm: sahte IP ile hız sınırı aşıldı). Canlıya çıkmadan önce güvenilir proxy şart; IP'ye dayalı her yeni kural bunu hesaba katmalı.
- **Arka planda başlatılan `next dev` TaskStop'tan sonra da portu dinlemeye devam edebilir;** dinleyen PID'yi bulup kapat.
- **Duman testi her koşuda 1 kayıt harcar;** kayıt sınırı IP başına saatte 5.
- **Doğrulama zinciri:** `backend: ./mvnw -q verify` → `frontend: npm run build && npm run typecheck && npm run lint && npm run test` → `docker compose -p sinopcepte up --build -d` → `node scripts/smoke.mjs --n7` → `node scripts/screenshot.mjs http://localhost:3100/ docs/n6`.
