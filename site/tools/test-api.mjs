/* The server's short test: node tools/test-api.mjs
   Accounts, PIN locks, saves and conflicts, backups, old saves from the old address, the teacher's tools. */
import { startDev } from './dev.mjs';

const s = await startDev({ port: 8797, oldPort: 8798 });
let failed = 0, passed = 0;
const check = (ok, what, extra) => { if (ok) passed++; else { failed++; console.log('  ✗ ' + what, extra !== undefined ? JSON.stringify(extra).slice(0, 300) : ''); } };

function client(origin = s.site) {
  const jar = {};
  return async function call(method, path, body, headers = {}) {
    const ck = Object.entries(jar).filter(([, c]) => path.startsWith(c.path)).map(([k, c]) => k + '=' + c.v).join('; ');
    const r = await fetch(s.site + path, {
      method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(ck ? { Cookie: ck } : {}), Origin: origin, ...headers },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
    for (const c of r.headers.getSetCookie()) {
      const [nv, ...attrs] = c.split(/;\s*/), [k, v] = nv.split('=');
      const path = (attrs.find((a) => /^path=/i.test(a)) || 'Path=/').slice(5);
      if (/max-age=0/i.test(c)) delete jar[k]; else jar[k] = { v, path };
    }
    let data = {};
    try { data = await r.json(); } catch (e) { /* none */ }
    return { status: r.status, data, headers: r.headers };
  };
}

const T = client(), A = client(), A2 = client(), B = client();
const SH = 'sunny-hill';
const st = (o) => JSON.stringify(Object.assign({ v: 1, created: true, started: true, name: 'Ali', stars: 0 }, o));

// ---- health and the teacher
let r = await T('GET', '/api/health');
check(r.data.ok === true, 'health ok', r.data);
r = await T('POST', '/api/teacher/login', { password: 'yanlis' });
check(r.status === 401, 'teacher: wrong password', r);
r = await T('POST', '/api/teacher/login', { password: 'ogretmen-test' });
check(r.status === 200, 'teacher: login', r);
r = await A('GET', '/api/teacher/students');
check(r.status === 401, 'a student cannot see the teacher list', r.status);

// ---- accounts
r = await T('POST', '/api/teacher/students', { cls: '2-A', usernames: ['alik', 'Ayşe D', 'ALİK', '!!!'] });
const made = r.data.created || [];
check(made.length === 4 && made[0].username === 'alik' && made[1].username === 'aysed' && made[2].username === 'alik2' && made[3].error === 'name', 'usernames: plain, unique', made);
check(made.slice(0, 3).every((x) => /^\d{4}$/.test(x.pin)), 'PINs: 4 digits', made);
const ali = made[0], ayse = made[1];
r = await T('GET', '/api/teacher/students');
check(r.data.students && r.data.students.length === 3 && r.data.students.every((x) => x.cls === '2-A'), 'teacher list', r.data);
const aliId = r.data.students.find((x) => x.username === 'alik').id, ayseId = r.data.students.find((x) => x.username === 'aysed').id;

// ---- logging in
r = await A('POST', '/api/login', { username: 'Ali K', pin: ali.pin === '0000' ? '1111' : '0000' });
check(r.status === 401 && r.data.error === 'wrong', 'student: wrong PIN', r);
r = await A('POST', '/api/login', { username: 'nobody', pin: '1234' });
check(r.status === 401, 'student: no such name', r);
for (let i = 0; i < 4; i++) r = await A('POST', '/api/login', { username: 'alik', pin: String((Number(ali.pin) + 1 + i) % 10000).padStart(4, '0') });
check(r.status === 429 && r.data.minutes === 15, 'student: locked after 5 wrong', r);
r = await A('POST', '/api/login', { username: 'alik', pin: ali.pin });
check(r.status === 429, 'student: still locked with the right PIN', r);
r = await T('POST', '/api/teacher/unlock', { id: aliId });
r = await A('POST', '/api/login', { username: ' ALİ.K ', pin: ali.pin });
check(r.status === 200 && r.data.user.username === 'alik', 'student: login (forgiving name)', r);
r = await A('GET', '/api/me');
check(r.status === 200 && r.data.user.username === 'alik' && r.data.user.cls === '2-A', 'me', r);
r = await A2('POST', '/api/login', { username: 'alik', pin: ali.pin });
check(r.status === 200, 'second device login', r);

// ---- saves
r = await A('GET', '/api/save/' + SH);
check(r.data.rev === 0 && Object.keys(r.data.keys).length === 0, 'empty save', r.data);
r = await A('POST', '/api/save/' + SH, { base: 0, set: { 'sunnyHill.save.v1': st({ stars: 2 }) }, played_at: Date.now(), summary: 'Bölüm 1 · 2 yıldız' });
check(r.data.rev === 1, 'first save', r);
r = await A('POST', '/api/save/' + SH, { base: 1, set: { 'pq.unit2.save': '{}' } });
check(r.status === 400, 'another game\'s key is refused', r);
r = await A('POST', '/api/save/no-such-game', { base: 0, set: {} });
check(r.status === 404, 'unknown game', r.status);
r = await A('POST', '/api/save/' + SH, { base: 1, set: { 'sunnyHill.save.v1.album': '{"a":"x"}' } });
check(r.data.rev === 2, 'second key', r);
r = await A2('GET', '/api/save/' + SH);
check(r.data.rev === 2 && JSON.parse(r.data.keys['sunnyHill.save.v1']).stars === 2 && r.data.keys['sunnyHill.save.v1.album'] === '{"a":"x"}', 'other device sees it', r.data);
r = await A2('POST', '/api/save/' + SH, { base: 2, del: ['sunnyHill.save.v1.album'], set: { 'sunnyHill.save.v1': st({ stars: 4 }) }, played_at: Date.now() });
check(r.data.rev === 3, 'device 2 plays on', r);
r = await A('POST', '/api/save/' + SH, { base: 2, set: { 'sunnyHill.save.v1': st({ stars: 3 }) }, played_at: Date.now() });
check(r.status === 409 && r.data.rev === 3, 'device 1 behind: conflict', r);
r = await A('POST', '/api/save/' + SH, { base: 2, full: true, force: true, set: { 'sunnyHill.save.v1': st({ stars: 5 }) }, played_at: Date.now(), summary: 'Bölüm 1 · 5 yıldız' });
check(r.data.rev === 4, 'device 1 wins with force', r);
r = await A2('GET', '/api/save/' + SH);
check(JSON.parse(r.data.keys['sunnyHill.save.v1']).stars === 5 && !r.data.keys['sunnyHill.save.v1.album'], 'force replaced the whole save', r.data);
r = await T('GET', `/api/teacher/backups?id=${aliId}&game=${SH}`);
const conflictBk = (r.data.backups || []).find((x) => x.reason === 'conflict');
check(!!conflictBk && /4 yıldız/.test(conflictBk.summary), 'the losing copy is a backup', r.data);
r = await A('POST', '/api/backup/' + SH, { keys: { 'sunnyHill.save.v1': st({ stars: 1 }) }, played_at: 1 });
check(r.data.ok === true, 'device copy kept as backup', r);
r = await A('POST', '/api/save/' + SH, { base: 4, del: ['sunnyHill.save.v1'], backup: true, played_at: Date.now() });
check(r.data.rev === 5, 'new game: the main save is removed', r);
r = await T('GET', `/api/teacher/backups?id=${aliId}&game=${SH}`);
check(r.data.backups.some((x) => x.reason === 'new-game' && /5 yıldız/.test(x.summary)), 'new game: the old save is kept as a backup first', r.data);
r = await A('POST', '/api/save/' + SH, { base: 5, set: { 'sunnyHill.save.v1': st({ stars: 5 }) }, played_at: Date.now(), summary: 'Bölüm 1 · 5 yıldız' });
check(r.data.rev === 6, 'saving again after the new game', r);

// ---- the teacher's list shows progress
r = await T('GET', '/api/teacher/students');
const aliRow = r.data.students.find((x) => x.id === aliId);
check(aliRow.games[SH] && aliRow.games[SH].summary === 'Bölüm 1 · 5 yıldız' && aliRow.games[SH].bytes > 10, 'summary in the list', aliRow);

// ---- restore a backup
r = await T('POST', '/api/teacher/restore', { backup_id: conflictBk.id });
check(r.data.ok && r.data.rev === 7, 'restore', r);
r = await A('GET', '/api/save/' + SH);
check(JSON.parse(r.data.keys['sunnyHill.save.v1']).stars === 4, 'restored copy is the save now', r.data);

// ---- old saves from the old address
const OLD = s.old;
r = await B('POST', '/api/login', { username: 'ayseD', pin: ayse.pin });
check(r.status === 200, 'Ayşe logs in', r);
r = await B('POST', '/api/move/start', { game: SH });
const code = r.data.code;
check(typeof code === 'string' && code.length > 16, 'move code', r);
const move = (origin, b) => fetch(s.site + '/api/move/finish', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8', Origin: origin }, body: JSON.stringify(b) });
let mr = await move('https://evil.example', { code, game: SH, keys: { 'sunnyHill.save.v1': st({ stars: 7 }) } });
check(mr.status === 403, 'move: other sites refused', mr.status);
mr = await move(OLD, { code: 'wrong', game: SH, keys: { 'sunnyHill.save.v1': st({ stars: 7 }) } });
check(mr.status === 403, 'move: wrong code refused', mr.status);
mr = await move(OLD, { code, game: SH, keys: { 'sunnyHill.save.v1': st({ stars: 7, name: 'Ayşe' }), 'sunnyHill.save.v1.album': '{}' } });
let md = await mr.json();
check(mr.status === 200 && md.applied === true && mr.headers.get('access-control-allow-origin') === OLD, 'move: applied, with CORS', md);
mr = await move(OLD, { code, game: SH, keys: {} });
check(mr.status === 403, 'move: a code works once', mr.status);
r = await B('GET', '/api/save/' + SH);
check(r.data.rev === 1 && JSON.parse(r.data.keys['sunnyHill.save.v1']).stars === 7, 'moved save is there', r.data);
r = await B('POST', '/api/move/start', { game: SH });
mr = await move(OLD, { code: r.data.code, game: SH, keys: { 'sunnyHill.save.v1': st({ stars: 1 }) } });
md = await mr.json();
check(md.applied === false, 'move: an account with a save keeps it (old one -> backup)', md);
r = await B('GET', '/api/save/' + SH);
check(JSON.parse(r.data.keys['sunnyHill.save.v1']).stars === 7, 'save unchanged', r.data);

// ---- cross-site posts are refused
r = await A('POST', '/api/save/' + SH, { base: 7, set: {} }, { Origin: 'https://evil.example' });
check(r.status === 403, 'other sites cannot save', r.status);

// ---- new PIN: old one and old logins stop
r = await T('POST', '/api/teacher/pin', { id: aliId });
const pin2 = r.data.pin;
check(/^\d{4}$/.test(pin2) && r.data.username === 'alik', 'new PIN', r);
r = await A('GET', '/api/me');
check(r.status === 401, 'old login ended', r.status);
r = await A('POST', '/api/login', { username: 'alik', pin: pin2 });
check(r.status === 200, 'new PIN works', r);

// ---- class move, delete
r = await T('POST', '/api/teacher/class', { id: ayseId, cls: '2-B' });
r = await T('GET', '/api/teacher/students');
check(r.data.students.find((x) => x.id === ayseId).cls === '2-B', 'class changed', r.data);
r = await T('POST', '/api/teacher/delete', { id: ayseId });
r = await B('GET', '/api/me');
check(r.status === 401, 'deleted account is gone', r.status);
const left = s.env.DB.sqlite.prepare('SELECT (SELECT COUNT(*) FROM save_keys WHERE student_id = ?) + (SELECT COUNT(*) FROM backups WHERE student_id = ?) AS n').get(ayseId, ayseId);
check(left.n === 0, 'its saves and backups are gone', left);

// ---- the teacher logs out
r = await T('POST', '/api/teacher/logout', {});
r = await T('GET', '/api/teacher/students');
check(r.status === 401, 'teacher logout', r.status);

s.close();
console.log(failed ? `API: ${failed} sorun, ${passed} geçti` : `API: hepsi geçti (${passed})`);
process.exit(failed ? 1 : 0);
