/*
 * Sunny Hill - headless Chrome driver.
 *
 *   node tools/drive.mjs tools/recipes/quest1.mjs
 *   node tools/drive.mjs <recipe.mjs> [url] [outDir]
 *
 * Opens the game over file:// (the way parents open it), waits for the
 * `window.SH` dev hook, then hands a small API to the recipe:
 * { evaluate, shot, savePng, send, sleep, consoleLog, OUT, viewport, navigate, URL }.
 * No npm packages: Chrome speaks CDP over a WebSocket and Node 22+ has one.
 *
 * Clicks made through evaluate() are not user gestures, so Chrome logs
 * "AudioContext was not allowed to start" for them. Those are counted
 * separately; real taps (Input.dispatchTouchEvent) do not produce them.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const recipePath = resolve(process.argv[2] || '');
const URL_ = process.argv[3] || pathToFileURL(join(ROOT, 'sunny-hill.html')).href;
const OUT = resolve(process.argv[4] || join(ROOT, 'tools', 'shots'));
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ chrome */
const profile = mkdtempSync(join(tmpdir(), 'sh-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--hide-scrollbars',
  '--allow-file-access-from-files', '--window-size=1280,800', 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
let chromeErr = '';
chrome.stderr.on('data', (d) => { chromeErr += d; });

// Chrome writes the port it took into DevToolsActivePort; it may still be
// holding the file open on the first reads, so a failed read just retries.
let port = 0;
for (let i = 0; ; i++) {
  const f = join(profile, 'DevToolsActivePort');
  if (existsSync(f)) {
    try { const p = readFileSync(f, 'utf8').split('\n')[0].trim(); if (p) { port = +p; break; } } catch { /* busy */ }
  }
  if (i > 150) { console.error('chrome never came up\n' + chromeErr); chrome.kill(); process.exit(1); }
  await sleep(200);
}
const devtools = async (p, init) => (await fetch(`http://127.0.0.1:${port}${p}`, init)).json();
for (let i = 0; ; i++) {
  try { await devtools('/json/version'); break; } catch { await sleep(200); }
  if (i > 60) { console.error('devtools never answered'); chrome.kill(); process.exit(1); }
}
const target = await devtools('/json/new?url=about:blank', { method: 'PUT' });

/* --------------------------------------------------------------------- cdp */
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
let nextId = 1;
const pending = new Map(), listeners = [], consoleLog = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { ok, no } = pending.get(m.id); pending.delete(m.id);
    m.error ? no(new Error(m.error.message)) : ok(m.result); return;
  }
  for (const fn of listeners) fn(m);
};
const send = (method, params = {}) => {
  const id = nextId++;
  return new Promise((ok, no) => { pending.set(id, { ok, no }); ws.send(JSON.stringify({ id, method, params })); });
};
listeners.push((m) => {
  if (m.method === 'Runtime.consoleAPICalled') {
    consoleLog.push({ level: m.params.type, text: (m.params.args || []).map((a) => (a.value !== undefined ? String(a.value) : a.description || a.type)).join(' ') });
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    consoleLog.push({ level: 'exception', text: (d.exception && (d.exception.description || d.exception.value)) || d.text });
  }
  if (m.method === 'Log.entryAdded') {
    const e = m.params.entry;
    if (e.level === 'error' || e.level === 'warning') consoleLog.push({ level: e.level, text: `[${e.source}] ${e.text}` });
  }
});
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

/* ----------------------------------------------------------------- helpers */
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error('page error: ' + ((d.exception && (d.exception.description || d.exception.value)) || d.text));
  }
  return r.result.value;
}
function savePng(name, dataUrl) {
  const f = join(OUT, name.endsWith('.png') ? name : name + '.png');
  writeFileSync(f, Buffer.from(String(dataUrl).replace(/^data:image\/png;base64,/, ''), 'base64'));
  return f;
}
async function viewport(w, h, { dpr = 1, mobile = false } = {}) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
  await evaluate(`window.dispatchEvent(new Event('resize'))`);
  await sleep(300);
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  return savePng(name, 'data:image/png;base64,' + r.data);
}
async function navigate(url) {
  await send('Page.navigate', { url });
  await new Promise((ok) => {
    const t = setTimeout(ok, 20000);
    listeners.push((m) => { if (m.method === 'Page.loadEventFired') { clearTimeout(t); ok(); } });
  });
  for (let i = 0; i < 100; i++) { try { if (await evaluate('!!window.SH')) break; } catch { /* parsing */ } await sleep(100); }
}

/* ------------------------------------------------------------------ recipe */
await viewport(1280, 800);
await navigate(URL_);
await sleep(300);
let failed = null;
try {
  const mod = await import(pathToFileURL(recipePath).href);
  await mod.default({ evaluate, shot, savePng, send, sleep, consoleLog, OUT, viewport, navigate, URL: URL_ });
} catch (e) { failed = e; }

const autoplay = (c) => /AudioContext was not allowed/.test(c.text);
const rest = consoleLog.filter((c) => !autoplay(c));
console.log(`\n--- console (${rest.length} + ${consoleLog.length - rest.length} autoplay warnings from synthetic input) ---`);
for (const c of rest.slice(0, 40)) console.log(`  [${c.level}] ${c.text.slice(0, 300)}`);
send('Browser.close').catch(() => {});
await sleep(150); ws.close(); chrome.kill();
if (failed) { console.error('\nRECIPE FAILED:', failed.stack || failed.message); process.exit(1); }
process.exit(0);
