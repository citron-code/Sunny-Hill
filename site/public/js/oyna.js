/* Opening a game: /oyna?oyun=<id>
   1. who is logged in;
   2. this device: if the game's keys here are another child's, their unsent changes are kept aside for them;
      this child's own unsent changes (from playing offline) are found;
   3. the cloud's copy; the newer of the two wins (the other is kept among the backups), and the game's keys
      here become that copy;
   4. a child with no save anywhere is asked once whether they played before at the old address (tasi.html
      there brings that save over);
   5. the game opens (its page has the bridge that sends its changes to the cloud). */
import { gameById } from './games.js';
import { CONFIG } from './config.js';
import { $, registerSW } from './util.js';

const S = window.OyunSitesi;
const q = new URLSearchParams(location.search);
const g = gameById(q.get('oyun'));
const onThisComputer = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const MOVE_URL = onThisComputer ? CONFIG.testMoveUrl : CONFIG.moveUrl;
registerSW();

function say(text, buttons = []) {
  $('text').textContent = text;
  const row = $('row');
  row.innerHTML = '';
  for (const b of buttons) {
    const el = document.createElement(b.href ? 'a' : 'button');
    el.className = 'btn ' + (b.cls || '');
    el.textContent = b.t;
    if (b.href) el.href = b.href; else { el.type = 'button'; el.addEventListener('click', b.go); }
    row.appendChild(el);
  }
  $('bob').style.visibility = buttons.length ? 'hidden' : 'visible';
}
const trouble = () => say('Your save cannot be fetched right now. Try again in a moment.', [
  { t: 'Try again', go: () => location.reload() }, { t: 'Back to games', cls: 'n', href: '/' }]);

function offline() {
  const user = S.get('oyunSitesi.kullanici'), m = S.meta(g);
  if (user && m && m.user === user) {
    say('No internet. The game opens with the save on this device; it goes to the cloud when you are back online.');
    setTimeout(() => play({ username: user, cls: S.get('oyunSitesi.sinif') || '' }), 1800);
  } else {
    say('No internet connection. The first time on this device, the game needs the internet to open.', [{ t: 'Try again', go: () => location.reload() }]);
  }
}

function play(u) {
  S.launch.set(g, u.username);
  S.set('oyunSitesi.r.' + g.id, String(Date.now()));
  let url = '/oyun/' + g.id + '/';
  if (g.classParam) {                     // "2-A" -> ?sinif=A (the game's class boards)
    const L = (String(u.cls || '').toLocaleUpperCase('tr-TR').match(/(?:^|[^A-ZÇĞİÖŞÜ])([ABCD])(?![A-ZÇĞİÖŞÜ])/) || [])[1];
    if (L) url += '?' + g.classParam + '=' + L;
  }
  location.replace(url);
}

async function goMove() {
  say('Going to the old address…');
  const r = await S.api('move/start', { game: g.id });
  if (!r.ok) return trouble();
  location.href = MOVE_URL + '#kod=' + encodeURIComponent(r.data.code) + '&oyun=' + encodeURIComponent(g.id) +
    '&site=' + encodeURIComponent(location.origin);
}

function askOld(u) {
  say('Did you play this game on this device before, at the old address? Your save from there can move to your account.', [
    { t: 'Yes, get my old save', cls: 'o', go: goMove },
    { t: 'No, start new', cls: 'n', go: () => { const m = S.meta(g); if (m) { m.asked = true; S.setMeta(g, m); } play(u); } },
  ]);
}

// mode: '' to play; 'new' to start with nothing; 'move' to go to the old address after the sync
async function sync(u, mode) {
  say('Getting your save…');
  const user = u.username, sk = S.stashKey(user, g);
  let m = S.meta(g);
  if (m && m.user !== user) {
    if (S.isDirty(m)) S.set(S.stashKey(m.user, g), JSON.stringify({ keys: S.read(g), base: m.rev | 0, played: Number(m.played) || 0 }));
    S.write(g, {});
    S.remove(S.metaKey(g));
    m = null;
  } else if (!m) {
    const loose = S.read(g);                   // (keys nobody owns: kept for this child as a backup, then cleared)
    if (Object.keys(loose).length) {
      const r = await S.api('backup/' + g.id, { keys: loose });
      if (!r.ok) return r.status === 0 ? offline() : trouble();
      S.write(g, {});
    }
  }
  let local = m && S.isDirty(m) ? { keys: S.read(g), base: m.rev | 0, played: Number(m.played) || 0 } : null;
  let stash = null;
  try { stash = JSON.parse(S.get(sk) || 'null'); } catch (e) { stash = null; }
  if (stash) {                                  // two unsent copies of this child's: the newer goes on, the other is a backup
    const older = local && local.played >= stash.played ? stash : local;
    if (older) {
      const r = await S.api('backup/' + g.id, { keys: older.keys });
      if (!r.ok) return r.status === 0 ? offline() : trouble();
    }
    if (!local || stash.played > local.played) local = stash;
  }
  const c = await S.api('save/' + g.id);
  if (!c.ok) return c.status === 0 ? offline() : trouble();
  const cloud = c.data;
  if (local) {
    if (local.base === cloud.rev || local.played >= cloud.played_at) {
      const r = await S.api('save/' + g.id, {
        base: local.base, set: local.keys, del: [], full: true, force: local.base !== cloud.rev,
        played_at: local.played || Date.now(), summary: S.summaryOf(g, local.keys),
      });
      if (!r.ok) return trouble();
      S.write(g, local.keys);
      S.setMeta(g, S.freshMeta(user, r.data.rev, local.played));
    } else {
      const r = await S.api('backup/' + g.id, { keys: local.keys });
      if (!r.ok) return trouble();
      S.write(g, cloud.keys);
      S.setMeta(g, S.freshMeta(user, cloud.rev, cloud.played_at));
    }
    S.remove(sk);
  } else {
    if (!S.write(g, cloud.keys)) return say('This device is full: the save could not be written. Try to free some space in the browser\'s data.', [{ t: 'Back to games', href: '/' }]);
    const mm = S.freshMeta(user, cloud.rev, cloud.played_at);
    mm.asked = !!(m && m.asked);
    S.setMeta(g, mm);
  }
  if (mode === 'move') return goMove();
  if (!local && cloud.rev === 0 && mode !== 'new' && !(S.meta(g) || {}).asked) return askOld(u);
  play(u);
}

async function main() {
  if (!g) return say('This game was not found.', [{ t: 'Back to games', href: '/' }]);
  document.title = g.title;
  $('title').textContent = g.title;
  if (g.accent) document.querySelector('.launch').style.setProperty('--acc', g.accent);          // the game's window colour
  $('coverImg').src = g.cover;
  $('cover').classList.toggle('px', !!g.pixel);
  if (q.get('r') === '1' && Date.now() - Number(S.get('oyunSitesi.r.' + g.id) || 0) < 15000) {
    return say('This browser could not open the game (it may be a private tab, or saving is turned off). Try a normal tab.', [{ t: 'Back to games', href: '/' }]);
  }
  const me = await S.api('me');
  if (me.status === 0) return offline();
  if (me.status === 401) return location.replace('/?sonra=' + encodeURIComponent('/oyna?oyun=' + g.id));
  if (!me.ok) return trouble();
  const u = me.data.user;
  S.set('oyunSitesi.kullanici', u.username);
  S.set('oyunSitesi.sinif', u.cls || '');
  const eski = q.get('eski');
  if (eski || q.get('tasi')) history.replaceState(null, '', '/oyna?oyun=' + encodeURIComponent(g.id));
  if (eski === 'tamam') return say('Your old save is here! From now on you keep going from here, on every device.', [{ t: 'Play', go: () => sync(u) }]);
  if (eski === 'yok') return say('No old save was found on this device.', [{ t: 'Start new', go: () => sync(u, 'new') }, { t: 'Back to games', cls: 'n', href: '/' }]);
  if (eski === 'yedek') return say('Your account already had a save, and it stays. The old save is kept as a backup: your teacher can bring it back if you want.', [{ t: 'Play', go: () => sync(u) }]);
  if (eski === 'hata') return say('The old save could not be fetched.', [{ t: 'Try again', cls: 'o', go: () => sync(u, 'move') }, { t: 'Start new', cls: 'n', go: () => sync(u, 'new') }]);
  return sync(u, q.get('tasi') === '1' ? 'move' : '');
}
main();
