// The front page's living world (public/js/hero.js) is Pocket Quest's own school-yard art: its pixel engine (px.js),
// its font (font.js) and its world (world.js), copied here as one file, public/js/pq-world.js. The game's files are
// never edited. Run it from site/ after Pocket Quest's art changes:  node tools/make-world.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PQ = process.env.PQ_DIR || resolve(SITE, '..', '..', 'Pocket Quest');
const FILES = ['js/gfx/px.js', 'js/gfx/font.js', 'js/gfx/world.js'];
let out = '/* Pocket Quest\'s pixel engine, font and school-yard world, copied by tools/make-world.mjs from ' + FILES.join(', ') +
  '.\n   Do not edit here: change Pocket Quest and run the tool again. */\n';
for (const f of FILES) out += '\n/* ---------------- ' + f + ' */\n' + readFileSync(join(PQ, f), 'utf8');
// The Citrobit valley (public/js/valley.js) needs only the far layers of the school yard's background: the sky, the
// clouds, the birds, the mountains and the hills, without Pocket Quest's town and park. One small function is added
// to the copy for that, next to background(), and returned with the rest.
const FAR = `
  /** (added by the site's tools/make-world.mjs) the far layers only: sky, clouds, birds, mountains, hills */
  function far(g, camX, t) {
    if (!skyCv) { buildSky(); buildClouds(); buildMountains(); buildHills(); buildTown(); buildPark(); }
    t = t || 0;
    g.drawImage(skyCv, 0, 0);
    var drift = t * 3;
    [[5, 92, 0.02, 0.2], [6, 104, 0.025, 0.25], [7, 84, 0.03, 0.3], [0, 30, 0.04, 1], [1, 62, 0.05, 1], [2, 18, 0.03, 1], [3, 84, 0.06, 1], [4, 50, 0.045, 1]].forEach(function (c, i) {
      var cl = clouds[c[0]], span = W + cl.width + 60;
      var x = ((i * 157 + 40 - camX * c[2] - drift * (0.5 + i * 0.15) * c[3]) % span + span) % span - cl.width;
      g.drawImage(cl, Math.round(x), c[1]);
    });
    birds(g, camX, t);
    tiled(g, mountCv, camX, 0.03);
    tiled(g, hillsCv, camX, 0.08);
  }
`;
const ANCHOR = '  /** the whole background, back to front */\n', RET = 'return { W: W, H: H, GY: GY, background: background,';
if (!out.includes(ANCHOR) || !out.includes(RET)) throw new Error('world.js changed: tools/make-world.mjs cannot add far() any more');
out = out.replace(ANCHOR, FAR + ANCHOR).replace(RET, RET + ' far: far,');
writeFileSync(join(SITE, 'public', 'js', 'pq-world.js'), out);
console.log('public/js/pq-world.js: ' + Math.round(out.length / 1024) + ' KB');
