/* The site in a real browser (headless Chrome, two "devices"): node tools/test-browser.mjs
   Build first: node build.mjs --local. Pictures go to $SHOTS (default: the temp folder).
   1. An old Sunny Hill save on the old address comes over on the first login ("Eski kaydımı getir").
   2. Progress made on device A opens on device B; offline changes go up when the internet is back.
   3. Two devices that both played: the one playing now wins, the other copy is kept as a backup.
   4. Two children on one tablet do not mix their saves; Pocket Quest saves too.
   5. A game page opened without logging in goes to the login. 6. The teacher page: accounts, cards, a new PIN. */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startDev } from './dev.mjs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SHOTS = process.env.SHOTS || join(tmpdir(), 'oyun-sitesi-shots');
mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0, passed = 0;
const check = (ok, what, extra) => { if (ok) { passed++; console.log('  ✓ ' + what); } else { failed++; console.log('  ✗ ' + what, extra !== undefined ? JSON.stringify(extra).slice(0, 400) : ''); } };

const dev = await startDev({ port: 8787, oldPort: 8788, log: !!process.env.LOG_API });
const SITE = dev.site, OLD = dev.old;

// accounts (through the API, as the teacher)
let tCookie = '';
async function tApi(method, path, body) {
  const r = await fetch(SITE + '/api/teacher/' + path, { method, headers: { 'Content-Type': 'application/json', Origin: SITE, Cookie: tCookie }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.getSetCookie().find((c) => c.startsWith('tid='));
  if (sc) tCookie = sc.split(';')[0];
  return r.json();
}
await tApi('POST', 'login', { password: 'ogretmen-test' });
const made = (await tApi('POST', 'students', { cls: '2-A', usernames: ['alik', 'aysed'] })).created;
const ALI = made[0], AYSE = made[1];
const summaryOf = async (u, game) => {
  const d = await tApi('GET', 'students');
  const s = d.students.find((x) => x.username === u);
  return (s && s.games[game] && s.games[game].summary) || '';
};

/* ------------------------------------------------------------ chrome */
const profile = mkdtempSync(join(tmpdir(), 'os-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--mute-audio', '--hide-scrollbars', '--window-size=1180,820',
  ...(process.env.GL === 'gpu' ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']), 'about:blank'],
{ stdio: ['ignore', 'pipe', 'pipe'] });
let port = 0;
for (let i = 0; !port; i++) {
  const f = join(profile, 'DevToolsActivePort');
  if (existsSync(f)) { try { port = +readFileSync(f, 'utf8').split('\n')[0].trim(); } catch (e) { /* busy */ } }
  if (i > 150) throw new Error('chrome never came up');
  if (!port) await sleep(200);
}
let ver;
for (let i = 0; ; i++) { try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch (e) { if (i > 60) throw e; await sleep(200); } }
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map(), errors = [], labels = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p.rej(new Error(m.error.message)); else p.res(m.result); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push(`[${labels.get(m.sessionId)}] ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(`[${labels.get(m.sessionId)}] console: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (m.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true }, m.sessionId).catch(() => {});
});
function send(method, params = {}, sessionId) {
  return new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
}

const devices = [];
// one device at a time: a 3D game left running full size on the others takes all of the software renderer
async function only(P) { for (const D of devices) if (D !== P) await D.small(true); await P.small(false); await P.front(); }
async function device(label) {
  const { browserContextId } = await send('Target.createBrowserContext');
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId: sid } = await send('Target.attachToTarget', { targetId, flatten: true });
  labels.set(sid, label);
  for (const d of ['Page', 'Runtime', 'Network']) await send(d + '.enable', {}, sid);
  await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false }, sid);
  const P = {
    sid,
    go: (url) => send('Page.navigate', { url }, sid),
    ev: async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, sid);
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    wait: async (expr, ms = 20000, what) => {
      const t0 = Date.now();
      for (;;) {
        try { const v = await P.ev(expr); if (v) return v; } catch (e) { /* the page is changing */ }
        if (Date.now() - t0 > ms) {
          let seen = '';
          try {
            seen = await P.ev(`JSON.stringify({ url: location.href, text: (document.getElementById('text') || {}).textContent, stars: typeof state === 'object' ? state.stars : null,
              saved: ((localStorage.getItem('sunnyHill.save.v1') || '').match(/"stars":(\\d+)/) || [])[1], meta: localStorage.getItem('oyunSitesi.meta.sunny-hill'),
              keys: Object.keys(localStorage).map((k) => k + ':' + (localStorage.getItem(k) || '').length) })`);
          } catch (e) { seen = e.message; }
          throw new Error(`${label}: waited too long for ${what || expr} (${seen})`);
        }
        await sleep(250);
      }
    },
    shot: async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }, sid); writeFileSync(join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); },
    offline: (on) => send('Network.emulateNetworkConditions', { offline: on, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, sid),
    // a device not in use gets a tiny screen: its 3D game then costs almost nothing (freezing it would stop its game from starting later)
    small: (on) => send('Emulation.setDeviceMetricsOverride', { width: on ? 160 : 1180, height: on ? 120 : 820, deviceScaleFactor: 1, mobile: false }, sid),
    front: () => send('Page.bringToFront', {}, sid).catch(() => {}),
  };
  devices.push(P);
  return P;
}

const shown = (id) => `!!document.getElementById('${id}') && !document.getElementById('${id}').hidden`;
async function login(P, user, pin) {
  await P.go(SITE + '/');
  await P.wait(`${shown('login')} || ${shown('games')}`, 30000, 'the front page');
  if (await P.ev(shown('games'))) { await P.ev("document.getElementById('logout').click()"); await P.wait(shown('login')); }
  await P.ev(`(() => { const i = document.getElementById('user'); i.value = ${JSON.stringify(user)}; i.dispatchEvent(new Event('input'));
    [...${JSON.stringify(pin)}].forEach((d) => document.querySelector('#pad [data-k="' + d + '"]').click()); })()`);
  await P.wait(shown('games'), 15000, 'the games after logging in');
}
const launcherText = "document.getElementById('text') && document.getElementById('text').textContent";
async function press(P, label) {          // a button on the launch page
  await P.wait(`[...document.querySelectorAll('#row .btn')].some((b) => b.textContent.includes(${JSON.stringify(label)}))`, 20000, 'button ' + label);
  await P.ev(`[...document.querySelectorAll('#row .btn')].find((b) => b.textContent.includes(${JSON.stringify(label)})).click()`);
}
const inSunnyHill = (stars) => `location.pathname === '/oyun/sunny-hill/' && !!window.SH && window.SH.booted === true && state.stars === ${stars}`;
// (a tap first: the site counts a save as playing only after the child touched the game)
const save = (stars) => `(async () => { window.dispatchEvent(new Event('pointerdown')); state.stars = ${stars}; Save.save(); const r = await OyunSitesi.flush(); return r && r.status; })()`;

try {
  /* ---------------------------------------------------------------- 1 */
  console.log('1. Eski kayıt (eski adresten)');
  const A = await device('A');
  await A.go(OLD + '/tasi.html');
  await A.wait("document.getElementById('m').textContent.includes('does not work')", 10000, 'tasi.html without a code');
  await A.ev(`localStorage.setItem('sunnyHill.save.v1', ${JSON.stringify(JSON.stringify({ v: 1, parentSeen: true, created: true, started: true, name: 'Ali', stars: 5 }))});
    localStorage.setItem('sunnyHill.save.v1.album', '{}'); localStorage.setItem('pq.best', '{"l1":3}');`);
  await login(A, 'Ali K', ALI.pin);
  await A.shot('1-oyunlar');
  await A.ev("document.querySelector('.tile[data-oyun=sunny-hill] .btn').click()");
  await press(A, 'Yes, get my old save');
  await A.wait(`location.href.includes('eski=') || location.search.includes('oyun=')`, 20000);
  await press(A, 'Play');
  await A.wait(inSunnyHill(5), 90000, 'Sunny Hill with the old save (5 stars)');
  check(true, 'eski kayıt taşındı, oyun onunla açıldı');
  check((await A.ev('location.search')) === '?sinif=A', 'sınıf oyuna geçti (?sinif=A)', await A.ev('location.search'));
  check(await A.ev("!!document.getElementById('osHandle')"), 'oyunda bulut düğmesi var');
  check(await A.ev("localStorage.getItem('pq.best')") === null, 'başka oyunun anahtarları karışmadı');

  /* ---------------------------------------------------------------- 2 */
  console.log('2. Başka cihazda devam, internetsiz oynama');
  check((await A.ev(save(7))) === 200, 'A: kayıt buluta gitti');
  check((await summaryOf('alik', 'sunny-hill')) === 'Level 1 · 7 stars', 'öğretmen listesinde ilerleme', await summaryOf('alik', 'sunny-hill'));
  await A.shot('2-oyun');
  const B = await device('B');
  await only(B);
  await login(B, 'alik', ALI.pin);
  check((await B.ev("document.querySelector('.tile[data-oyun=sunny-hill] .sum') && document.querySelector('.tile[data-oyun=sunny-hill] .sum').textContent")) || '', 'oyunlar sayfasında ilerleme');
  await B.ev("document.querySelector('.tile[data-oyun=sunny-hill] .btn').click()");
  await B.wait(inSunnyHill(7), 90000, 'Sunny Hill on device B (7 stars)');
  check(true, 'B: A\'nın kaydıyla açıldı');
  await B.offline(true);
  check((await B.ev(save(8))) === 0, 'B: internet yok, kayıt cihazda bekliyor');
  check(await B.ev("OyunSitesi.isDirty(OyunSitesi.meta(OyunSitesi.game))"), 'B: bekleyen değişiklik işaretli');
  await B.offline(false);
  check((await B.ev('OyunSitesi.flush().then((r) => r.status)')) === 200, 'B: internet gelince gitti');
  check((await summaryOf('alik', 'sunny-hill')) === 'Level 1 · 8 stars', 'bulutta 8 yıldız');

  /* ---------------------------------------------------------------- 3 */
  console.log('3. İki cihaz çakışınca');
  await only(A);
  check((await A.ev(save(3))) === 200, 'A (eski sürümden) kaydetti: şimdi oynayan kazandı');
  check((await summaryOf('alik', 'sunny-hill')) === 'Level 1 · 3 stars', 'bulutta 3 yıldız');
  const bks = await tApi('GET', 'backups?id=' + (await tApi('GET', 'students')).students.find((x) => x.username === 'alik').id + '&game=sunny-hill');
  check(bks.backups.some((b) => b.reason === 'conflict' && b.summary.includes('8 stars')), 'B\'nin 8 yıldızlı kaydı yedekte', bks.backups);

  /* ---------------------------------------------------------------- 4 */
  console.log('4. Aynı tablette iki çocuk; Pocket Quest');
  await only(B);
  await login(B, 'aysed', AYSE.pin);
  await B.ev("document.querySelector('.tile[data-oyun=sunny-hill] .btn').click()");
  await press(B, 'No, start new');
  await B.wait(inSunnyHill(0), 90000, 'Sunny Hill fresh for Ayşe');
  check(true, 'Ayşe yeni oyunla açıldı (Ali\'nin kaydı yok)');
  check((await B.ev(save(2))) === 200, 'Ayşe kaydetti');
  check((await B.ev("(async () => { localStorage.removeItem('sunnyHill.save.v1'); Save.save(); return (await OyunSitesi.flush()).status; })()")) === 200, 'oyun ana kaydını sildi (New Game gibi)');
  const ayseId = (await tApi('GET', 'students')).students.find((x) => x.username === 'aysed').id;
  check((await tApi('GET', 'backups?id=' + ayseId + '&game=sunny-hill')).backups.some((b) => b.reason === 'new-game' && b.summary.includes('2 stars')), 'silinmeden önce bulutta yedeklendi');
  await login(B, 'alik', ALI.pin);
  await B.ev("document.querySelector('.tile[data-oyun=sunny-hill] .btn').click()");
  await B.wait(inSunnyHill(3), 90000, 'Sunny Hill for Ali again (3 stars)');
  check(true, 'Ali aynı tablette kendi kaydıyla (3 yıldız) açıldı');
  check((await summaryOf('aysed', 'sunny-hill')) === 'Level 1 · 2 stars', 'Ayşe\'nin kaydı ayrı duruyor');
  await only(A);
  await A.go(SITE + '/oyna?oyun=pocket-quest');
  await press(A, 'No, start new');
  await A.wait("location.pathname === '/oyun/pocket-quest/' && document.readyState === 'complete'", 30000, 'Pocket Quest');
  await sleep(1500);
  check((await A.ev(`(async () => { localStorage.setItem('pq.unit2.save', JSON.stringify({ v: 1, zone: 2, stars: 4 })); return (await OyunSitesi.flush()).status; })()`)) === 200, 'Pocket Quest kaydı buluta gitti');
  check((await summaryOf('alik', 'pocket-quest')) === 'Season 1 · Zone 3 · 4 stars', 'Pocket Quest ilerlemesi listede', await summaryOf('alik', 'pocket-quest'));
  await A.shot('3-pocket-quest');

  /* ---------------------------------------------------------------- 5 */
  console.log('5. Girişsiz açılan oyun');
  const C = await device('C');
  await only(C);
  await C.go(SITE + '/oyun/sunny-hill/');
  await C.wait(`location.pathname === '/' && location.search.includes('sonra=') && ${shown('login')}`, 20000, 'the login page');
  check(true, 'giriş sayfasına yönlendi');
  // the login page as a phone sees it
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, C.sid);
  await sleep(600);
  await C.shot('0-giris-telefon');

  /* ---------------------------------------------------------------- 6 */
  console.log('6. Öğretmen sayfası');
  const T = await device('T');
  await only(T);
  await T.go(SITE + '/ogretmen');
  await T.wait(shown('tLogin'), 10000, 'teacher login');
  await T.ev("document.getElementById('tPass').value = 'ogretmen-test'; document.getElementById('tForm').requestSubmit()");
  await T.wait(`${shown('tMain')} && document.querySelectorAll('#list tbody tr[data-id]').length === 2`, 10000, 'the list');
  check(await T.ev("document.querySelector('#list tbody').textContent.includes('3 stars')"), 'listede ilerleme görünüyor');
  await T.ev("document.querySelector('[data-tab=add]').click(); document.getElementById('newCls').value = '2-B'; document.getElementById('newNames').value = 'Can Öztürk\\nElif Şahin\\nCan Özer'; document.getElementById('preview').click()");
  await T.wait("document.querySelectorAll('#previewBox input').length === 3");
  const pre = await T.ev("[...document.querySelectorAll('#previewBox input')].map((i) => i.value)");
  check(JSON.stringify(pre) === '["cano","elifs","cano2"]', 'kullanıcı adları önerildi', pre);
  await T.ev("document.getElementById('create').click()");
  await T.wait(`${shown('tab-cards')} && document.querySelectorAll('.kcard').length === 3`, 10000, 'the cards');
  const card = await T.ev("[...document.querySelectorAll('.kcard')[1].querySelectorAll('b.big')].map((b) => b.textContent)");
  check(await T.ev("document.querySelectorAll('.kcard')[1].textContent.includes('Elif Şahin')"), 'kartta ad var (yalnızca bu bilgisayarda)');
  const lr = await fetch(SITE + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE }, body: JSON.stringify({ username: card[0], pin: card[1] }) });
  check(lr.status === 200, 'karttaki bilgilerle giriş olur', card);
  await T.shot('4-kartlar');
  await T.ev("window.confirm = () => true; document.querySelector('[data-tab=list]').click()");
  await T.wait("document.querySelectorAll('#list tbody tr[data-id]').length === 5");
  await T.ev("document.querySelector('#list tr[data-id] [data-a=pin]').click()");
  await T.wait("document.querySelectorAll('.kcard').length === 4", 10000, 'the new PIN card');
  const newPin = await T.ev("[...document.querySelectorAll('.kcard')].pop().querySelectorAll('b.big')[1].textContent");
  check(/^\d{4}$/.test(newPin), 'yeni şifre verildi', newPin);
  check((await A.ev("fetch('/api/me').then((r) => r.status)")) === 401, 'eski şifreyle açık oturum kapandı');
  await T.ev("document.querySelector('[data-tab=list]').click()");
  await T.shot('5-liste');
} catch (e) {
  failed++;
  console.log('  ✗ ' + e.message);
}

const noise = /AudioContext|favicon|Failed to load resource|ERR_INTERNET_DISCONNECTED/i;
const real = errors.filter((e) => !noise.test(e));
check(!real.length, 'sayfalarda hata yok', real.slice(0, 8));
ws.close(); chrome.kill(); dev.close();
try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* Chrome may still hold it */ }
console.log(failed ? `Tarayıcı: ${failed} sorun, ${passed} geçti` : `Tarayıcı: hepsi geçti (${passed})`);
console.log('Resimler: ' + SHOTS);
process.exit(failed ? 1 : 0);
