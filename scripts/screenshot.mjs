// Başsız Chrome + CDP ile tam sayfa ekran görüntüsü (açık/koyu, masaüstü/mobil).
// Kullanım: node scripts/screenshot.mjs <url> <hedef-klasör> [önek]
// Tema localStorage 'sinopcepte_theme' anahtarıyla seçilir (eski ve yeni site aynı anahtarı kullanır).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [url, outDir, prefix = ''] = process.argv.slice(2);
if (!url || !outDir) { console.error('Kullanım: node scripts/screenshot.mjs <url> <klasör> [önek]'); process.exit(1); }
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const profile = mkdtempSync(join(tmpdir(), 'sc-shot-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function wsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome DevTools açılmadı');
}

const ws = new WebSocket(await wsUrl());
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map(); const waiters = [];
ws.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
  else if (msg.method) waiters.filter(w => w.method === msg.method).forEach(w => w.resolve(msg.params));
});
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const once = method => new Promise(resolve => waiters.push({ method, resolve }));

await send('Page.enable');
mkdirSync(outDir, { recursive: true });
const shots = [
  { name: 'masaustu-koyu', theme: 'dark', w: 1440, h: 900, mobile: false },
  { name: 'masaustu-acik', theme: 'light', w: 1440, h: 900, mobile: false },
  { name: 'mobil-koyu', theme: 'dark', w: 390, h: 844, mobile: true },
];
for (const s of shots) {
  await send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: 1, mobile: s.mobile });
  let loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url }); await loaded;
  await send('Runtime.evaluate', { expression: `localStorage.setItem('sinopcepte_theme', '${s.theme}')` });
  loaded = once('Page.loadEventFired');
  await send('Page.reload', { ignoreCache: true }); await loaded;
  await sleep(2500); // fetch (eczane, hava durumu) ve font yüklemesi
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const file = join(outDir, `${prefix}${s.name}.png`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(file);
}
ws.close(); chrome.kill();
