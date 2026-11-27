/* The site's icons (home screen, browser tab) from public/img/logo.svg: node tools/make-icons.mjs
   Draws the picture in headless Chrome and saves public/img/icon-512.png, icon-192.png, apple-touch-icon.png, and
   icon-maskable-512.png: the same tile smaller on night blue, since Android may cut a home-screen icon to a circle
   (only its middle 80% is sure to show; the mascot fills the tile). */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const svg = readFileSync(join(SITE, 'public', 'img', 'logo.svg'), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), 'icons-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
let port = 0;
for (let i = 0; !port && i < 150; i++) {
  const f = join(profile, 'DevToolsActivePort');
  if (existsSync(f)) { try { port = +readFileSync(f, 'utf8').split('\n')[0]; } catch (e) { /* busy */ } }
  if (!port) await sleep(200);
}
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });

for (const [name, size, inner] of [['icon-512.png', 512, 512], ['icon-192.png', 192, 192], ['apple-touch-icon.png', 180, 180], ['icon-maskable-512.png', 512, 384]]) {
  await send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false });
  const html = `<html><body style="margin:0;overflow:hidden"><div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:#1d2b53">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`;
  await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') });
  let r = null;
  for (let i = 0; i < 10 && !(r && r.data); i++) {           // (the first try can come before the page is drawn)
    await sleep(400);
    r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
  }
  if (!r || !r.data) throw new Error('could not draw ' + name);
  writeFileSync(join(SITE, 'public', 'img', name), Buffer.from(r.data, 'base64'));
  console.log('public/img/' + name);
}
ws.close(); chrome.kill();
try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* Chrome may still hold it */ }
