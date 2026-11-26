/* The site on this computer, for the tests:
     node tools/dev.mjs            -> http://localhost:8787 (the site, from dist/) and http://127.0.0.1:8788 (the old address: the repo)
   Build first: node build.mjs --local
   The server code is the same as on Cloudflare (server/api.js); the database is Node's SQLite (tools/d1-node.mjs). */
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { handle } from '../server/api.js';
import { openD1 } from './d1-node.mjs';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(SITE, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(root, req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = normalize(join(root, p));
  if (f !== root && !f.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f) && existsSync(f + '.html')) f += '.html';          // (like Cloudflare Pages: /oyna is oyna.html)
  if (!existsSync(f)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(readFileSync(f));
}

export function startDev({ port = 8787, oldPort = 8788, dbFile = ':memory:', log = false } = {}) {
  const env = {
    DB: openD1(dbFile, readFileSync(join(SITE, 'schema.sql'), 'utf8')),
    TEACHER_PASSWORD: process.env.TEACHER_PASSWORD || 'ogretmen-test',
    PEPPER: 'test-pepper-only-on-this-computer',
    TEST_OLD_SITE: `http://127.0.0.1:${oldPort}`,
  };
  const site = http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/api/')) {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        if (log && req.method === 'POST' && /^\/api\/(save|backup|login|logout)/.test(req.url)) {
          let b = {};
          try { b = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) { /* not json */ }
          const sv = (b.set || b.keys) ? Object.fromEntries(Object.entries(b.set || b.keys).map(([k, v]) => [k, /stars/.test(v) ? 'stars=' + (String(v).match(/"stars":(\d+)/) || [])[1] : v.length])) : '';
          console.log('    api', req.url, b.username || '', 'base' in b ? `base=${b.base} full=${!!b.full} force=${!!b.force} played=${b.played_at}` : '', JSON.stringify(sv), b.del && b.del.length ? 'del=' + b.del : '');
        }
        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers)) if (!['host', 'connection', 'content-length'].includes(k)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
        const r = await handle(new Request(`http://localhost:${port}${req.url}`, {
          method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
        }), env);
        const out = {};
        r.headers.forEach((v, k) => { if (k !== 'set-cookie') out[k] = v; });
        const sc = r.headers.getSetCookie();
        if (sc.length) out['set-cookie'] = sc;
        res.writeHead(r.status, out);
        res.end(Buffer.from(await r.arrayBuffer()));
        if (log && req.method === 'POST' && /^\/api\/(save|backup)/.test(req.url)) console.log('      ->', r.status);
        return;
      }
      serveStatic(join(SITE, 'dist'), req, res);
    } catch (e) {
      res.writeHead(500); res.end(String(e && e.stack || e));
    }
  });
  const old = http.createServer((req, res) => serveStatic(REPO, req, res));
  return new Promise((ok) => {
    site.listen(port, 'localhost', () => old.listen(oldPort, '127.0.0.1', () => ok({
      env, site: `http://localhost:${port}`, old: `http://127.0.0.1:${oldPort}`,
      close: () => { site.close(); old.close(); },
    })));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const s = await startDev({ dbFile: process.env.DB_FILE || ':memory:', log: true });
  console.log(`Site: ${s.site}   (öğretmen şifresi: ${s.env.TEACHER_PASSWORD})\nEski adres: ${s.old}`);
}
