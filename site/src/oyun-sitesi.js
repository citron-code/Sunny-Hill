/* The site's own part of every page and of every game (build.mjs puts the game list in front of it
   and writes it to /js/oyun-sitesi.js).

   In a game (its script tag has data-oyun="<game id>", put in by build.mjs):
     the game is not changed and keeps saving in this browser as it always did. This script notes which
     of the game's keys changed and sends them to the cloud a few seconds later (at most every 40 s while
     playing), and at once when the page is hidden or left. With no internet the changes wait on the
     device and go when it comes back (or at the next start, through oyna.html).
   On the site's pages: the same helpers as window.OyunSitesi. */
(function () {
  'use strict';
  var S = window.OyunSitesi = window.OyunSitesi || {};
  var LS = null;
  try { LS = window.localStorage; } catch (e) { /* storage blocked */ }
  var P = window.Storage && Storage.prototype;
  var rawSet = P && P.setItem, rawGet = P && P.getItem, rawRemove = P && P.removeItem, rawKey = P && P.key, rawClear = P && P.clear;

  S.T = { debounce: 4000, every: 40000 };
  try { if (LS && rawGet.call(LS, 'oyunSitesi.test') === 'hizli') S.T = { debounce: 150, every: 400 }; } catch (e) { /* no storage */ }

  /* ------------------------------------------------------------ storage */
  S.get = function (k) { try { return LS ? rawGet.call(LS, k) : null; } catch (e) { return null; } };
  S.set = function (k, v) { try { rawSet.call(LS, k, v); return true; } catch (e) { return false; } };
  S.remove = function (k) { try { rawRemove.call(LS, k); } catch (e) { /* nothing */ } };
  S.keysOf = function (g) {                       // this game's keys in this browser now
    var out = [];
    try { for (var i = 0; i < LS.length; i++) { var k = rawKey.call(LS, i); if (k != null && S.ownsKey(g, k)) out.push(k); } } catch (e) { /* none */ }
    return out;
  };
  S.read = function (g) {
    var o = {};
    S.keysOf(g).forEach(function (k) { var v = S.get(k); if (v != null) o[k] = v; });
    return o;
  };
  S.write = function (g, keys) {                  // the game's keys become exactly these
    var ok = true;
    S.keysOf(g).forEach(function (k) { if (!Object.prototype.hasOwnProperty.call(keys, k)) S.remove(k); });
    Object.keys(keys).forEach(function (k) { if (!S.set(k, keys[k])) ok = false; });
    return ok;
  };
  S.summary = function (g) { return S.summaryOf(g, function (k) { return S.get(k); }); };

  /* Per game, on this device: whose save the game's keys are now, which cloud version (rev) they started
     from, and what changed since: { user, rev, dirty: {key: n}, seq, all, played } */
  S.metaKey = function (g) { return 'oyunSitesi.meta.' + g.id; };
  S.meta = function (g) { try { return JSON.parse(S.get(S.metaKey(g)) || 'null'); } catch (e) { return null; } };
  S.setMeta = function (g, m) { S.set(S.metaKey(g), JSON.stringify(m)); };
  S.freshMeta = function (user, rev, played) { return { user: user, rev: rev | 0, dirty: {}, seq: 0, all: 0, played: played || 0 }; };
  S.isDirty = function (m) { return !!m && (!!m.all || (!!m.dirty && Object.keys(m.dirty).length > 0)); };
  // another child's unsent changes, kept for them when a different child opens the same game here
  S.stashKey = function (user, g) { return 'oyunSitesi.bekleyen.' + user + '.' + g.id; };

  // opened through the site in this tab (sessionStorage), or a moment ago (for browsers without it)
  S.launch = {
    set: function (g, user) {
      try { sessionStorage.setItem('oyunSitesi.acilis.' + g.id, user); } catch (e) { /* none */ }
      S.set('oyunSitesi.acilis.' + g.id, JSON.stringify({ user: user, t: Date.now() }));
    },
    get: function (g) {
      try { var u = sessionStorage.getItem('oyunSitesi.acilis.' + g.id); if (u) return u; } catch (e) { /* none */ }
      try { var o = JSON.parse(S.get('oyunSitesi.acilis.' + g.id) || 'null'); if (o && Date.now() - o.t < 30000) return o.user; } catch (e) { /* none */ }
      return '';
    },
  };

  /* ---------------------------------------------------------------- api */
  S.api = function (path, body, opt) {
    var init = { method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', headers: {} };
    if (body) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
      if (opt && opt.keepalive && init.body.length < 60000) init.keepalive = true;
    }
    return fetch('/api/' + path, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, ok: r.ok, data: d || {} }; });
    }, function () { return { status: 0, ok: false, data: {} }; });
  };

  /* Sends this game's changed keys. When another device moved the cloud on meanwhile (409), opt.force(played_at)
     decides: true, and this copy wins (the server keeps the other one as a backup); otherwise the 409 comes back. */
  S.push = function (g, user, opt) {
    opt = opt || {};
    var m = S.meta(g);
    if (!m || m.user !== user) return Promise.resolve({ ok: false, status: -1, data: {} });
    if (!S.isDirty(m)) return Promise.resolve({ ok: true, status: 200, nothing: true, data: { rev: m.rev } });
    var allSnap = m.all, riskSnap = m.risky, snap = {}, set = {}, del = [];
    var names = m.all ? S.keysOf(g) : Object.keys(m.dirty);
    names.forEach(function (k) { var v = S.get(k); if (v == null) del.push(k); else set[k] = v; });
    Object.keys(m.dirty || {}).forEach(function (k) { snap[k] = m.dirty[k]; });
    // backup: the game threw its main save away since the last push ("New Game"): the cloud keeps the old one first
    var body = { base: m.rev | 0, set: set, del: del, full: !!m.all, backup: !!m.risky, played_at: m.played || Date.now(), summary: S.summary(g) };
    return S.api('save/' + g.id, body, { keepalive: opt.keepalive }).then(function (r) {
      if (r.status !== 409 || !opt.force || !opt.force(Number(r.data.played_at) || 0)) return r;
      body.force = true; body.full = true; body.set = S.read(g); body.del = [];
      return S.api('save/' + g.id, body);
    }).then(function (r) {
      if (r.ok) {
        var m2 = S.meta(g);
        if (m2 && m2.user === user) {
          m2.rev = r.data.rev;
          Object.keys(snap).forEach(function (k) { if (m2.dirty && m2.dirty[k] === snap[k]) delete m2.dirty[k]; });
          if (m2.all === allSnap) m2.all = 0;
          if (m2.risky === riskSnap) m2.risky = 0;
          m2.synced = Date.now();
          S.setMeta(g, m2);
        }
      }
      return r;
    });
  };

  /* ------------------------------------------------------------ in a game */
  var tag = document.currentScript;
  var gameId = tag && tag.getAttribute('data-oyun');
  if (gameId && S.gameById) bridge(S.gameById(gameId));

  function bridge(g) {
    if (!g || !LS || !P) return;
    var user = S.launch.get(g), m0 = S.meta(g);
    if (!user || !m0 || m0.user !== user) {
      // not opened through the site (a bookmark, or another child's save is here): oyna.html opens it properly
      try { window.stop(); } catch (e) { /* old browser */ }
      location.replace('/oyna?oyun=' + encodeURIComponent(g.id) + '&r=1');
      return;
    }
    S.game = g; S.user = user;
    var busy = false, again = false, timer = 0, lastPush = 0, fails = 0, blocked = false, state = 'ok', lastInput = 0, hiddenAt = 0, inflight = null;

    /* "played" is when the child last touched this game here, not when it last wrote its save: a game left open on
       another device writes its (old) state when its page is hidden, and that must not count as playing. */
    ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, function () { lastInput = Date.now(); }, { capture: true, passive: true });
    });
    function mark(k, removed) {
      var m = S.meta(g);
      if (!m || m.user !== user) return;
      m.seq = (m.seq | 0) + 1;
      (m.dirty || (m.dirty = {}))[k] = m.seq;
      if (removed && g.main && g.main.indexOf(k) >= 0) m.risky = m.seq;
      if (lastInput > (m.played || 0)) m.played = lastInput;
      S.setMeta(g, m);
      if (state === 'ok') show('wait');
      schedule();
    }
    // the game's own saving, watched (it still goes where it always went)
    P.setItem = function (k, v) {
      if (blocked && this === LS && S.ownsKey(g, String(k))) return;     // (another child opened this game in another tab)
      var r = rawSet.apply(this, arguments);
      if (this === LS && S.ownsKey(g, String(k))) mark(String(k));
      return r;
    };
    P.removeItem = function (k) {
      if (blocked && this === LS && S.ownsKey(g, String(k))) return;
      var r = rawRemove.apply(this, arguments);
      if (this === LS && S.ownsKey(g, String(k))) mark(String(k), true);
      return r;
    };
    P.clear = function () {
      if (this !== LS) return rawClear.apply(this, arguments);
      var m = S.meta(g), r = rawClear.apply(this, arguments);
      if (m) { m.seq = (m.seq | 0) + 1; m.all = m.seq; m.risky = m.seq; m.dirty = {}; m.played = Date.now(); S.setMeta(g, m); S.launch.set(g, user); schedule(); }
      return r;
    };

    function schedule(ms) {
      if (timer || blocked) return;
      var wait = ms != null ? ms : Math.max(S.T.debounce, S.T.every - (Date.now() - lastPush));
      timer = setTimeout(function () { timer = 0; push(false); }, wait);
    }
    function push(keep) {
      if (blocked) return Promise.resolve({ ok: false, status: -1 });
      if (busy) { again = true; return inflight; }
      busy = true;
      // another device saved meanwhile: this copy wins only when the child touched it here later than that
      var force = function (theirs) { var m = S.meta(g); return !!m && (m.played || 0) > theirs; };
      return (inflight = S.push(g, user, { keepalive: keep, force: force }).then(function (r) {
        busy = false; lastPush = Date.now();
        if (r.ok) { fails = 0; show(S.isDirty(S.meta(g)) ? 'wait' : 'ok'); }
        else if (r.status === 409) stale(true);
        else if (r.status === 401) show('login');
        else if (r.status !== -1) { fails++; show('off'); schedule(Math.min(120000, 4000 * Math.pow(2, fails))); }
        if (again) { again = false; schedule(); }
        return r;
      }));
    }
    // now (the home button, the tests): after a push already on its way, once more for what changed since
    S.flush = function () {
      if (timer) { clearTimeout(timer); timer = 0; }
      return busy ? inflight.then(function () { if (timer) { clearTimeout(timer); timer = 0; } return push(false); }) : push(false);
    };

    /* This page's game is older than the cloud's (played more recently on another device): its copy goes to the
       backups, the newer one is written here, and the game opens again with it. Until then it saves nothing. */
    function stale(keepMine) {
      if (blocked) return;
      blocked = true;
      if (timer) { clearTimeout(timer); timer = 0; }
      show('stale');
      var mine = S.read(g);
      (keepMine ? S.api('backup/' + g.id, { keys: mine }, { keepalive: true }) : Promise.resolve({ ok: true })).then(function () {
        return S.api('save/' + g.id);
      }).then(function (c) {
        if (!c.ok) return;
        S.write(g, c.data.keys);
        S.setMeta(g, S.freshMeta(user, c.data.rev, c.data.played_at));
        var reopen = function () { location.reload(); };
        if (document.visibilityState === 'visible') setTimeout(reopen, 1800);
        else document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reopen(); });
      });
    }
    // back after a while: has the game moved on on another device?
    function look() {
      S.api('save/' + g.id + '?meta=1').then(function (r) {
        var m = S.meta(g);
        if (!r.ok || blocked || !m || m.user !== user || r.data.rev === m.rev) return;
        if (S.isDirty(m)) push(false); else stale(false);
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); if (timer) { clearTimeout(timer); timer = 0; } push(true); }
      else if (hiddenAt && Date.now() - hiddenAt > 30000) look();
    });
    window.addEventListener('pagehide', function () { push(true); });
    window.addEventListener('online', function () { schedule(800); });
    window.addEventListener('storage', function (e) {          // another tab opened this game for another child
      if (e.key !== S.metaKey(g) || blocked) return;
      var m = S.meta(g);
      if (!m || m.user !== user) { blocked = true; show('blocked'); }
    });
    if (S.isDirty(m0)) schedule(2500);                          // left over from last time (no internet then)

    /* the little handle on the left edge: how the cloud save is, and the way back to the games */
    var ui = null;
    function show(s) {
      state = s;
      if (!ui) return;
      ui.h.setAttribute('data-s', s);
      if (s === 'blocked' || s === 'stale') open();
      if (ui.p.style.display === 'block') text();
    }
    var TXT = {
      ok: 'Your save is in the cloud. On another device, you pick up where you left off.',
      wait: 'Your save is going to the cloud…',
      off: 'No internet, it seems. Keep playing: your save is on this device and goes to the cloud when you are back online.',
      login: 'To save in the cloud, log in again. Go back to the games page and log in; your save waits on this device.',
      stale: 'This game was played later on another device. It opens again with the newest save…',
      blocked: 'This game was opened in another tab with another account. This tab does not save any more.',
    };
    function text() { ui.t.textContent = TXT[state] || TXT.ok; }
    function open() { text(); ui.p.style.display = 'block'; }
    function home() {
      ui.b.disabled = true; ui.b.textContent = 'Kaydediliyor…';
      var go = function () { location.href = '/'; };
      S.flush().then(go, go);
      setTimeout(go, 4000);
    }
    function build() {
      var css = document.createElement('style');
      css.textContent =
        '#osHandle{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:2147483000;width:34px;height:60px;border:0;padding:0;border-radius:0;' +
        'background:#ff9f1c;color:#1d2b53;box-shadow:inset -3px -3px 0 rgba(0,0,0,.2),inset 3px 3px 0 rgba(255,255,255,.4),0 -3px 0 #1d2b53,0 3px 0 #1d2b53,3px 0 0 #1d2b53;cursor:pointer;display:flex;' +
        'align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;touch-action:manipulation}' +
        '#osHandle b{width:20px;height:20px;background:currentColor;-webkit-mask:url(/img/i/home.svg) center/contain no-repeat;mask:url(/img/i/home.svg) center/contain no-repeat}' +
        '#osHandle i{position:absolute;right:5px;top:6px;width:7px;height:7px;background:#3fbf3f;box-shadow:0 0 0 2px #1d2b53}' +
        '#osHandle[data-s=wait] i,#osHandle[data-s=stale] i{background:#ffdd3c}#osHandle[data-s=off] i,#osHandle[data-s=login] i,#osHandle[data-s=blocked] i{background:#e2364a}' +
        '#osPanel{display:none;position:fixed;left:46px;top:50%;transform:translateY(-50%);z-index:2147483001;width:min(300px,calc(100vw - 64px));' +
        'background:#fffdf7;box-shadow:0 -4px 0 #1d2b53,0 4px 0 #1d2b53,-4px 0 0 #1d2b53,4px 0 0 #1d2b53,0 12px 0 rgba(14,24,56,.3);padding:14px 16px;font:500 16px/1.4 "Pixelify Sans","Trebuchet MS",system-ui,sans-serif;color:#1d2b53}#osPanel,#osPanel *{font-variant-ligatures:none!important}' +
        '#osPanel p{margin:0 0 14px}#osPanel .r{display:flex;gap:12px;padding:3px}#osPanel button{flex:1;font:600 16px "Pixelify Sans","Trebuchet MS",system-ui,sans-serif;border:0;border-radius:0;' +
        'padding:9px 6px 11px;cursor:pointer;color:#1d2b53;background:#ff9f1c;box-shadow:inset -3px -3px 0 rgba(0,0,0,.2),inset 3px 3px 0 rgba(255,255,255,.4),0 -3px 0 #1d2b53,0 3px 0 #1d2b53,-3px 0 0 #1d2b53,3px 0 0 #1d2b53}' +
        '#osPanel button.n{background:#fff}';
      var font = document.createElement('link');            // the site's pixel font, for the panel
      font.rel = 'stylesheet'; font.href = '/fonts/fonts.css';
      document.head.appendChild(font);
      document.head.appendChild(css);
      var h = document.createElement('button');
      h.id = 'osHandle'; h.type = 'button'; h.setAttribute('aria-label', 'Games and cloud save');
      h.innerHTML = '<b></b><i></i>';
      var p = document.createElement('div');
      p.id = 'osPanel';
      p.innerHTML = '<p></p><div class="r"><button type="button" class="b">Back to games</button><button type="button" class="n">Close</button></div>';
      document.body.appendChild(h); document.body.appendChild(p);
      ui = { h: h, p: p, t: p.querySelector('p'), b: p.querySelector('.b') };
      h.addEventListener('click', function (e) { e.stopPropagation(); if (p.style.display === 'block') p.style.display = 'none'; else open(); });
      p.querySelector('.n').addEventListener('click', function (e) { e.stopPropagation(); p.style.display = 'none'; });
      ui.b.addEventListener('click', function (e) { e.stopPropagation(); home(); });
      ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) {
        h.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
        p.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
      });
      show(state);
    }
    if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
  }
})();
