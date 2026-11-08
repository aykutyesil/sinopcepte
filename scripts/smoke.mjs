// N6 — çalışan yığına karşı uçtan uca duman testi. Tüm çağrılar frontend kökeninden (rewrite + çerez) gider.
// Kullanım: node scripts/smoke.mjs [frontendUrl] [--n7]   (varsayılan http://localhost:$FRONTEND_PORT, .env'den)
//   --n7: kullanıcı kaydı/profil/silme kontrollerini de çalıştırır (kendi test kullanıcısını açar ve siler)
// Admin bilgileri .env'deki ADMIN_USERNAME / ADMIN_PASSWORD. Çıkış kodu: 0 = hepsi geçti.
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const BASE = process.argv.slice(2).find(a => !a.startsWith('--')) ||`http://localhost:${env.FRONTEND_PORT || 3000}`;
const seedItems = JSON.parse(readFileSync('backend/src/main/resources/seed/items.json', 'utf8'));
const seedEvents = JSON.parse(readFileSync('backend/src/main/resources/seed/events.json', 'utf8'));

const jar = new Map();
async function req(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  const res = await fetch(BASE + path, { ...opts, headers, redirect: 'manual' });
  for (const c of res.headers.getSetCookie()) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i), kv.slice(i + 1)); }
  return res;
}
const results = [];
function check(name, ok, detail = '') { results.push({ name, ok }); console.log(`${ok ? 'GEÇTİ' : 'KALDI'} | ${name}${detail ? ' | ' + detail : ''}`); }
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// 1. Okuma uç noktaları
let r = await req('/api/items'); const items = r.ok ? await r.json() : [];
check('/api/items id listesi = seed (sıra dahil)', r.status === 200 && sameList(items.map(i => i.id), seedItems.map(i => i.id)), `status=${r.status} n=${items.length}`);
r = await req('/api/events'); const events = r.ok ? await r.json() : [];
check('/api/events id listesi = seed', r.status === 200 && sameList(events.map(e => e.id), seedEvents.map(e => e.id)), `status=${r.status} n=${events.length}`);
r = await req('/api/items?category=taksi'); const tx = r.ok ? await r.json() : [];
check('kategori filtresi taksi → 3 kayıt', r.status === 200 && tx.length === 3 && tx.every(i => i.category === 'taksi'), `n=${tx.length}`);
r = await req('/api/pharmacy/today'); const ph = r.ok ? await r.json() : null;
check('/api/pharmacy/today 200 ve ad dolu', r.status === 200 && !!ph?.name, ph ? `${ph.name} • ${ph.updatedAt}` : `status=${r.status}`);
const e1 = items.find(i => i.id === 'e-1');
check('e-1 kartı bugünkü eczaneyle birleşik', !!ph && e1?.title === `${ph.name} (Sinop Merkez Nöbetçi)` && e1?.wa === `9${ph.phoneFormatted}`, e1?.title);

// 2. Sayfa
r = await req('/'); const html = await r.text();
check('ana sayfa 200 ve seed başlığı HTML içinde', r.status === 200 && html.includes(seedItems[0].title), `status=${r.status}`);
check('eczane adı sayfada', !!ph && html.includes(ph.name));

// 3. Yetki
r = await req('/api/admin/items', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
check('oturumsuz POST /api/admin/items → 401', r.status === 401, `status=${r.status}`);
r = await req('/api/auth/me');
check('oturumsuz /api/auth/me → 401', r.status === 401, `status=${r.status}`);

// 4. Admin akışı (CSRF ile)
await req('/api/auth/csrf');
const xsrf = () => decodeURIComponent(jar.get('XSRF-TOKEN') || '');
const json = (method, body) => ({ method, headers: { 'content-type': 'application/json', 'X-XSRF-TOKEN': xsrf() }, body: JSON.stringify(body) });
r = await req('/api/auth/login', json('POST', { username: env.ADMIN_USERNAME, password: 'yanlis-' + Date.now() }));
check('yanlış şifre → 401', r.status === 401, `status=${r.status}`);
await req('/api/auth/csrf');
r = await req('/api/auth/login', json('POST', { username: env.ADMIN_USERNAME, password: env.ADMIN_PASSWORD }));
check('doğru şifre → 200', r.status === 200, `status=${r.status}`);
const id = 'smoke-' + Date.now();
r = await req('/api/admin/items', json('POST', { id, category: 'tekel', title: 'Duman Testi Tekel', badge: 'Test', location: 'Sinop', desc: 'Silinecek', phone: '03680000000', wa: '903680000000', rating: '4.0' }));
check('admin item oluşturma', r.status === 200 || r.status === 201, `status=${r.status}`);
r = await req('/api/items'); let now = await r.json();
check('yeni item listede', now.some(i => i.id === id));
r = await req(`/api/admin/items/${id}`, { method: 'DELETE', headers: { 'X-XSRF-TOKEN': xsrf() } });
check('admin item silme', r.status === 200 || r.status === 204, `status=${r.status}`);
r = await req('/api/items'); now = await r.json();
check('silinen item listede yok, seed geri geldi', !now.some(i => i.id === id) && sameList(now.map(i => i.id), seedItems.map(i => i.id)));
r = await req('/api/auth/logout', { method: 'POST', headers: { 'X-XSRF-TOKEN': xsrf() } });
check('çıkış', r.status === 200 || r.status === 204, `status=${r.status}`);

// 5. N7 — kullanıcı kaydı, profil, gizlilik, silme (yalnız --n7 ile)
if (process.argv.includes('--n7')) {
  jar.clear();
  await req('/api/auth/csrf');
  const handle = `duman_${Date.now().toString(36)}`;
  const email = `${handle}@example.test`;
  const password = 'Sifre-' + Math.random().toString(36).slice(2, 10);
  r = await req('/api/auth/register', json('POST', { handle, email, password, kvkkAccepted: true }));
  const me = r.ok ? await r.json() : null;
  check('kayıt → 201, oturum açık, rol USER', r.status === 201 && me?.handle === handle && sameList(me?.roles || [], ['USER']), `status=${r.status}`);
  r = await req('/api/auth/me');
  check('kayıt sonrası /api/auth/me 200', r.status === 200);
  r = await req('/api/auth/register', json('POST', { handle: handle.toUpperCase(), email: 'baska-' + email, password, kvkkAccepted: true }));
  check('aynı rumuz büyük harfle → 409', r.status === 409, `status=${r.status}`);
  r = await req('/api/auth/register', json('POST', { handle: 'admin', email: 'x-' + email, password, kvkkAccepted: true }));
  check('ayrılmış rumuz → 400', r.status === 400, `status=${r.status}`);
  r = await req('/api/me/profile'); const own = r.ok ? await r.json() : null;
  check('/api/me/profile e-postayı içerir', r.status === 200 && own?.email === email, `status=${r.status}`);
  r = await req('/api/me/profile', json('PUT', { avatar: 'kale', bio: 'Duman testi biyo', instagram: 'sinop_test', checkinVisibility: 'HIDDEN', anonymousMode: false }));
  const upd = r.ok ? await r.json() : null;
  check('profil güncelle → 200, avatar kale', r.status === 200 && upd?.avatar === 'kale' && upd?.checkinVisibility === 'HIDDEN', `status=${r.status}`);
  r = await req('/api/me/profile', json('PUT', { avatar: 'ejderha', bio: '', instagram: '', checkinVisibility: 'PUBLIC', anonymousMode: false }));
  check('geçersiz avatar → 400', r.status === 400, `status=${r.status}`);
  r = await req(`/api/users/${handle}`); const pub = r.ok ? await r.json() : null;
  const keys = pub ? Object.keys(pub).sort() : [];
  check('herkese açık profil anahtarları = sözleşme', sameList(keys, ['avatar', 'badges', 'bio', 'createdAt', 'handle', 'instagram']), keys.join(','));
  check('herkese açık profilde e-posta yok', !!pub && !JSON.stringify(pub).includes(email));
  r = await req(`/u/${handle}`); const prof = await r.text();
  check('/u/<rumuz> sayfası 200 ve rumuz görünür', r.status === 200 && prof.includes(handle), `status=${r.status}`);
  for (const p of ['/giris', '/kayit', '/kvkk']) { r = await req(p); check(`${p} sayfası 200`, r.status === 200, `status=${r.status}`); }
  r = await req('/api/admin/items', json('POST', { category: 'tekel', title: 'x' }));
  check('USER → /api/admin 403', r.status === 403, `status=${r.status}`);
  await req('/api/auth/logout', { method: 'POST', headers: { 'X-XSRF-TOKEN': xsrf() } });
  await req('/api/auth/csrf');
  r = await req('/api/auth/login', json('POST', { username: email, password }));
  check('e-posta ile giriş → 200', r.status === 200, `status=${r.status}`);
  r = await req('/api/me', json('DELETE', { password }));
  check('hesap silme → 204', r.status === 204, `status=${r.status}`);
  r = await req(`/api/users/${handle}`);
  check('silinen kullanıcı profili → 404', r.status === 404, `status=${r.status}`);
  await req('/api/auth/csrf');
  r = await req('/api/auth/login', json('POST', { username: handle, password }));
  check('silinen kullanıcı girişi → 401', r.status === 401, `status=${r.status}`);
}

const failed = results.filter(x => !x.ok).length;
console.log(`\n${results.length - failed}/${results.length} geçti`);
process.exit(failed ? 1 : 0);
