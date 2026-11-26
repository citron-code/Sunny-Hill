// Batuhan Teacher for the children's page (public/js/batu.js), drawn by Pocket Quest's own character code, so he looks
// as he does in the game. Needs the Pocket Quest folder next to this one and Chrome; run it from site/ after a change:
//   node "../../Pocket Quest/tools/shot.mjs" tools/make-teacher.mjs tools/teacher-sprite.html public/img/ogretmen
// It writes ogretmen.png (the frames in a strip) and portakal.png (the orange); the sizes and the orange's place in each
// frame go to tools/teacher-sprite.json, for the numbers at the top of public/js/batu.js.
import { writeFileSync } from 'node:fs';

export default async function ({ navigate, evaluate, savePng }) {
  await navigate('', { w: 900, h: 700 });
  const s = await evaluate('SHEET');
  console.log(savePng('ogretmen', s.strip));
  console.log(savePng('portakal', s.orange));
  writeFileSync(new URL('./teacher-sprite.json', import.meta.url), JSON.stringify(s.meta) + '\n');
  console.log(JSON.stringify(s.meta));
}
