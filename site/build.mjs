/* Builds the site into dist/ (the files the Cloudflare Worker serves).
     node build.mjs           the games as they are published: Sunny Hill from this repo's origin/main
                              (run "git fetch origin main" first; yayinla.mjs does), Pocket Quest from its web address
     node build.mjs --local   the games from the files on this computer (for the tests)
   Each game is copied as it is, with one line added at the top of its <head>: the site's script
   (/js/oyun-sitesi.js) that sends the game's saves to the cloud. The games' own files are never changed. */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAMES } from './shared/games.js';
import { CONFIG } from './shared/config.js';

const SITE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(SITE, '..');
const DIST = join(SITE, 'dist');
const LOCAL = process.argv.includes('--local');
const PQ_URL = 'https://citron-code.github.io/pocket-quest/';
const PQ_FILE = process.env.PQ_FILE || resolve(REPO, '..', 'Pocket Quest', 'dist', 'Pocket_Quest.html');

// where each game comes from, what it must contain (its save keys: a renamed key would lose saves), extra files beside it
const SOURCES = {
  'sunny-hill': {
    get: () => (LOCAL
      ? readFileSync(join(REPO, 'sunny-hill.html'), 'utf8')
      : execFileSync('git', ['show', 'origin/main:sunny-hill.html'], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 << 20 })),
    expect: ["saveKey: 'sunnyHill.save.v1'", "SETTINGS.saveKey + '.album'"],
    // (the game adds these two links itself, next to its own file: they are the site's, so the home-screen icon opens the site)
    files: { 'manifest.webmanifest': join(DIST, 'manifest.webmanifest'), 'apple-touch-icon.png': join(DIST, 'img', 'apple-touch-icon.png') },
  },
  'pocket-quest': {
    get: async () => {
      if (LOCAL) return readFileSync(PQ_FILE, 'utf8');
      const r = await fetch(PQ_URL + '?v=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('Pocket Quest indirilemedi (' + r.status + ')');
      return r.text();
    },
    expect: ["'pq.unit2.save'"],          // unit 3's key comes with season 2; every pq.* key syncs anyway
    files: { 'icon-180.png': join(SITE, 'public', 'img', 'pq-icon-180.png'), 'icon-192.png': join(SITE, 'public', 'img', 'pq-icon-192.png') },
  },
};

function inject(html, id) {
  const tag = `<script src="/js/oyun-sitesi.js" data-oyun="${id}"></script>`;
  const m = html.match(/<meta\s+charset=["']?[\w-]+["']?\s*\/?>/i);
  if (m && m.index < 1024) html = html.slice(0, m.index + m[0].length) + '\n' + tag + html.slice(m.index + m[0].length);
  else if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (h) => h + '\n' + tag);
  else throw new Error(id + ': <head> bulunamadı');
  // "add to home screen" from inside a game opens the site, not the game alone
  return html.replace(/<link\s+rel=["']manifest["'][^>]*>/gi, '<link rel="manifest" href="/manifest.webmanifest">');
}

rmSync(DIST, { recursive: true, force: true });
cpSync(join(SITE, 'public'), DIST, { recursive: true });
mkdirSync(join(DIST, 'js'), { recursive: true });

// the pages' modules
for (const f of ['games.js', 'config.js', 'names.js']) copyFileSync(join(SITE, 'shared', f), join(DIST, 'js', f));

// the plain script for the pages and the games: the game list, then src/oyun-sitesi.js
const games = readFileSync(join(SITE, 'shared', 'games.js'), 'utf8').replace(/^export /gm, '');
writeFileSync(join(DIST, 'js', 'oyun-sitesi.js'),
  '/* Built by build.mjs from shared/games.js and src/oyun-sitesi.js: change those, not this. */\n' +
  '(function () {\n' + games + '\nvar S = window.OyunSitesi = window.OyunSitesi || {};\n' +
  'S.GAMES = GAMES; S.gameById = gameById; S.ownsKey = ownsKey; S.summaryOf = summaryOf;\n})();\n' +
  readFileSync(join(SITE, 'src', 'oyun-sitesi.js'), 'utf8'));

// Sunny Hill's picture from the repo (the site's own icons are in public/img, drawn by tools/make-icons.mjs)
copyFileSync(join(REPO, 'og-image.jpg'), join(DIST, 'img', 'sunny-hill.jpg'));

// the site's name (shared/config.js) into the pages and the home-screen app
const html = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const jsonText = (s) => JSON.stringify(s).slice(1, -1);
for (const f of readdirSync(DIST)) {
  if (!/\.(html|webmanifest)$/.test(f)) continue;
  const esc = f.endsWith('.html') ? html : jsonText;
  const s = readFileSync(join(DIST, f), 'utf8');
  writeFileSync(join(DIST, f), s.replaceAll('{{MARK}}', CONFIG.mark ? esc(CONFIG.mark[0]) + '<em>' + esc(CONFIG.mark[1]) + '</em>' : esc(CONFIG.name)).replaceAll('{{AD}}', esc(CONFIG.name)).replaceAll('{{KISA}}', esc(CONFIG.short)).replaceAll('{{OGRETMEN}}', esc(CONFIG.by)));
}

// the games
const report = [];
for (const g of GAMES) {
  const src = SOURCES[g.id];
  if (!src) throw new Error(g.id + ': build.mjs bu oyunun nereden geleceğini bilmiyor');
  const html = await src.get();
  for (const e of src.expect) if (!html.includes(e)) throw new Error(`${g.id}: oyunda "${e}" yok. Kayıt anahtarları değişmiş olabilir; shared/games.js'i kontrol edin.`);
  const out = inject(html, g.id);
  if (out.split('/js/oyun-sitesi.js').length !== 2) throw new Error(g.id + ': site betiği bir kez eklenmeli');
  const dir = join(DIST, 'oyun', g.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), out);
  for (const [name, from] of Object.entries(src.files)) if (existsSync(from)) copyFileSync(from, join(dir, name));
  report.push(`${g.title}: ${(out.length / 1048576).toFixed(2)} MB`);
}

writeFileSync(join(DIST, 'surum.txt'), `${new Date().toISOString()}\n${LOCAL ? 'local' : 'published'}\n${report.join('\n')}\n`);
console.log('dist/ hazır (' + (LOCAL ? 'bu bilgisayardaki oyunlarla' : 'yayındaki oyunlarla') + '): ' + report.join(', '));
