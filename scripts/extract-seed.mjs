// N1 — Tasarım 4 HTML'indeki defaultData / defaultLiveEvents dizilerini seed JSON'a çıkarır.
// Kullanım: node scripts/extract-seed.mjs <kaynak.html> <hedef-klasör>
// Çıkış kodu: 0 = id kümeleri birebir, 1 = uyuşmazlık / ayrıştırma hatası.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const [src, outDir] = process.argv.slice(2);
if (!src || !outDir) {
  console.error('Kullanım: node scripts/extract-seed.mjs <kaynak.html> <hedef-klasör>');
  process.exit(1);
}
const html = readFileSync(src, 'utf8');

function extractArray(name) {
  const start = html.indexOf(`const ${name} = [`);
  if (start < 0) throw new Error(`${name} bulunamadı`);
  const open = html.indexOf('[', start);
  // Köşeli parantez dengesini string'leri atlayarak say
  let depth = 0, i = open, quote = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) break; }
  }
  const literal = html.slice(open, i + 1);
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
}

const items = extractArray('defaultData');
const events = extractArray('defaultLiveEvents');

// Kontrol: HTML'deki id kümesi = çıkarılan id kümesi
// Yalnız veri bloğu (admin kaydetmedeki `'ev-' + Date.now()` şablonları hariç)
const scriptStart = html.indexOf('const defaultLiveEvents');
const scriptEnd = html.indexOf('const DATA_KEY', scriptStart);
const htmlIds = new Set([...html.slice(scriptStart, scriptEnd).matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]));
const jsonIds = new Set([...items, ...events].map(x => x.id));
const missing = [...htmlIds].filter(id => !jsonIds.has(id));
const extra = [...jsonIds].filter(id => !htmlIds.has(id));
const dupes = [...items, ...events].length !== jsonIds.size;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'items.json'), JSON.stringify(items, null, 2) + '\n', 'utf8');
writeFileSync(join(outDir, 'events.json'), JSON.stringify(events, null, 2) + '\n', 'utf8');

const fields = [...new Set(items.flatMap(Object.keys))];
const evFields = [...new Set(events.flatMap(Object.keys))];
console.log(`items=${items.length} events=${events.length} htmlIds=${htmlIds.size}`);
console.log(`item alanları: ${fields.join(', ')}`);
console.log(`event alanları: ${evFields.join(', ')}`);
if (missing.length || extra.length || dupes) {
  console.error(`UYUŞMAZLIK eksik=${missing} fazla=${extra} tekrar=${dupes}`);
  process.exit(1);
}
console.log('OK: id kümeleri birebir');
