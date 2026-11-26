// The front page: the site's welcome with the login card (username + a 4-digit PIN on a keypad),
// and after logging in the child's own page with the games.
import { GAMES } from './games.js';
import { canonUser } from './names.js';
import { $, ago, registerSW } from './util.js';

const S = window.OyunSitesi;
$('old').hidden = true;
registerSW();

let pin = '', busy = false;

/* --------------------------------------------------------- the front page */
// the games, as they are shown to parents and visitors
$('gameCards').innerHTML = '';
for (const g of GAMES) {
  const c = document.createElement('article');
  c.className = 'gcard';
  c.innerHTML = '<div class="pic"><img alt="" loading="lazy"></div><div class="in"><div class="tags"></div><h3></h3><p></p></div>';
  c.querySelector('img').src = g.shot || g.cover;
  c.querySelector('h3').textContent = g.title;
  c.querySelector('p').textContent = g.about || g.tagline;
  for (const t of g.tags || []) {
    const s = document.createElement('span');
    s.className = 'tagc'; s.textContent = t;
    c.querySelector('.tags').appendChild(s);
  }
  $('gameCards').appendChild(c);
}
$('ctaLogin').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => $('user').focus(), 350);
});

function nav(user) {          // the top bar: links for visitors, the child's name after logging in
  $('navLinks').hidden = !!user;
  $('navTeacher').hidden = !!user;
  $('navUser').hidden = !user;
  $('logout').hidden = !user;
  if (user) {
    $('navAv').textContent = user.username.slice(0, 1);
    $('navName').textContent = user.username;
    $('navCls').textContent = user.cls ? 'Sınıf ' + user.cls : '';
  }
}

/* ------------------------------------------------------------------ login */
const known = () => { try { return JSON.parse(S.get('oyunSitesi.hatirla') || '[]'); } catch (e) { return []; } };
function remember(u) {
  const L = known().filter((x) => x !== u);
  L.unshift(u);
  S.set('oyunSitesi.hatirla', JSON.stringify(L.slice(0, 6)));
}

function dots() {
  [...$('dots').children].forEach((d, i) => d.classList.toggle('on', i < pin.length));
}

function showLogin(message) {
  nav(null);
  $('games').hidden = true;
  $('landing').hidden = false;
  $('login').hidden = false;
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
  const card = $('login');
  card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
}

async function doLogin(user, p) {
  if (busy) return;
  if (!canonUser(user)) { $('user').focus(); return fail('Önce kullanıcı adını yaz.'); }
  if (!/^\d{4}$/.test(p)) return fail('Şifre 4 rakam.');
  busy = true; $('msg').textContent = '';
  const r = await S.api('login', { username: user, pin: p });
  busy = false;
  if (r.ok) {
    const u = r.data.user;
    remember(u.username);
    S.set('oyunSitesi.kullanici', u.username);
    S.set('oyunSitesi.sinif', u.cls || '');
    const next = new URLSearchParams(location.search).get('sonra');
    if (next && next.startsWith('/') && !next.startsWith('//')) { location.replace(next); return; }
    const me = await S.api('me');
    showGames(me.ok ? me.data : { user: u, games: {} });
    return;
  }
  pin = ''; dots();
  if (r.status === 429) return fail(`Çok fazla yanlış deneme. ${r.data.minutes} dakika sonra yeniden dene ya da öğretmenine sor.`);
  if (r.status === 401) return fail('Kullanıcı adı ya da şifre yanlış.');
  if (r.status === 0) return fail('İnternet bağlantısı yok.');
  fail('Bir sorun oldu. Biraz sonra yeniden dene.');
}

function key(k) {
  if (busy) return;
  if (k === 'del') pin = pin.slice(0, -1);
  else if (k === 'ok') return doLogin($('user').value, pin);
  else if (pin.length < 4) pin += k;
  dots();
  if (pin.length === 4) doLogin($('user').value, pin);
}
$('pad').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) key(b.dataset.k); });
$('user').addEventListener('input', mark);
$('user').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('user').blur(); } });
document.addEventListener('keydown', (e) => {          // a computer's keyboard works for the PIN too
  if ($('login').hidden || e.target === $('user')) return;
  if (/^\d$/.test(e.key)) key(e.key);
  else if (e.key === 'Backspace') key('del');
  else if (e.key === 'Enter') key('ok');
});

/* ------------------------------------------------------------------ games */
const has3d = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
const playUrl = (g) => '/oyna?oyun=' + encodeURIComponent(g.id);

function showGames(d, offline) {
  nav(d.user);
  $('landing').hidden = true;
  $('login').hidden = true;
  $('games').hidden = false;
  window.scrollTo(0, 0);
  $('hiName').textContent = d.user.username;
  $('hiCls').textContent = d.user.cls ? 'Sınıf ' + d.user.cls : '';
  $('hiCls').hidden = !d.user.cls;
  const games = d.games || {};
  const when = (g) => (games[g.id] || {}).played_at || 0;
  const order = GAMES.slice().sort((x, y) => when(y) - when(x));   // the game played last comes first
  const last = order[0] && when(order[0]) ? order[0] : null;
  $('cont').hidden = !last;
  if (last) {
    const info = games[last.id] || {};
    $('contImg').src = last.cover;
    $('contTitle').textContent = last.title;
    $('contSum').textContent = [info.summary, ago(info.played_at)].filter(Boolean).join(' · ');
    $('contBtn').href = playUrl(last);
  }
  $('grid').innerHTML = '';
  for (const g of order) $('grid').appendChild(tile(g, games[g.id], last === g));
  warnings(offline);
}

function tile(g, info, isLast) {
  const a = document.createElement('article');
  const started = !!(info && (info.summary || info.played_at));
  a.className = 'tile';
  a.dataset.oyun = g.id;
  a.innerHTML = `<div class="cover${g.pixel ? ' px' : ''}"><img alt="">${isLast ? '<span class="ribbon">En son oynadığın</span>' : ''}</div>
    <div class="body"><h3></h3><p class="tag"></p></div>
    <div class="act"><a class="btn go">
      <i class="pi pi-play"></i>${started ? 'Devam et' : 'Başla'}</a>
      <button class="linkbtn" type="button">Eski adresteki kaydımı getir</button></div>`;
  a.querySelector('img').src = g.cover;
  a.querySelector('h3').textContent = g.title;
  a.querySelector('.tag').textContent = g.tagline;
  if (started) {
    const s = document.createElement('span');
    s.className = 'sum';
    s.textContent = [info.summary, ago(info.played_at)].filter(Boolean).join(' · ');
    a.querySelector('.body').appendChild(s);
  }
  if (g.needs3d && !has3d) {
    const n = document.createElement('p');
    n.className = 'note';
    n.textContent = 'Bu cihazda 3D görüntü çalışmıyor olabilir. Açılmazsa tarayıcıyı güncelleyin ya da başka bir cihaz deneyin.';
    a.querySelector('.body').appendChild(n);
  }
  a.querySelector('.btn').href = playUrl(g);
  a.querySelector('.linkbtn').addEventListener('click', () => { location.href = playUrl(g) + '&tasi=1'; });
  return a;
}

let installEvent = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; if (!$('games').hidden) warnings(); });

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
  if (offline) add('İnternet yok. Oyunlar bu cihazdaki kayıtla açılır; internet gelince kayıt buluta gider.');
  if (/FBAN|FBAV|Instagram|Line\/|Snapchat|MicroMessenger|; wv\)/i.test(ua)) {
    add('Bu sayfa bir uygulamanın içinde açıldı. Oyunlar Chrome ya da Safari\'de daha iyi çalışır: menüden "Tarayıcıda aç"ı seçin.',
      { t: 'Adresi kopyala', go: () => navigator.clipboard && navigator.clipboard.writeText(location.origin) });
  }
  if (!S.set('oyunSitesi.dene', '1')) add('Bu tarayıcı kayıt tutamıyor (gizli sekme olabilir). Normal bir sekmede açın.');
  else S.remove('oyunSitesi.dene');
  const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone;
  if (!standalone && S.get('oyunSitesi.ipucu') !== 'kapali') {
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (installEvent) add('Bu siteyi ana ekrana ekleyin: oyunlar uygulama gibi tam ekran açılır.', { t: 'Ana ekrana ekle', go: () => { installEvent.prompt(); installEvent = null; S.set('oyunSitesi.ipucu', 'kapali'); warnings(); } });
    else if (ios) add('İpucu: Safari\'de Paylaş düğmesine, sonra "Ana Ekrana Ekle"ye dokunun. Oyunlar uygulama gibi tam ekran açılır.', { t: 'Tamam', go: () => { S.set('oyunSitesi.ipucu', 'kapali'); warnings(); } });
  }
}

$('logout').addEventListener('click', async () => {
  await S.api('logout', {});
  showLogin();
  window.scrollTo(0, 0);
});

/* ------------------------------------------------------------------ start */
async function start() {
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
  showLogin(r.status === 0 ? 'İnternet bağlantısı yok.' : '');
}
start();
