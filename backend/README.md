# SinopCepte Backend

Spring Boot 4.1.2 (Java 17, Maven). PostgreSQL + Flyway, Spring Security (oturum çerezi + CSRF),
nöbetçi eczane için Jsoup ile günlük çekme.

## Çalıştırma

```bash
# Gereken: JDK 17, Docker (testler için)
./mvnw verify                 # tüm testler (Testcontainers Postgres başlatır)
./mvnw spring-boot:run        # yerel Postgres'e bağlanır (aşağıdaki DB_* değişkenleri)
./mvnw spring-boot:test-run   # Postgres'i Testcontainers ile kendisi başlatır (TestBackendApplication)
docker build -t sinopcepte-backend .   # imaj (testler imaj içinde koşmaz)
```

Kök dizindeki `docker-compose.yml`, Postgres + backend + frontend'i birlikte ayağa kaldırır.

## Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/sinopcepte` | JDBC adresi |
| `DB_USERNAME` | `sinopcepte` | |
| `DB_PASSWORD` | `sinopcepte` | Üretimde mutlaka değiştirin |
| `ADMIN_USERNAME` | (yok) | Hiç ADMIN yoksa açılışta bu adla bir ADMIN oluşturulur |
| `ADMIN_PASSWORD` | (yok) | BCrypt ile saklanır. İki değişkenden biri yoksa admin **oluşturulmaz**, uyarı loglanır |
| `SESSION_COOKIE_SECURE` | `false` | HTTPS arkasında `true` yapın (oturum ve XSRF-TOKEN çerezlerine `Secure` ekler) |
| `PHARMACY_FETCH_ENABLED` | `true` | `false` ise eczaneler.gen.tr'ye hiç istek atılmaz (testlerde kapalı) |
| `PHARMACY_URL` | `https://www.eczaneler.gen.tr/iframe.php?lokasyon=1627` | Sinop Merkez |
| `KVKK_VERSION` | `taslak-1` | Kayıtta onaylanan aydınlatma metni sürümü (`app_user.kvkk_version`) |
| `LOGIN_RATE_LIMIT_MAX` / `LOGIN_RATE_LIMIT_WINDOW` | `10` / `10m` | IP başına pencere içinde izin verilen **başarısız** giriş |
| `REGISTER_RATE_LIMIT_MAX` / `REGISTER_RATE_LIMIT_WINDOW` | `5` / `1h` | IP başına pencere içinde izin verilen kayıt denemesi |
| `PORT` | `8080` | |

Admin yalnızca **hiç ADMIN yokken** oluşturulur. Değişkenleri sonradan değiştirmek mevcut admin'in
parolasını değiştirmez.

Saat dilimi: "bugün" ve zaman damgaları `Europe/Istanbul` ile hesaplanır (`app.time-zone`).

## API

| Metot | Yol | Yetki | Yanıt |
|---|---|---|---|
| GET | `/api/items?category=` | herkes | Kart dizisi, seed sırasıyla. `category` ∈ `mekan, tekel, taksi, eczane, cicek`; başka değer → 400 |
| GET | `/api/events` | herkes | Etkinlik dizisi, seed sırasıyla |
| GET | `/api/pharmacy/today` | herkes | `{name,address,phone,phoneFormatted,mapUrl,lat,lng,updatedAt}`; hiç çekilmediyse 404 |
| POST | `/api/admin/items`, `/api/admin/events` | ADMIN | 201 + oluşan kayıt. `id` verilmezse `item-xxxxxxxx` / `ev-xxxxxxxx` üretilir; var olan id → 409 |
| PUT | `/api/admin/items/{id}`, `/api/admin/events/{id}` | ADMIN | 200 + güncel kayıt; yoksa 404 |
| DELETE | `/api/admin/items/{id}`, `/api/admin/events/{id}` | ADMIN | 204; yoksa 404 |
| GET | `/api/auth/csrf` | herkes | 204, `XSRF-TOKEN` çerezini yazar |
| POST | `/api/auth/register` | herkes (+CSRF) | `{handle,email,password,kvkkAccepted}` → 201 `Me`, oturum açılmış · 400 · 409 · 429 |
| POST | `/api/auth/login` | herkes (+CSRF) | `{username,password}`; `username` rumuz **veya** e-posta → 200 `Me` · 401 · 429 |
| POST | `/api/auth/logout` | oturum (+CSRF) | 204 |
| GET | `/api/auth/me` | — | 200 `Me` ya da 401 |
| GET | `/api/me/profile` | oturum | 200 `OwnProfile` |
| PUT | `/api/me/profile` | oturum (+CSRF) | `{avatar,bio,instagram,checkinVisibility,anonymousMode}` → 200 `OwnProfile` · 400 |
| PUT | `/api/me/password` | oturum (+CSRF) | `{currentPassword,newPassword}` → 204 · 400 · 401 (mevcut şifre yanlış) · 429 |
| DELETE | `/api/me` | USER (+CSRF) | `{password}` → 204, oturum kapanır · 401 · 403 (ADMIN) · 429 |
| GET | `/api/users/{handle}` | herkes | 200 `PublicProfile` · 404 (yok ya da ADMIN) |
| GET | `/actuator/health` | herkes | Sağlık kontrolü |

Alan şekilleri:

- **Kart:** `{id, category, title, badge, location, desc, phone, wa, rating, mapUrl}` —
  `seed/items.json` ile birebir. Null alanlar yazılmaz (çoğu kartta `mapUrl` yoktur). `rating` metindir (`"4.9"`).
- **Etkinlik:** `{id, title, venue, location, date, badge, desc, wa}` — `date` serbest metin etiket (`"Bugün Canlı • 20:00"`).
- **Eczane:** `lat`/`lng` JSON sayısı; `updatedAt` ISO-8601, İstanbul ofsetiyle (`"2026-11-08T08:30:12+03:00"`).
- **roles:** önek yok, ör. `["ADMIN"]`.
- **Hatalar:** `{"status":401,"error":"Unauthorized"}` biçiminde JSON. Admin uçlarının doğrulama hatalarında
  `details` dizisi (metin). N7 uçlarında (kayıt, profil, şifre, silme) alan bazlı `errors` dizisi — aşağıya bakın.

**e-1 birleştirmesi:** En son kaydedilmiş nöbetçi eczane varsa `/api/items` içindeki `e-1` kartı şöyle döner:
`title = "<ad> (Sinop Merkez Nöbetçi)"`, `location = "📍 <adres>"`, `phone = phoneFormatted`,
`wa = "9" + phoneFormatted`, `mapUrl`. id ve diğer alanlar seed'deki gibi kalır.

## Kimlik doğrulama ve CSRF — tarayıcı açısından

Oturum sunucu tarafında tutulur; tarayıcıda yalnızca `JSESSIONID` çerezi vardır (`HttpOnly`,
`SameSite=Lax`, HTTPS'te `Secure`). JS bu çereze erişemez, erişmesi de gerekmez.

CSRF, Spring Security'nin SPA önerisiyle (`csrf.spa()`) yapılandırılmıştır:
`CookieCsrfTokenRepository.withHttpOnlyFalse()` → çerez **`XSRF-TOKEN`** (JS okuyabilir, `SameSite=Lax`),
başlık **`X-XSRF-TOKEN`**. Başlığa çerezin **ham değeri** konur; ek kodlama gerekmez.
GET/HEAD/OPTIONS için CSRF gerekmez; **POST/PUT/DELETE'in hepsinde gerekir (login dahil).**

Frontend `/api/*` isteklerini Next.js rewrite ile aynı kökenden geçirdiği için çerezler kendiliğinden
gider (`fetch(..., { credentials: "same-origin" })` varsayılanı yeterli).

Sıra:

1. **`GET /api/auth/csrf`** → `204`, yanıt `Set-Cookie: XSRF-TOKEN=<t1>; Path=/; SameSite=Lax` yazar.
   (Sayfa açılışında bir kez çağırın. Token'lar ertelemeli üretildiği için bu çağrı olmadan çerez oluşmayabilir.)
2. **`POST /api/auth/login`**
   başlıklar: `Content-Type: application/json`, `X-XSRF-TOKEN: <document.cookie'den okunan t1>`
   gövde: `{"username":"...","password":"..."}`
   - `200 {"username":"admin","roles":["ADMIN"],"handle":"admin","avatar":"marti"}` + `Set-Cookie: JSESSIONID=...; HttpOnly; SameSite=Lax`
     + **yeni** `Set-Cookie: XSRF-TOKEN=<t2>` (giriş, oturum kimliğini ve CSRF token'ını yeniler; `t1` artık geçmez).
   - `401` yanlış kullanıcı/parola · `403` CSRF başlığı eksik/yanlış.
3. **`GET /api/auth/me`** → `200 Me` (sayfa yenilendiğinde oturum kontrolü için) ya da `401`.
4. **Admin yazma işlemleri** (`POST/PUT/DELETE /api/admin/...`): her istekte `X-XSRF-TOKEN` başlığını
   **o anki** `XSRF-TOKEN` çerezinden okuyun — değeri önbelleğe almayın, çünkü giriş/çıkışta değişir.
   Çerez herhangi bir nedenle yoksa önce `GET /api/auth/csrf` çağırın.
5. **`POST /api/auth/logout`** (`X-XSRF-TOKEN` ile) → `204`; oturum düşer, `JSESSIONID` ve `XSRF-TOKEN` silinir.
   Sonraki yazma işleminden önce yine `GET /api/auth/csrf`.

Örnek istemci yardımcısı:

```ts
function xsrf(): string | undefined {
  return document.cookie.split("; ").find(c => c.startsWith("XSRF-TOKEN="))?.split("=")[1];
}
async function api(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!xsrf()) await fetch("/api/auth/csrf");
    headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf() ?? ""));
  }
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(path, { ...init, method, headers, credentials: "same-origin" });
}
```

Durum kodları:

| Durum | Yanıt |
|---|---|
| Oturum yok, korumalı uca istek (CSRF olsun olmasın) | `401` JSON — asla yönlendirme veya giriş sayfası yok |
| Oturum var, rol yetersiz (USER → `/api/admin/**`) | `403` |
| Oturum var, CSRF başlığı eksik/yanlış | `403` |
| `/api/auth/login`'e CSRF'siz istek | `403` |

## Kullanıcı hesapları (N7)

Site hesapsız gezilir; kimlik gerektiren işlemler için kayıt/giriş. E-posta doğrulama ve şifre sıfırlama
**yok** (posta altyapısı gerekiyor — açık iş). `app_user.username` kolonu rumuzdur (handle).

**Tipler**

- `Me`: `{username, roles, handle, avatar}` — `username` = `handle` (Faz 1 istemcileri için kalır).
- `OwnProfile`: `{handle, email, avatar, bio, instagram, checkinVisibility, anonymousMode, createdAt, roles}`.
  Admin'in `email`'i `null`.
- `PublicProfile`: `{handle, avatar, bio, instagram, createdAt, badges: []}` — ayrı DTO; **asla e-posta,
  rol veya gizlilik ayarı içermez** (anahtar kümesi testle sabit). Null alanlar `null` olarak yazılır.
  ADMIN hesapları herkese açık profilde 404 döner (yönetici giriş adı dışarı açılmaz).
- `createdAt`: ISO-8601, İstanbul ofsetiyle. `checkinVisibility`: `PUBLIC | HIDDEN` (N8 kullanır).

**Kurallar** (frontend aynılarını uygular; alan başına tek hata, tüm hatalı alanlar tek yanıtta)

| Alan | Kural |
|---|---|
| `handle` | trim + küçük harf (`Locale.ROOT`) **sonra** doğrulama: 3–20 karakter, `^[a-z0-9_.]+$`. Ayrılmış: `admin, root, sinopcepte, destek, moderator, api, giris, kayit, profil, kvkk` |
| `email` | kayıtta zorunlu; trim + küçük harf; `^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$`, en fazla 254 |
| `password`, `newPassword` | en az 8 karakter, en fazla **72 bayt** UTF-8 (BCrypt sınırı) |
| `kvkkAccepted` | `true` olmalı; `kvkk_accepted_at` + `kvkk_version` (`app.kvkk.version`) saklanır |
| `avatar` | `marti, hamsi, fener, kale, dalga, capa, balik, yildiz, gunes, ay, kedi, yunus` (varsayılan `marti`) |
| `bio` | trim; boş → `null`; en fazla 160 karakter (Unicode code point) |
| `instagram` | trim; boş → `null`; `^[A-Za-z0-9_.]{1,30}$` — yalnız kullanıcı adı (`@` ve URL yok) |
| `checkinVisibility`, `anonymousMode` | `PUT /api/me/profile`'da zorunlu (beş alanın hepsini gönderin) |

Rumuz ve e-posta küçük harfle saklanır; veritabanı da `check (username = lower(username))` ve
`lower(...)` üzerinde tekil index'lerle (`app_user_username_lower_uq`, `app_user_email_lower_uq`) zorlar.

**Hata gövdeleri**

```json
400 {"status":400,"error":"Bad Request","message":"Doğrulama hatası",
     "errors":[{"field":"handle","message":"Rumuz 3–20 karakter olmalı"}]}
409 {"status":409,"error":"Conflict","message":"Bu rumuz zaten alınmış","errors":[{"field":"handle","message":"..."}]}
401 {"status":401,"error":"Unauthorized","message":"Mevcut şifre hatalı","errors":[{"field":"currentPassword","message":"..."}]}
429 {"status":429,"error":"Too Many Requests","message":"Çok fazla deneme. Lütfen daha sonra tekrar deneyin."}  + Retry-After: <saniye>
```

409 alanları: `handle` ("Bu rumuz zaten alınmış") veya `email` ("Bu e-posta adresiyle kayıtlı bir hesap var");
ikisi de doluysa `handle` döner. `PUT /api/me/password`'daki 401 oturumun düştüğü anlamına **gelmez**.

**Akışlar**

1. **Kayıt:** `GET /api/auth/csrf` → `POST /api/auth/register` (`X-XSRF-TOKEN` ile). 201'de giriş ile aynı
   mekanik: yeni `JSESSIONID` + **yeni** `XSRF-TOKEN`. CSRF'siz istek 403 (login gibi).
2. **Giriş:** `username` rumuz veya e-posta, büyük/küçük harf duyarsız. Yanıttaki `Me.username` her zaman rumuz.
3. **Profil:** `PUT /api/me/profile` yalnız oturum sahibini değiştirir; hedef kullanıcı yol/gövdeden alınmaz.
   Başka bir kullanıcıyı düzenleyen uç **yoktur**.
4. **Şifre değiştirme:** mevcut şifre şart; başarıda oturum kimliği (`JSESSIONID`) yenilenir.
   Diğer cihazlardaki oturumlar düşürülmez (oturum kaydı tutulmuyor — açık iş).
5. **Hesap silme:** `DELETE /api/me` `{password}` → satır silinir, oturum kapanır (çerezler silinir).
   ADMIN kendini silemez (403). Başka tarayıcıdaki eski oturumlar sonraki istekte 401 alır: oturumdaki kimlik
   kullanıcı **id**'sini taşır ve her istekte veritabanından çözülür (`CurrentUser`); rumuz yeniden alınsa bile
   eski oturum yeni hesaba geçmez.

**Hesap silme — sonraki modüller (N8–N10) için yaklaşım**

- Silmeden hemen önce, aynı transaction içinde `UserDeletionEvent(userId, handle)` yayımlanır. Modül kendi
  verisini `@EventListener` ile temizler/anonimleştirir; dinleyici hata fırlatırsa silme geri alınır.
- Yalnız kullanıcıya ait kişisel iz (check-in/konum): `app_user(id)`'ye FK `on delete cascade`.
- Başkalarının da gördüğü içerik (itiraf, ilan, başvurular): FK `on delete set null`; içerik görünür kalacaksa
  yazar "silinmiş kullanıcı" olarak gösterilir; iletişim bilgisi gibi kişisel alanlar olayda temizlenir.
- Oturum sahibini her zaman `CurrentUser.require(auth)` ile alın (id ile); rumuz metnine güvenmeyin.

**Hız sınırı (IP başına, bellek içi)**

- Giriş: pencere (10 dk) içinde 10 **başarısız** deneme → 429. Sınır parola denetiminden **önce** uygulanır;
  sınır dolunca doğru parola da 429 alır. Başarılı giriş sayılmaz ve sayacı sıfırlamaz. `PUT /api/me/password`
  ve `DELETE /api/me`'deki yanlış şifreler de aynı sayaca yazılır.
- Kayıt: saatte 5 deneme → 429. 400 doğrulama hataları sayılmaz; geçerli gövdeli her deneme (201/409) sayılır.
- Sayaçlar bellektedir: yeniden başlatmada sıfırlanır, birden çok backend örneğinde paylaşılmaz.
- **IP kaynağı:** `request.getRemoteAddr()`. `server.forward-headers-strategy=framework` olduğu için bu,
  `X-Forwarded-For`'un **en soldaki** değeridir ve başlık **herkesten** kabul edilir. Bu yüzden:
  - Backend portu internete açık olmamalı (compose'da `127.0.0.1`'e bağlı).
  - Önündeki vekil başlığı istemciden gelene **eklemeden, kendisi yazmalı**:
    nginx'te `proxy_set_header X-Forwarded-For $remote_addr;` (`$proxy_add_x_forwarded_for` **değil**).
    Aksi halde istemci sahte IP ile sınırı aşar.
  - Vekil başlığı hiç göndermezse tüm kullanıcılar vekilin IP'sini paylaşır ve sınır site geneline uygulanır.

## Veri ve şema

- Flyway, `src/main/resources/db/migration`. **Sürüm aralıkları modüllere ayrılmıştır:**
  `V1–V9` çekirdek (bu modül), `V10–V19` auth, `V20–V29` check-in, `V30–V39` itiraf, `V40–V49` ilan.
- `V1__core_schema.sql`: `item`, `live_event`, `pharmacy_duty`, `app_user`.
  JSON'daki `desc` sütunda `description`, etkinlik `date` alanı sütunda `date_label`.
- `V2__load_seed` (Java migration, `src/main/java/db/migration`): `seed/items.json` ve `seed/events.json`
  dosyalarını okuyup yükler; dosya sırası `sort_order` olarak saklanır. Flyway bunu bir kez çalıştırır
  (`on conflict do nothing` ek güvence). Admin her şeyi silse bile seed geri gelmez.
- `V10__user_profile.sql`: `app_user`'a `email` (nullable, admin'de yok), `avatar` (varsayılan `marti`), `bio`,
  `instagram`, `checkin_visibility` (`PUBLIC`/`HIDDEN`, varsayılan `PUBLIC`), `anonymous_mode` (varsayılan
  `false`), `kvkk_accepted_at`, `kvkk_version`. Mevcut rumuzlar küçük harfe çevrilir; küçük harf `check`
  kısıtları ve `lower(...)` tekil index'leri eklenir. Mevcut admin satırı korunur.
- Hibernate `ddl-auto: validate` — şemayı yalnız Flyway değiştirir.

## Nöbetçi eczane işi

- Kaynak: `https://www.eczaneler.gen.tr/iframe.php?lokasyon=1627`, `User-Agent: SinopCepte/1.0`.
- Zamanlama: `@Scheduled(cron = "0 30 8 * * *", zone = "Europe/Istanbul")` + açılışta, bugünün kaydı yoksa bir kez.
- Ayrıştırma Jsoup ile, sabit işaretlerden (`span.text-dark > b`, `a[href*=maps]`,
  `img[alt=telefon]` / `img[alt=adres]` hücresinin yanındaki hücre). Sayfada `</tr>` eksik olduğundan
  satır sırasına güvenilmez. Koordinatlar harita linkindeki `daddr=LAT,LNG`'den alınır.
- Çekme veya ayrıştırma başarısız olursa son kayıt korunur, uyarı loglanır; iş dışarı exception fırlatmaz.
- Gün başına bir kayıt (`duty_date` unique); aynı gün tekrar çekilirse güncellenir.

## Testler

`./mvnw verify` — JUnit 5 + Testcontainers (`postgres:17-alpine`, `@ServiceConnection`). Tüm entegrasyon
testleri aynı yapılandırmayı paylaşır (tek context, tek konteyner) ve gerçek HTTP üzerinden, tarayıcı
gibi çerez tutan bir istemciyle koşar.

| Test | Ne kontrol eder |
|---|---|
| `PharmacyParserTest` | Fikstürden ad, telefon, `phoneFormatted`, adres, harita, lat/lng birebir (ağ yok) |
| `PharmacyServiceTest` | Ağ/ayrıştırma hatasında kayıt yazılmaz, exception sızmaz; bayrak kapalıyken ağa gidilmez |
| `PharmacyJobScheduleTest` | `@Scheduled` cron `0 30 8 * * *`, zone `Europe/Istanbul` |
| `CatalogApiTest` | `/api/items` ve `/api/events` = seed dosyaları (id kümesi, sıra, tüm alanlar); kategori filtresi; 400/404 |
| `PharmacyMergeTest` | Eczane kaydı varken `e-1` birleştirmesi; diğer kartlar değişmez; `/api/pharmacy/today` şekli |
| `AdminSecurityTest` | 6 admin ucu oturumsuz 401 (CSRF'li ve CSRF'siz); USER rolü 403 |
| `AdminFlowTest` | csrf → login → oluştur → listede → güncelle → sil → logout; giriş sonrası token yenilenir; CSRF'siz yazma 403; yanlış parola 401; çerez bayrakları |
| `RegistrationTest` | Kayıt 201 + oturum + token yenileme + `Me` anahtar kümesi; küçük harfle saklama; CSRF'siz 403; rumuz/e-posta 409 (büyük/küçük harf duyarsız, alan adıyla); geçersiz/ayrılmış rumuz, kısa/72 bayttan uzun şifre, geçersiz e-posta, `kvkkAccepted≠true` → 400 `errors`; sınır değerleri kabul |
| `LoginTest` | Rumuz ve e-postayla (büyük/küçük harf, boşluk) giriş; USER → admin 403; V10 sonrası admin girişi ve `Me`; DB küçük harf kısıtları ve `lower()` index'leri |
| `V10MigrationTest` | Ayrı şemada V1–V2 + büyük harfli Faz 1 admin'i → V10: satır korunur, rumuz küçülür, varsayılanlar dolar |
| `RateLimitTest` | 3 başarısız girişten sonra doğru parola da 429 + `Retry-After`; başka IP etkilenmez; başarılı giriş sayılmaz; kayıt sınırı (400'ler sayılmaz) |
| `ProfileTest` | `OwnProfile` şekli/varsayılanlar; oturumsuz 401; profil güncelleme ve temizleme; geçersiz avatar/bio/instagram/görünürlük 400; başkasının profili düzenlenemez; `PublicProfile` anahtar kümesi tam ve özel veri yok; ADMIN 404 |
| `AccountTest` | Şifre değiştirme mevcut şifreyi ister (401/400/204), eski şifre geçmez; hesap silme: yanlış şifre 401, sonra giriş 401, eski oturumlar 401, rumuz yeniden alınsa da eski oturum geçmez; admin silinemez 403; `UserDeletionEvent` yayımlanır |

Testlerde hız sınırları düşüktür (`application-test.yml`: 3/3) ve her `TestHttp` istemcisi kendi
`X-Forwarded-For` IP'siyle gelir; sayaçlar testler arasında karışmaz.
