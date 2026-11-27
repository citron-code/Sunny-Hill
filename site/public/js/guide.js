// The full-screen guide: the very first screen on a phone or tablet when the site is opened in a browser. It shows how
// to put Citrobit on the home screen (then the games open full screen, like an app), for Android or for an iPhone /
// iPad, each step in Turkish and English; the phone in hand is chosen first. "Devam et" goes on to the title screen.
// Not shown: when the site already runs from the home screen, on a computer, after "Bir daha gösterme", or on the way
// back to a game (?sonra=). To look at it anywhere: /?rehber=android or /?rehber=ios
import { $ } from './util.js';

const S = window.OyunSitesi;
const q = new URLSearchParams(location.search);

// Chrome on Android can add the site in one tap: it offers that (beforeinstallprompt), and the guide or the child's
// page (portal.js) use it once
let offer = null;
const waiting = [];
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); offer = e; waiting.forEach((f) => f()); });
export const canInstall = () => !!offer;
export const onInstallable = (f) => waiting.push(f);
export async function installNow() {
  if (!offer) return false;
  const e = offer;
  offer = null;
  try { await e.prompt(); const r = await e.userChoice; return r && r.outcome === 'accepted'; } catch (err) { return false; }
}

const ua = navigator.userAgent || '';
const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const android = /Android/i.test(ua);
const fromHome = () => matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches || navigator.standalone === true;

function choose(os) {
  for (const [id, tab, panel] of [['android', 'tabAndroid', 'osAndroid'], ['ios', 'tabIos', 'osIos']]) {
    $(tab).setAttribute('aria-selected', String(id === os));
    $(tab).tabIndex = id === os ? 0 : -1;
    $(panel).hidden = id !== os;
  }
}

/** shows the guide when it is needed; the promise ends when it closes (at once when it is not needed) */
export function showGuide() {
  const forced = /^(android|ios)$/.test(q.get('rehber') || '') ? q.get('rehber') : '';
  const needed = forced || ((ios || android) && !fromHome() && S.get('oyunSitesi.rehber') !== 'kapali' && !q.has('sonra'));
  if (!needed) return Promise.resolve();
  choose(forced || (ios ? 'ios' : 'android'));
  document.body.classList.add('guiding');
  $('guide').hidden = false;
  scrollTo(0, 0);
  $('guideT').focus({ preventScroll: true });

  for (const b of document.querySelectorAll('.gtabs [role="tab"]')) {
    b.addEventListener('click', () => choose(b.dataset.os));
    b.addEventListener('keydown', (e) => {          // the arrow keys move between the two, as in any tab list
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const other = b.dataset.os === 'ios' ? 'android' : 'ios';
      choose(other); $(other === 'ios' ? 'tabIos' : 'tabAndroid').focus();
    });
  }
  const quick = () => { $('quick').hidden = !canInstall(); };
  quick();
  onInstallable(quick);
  $('quickBtn').addEventListener('click', async () => {
    const ok = await installNow();
    quick();
    if (ok) { $('added').hidden = false; S.set('oyunSitesi.ipucu', 'kapali'); }
  });

  return new Promise((done) => {
    $('guideGo').addEventListener('click', () => {
      if ($('guideNever').checked) { S.set('oyunSitesi.rehber', 'kapali'); S.set('oyunSitesi.ipucu', 'kapali'); }
      $('guide').hidden = true;
      document.body.classList.remove('guiding');
      scrollTo(0, 0);
      done();
    }, { once: true });
  });
}
