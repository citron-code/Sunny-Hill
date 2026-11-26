// Shared by kur.mjs and yayinla.mjs: running wrangler (Cloudflare's tool, fetched by npx) and small helpers.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = resolve(SITE, '..');
export const DB_NAME = 'oyun-kayitlari';

export function say(text) { console.log('\n== ' + text); }
export function stop(text) { console.error('\nDURDU: ' + text + '\n'); process.exit(1); }

// wrangler, with its output on the screen (it may ask something) or captured
export function wrangler(args, { capture = false, input, env } = {}) {
  const r = spawnSync('npx --yes wrangler@4 ' + args, {
    cwd: SITE, shell: true, encoding: 'utf8', input, env: env ? { ...process.env, ...env } : process.env,
    stdio: [input !== undefined ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit'],
  });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

export function git(args) {
  const r = spawnSync('git ' + args, { cwd: REPO, shell: true, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

export function node(args) {
  const r = spawnSync(process.execPath, args.split(' '), { cwd: SITE, stdio: 'inherit' });   // no shell: the path to Node may have spaces (Program Files)
  return r.status === 0;
}

// the Worker's name in wrangler.toml: the site's address is https://<name>.<the account's workers.dev name>.workers.dev
export function project() {
  const m = readFileSync(join(SITE, 'wrangler.toml'), 'utf8').match(/^name\s*=\s*"([^"]+)"/m);
  return m ? m[1] : 'oyun';
}

// false when wrangler has no login, or when Cloudflare no longer takes it ("Unable to authenticate request [code: 10001]")
export function loggedIn() {
  const out = wrangler('whoami', { capture: true }).out;
  return !/not authenticated|not logged in|Unable to authenticate|code: 10001|code: 9109/i.test(out);
}

// wrangler deploy, on the screen: the first time it may ask for the account's workers.dev name.
// The site's address is read from wrangler's log (the screen is not captured, so that the question works).
export function deploy() {
  const log = join(tmpdir(), `citrobit-deploy-${process.pid}.log`);
  rmSync(log, { force: true });
  const { ok } = wrangler('deploy', { env: { WRANGLER_LOG_PATH: log } });
  let text = '';
  try { text = readFileSync(log, 'utf8'); } catch (e) { /* no log */ }
  rmSync(log, { force: true });
  const m = text.match(new RegExp('https://' + project() + '\.[a-z0-9-]+\.workers\.dev', 'i'));
  return { ok, url: m ? m[0].toLowerCase() : '' };
}

// the site's address goes into shared/config.js, in place of any Cloudflare address there (pages.dev, workers.dev)
// (the old address's tasi.html sends saves only to these; a custom domain added by hand stays)
export function rememberOrigin(origin) {
  const f = join(SITE, 'shared', 'config.js');
  const s = readFileSync(f, 'utf8');
  const m = s.match(/siteOrigins:\s*\[([^\]]*)\]/);
  const now = m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
  const next = now.filter((o) => !/\.(pages|workers)\.dev$/.test(o)).concat(origin);
  if (now.length === next.length && now.every((o) => next.includes(o))) return false;
  writeFileSync(f, s.replace(/siteOrigins:\s*\[[^\]]*\]/, 'siteOrigins: [' + next.map((o) => `'${o}'`).join(', ') + ']'));
  return true;
}

// the site's own check (/api/health), until it says ok (a new address or a new secret may take a minute)
export async function health(origin) {
  let last = null;
  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch(origin + '/api/health', { cache: 'no-store' });
      if (r.ok) { last = await r.json(); if (last.ok) return last; }
    } catch (e) { /* not there yet */ }
    await new Promise((r) => setTimeout(r, 6000));
  }
  return last;
}
