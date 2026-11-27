// The front page: the site's welcome with the login card (username + a 4-digit PIN on a keypad),
// and after logging in the child's own page with the games.
import { GAMES } from './games.js';
import { canonUser } from './names.js';
import { $, ago, registerSW } from './util.js';
import { greet } from './batu.js';
import { startWorld, startStrip } from './hero.js';
import { blip, back, buzz, jingle, start as startSound, fanfare, confetti, wipe, soundOn, setSound } from './sfx.js';
import { showGuide, canInstall, installNow, onInstallable } from './guide.js';

const S = window.OyunSitesi;
const still = matchMedia('(prefers-reduced-motion: reduce)');
$('old').hidden = true;
registerSW();
startWorld($('world'));
startStrip($('strip'));
// the title's letters drop in one by one, then give a little wave now and then (site.css: .word .ch)
{
  let i = 0;
  const walk = (n) => {
    for (const c of [...n.childNodes]) {
      if (c.nodeType !== 3) { walk(c); continue; }
      const f = document.createDocumentFragment();
      for (const ch of c.textContent) { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; f.appendChild(s); }
      c.replaceWith(f);
    }
  };
  walk(document.querySelector('.hero .word'));
}

// the speaker in the login window: the key sounds on or off (kept on this device)
function speaker() { const on = soundOn(); $('sound').setAttribute('aria-pressed', String(on)); $('sound').firstElementChild.className = 'pi ' + (on ? 'pi-sound' : 'pi-mute'); }
$('sound').addEventListener('click', () => { setSound(!soundOn()); speaker(); blip(); });
speaker();
// "Press start" (and every "Log in" below it): to the login window, which flashes, the username first
function toLogin() {
  $('login').scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'center' });
  const card = $('login'); card.classList.remove('glow'); void card.offsetWidth; card.classList.add('glow');
  setTimeout(() => { if (!canonUser($('user').value)) $('user').focus({ preventScroll: true }); }, 400);
  startSound();
}
$('start').addEventListener('click', toLogin);

let pin = '', busy = false;

/* --------------------------------------------------------- the front page */
// Choose your game: a window per game; its screen shows the game's own pictures in turn, each slowly panned, then cut
$('gameCards').innerHTML = '';
for (const g of GAMES) {
  const c = document.createElement('article');
  c.className = 'gsel';
  if (g.accent) c.style.setProperty('--acc', g.accent);
  c.innerHTML = `<div class="gwin-head"><h3></h3><div class="tags"></div></div>
    <div class="scr"><span class="pips" aria-hidden="true"></span></div>
    <div class="body"><p></p><button class="btn go" type="button"><i class="pi pi-play"></i>Log in to play</button></div>`;
  c.querySelector('h3').textContent = g.title;
  c.querySelector('p').textContent = g.about || g.tagline;
  for (const t of g.tags || []) {
    const s = document.createElement('span');
    s.className = 'tagc'; s.textContent = t;
    c.querySelector('.tags').appendChild(s);
  }
  const scr = c.querySelector('.scr'), pips = c.querySelector('.pips');
  (g.shots || [g.cover]).forEach((src, i) => {
    const im = document.createElement('img');
    im.alt = i ? '' : 'A picture from ' + g.title; im.loading = 'lazy'; im.decoding = 'async'; im.src = src;
    im.style.setProperty('--dx', i % 2 ? -1 : 1);          // (every other picture pans the other way)
    scr.insertBefore(im, pips);
    pips.appendChild(document.createElement('i'));
  });
  c.querySelector('.btn').setAttribute('aria-label', 'Log in to play ' + g.title);
  c.querySelector('.btn').addEventListener('click', toLogin);
  $('gameCards').appendChild(c);
  preview(scr);
}
function preview(scr) {          // only while the screen can be seen; one still picture when motion is turned off
  const shots = [...scr.querySelectorAll('img')], pips = [...scr.querySelectorAll('.pips i')];
  let i = -1, timer = 0;
  const show = (n) => {
    shots.forEach((im) => im.classList.remove('was'));
    if (i >= 0) { shots[i].classList.remove('on'); shots[i].classList.add('was'); }
    i = n % shots.length;
    shots[i].classList.remove('was', 'on'); void shots[i].offsetWidth; shots[i].classList.add('on');
    pips.forEach((p, k) => p.classList.toggle('on', k === i));
  };
  show(0);
  if (shots.length < 2) return;
  new IntersectionObserver((e) => {
    clearInterval(timer);
    if (e[0].isIntersecting && !still.matches) timer = setInterval(() => { if (!document.hidden) show(i + 1); }, 4600);          // (= the pan in site.css)
  }).observe(scr);
}
$('ctaLogin').addEventListener('click', (e) => { e.preventDefault(); toLogin(); });

function nav(user) {          // the top bar: links for visitors, the child's name after logging in
  $('navLinks').hidden = !!user;
  $('navTeacher').hidden = !!user;
  $('navUser').hidden = !user;
  $('logout').hidden = !user;
  $('skip').href = user ? '#picks' : '#login';
  $('skip').textContent = user ? 'Skip to the games' : 'Skip to the login';
  if (user) {
    $('navAv').textContent = user.username.slice(0, 1);
    $('navName').textContent = user.username;
    $('navCls').textContent = user.cls ? 'Class ' + user.cls : '';
  }
}

/* ------------------------------------------------------------------ login */
const known = () => { try { return JSON.parse(S.get('oyunSitesi.hatirla') || '[]'); } catch (e) { return []; } };
function remember(u) {
  const L = known().filter((x) => x !== u);
  L.unshift(u);
  S.set('oyunSitesi.hatirla', JSON.stringify(L.slice(0, 6)));
}

function dots(pop) {
  [...$('dots').children].forEach((d, i) => { d.classList.toggle('on', i < pin.length); d.classList.toggle('pop', !!pop && i === pin.length - 1); });
}

function showLogin(message) {
  nav(null);
  $('games').hidden = true;
  $('landing').hidden = false;
  $('login').hidden = false;
  $('pitch').hidden = false;
  $('hello').hidden = true;
  $('picks').hidden = true;
  const k = known();
  $('known').hidden = !k.length;
  $('chips').innerHTML = '';
  for (const u of k) {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'chip'; c.textContent = u;
    c.addEventListener('click', () => { $('user').value = u; pin = ''; dots(); mark(); });
    $('chips').appendChild(c);
  }
  pin = ''; dots();
  $('msg').textContent = message || '';
  mark();
}
function mark() {
  const u = canonUser($('user').value);
  [...$('chips').children].forEach((c) => c.classList.toggle('on', c.textContent === u));
}

function fail(text) {
  $('msg').textContent = text;
  buzz();
  const card = $('login'), d = $('dots');
  card.classList.remove('shake'); d.classList.remove('bad'); void card.offsetWidth; card.classList.add('shake'); d.classList.add('bad');
}

async function doLogin(user, p) {
  if (busy) return;
  if (!canonUser(user)) { $('user').focus(); return fail('Type your username first.'); }
  if (!/^\d{4}$/.test(p)) return fail('The PIN has 4 digits.');
  busy = true; $('msg').textContent = '';
  const r = await S.api('login', { username: user, pin: p });
  busy = false;
  if (r.ok) {
    const u = r.data.user;
    remember(u.username);
    S.set('oyunSitesi.kullanici', u.username);
    S.set('oyunSitesi.sinif', u.cls || '');
    const next = new URLSearchParams(location.search).get('sonra');
    jingle();
    if (next && next.startsWith('/') && !next.startsWith('//')) { location.replace(next); return; }
    const me = await S.api('me');
    wipe(() => showGames(me.ok ? me.data : { user: u, games: {} }));
    return;
  }
  pin = ''; dots();
  if (r.status === 429) return fail(`Too many wrong tries. Try again in ${r.data.minutes} minutes or ask your teacher.`);
  if (r.status === 401) return fail('Wrong username or PIN.');
  if (r.status === 0) return fail('No internet connection.');
  fail('Something went wrong. Try again in a moment.');
}

function key(k) {
  if (busy) return;
  if (k === 'del') { pin = pin.slice(0, -1); back(); }
  else if (k === 'ok') { blip(4); return doLogin($('user').value, pin); }
  else if (pin.length < 4) { pin += k; blip(pin.length); }
  dots(k !== 'del');
  if (pin.length === 4) doLogin($('user').value, pin);
}
$('pad').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) key(b.dataset.k); });
$('user').addEventListener('input', mark);
$('user').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('user').blur(); } });
document.addEventListener('keydown', (e) => {          // a computer's keyboard works for the PIN too
  if ($('login').hidden || e.target === $('user')) return;
  const k = /^\d$/.test(e.key) ? e.key : e.key === 'Backspace' ? 'del' : e.key === 'Enter' ? 'ok' : null;
  if (!k) return;
  const b = $('pad').querySelector('[data-k="' + k + '"]');          // the key on the screen goes down too
  if (b) { b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 120); }
  key(k);
});

/* ------------------------------------------------------------------ games */
const has3d = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
const playUrl = (g) => '/oyna?oyun=' + encodeURIComponent(g.id);

// what a game's summary line says (games.js writes it): its level or zone out of how many, and its stars
function progress(g, summary) {
  const s = summary || '', lv = /Level (\d+)/.exec(s), z = /Zone (\d+)(?:\/(\d+))?/.exec(s), se = /Season (\d+)/.exec(s), st = /(\d+) stars?/.exec(s);
  const p = { stars: st ? +st[1] : 0, season: se ? +se[1] : 0, n: 0, v: 0, label: '' };
  if (lv && g.levels) Object.assign(p, { n: g.levels, v: Math.min(+lv[1], g.levels), label: 'Level ' + lv[1] + ' of ' + g.levels });
  else if (z && z[2]) Object.assign(p, { n: +z[2], v: +z[1], label: 'Season ' + (p.season || 1) + ' · Zone ' + z[1] + ' of ' + z[2] });
  else if (se) p.label = 'Season ' + se[1] + (z ? ' · Zone ' + z[1] : '');
  return p;
}
// days in a row, in Turkey's dates from the server: up to today, or up to yesterday when not played yet today
function inARow(days, today) {
  if (!Array.isArray(days) || !today) return 0;
  const set = new Set(days), d = new Date(today + 'T12:00:00Z');
  if (!set.has(today)) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}

function showGames(d, offline) {
  nav(d.user);
  $('landing').hidden = true;
  $('login').hidden = true;
  $('pitch').hidden = true;
  $('hello').hidden = false;
  $('picks').hidden = false;
  $('games').hidden = false;
  window.scrollTo(0, 0);
  $('hiName').textContent = d.user.username;
  $('hiCls').textContent = d.user.cls ? 'Class ' + d.user.cls : '';
  $('hiCls').hidden = !d.user.cls;
  const games = d.games || {};
  const when = (g) => (games[g.id] || {}).played_at || 0;
  const last = GAMES.slice().sort((x, y) => when(y) - when(x)).find((g) => when(g)) || null;
  // a window for each game, in the games' own order; the one played last is marked
  $('grid').innerHTML = '';
  let stars = 0;
  const list = GAMES.map((g, i) => {
    const p = progress(g, (games[g.id] || {}).summary);
    stars += p.stars;
    $('grid').appendChild(tile(g, games[g.id], last === g, i + 1, p));
    return { g, p };
  });
  // the numbers: days in a row, and all the stars
  const row = offline ? 0 : inARow(d.days, d.today);
  $('streak').hidden = !row;
  $('streakTxt').textContent = row + (row === 1 ? ' day in a row' : ' days in a row');
  $('starsBox').hidden = !stars;
  $('starsTxt').textContent = starsText(stars);
  const up = offline ? null : news(d.user.username, list, stars);
  greet(d.user.username, up && up.say);
  warnings(offline);
}
const starsText = (n) => n + (n === 1 ? ' star' : ' stars');

// What is new since this device last showed this child's page: new stars count up; a new level (or zone, or season)
// brings pixel confetti from its window, a fanfare, a "Level up!" ribbon, and the teacher says so.
function news(user, list, stars) {
  const key = 'oyunSitesi.gordu.' + user, rank = (p) => p.season * 100 + p.v;
  let before = null;
  try { before = JSON.parse(S.get(key) || 'null'); } catch (e) { /* a new start */ }
  S.set(key, JSON.stringify({ stars, at: Object.fromEntries(list.map(({ g, p }) => [g.id, rank(p)])) }));
  if (!before || !before.at) return null;
  if (stars > (before.stars || 0)) countUp(before.stars || 0, stars);
  const up = list.find(({ g, p }) => before.at[g.id] >= 1 && rank(p) > before.at[g.id]);
  if (!up) return null;
  const { g, p } = up, win = $('grid').querySelector('[data-oyun="' + g.id + '"]');
  const what = g.levels ? 'Level ' + p.v : Math.floor(before.at[g.id] / 100) < p.season ? 'Season ' + p.season : 'Zone ' + p.v;
  const head = win.querySelector('.gwin-head');
  const old = head.querySelector('.ribbon');
  if (old) old.remove();
  head.insertAdjacentHTML('beforeend', '<span class="ribbon up">Level up!</span>');
  setTimeout(() => { confetti(win); fanfare(); }, still.matches ? 0 : 750);          // (after the windows have opened)
  return { say: what + '! Wow, ' + user + '! My orange is very proud of you. Heh.' };
}
function countUp(from, to) {
  const el = $('starsTxt'), box = $('starsBox');
  if (still.matches) return;
  el.textContent = starsText(from);
  setTimeout(() => {
    const t0 = performance.now(), dur = Math.min(1400, 300 + (to - from) * 90);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = starsText(Math.round(from + (to - from) * k));
      if (k < 1) requestAnimationFrame(step);
      else { box.classList.remove('up'); void box.offsetWidth; box.classList.add('up'); blip(4); }
    };
    requestAnimationFrame(step);
  }, 700);
}

function tile(g, info, isLast, n, p) {          // a game's window, like the login window: its head, its progress, its button
  const a = document.createElement('article');
  const started = !!(info && (info.summary || info.played_at));
  a.className = 'tile gwin' + (isLast ? ' last' : '');
  a.dataset.oyun = g.id;
  a.style.setProperty('--i', n - 1);          // (the windows open one after the other)
  if (g.accent) a.style.setProperty('--acc', g.accent);
  a.innerHTML = `<div class="gwin-head"><img class="thumb" alt=""><div><span class="slotno">File ${n}</span><h3></h3></div>${isLast ? '<span class="ribbon">Last played</span>' : ''}</div>
    <div class="body"><p class="tag"></p><div class="meter"></div><p class="plabel"></p></div>
    <div class="act"><a class="btn go"><i class="pi pi-play"></i>${started ? 'Continue' : 'Play'}</a><button class="linkbtn" type="button">Get my old save</button></div>`;
  a.querySelector('img').src = g.cover;
  a.querySelector('h3').textContent = g.title;
  a.querySelector('.tag').textContent = g.tagline;
  const m = a.querySelector('.meter');
  if (p.n) for (let i = 0; i < p.n; i++) { const s = document.createElement('i'); if (i < p.v) s.className = 'on'; m.appendChild(s); }
  else m.remove();
  a.querySelector('.plabel').textContent = p.label || (started ? '' : 'A new adventure is waiting!');
  if (started) {
    const s = document.createElement('span');
    s.className = 'sum';
    s.textContent = [info.summary, ago(info.played_at, 'en')].filter(Boolean).join(' · ');
    a.querySelector('.body').appendChild(s);
  }
  if (g.needs3d && !has3d) {
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = '3D may not work on this device. If the game does not open, update the browser or try another device.';
    a.querySelector('.body').appendChild(note);
  }
  a.querySelector('.btn').href = playUrl(g);
  a.querySelector('.linkbtn').addEventListener('click', () => { location.href = playUrl(g) + '&tasi=1'; });
  return a;
}

onInstallable(() => { if (!$('games').hidden) warnings(); });          // (Chrome offers to add the site: guide.js keeps that offer)

function warnings(offline) {
  const box = $('warns');
  box.innerHTML = '';
  const add = (text, button) => {
    const w = document.createElement('div');
    w.className = 'warn';
    w.textContent = text;
    if (button) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn o sm'; b.textContent = button.t;
      b.addEventListener('click', button.go);
      w.appendChild(document.createElement('br'));
      w.appendChild(b);
    }
    box.appendChild(w);
  };
  const ua = navigator.userAgent || '';
  if (offline) add('No internet. Games open with the save on this device; it goes to the cloud when you are back online.');
  if (/FBAN|FBAV|Instagram|Line\/|Snapchat|MicroMessenger|; wv\)/i.test(ua)) {
    add('This page opened inside an app. Games work better in Chrome or Safari: choose "Open in browser" from the menu.',
      { t: 'Copy the address', go: () => navigator.clipboard && navigator.clipboard.writeText(location.origin) });
  }
  if (!S.set('oyunSitesi.dene', '1')) add('This browser cannot keep saves (it may be a private tab). Open the site in a normal tab.');
  else S.remove('oyunSitesi.dene');
  const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone;
  if (!standalone && S.get('oyunSitesi.ipucu') !== 'kapali') {
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (canInstall()) add('Add this site to your home screen: the games open full screen, like an app.', { t: 'Add to home screen', go: async () => { await installNow(); S.set('oyunSitesi.ipucu', 'kapali'); warnings(); } });
    else if (ios) add('Tip: in Safari, tap Share, then "Add to Home Screen". The games open full screen, like an app.', { t: 'OK', go: () => { S.set('oyunSitesi.ipucu', 'kapali'); warnings(); } });
  }
}

$('logout').addEventListener('click', async () => {
  await S.api('logout', {});
  showLogin();
  window.scrollTo(0, 0);
});

/* ------------------------------------------------------------------ start */
async function start() {
  await showGuide();          // on a phone or tablet in a browser: first how to play full screen (guide.js)
  // a personal link from the teacher: /#g=alik.4821 logs in at once
  const g = new URLSearchParams(location.hash.slice(1)).get('g');
  if (g) {
    history.replaceState(null, '', location.pathname + location.search);
    const i = g.lastIndexOf('.');
    if (i > 0) {
      showLogin();
      $('user').value = g.slice(0, i);
      mark();
      return doLogin(g.slice(0, i), g.slice(i + 1));
    }
  }
  const r = await S.api('me');
  if (r.ok) return showGames(r.data);
  const last = S.get('oyunSitesi.kullanici');
  if (r.status === 0 && last) return showGames({ user: { username: last, cls: S.get('oyunSitesi.sinif') || '' }, games: {} }, true);
  showLogin(r.status === 0 ? 'No internet connection.' : '');
}
start();
