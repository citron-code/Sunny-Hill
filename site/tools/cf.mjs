// Shared by kur.mjs and yayinla.mjs: running wrangler (Cloudflare's tool, fetched by npx) and small helpers.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = resolve(SITE, '..');
export const DB_NAME = 'oyun-kayitlari';

export function say(text) { console.log('\n== ' + text); }
export function stop(text) { console.error('\nDURDU: ' + text + '\n'); process.exit(1); }

// wrangler, with its output on the screen (it may ask something) or captured
export function wrangler(args, { capture = false, input } = {}) {
  const r = spawnSync('npx --yes wrangler@4 ' + args, {
    cwd: SITE, shell: true, encoding: 'utf8', input,
    stdio: [input !== undefined ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit'],
  });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

export function git(args) {
  const r = spawnSync('git ' + args, { cwd: REPO, shell: true, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

export function node(args) {
  const r = spawnSync(process.execPath + ' ' + args, { cwd: SITE, shell: true, stdio: 'inherit' });
  return r.status === 0;
}

export function project() {
  const m = readFileSync(join(SITE, 'wrangler.toml'), 'utf8').match(/^name\s*=\s*"([^"]+)"/m);
  return m ? m[1] : 'citrobit';
}

// the project's address on pages.dev, from wrangler's list
export function domainOf(name) {
  const r = wrangler('pages project list', { capture: true });
  const line = r.out.split(/\r?\n/).find((l) => l.split(/[│|]/).map((c) => c.trim()).includes(name));
  const m = line && line.match(/([a-z0-9-]+\.pages\.dev)/);
  return m ? m[1] : '';
}

// the site's pages.dev address goes into shared/config.js, in place of any other pages.dev address there
// (the old address's tasi.html sends saves only to these; a custom domain added by hand stays)
export function rememberOrigin(origin) {
  const f = join(SITE, 'shared', 'config.js');
  const s = readFileSync(f, 'utf8');
  const m = s.match(/siteOrigins:\s*\[([^\]]*)\]/);
  const now = m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
  const next = now.filter((o) => !/\.pages\.dev$/.test(o)).concat(origin);
  if (now.length === next.length && now.every((o) => next.includes(o))) return false;
  writeFileSync(f, s.replace(/siteOrigins:\s*\[[^\]]*\]/, 'siteOrigins: [' + next.map((o) => `'${o}'`).join(', ') + ']'));
  return true;
}

export async function health(origin) {
  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch(origin + '/api/health', { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch (e) { /* the new address may take a minute */ }
    await new Promise((r) => setTimeout(r, 6000));
  }
  return null;
}
