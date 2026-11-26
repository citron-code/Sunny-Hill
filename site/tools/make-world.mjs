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
writeFileSync(join(SITE, 'public', 'js', 'pq-world.js'), out);
console.log('public/js/pq-world.js: ' + Math.round(out.length / 1024) + ' KB');
