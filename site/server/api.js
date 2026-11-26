/* The site's server: everything under /api/. It runs as a Cloudflare Pages Function
   (functions/api/[[path]].js) and, for the tests, under tools/dev.mjs with the same code.

   env.DB               the D1 database (schema.sql)
   env.TEACHER_PASSWORD the teacher's password (a Cloudflare secret)
   env.PEPPER           a long random secret mixed into every PIN's hash (a Cloudflare secret; never change it)
   env.TEST_OLD_SITE    only in the tests: the stand-in for the old address

   Students log in with a username and a 4-digit PIN. A PIN this short is only safe with the
   pepper (the database alone cannot be used to find a PIN) and with the lock after wrong tries:
   5 wrong: 15 minutes, 10 wrong: an hour, from 15 on: a day each (the teacher can unlock). */

import { GAMES, gameById, ownsKey, summaryOf } from '../shared/games.js';
import { canonUser } from '../shared/names.js';
import { CONFIG } from '../shared/config.js';

const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const STUDENT_DAYS = 365, TEACHER_DAYS = 30;
const MAX_BODY = 1900000, MAX_VALUE = 1500000, KEEP_BACKUPS = 12;
const enc = new TextEncoder();

const ROUTES = [
  ['GET', /^\/api\/health$/, health],
  ['POST', /^\/api\/login$/, login],
  ['POST', /^\/api\/logout$/, logout],
  ['GET', /^\/api\/me$/, me],
  ['GET', /^\/api\/save\/([a-z0-9-]+)$/, getSave],
  ['POST', /^\/api\/save\/([a-z0-9-]+)$/, putSave],
  ['POST', /^\/api\/backup\/([a-z0-9-]+)$/, putBackup],
  ['POST', /^\/api\/move\/start$/, moveStart],
  ['POST', /^\/api\/teacher\/login$/, tLogin],
  ['POST', /^\/api\/teacher\/logout$/, tLogout],
  ['GET', /^\/api\/teacher\/students$/, tList],
  ['POST', /^\/api\/teacher\/students$/, tCreate],
  ['POST', /^\/api\/teacher\/pin$/, tPin],
  ['POST', /^\/api\/teacher\/unlock$/, tUnlock],
  ['POST', /^\/api\/teacher\/class$/, tClass],
  ['POST', /^\/api\/teacher\/delete$/, tDelete],
  ['GET', /^\/api\/teacher\/backups$/, tBackups],
  ['POST', /^\/api\/teacher\/restore$/, tRestore],
];

export async function handle(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  try {
    // the old address sends an old save here (another site: the one place with CORS)
    if (path === '/api/move/finish') {
      if (request.method === 'OPTIONS') return cors(request, env, new Response(null, { status: 204 }));
      if (request.method === 'POST') return cors(request, env, await moveFinish(request, env));
    }
    // everything else only from the site's own pages
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const o = request.headers.get('Origin');
      if (o && o !== url.origin) return json({ error: 'origin' }, 403);
    }
    for (const [method, re, fn] of ROUTES) {
      const m = path.match(re);
      if (m && method === request.method) return await fn(request, env, m, url);
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    if (e instanceof Response) return e;
    return json({ error: 'server', detail: String((e && e.message) || e).slice(0, 300) }, 500);
  }
}

/* ------------------------------------------------------------------ helpers */

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

async function body(req) {
  const t = await req.text();
  if (t.length > MAX_BODY) throw json({ error: 'too big' }, 413);
  try {
    const b = JSON.parse(t || '{}');
    return b && typeof b === 'object' ? b : {};
  } catch (e) {
    throw json({ error: 'bad json' }, 400);
  }
}

function cookie(req, name) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

function setCookie(req, name, value, maxAgeSec, path) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${name}=${value}; Path=${path}; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Lax${secure}`;
}

function b64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function token(bytes) {
  return b64(crypto.getRandomValues(new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha256(s) {
  return b64(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(String(s)))));
}
async function pinHash(env, salt, pin) {
  const key = await crypto.subtle.importKey('raw', enc.encode(env.PEPPER), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode('pin1:' + salt + ':' + pin))));
}
function same(a, b) {                       // compares without telling how much matched
  a = String(a); b = String(b);
  let r = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
  return r === 0;
}
function newPin() {                         // 4 digits, none of the easy ones (1111, 1234, 4321, 1212, years)
  for (;;) {
    const p = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, '0');
    if (/^(\d)\1{3}$/.test(p) || /^(\d\d)\1$/.test(p) || /^(19|20)\d\d$/.test(p)) continue;
    if ('01234567890'.includes(p) || '09876543210'.includes(p)) continue;
    return p;
  }
}
function cleanCls(v) {
  return String(v || '').replace(/[^\p{L}\p{N} .\-/]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 20);
}
function cleanKeys(g, keys) {               // only this game's keys, only strings; null when anything else is there
  if (!keys || typeof keys !== 'object') return {};
  const out = {};
  for (const k of Object.keys(keys)) {
    if (!ownsKey(g, k) || typeof keys[k] !== 'string' || keys[k].length > MAX_VALUE) return null;
    out[k] = keys[k];
  }
  return out;
}

async function newSession(env, role, studentId, days) {
  const t = token(32);
  await env.DB.prepare('INSERT INTO sessions (token_hash, role, student_id, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(t), role, studentId, Date.now() + days * DAY).run();
  return t;
}

async function student(req, env) {
  const t = cookie(req, 'sid');
  if (!t) return null;
  const r = await env.DB.prepare(
    'SELECT st.id, st.username, st.cls, s.expires_at FROM sessions s JOIN students st ON st.id = s.student_id WHERE s.token_hash = ? AND s.role = ?',
  ).bind(await sha256(t), 'student').first();
  return r && r.expires_at > Date.now() ? r : null;
}

async function isTeacher(req, env) {
  const t = cookie(req, 'tid');
  if (!t) return false;
  const r = await env.DB.prepare('SELECT expires_at FROM sessions WHERE token_hash = ? AND role = ?').bind(await sha256(t), 'teacher').first();
  return !!r && r.expires_at > Date.now();
}

async function needStudent(req, env) {
  const st = await student(req, env);
  if (!st) throw json({ error: 'login' }, 401);
  return st;
}
async function needTeacher(req, env) {
  if (!(await isTeacher(req, env))) throw json({ error: 'login' }, 401);
}
function needGame(id) {
  const g = gameById(id);
  if (!g) throw json({ error: 'game' }, 404);
  return g;
}

/* --------------------------------------------------------------- the saves */

async function readSave(env, sid, game) {
  const meta = await env.DB.prepare('SELECT rev, played_at FROM save_meta WHERE student_id = ? AND game = ?').bind(sid, game).first();
  if (!meta) return { rev: 0, played_at: 0, keys: {} };
  const rows = await env.DB.prepare('SELECT k, v FROM save_keys WHERE student_id = ? AND game = ?').bind(sid, game).all();
  const keys = {};
  for (const r of rows.results) keys[r.k] = r.v;
  return { rev: meta.rev, played_at: meta.played_at, keys };
}

const UPSERT_KEY = 'INSERT INTO save_keys (student_id, game, k, v) VALUES (?, ?, ?, ?) ON CONFLICT (student_id, game, k) DO UPDATE SET v = excluded.v';

function metaStmt(env, sid, game, rev, played, backupAt, summary) {
  // (bytes: the size of the whole save after this change; WHERE 1 keeps SQLite's upsert parser happy)
  return env.DB.prepare(
    'INSERT INTO save_meta (student_id, game, rev, played_at, updated_at, backup_at, summary, bytes) ' +
    'SELECT ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(SUM(LENGTH(v)), 0) FROM save_keys WHERE student_id = ? AND game = ?) WHERE 1 ' +
    'ON CONFLICT (student_id, game) DO UPDATE SET rev = excluded.rev, played_at = excluded.played_at, updated_at = excluded.updated_at, ' +
    "backup_at = excluded.backup_at, bytes = excluded.bytes, summary = CASE WHEN excluded.summary <> '' THEN excluded.summary ELSE save_meta.summary END",
  ).bind(sid, game, rev, played, Date.now(), backupAt, summary || '', sid, game);
}

function replaceAll(env, sid, game, keys) {
  const S = [env.DB.prepare('DELETE FROM save_keys WHERE student_id = ? AND game = ?').bind(sid, game)];
  for (const k of Object.keys(keys)) S.push(env.DB.prepare(UPSERT_KEY).bind(sid, game, k, keys[k]));
  return S;
}

// a copy of a save into backups (the one in the cloud now, or the given keys); the last KEEP_BACKUPS stay
async function backupStmts(env, sid, game, reason, keys) {
  if (!keys) keys = (await readSave(env, sid, game)).keys;
  if (!Object.keys(keys).length) return [];
  const g = gameById(game), data = JSON.stringify(keys);
  if (data.length > MAX_BODY) return [];             // (a row in D1 holds 2 MB: saving comes first)
  return [
    env.DB.prepare('INSERT INTO backups (student_id, game, saved_at, reason, summary, data) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(sid, game, Date.now(), reason, summaryOf(g, keys), data),
    env.DB.prepare('DELETE FROM backups WHERE student_id = ? AND game = ? AND id NOT IN (SELECT id FROM backups WHERE student_id = ? AND game = ? ORDER BY id DESC LIMIT ?)')
      .bind(sid, game, sid, game, KEEP_BACKUPS),
  ];
}

/* ----------------------------------------------------------------- student */

async function health(req, env) {
  let db = false;
  try { await env.DB.prepare('SELECT COUNT(*) AS n FROM save_meta').first(); db = true; } catch (e) { /* no tables */ }
  return json({ ok: db && !!env.PEPPER && !!env.TEACHER_PASSWORD, db, pepper: !!env.PEPPER, teacher: !!env.TEACHER_PASSWORD });
}

async function login(req, env) {
  if (!env.PEPPER) return json({ error: 'setup' }, 500);
  const b = await body(req);
  const u = canonUser(b.username), pin = String(b.pin || '').replace(/\D/g, '').slice(0, 8), now = Date.now();
  const st = u ? await env.DB.prepare('SELECT id, username, cls, pin_hash, pin_salt, fails, locked_until FROM students WHERE username = ?').bind(u).first() : null;
  if (st && st.locked_until > now) return json({ error: 'locked', minutes: Math.ceil((st.locked_until - now) / MIN) }, 429);
  const h = await pinHash(env, st ? st.pin_salt : 'none', pin);          // (the same work for a name that is not there)
  if (!st || !same(h, st.pin_hash)) {
    if (st) {
      const f = st.fails + 1, mins = f >= 15 ? 1440 : f === 10 ? 60 : f === 5 ? 15 : 0;
      await env.DB.prepare('UPDATE students SET fails = ?, locked_until = ? WHERE id = ?').bind(f, mins ? now + mins * MIN : 0, st.id).run();
      if (mins) return json({ error: 'locked', minutes: mins }, 429);
    }
    return json({ error: 'wrong' }, 401);
  }
  const t = await newSession(env, 'student', st.id, STUDENT_DAYS);
  await env.DB.prepare('UPDATE students SET fails = 0, locked_until = 0, last_login = ? WHERE id = ?').bind(now, st.id).run();
  return json({ user: { username: st.username, cls: st.cls } }, 200, { 'Set-Cookie': setCookie(req, 'sid', t, STUDENT_DAYS * 86400, '/api') });
}

async function logout(req, env) {
  const t = cookie(req, 'sid');
  if (t) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(t)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': setCookie(req, 'sid', '', 0, '/api') });
}

async function me(req, env) {
  const st = await needStudent(req, env);
  const rows = await env.DB.prepare('SELECT game, summary, played_at FROM save_meta WHERE student_id = ?').bind(st.id).all();
  const games = {};
  for (const r of rows.results) games[r.game] = { summary: r.summary, played_at: r.played_at };
  return json({ user: { username: st.username, cls: st.cls }, games });
}

async function getSave(req, env, m, url) {
  const st = await needStudent(req, env), g = needGame(m[1]);
  if (url.searchParams.get('meta')) {                // only the version (a quick look: has another device moved on?)
    const meta = await env.DB.prepare('SELECT rev, played_at FROM save_meta WHERE student_id = ? AND game = ?').bind(st.id, g.id).first();
    return json({ rev: meta ? meta.rev : 0, played_at: meta ? meta.played_at : 0 });
  }
  return json(await readSave(env, st.id, g.id));
}

/* A change from a device: {base, set: {key: value}, del: [key], full, force, played_at, summary}.
   base is the version the device started from. When the cloud has moved on since (another device
   played), the answer is 409 and nothing changes, unless force: then the device's copy wins and
   the cloud's copy goes to the backups first. full: the device sends the whole save. */
async function putSave(req, env, m) {
  const st = await needStudent(req, env), g = needGame(m[1]), b = await body(req);
  const set = cleanKeys(g, b.set), del = Array.isArray(b.del) ? b.del.map(String) : [];
  if (set === null || del.some((k) => !ownsKey(g, k))) return json({ error: 'key' }, 400);
  const now = Date.now(), base = b.base | 0, full = !!b.full;
  const meta = await env.DB.prepare('SELECT rev, backup_at, played_at FROM save_meta WHERE student_id = ? AND game = ?').bind(st.id, g.id).first();
  const cur = meta ? meta.rev : 0;
  if (base !== cur && !b.force) return json({ conflict: true, rev: cur, played_at: meta ? meta.played_at : 0 }, 409);
  let S = [], backupAt = meta ? meta.backup_at : now;
  if (meta && (base !== cur || b.backup || now - meta.backup_at > HOUR)) {
    S = S.concat(await backupStmts(env, st.id, g.id, base !== cur ? 'conflict' : b.backup ? 'new-game' : 'hourly'));
    backupAt = now;
  }
  if (full) S = S.concat(replaceAll(env, st.id, g.id, set));
  else {
    for (const k of Object.keys(set)) S.push(env.DB.prepare(UPSERT_KEY).bind(st.id, g.id, k, set[k]));
    for (const k of del) S.push(env.DB.prepare('DELETE FROM save_keys WHERE student_id = ? AND game = ? AND k = ?').bind(st.id, g.id, k));
  }
  const played = Math.min(Number(b.played_at) || now, now + MIN);
  S.push(metaStmt(env, st.id, g.id, cur + 1, played, backupAt, String(b.summary || '').slice(0, 120)));
  await env.DB.batch(S);
  return json({ rev: cur + 1 });
}

// a device's copy that lost to a newer one in the cloud: kept among the backups
async function putBackup(req, env, m) {
  const st = await needStudent(req, env), g = needGame(m[1]), b = await body(req);
  const keys = cleanKeys(g, b.keys);
  if (keys === null) return json({ error: 'key' }, 400);
  const S = await backupStmts(env, st.id, g.id, 'device', keys);
  if (S.length) await env.DB.batch(S);
  return json({ ok: true });
}

/* ------------------------------------------- old saves from the old address */

async function moveStart(req, env) {
  const st = await needStudent(req, env), b = await body(req), g = needGame(b.game);
  const code = token(18), now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM codes WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO codes (code_hash, student_id, game, expires_at) VALUES (?, ?, ?, ?)').bind(await sha256(code), st.id, g.id, now + 15 * MIN),
  ]);
  return json({ code });
}

function moveOrigins(env) {
  return env.TEST_OLD_SITE ? [CONFIG.oldSite, env.TEST_OLD_SITE] : [CONFIG.oldSite];
}

function cors(req, env, res) {
  const o = req.headers.get('Origin') || '';
  if (moveOrigins(env).includes(o)) {
    res.headers.set('Access-Control-Allow-Origin', o);
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    res.headers.set('Vary', 'Origin');
  }
  return res;
}

// {code, game, keys} from tasi.html: an account with no save for this game takes it; otherwise it is kept as a backup
async function moveFinish(req, env) {
  if (!moveOrigins(env).includes(req.headers.get('Origin') || '')) return json({ error: 'origin' }, 403);
  const b = await body(req), g = needGame(b.game), code = String(b.code || '');
  const row = code ? await env.DB.prepare('SELECT student_id, game, expires_at FROM codes WHERE code_hash = ?').bind(await sha256(code)).first() : null;
  if (!row || row.game !== g.id || row.expires_at < Date.now()) return json({ error: 'code' }, 403);
  const keys = cleanKeys(g, b.keys);
  if (keys === null) return json({ error: 'key' }, 400);
  const sid = row.student_id;
  let S = [env.DB.prepare('DELETE FROM codes WHERE code_hash = ?').bind(await sha256(code))], applied = false;
  if (Object.keys(keys).length) {
    S = S.concat(await backupStmts(env, sid, g.id, 'old-site', keys));
    const meta = await env.DB.prepare('SELECT rev FROM save_meta WHERE student_id = ? AND game = ?').bind(sid, g.id).first();
    if (!meta || meta.rev === 0) {
      S = S.concat(replaceAll(env, sid, g.id, keys));
      S.push(metaStmt(env, sid, g.id, 1, Date.now(), Date.now(), summaryOf(g, keys)));
      applied = true;
    }
  }
  await env.DB.batch(S);
  return json({ ok: true, applied, empty: !Object.keys(keys).length });
}

/* ----------------------------------------------------------------- teacher */

async function tLogin(req, env) {
  if (!env.TEACHER_PASSWORD) return json({ error: 'setup' }, 500);
  const now = Date.now();
  const row = await env.DB.prepare('SELECT v FROM kv WHERE k = ?').bind('teacher_fails').first();
  const L = row ? JSON.parse(row.v) : { n: 0, until: 0 };
  if (L.until > now) return json({ error: 'locked', minutes: Math.ceil((L.until - now) / MIN) }, 429);
  const b = await body(req);
  if (!same(await sha256(String(b.password || '')), await sha256(env.TEACHER_PASSWORD))) {
    L.n = (L.n | 0) + 1;
    if (L.n >= 10) { L.n = 0; L.until = now + 10 * MIN; }
    await env.DB.prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT (k) DO UPDATE SET v = excluded.v').bind('teacher_fails', JSON.stringify(L)).run();
    return L.until > now ? json({ error: 'locked', minutes: 10 }, 429) : json({ error: 'wrong' }, 401);
  }
  await env.DB.batch([
    env.DB.prepare('DELETE FROM kv WHERE k = ?').bind('teacher_fails'),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('DELETE FROM codes WHERE expires_at < ?').bind(now),
  ]);
  const t = await newSession(env, 'teacher', 0, TEACHER_DAYS);
  return json({ ok: true }, 200, { 'Set-Cookie': setCookie(req, 'tid', t, TEACHER_DAYS * 86400, '/api/teacher') });
}

async function tLogout(req, env) {
  const t = cookie(req, 'tid');
  if (t) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(t)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': setCookie(req, 'tid', '', 0, '/api/teacher') });
}

async function tList(req, env) {
  await needTeacher(req, env);
  const st = await env.DB.prepare('SELECT id, username, cls, created_at, last_login, fails, locked_until FROM students ORDER BY cls, username').all();
  const sm = await env.DB.prepare('SELECT student_id, game, summary, played_at, updated_at, bytes FROM save_meta').all();
  const by = {}, now = Date.now();
  for (const r of sm.results) (by[r.student_id] || (by[r.student_id] = {}))[r.game] = { summary: r.summary, played_at: r.played_at, updated_at: r.updated_at, bytes: r.bytes };
  return json({
    students: st.results.map((s) => ({ id: s.id, username: s.username, cls: s.cls, created_at: s.created_at, last_login: s.last_login, locked: s.locked_until > now, games: by[s.id] || {} })),
    games: GAMES.map((g) => ({ id: g.id, title: g.title })),
  });
}

// {cls, usernames: [...]}: new accounts; the answer has each PIN once (only its hash is kept)
async function tCreate(req, env) {
  await needTeacher(req, env);
  if (!env.PEPPER) return json({ error: 'setup' }, 500);
  const b = await body(req), cls = cleanCls(b.cls), list = Array.isArray(b.usernames) ? b.usernames.slice(0, 80) : [];
  const taken = new Set((await env.DB.prepare('SELECT username FROM students').all()).results.map((r) => r.username));
  const created = [], S = [], now = Date.now();
  for (const raw of list) {
    const base = canonUser(raw).slice(0, 17);
    if (!base) { created.push({ error: 'name', input: String(raw).slice(0, 40) }); continue; }
    let u = base, n = 2;
    while (taken.has(u)) u = base + n++;
    taken.add(u);
    const pin = newPin(), salt = token(12);
    S.push(env.DB.prepare('INSERT INTO students (username, cls, pin_hash, pin_salt, created_at) VALUES (?, ?, ?, ?, ?)').bind(u, cls, await pinHash(env, salt, pin), salt, now));
    created.push({ username: u, pin, cls });
  }
  if (S.length) await env.DB.batch(S);
  return json({ created });
}

// a new PIN (the old one stops working, and every device has to log in again)
async function tPin(req, env) {
  await needTeacher(req, env);
  const id = (await body(req)).id | 0;
  const st = await env.DB.prepare('SELECT username, cls FROM students WHERE id = ?').bind(id).first();
  if (!st) return json({ error: 'student' }, 404);
  const pin = newPin(), salt = token(12);
  await env.DB.batch([
    env.DB.prepare('UPDATE students SET pin_hash = ?, pin_salt = ?, fails = 0, locked_until = 0 WHERE id = ?').bind(await pinHash(env, salt, pin), salt, id),
    env.DB.prepare('DELETE FROM sessions WHERE role = ? AND student_id = ?').bind('student', id),
  ]);
  return json({ username: st.username, pin, cls: st.cls });
}

async function tUnlock(req, env) {
  await needTeacher(req, env);
  const id = (await body(req)).id | 0;
  await env.DB.prepare('UPDATE students SET fails = 0, locked_until = 0 WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

async function tClass(req, env) {
  await needTeacher(req, env);
  const b = await body(req);
  await env.DB.prepare('UPDATE students SET cls = ? WHERE id = ?').bind(cleanCls(b.cls), b.id | 0).run();
  return json({ ok: true });
}

async function tDelete(req, env) {
  await needTeacher(req, env);
  const id = (await body(req)).id | 0;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM students WHERE id = ?').bind(id),
    env.DB.prepare('DELETE FROM sessions WHERE role = ? AND student_id = ?').bind('student', id),
    env.DB.prepare('DELETE FROM save_meta WHERE student_id = ?').bind(id),
    env.DB.prepare('DELETE FROM save_keys WHERE student_id = ?').bind(id),
    env.DB.prepare('DELETE FROM backups WHERE student_id = ?').bind(id),
    env.DB.prepare('DELETE FROM codes WHERE student_id = ?').bind(id),
  ]);
  return json({ ok: true });
}

async function tBackups(req, env, m, url) {
  await needTeacher(req, env);
  const id = Number(url.searchParams.get('id')) | 0, g = needGame(url.searchParams.get('game'));
  const rows = await env.DB.prepare('SELECT id, saved_at, reason, summary, LENGTH(data) AS bytes FROM backups WHERE student_id = ? AND game = ? ORDER BY id DESC').bind(id, g.id).all();
  return json({ backups: rows.results });
}

// a backup becomes the save again (the save it replaces is kept as a backup first)
async function tRestore(req, env) {
  await needTeacher(req, env);
  const bid = (await body(req)).backup_id | 0;
  const bk = await env.DB.prepare('SELECT student_id, game, data FROM backups WHERE id = ?').bind(bid).first();
  if (!bk) return json({ error: 'backup' }, 404);
  const g = needGame(bk.game), keys = JSON.parse(bk.data), sid = bk.student_id;
  const meta = await env.DB.prepare('SELECT rev FROM save_meta WHERE student_id = ? AND game = ?').bind(sid, g.id).first();
  const rev = (meta ? meta.rev : 0) + 1, now = Date.now();
  let S = await backupStmts(env, sid, g.id, 'before-restore');
  S = S.concat(replaceAll(env, sid, g.id, keys));
  S.push(metaStmt(env, sid, g.id, rev, now, now, summaryOf(g, keys)));
  await env.DB.batch(S);
  return json({ ok: true, rev });
}
