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
| POST | `/api/auth/login` | herkes (+CSRF) | `{username,password}` → 200 `{username,roles}` ya da 401 |
| POST | `/api/auth/logout` | oturum (+CSRF) | 204 |
| GET | `/api/auth/me` | — | 200 `{username,roles}` ya da 401 |
| GET | `/actuator/health` | herkes | Sağlık kontrolü |

Alan şekilleri:

- **Kart:** `{id, category, title, badge, location, desc, phone, wa, rating, mapUrl}` —
  `seed/items.json` ile birebir. Null alanlar yazılmaz (çoğu kartta `mapUrl` yoktur). `rating` metindir (`"4.9"`).
- **Etkinlik:** `{id, title, venue, location, date, badge, desc, wa}` — `date` serbest metin etiket (`"Bugün Canlı • 20:00"`).
- **Eczane:** `lat`/`lng` JSON sayısı; `updatedAt` ISO-8601, İstanbul ofsetiyle (`"2026-11-08T08:30:12+03:00"`).
- **roles:** önek yok, ör. `["ADMIN"]`.
- **Hatalar:** `{"status":401,"error":"Unauthorized"}` biçiminde JSON. Doğrulama hatalarında `details` dizisi.

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
   - `200 {"username":"admin","roles":["ADMIN"]}` + `Set-Cookie: JSESSIONID=...; HttpOnly; SameSite=Lax`
     + **yeni** `Set-Cookie: XSRF-TOKEN=<t2>` (giriş, oturum kimliğini ve CSRF token'ını yeniler; `t1` artık geçmez).
   - `401` yanlış kullanıcı/parola · `403` CSRF başlığı eksik/yanlış.
3. **`GET /api/auth/me`** → `200 {username, roles}` (sayfa yenilendiğinde oturum kontrolü için) ya da `401`.
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

## Veri ve şema

- Flyway, `src/main/resources/db/migration`. **Sürüm aralıkları modüllere ayrılmıştır:**
  `V1–V9` çekirdek (bu modül), `V10–V19` auth, `V20–V29` check-in, `V30–V39` itiraf, `V40–V49` ilan.
- `V1__core_schema.sql`: `item`, `live_event`, `pharmacy_duty`, `app_user`.
  JSON'daki `desc` sütunda `description`, etkinlik `date` alanı sütunda `date_label`.
- `V2__load_seed` (Java migration, `src/main/java/db/migration`): `seed/items.json` ve `seed/events.json`
  dosyalarını okuyup yükler; dosya sırası `sort_order` olarak saklanır. Flyway bunu bir kez çalıştırır
  (`on conflict do nothing` ek güvence). Admin her şeyi silse bile seed geri gelmez.
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
