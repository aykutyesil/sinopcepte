// N6 — çalışan yığına karşı uçtan uca duman testi. Tüm çağrılar frontend kökeninden (rewrite + çerez) gider.
// Kullanım: node scripts/smoke.mjs [frontendUrl]   (varsayılan http://localhost:$FRONTEND_PORT, .env'den)
// Admin bilgileri .env'deki ADMIN_USERNAME / ADMIN_PASSWORD. Çıkış kodu: 0 = hepsi geçti.
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const BASE = process.argv[2] || `http://localhost:${env.FRONTEND_PORT || 3000}`;
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

const failed = results.filter(x => !x.ok).length;
console.log(`\n${results.length - failed}/${results.length} geçti`);
process.exit(failed ? 1 : 0);
