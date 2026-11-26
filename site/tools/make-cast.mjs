// The characters of the front page's world (public/js/hero.js), drawn by Pocket Quest's own character code: Batuhan
// Teacher walking with an orange (and standing, surprised, happy), Grabbo, Pip, and the orange. Run it from site/:
//   node "../../Pocket Quest/tools/shot.mjs" tools/make-cast.mjs tools/pq-cast.html public/img
// It writes public/img/pq-cast.png and public/js/pq-cast.js (where each picture is on the sheet, its feet, his hand).
import { writeFileSync } from 'node:fs';

export default async function ({ navigate, evaluate, savePng }) {
  await navigate('', { w: 900, h: 400 });
  const s = await evaluate('SHEET');
  console.log(savePng('pq-cast', s.png));
  writeFileSync(new URL('../public/js/pq-cast.js', import.meta.url),
    '// Made by tools/make-cast.mjs: where each picture is on img/pq-cast.png (x, w, h), its anchor (ax, ay: the feet),\n' +
    '// and for Batuhan Teacher his near hand (hx, hy), where the orange sits.\nexport const CAST = ' + JSON.stringify(s.atlas) + ';\n');
  console.log(Object.keys(s.atlas).join(' '));
}
