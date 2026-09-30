// Finds all eight hidden surprises the way a child would (walking up, pressing Talk / Look / Open, stepping
// on the music stones), with a screenshot of each, then checks the count in the menu and on the certificate.
export default async function ({ evaluate, shot, sleep, viewport }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  if (process.env.VIEW) { const [w, h] = process.env.VIEW.split('x').map(Number); await viewport(w, h); }
  const next = async () => { const out = []; for (let i = 0; i < 10 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await sleep(350); await S(`document.getElementById('dlgNext').click()`); } return out.join(' | '); };
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await next();
  // walk next to a surprise and use it through the real Talk button
  async function use(id, stand) {
    for (let k = 0; k < 40; k++) {
      const it = await S(`(() => { const it = SH.interactables().find(o => o.id === '${id}'); return it ? [it.x, it.y] : null; })()`);
      if (it) {
        await S(`SH.tp(${stand ? stand[0] : 'null'} ?? ${it[0]}, ${stand ? stand[1] : 'null'} ?? ${it[1] + 30})`); await sleep(500);
        const near = await S(`SH.nearestInteractable() && SH.nearestInteractable().id`);
        if (near === id) { await S(`document.getElementById('talkBtn').click()`); return true; }
      }
      await sleep(400);
    }
    throw new Error('could not reach ' + id + ' (nearest: ' + await S(`SH.nearestInteractable() && SH.nearestInteractable().id`) + ')');
  }
  const b = await S('[SH.LANDMARK.benchL.x, SH.LANDMARK.benchL.y]');
  await S(`SH.tp(${b[0]} - 12, ${b[1]} + 60)`); await sleep(700); await shot('e-cat-asleep');
  await use('cat'); await sleep(600); await shot('e-cat'); log('cat:', await next());
  await use('fountain'); await sleep(1200); await shot('e-fountain');
  const st = await S('SH.EGGS.stones.list');
  for (let i = 0; i < 5; i++) { await S(`SH.tp(${st[i][0]}, ${st[i][1]})`); await sleep(160); if (i === 2) { await sleep(100); await shot('e-stones'); } }
  await sleep(500);
  await use('duck', [1568, 1500]); await sleep(600); await shot('e-ducks'); log('ducks:', await next());
  await use('frog', [1498, 1605]); await sleep(600); await shot('e-frog'); log('frog:', await next());
  await sleep(400); await shot('e-frog-jump');
  await use('scarecrow'); await sleep(500); await shot('e-scarecrow'); log('scarecrow:', await next());
  await S(`SH.tp(420, 850)`); await sleep(800); await shot('e-meadow');
  await use('rabbit', null); await sleep(500); await shot('e-rabbit'); log('rabbit:', await next());
  await use('treasure'); await sleep(1500); await shot('e-treasure');
  const [mx, my] = await S('[SH.EGGS.mill.x, SH.EGGS.mill.y]');
  await S(`SH.tp(${mx} - 60, ${my} + 170)`); await sleep(800); await shot('e-windmill');
  await S(`SH.tp(2160, 1100)`); await sleep(800); await shot('e-orchard');
  log('found:', await S('JSON.stringify(SH.state.eggs)'), 'count', await S('SH.EGGS.count()'));
  await S(`document.getElementById('menuBtn').click()`); await sleep(200);
  log('menu line:', await S(`document.getElementById('mSecrets').textContent`));
  await S(`document.getElementById('mClose').click()`);
  await S(`SH.state.finishedAt = '30.09.2026'; SH.Cert.open()`); await sleep(500);
  log('certificate line:', await S(`document.getElementById('certSecrets').textContent`));
  await shot('e-cert');
}
