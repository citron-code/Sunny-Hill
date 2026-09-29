// Phone checks: 375x667 portrait and 667x375 landscape, real touch input, overflow and 56px button sizes.
export default async function ({ evaluate, shot, send, sleep, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  async function touch(x, y) {
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(60);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(120);
  }
  async function touchEl(id) {
    const r = await S(`(() => { const b = document.getElementById('${id}').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })()`);
    await touch(r[0], r[1]);
  }
  async function checks(tag) {
    const r = await S(`(() => {
      const small = [];
      for (const b of document.querySelectorAll('.btn, #questCard')) {
        const r = b.getBoundingClientRect();
        if (r.width && r.height && (r.width < 56 || r.height < 56)) small.push((b.id || b.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
      const d = document.getElementById('dialog').getBoundingClientRect();
      const q = document.getElementById('questCard').getBoundingClientRect();
      const t = document.getElementById('topRight').getBoundingClientRect();
      return { scrollW: document.documentElement.scrollWidth, innerW: innerWidth, scrollH: document.documentElement.scrollHeight, innerH: innerHeight,
        small, dialog: [Math.round(d.left), Math.round(d.top), Math.round(d.right), Math.round(d.bottom)],
        cardOverlapsTopRight: q.right > t.left && q.bottom > t.top && q.top < t.bottom };
    })()`);
    log(tag, JSON.stringify(r));
  }
  // ---------- portrait phone
  await S('localStorage.clear()');
  await viewport(375, 667, { dpr: 2, mobile: true });
  await navigate(URL); await sleep(400);
  await shot('20-phone-title');
  await touchEl('startBtn'); await sleep(500);
  await shot('21-phone-intro');
  await checks('portrait-dialog');
  for (let i = 0; i < 3; i++) { await sleep(400); await touchEl('dlgNext'); }
  log('mode after intro:', await S('SH.game.mode'));
  // real touch on the map, up-left toward Milo's house
  const before = await S('[SH.player.x, SH.player.y]');
  await touch(120, 250); await sleep(1500);
  const after = await S('[SH.player.x, SH.player.y]');
  log('touch-walk moved from', before.map(Math.round), 'to', after.map(Math.round));
  await shot('22-phone-walk');
  // tap Milo himself when on screen
  for (let i = 0; i < 20; i++) {
    if (await S('SH.Dialog.open')) break;
    const p = await S(`[(SH.NPC.milo.x - SH.cam.x) * SH.view.scale, (SH.NPC.milo.y - 25 - SH.cam.y) * SH.view.scale]`);
    if (p[0] > 10 && p[0] < 365 && p[1] > 100 && p[1] < 650) await touch(p[0], p[1]);
    else await S('SH.walkTo(SH.NPC.milo.x, SH.NPC.milo.y + 60)');
    await sleep(800);
  }
  await sleep(300);
  await shot('23-phone-milo');
  await checks('portrait-milo');
  for (let i = 0; i < 4; i++) { await sleep(400); await touchEl('dlgNext'); }
  // long line: Pop's cousin sentence
  await S(`SH.tp(SH.NPC.pop.x, SH.NPC.pop.y + 50)`); await sleep(300);
  await S(`SH.interact(SH.interactables().find(o => o.id === 'pop'))`); await sleep(400);
  await touchEl('dlgNext'); await sleep(500);
  await shot('24-phone-pop');
  await checks('portrait-pop');
  await sleep(400); await touchEl('dlgNext'); await sleep(300);
  await touchEl('menuBtn'); await sleep(300);
  await shot('25-phone-menu');
  await touchEl('mClose'); await sleep(200);
  // ---------- landscape phone
  await viewport(667, 375, { dpr: 2, mobile: true }); await sleep(400);
  await shot('26-land-play');
  await checks('landscape-play');
  await S(`SH.tp(SH.NPC.milo.x + 10, SH.NPC.milo.y + 60)`); await sleep(300);
  await S(`SH.interact(SH.interactables().find(o => o.id === 'milo'))`); await sleep(500);
  await shot('27-land-dialog');
  await checks('landscape-dialog');
}
