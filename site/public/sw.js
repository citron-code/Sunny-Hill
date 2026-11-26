/* The site works without internet once it has been opened: every page and game is fetched from the web
   first (so it is always the newest one) and kept; with no internet the kept copy opens.
   /api/ is never kept. */
const CACHE = 'english-games-v1';
const CORE = ['/', '/oyna', '/css/site.css', '/js/oyun-sitesi.js', '/js/portal.js', '/js/oyna.js', '/js/games.js', '/js/config.js',
  '/js/names.js', '/js/util.js', '/manifest.webmanifest', '/img/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  const key = u.origin + u.pathname;              // (one copy per page, whatever comes after "?")
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && res.type === 'basic' && !u.searchParams.has('check')) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {});
    }
    return res;
  }).catch(() => caches.match(key).then((r) => r || caches.match(u.pathname.startsWith('/oyun/') ? key : '/'))));
});
