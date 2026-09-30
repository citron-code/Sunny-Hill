// The character creator (hair styles, clothes, skin) with real clicks, then the dialog window:
// the speaker's portrait must keep moving (idle, blinking, talking) while the window is open.
export default async function ({ evaluate, send, sleep, shot, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  async function click(sel) {
    const r = await S(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return 'missing'; e.scrollIntoView({ block: 'nearest' }); const b = e.getBoundingClientRect();
      if (!b.width) return 'hidden'; const x = b.left + b.width / 2, y = b.top + b.height / 2; const top = document.elementFromPoint(x, y);
      return [x, y, top === e || e.contains(top) ? 'ok' : 'covered by ' + (top && (top.id || top.className))]; })()`);
    if (!Array.isArray(r) || r[2] !== 'ok') { log('  !!', sel, Array.isArray(r) ? r[2] : r); if (!Array.isArray(r)) return false; }
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: 'left', clickCount: 1 });
    await sleep(350);
    return true;
  }
  const sizes = async (tag) => log(tag.padEnd(22), JSON.stringify(await S(`(() => { const small = [], off = [];
    for (const b of document.querySelectorAll('#creator button')) { const r = b.getBoundingClientRect(); if (!r.width || b.closest('.hidden')) continue;
      if (r.width < 55.5 || r.height < 55.5) small.push((b.id || b.className).slice(0, 12) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      if (r.left < -1 || r.right > innerWidth + 1) off.push(b.id || b.className); }
    return { small, off, overflowX: document.documentElement.scrollWidth > innerWidth }; })()`)));
  for (const [w, h, tag] of [[1280, 800, 'desk'], [375, 667, 'phone']]) {
    await viewport(w, h, { dpr: 1, mobile: w < 800 });
    await S('localStorage.clear()'); await navigate(URL); await sleep(1200);
    await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
    await click('#tNew'); await click('#pStart'); await sleep(400);
    log(tag.padEnd(22), 'mode', await S('SH.game.mode'), '| tabs', await S(`[...document.querySelectorAll('.crTab')].map(b => b.textContent).join(' / ')`), '| styles', await S(`document.querySelectorAll('#crStyles .pick').length`));
    await shot(`c-${tag}-hair`); await sizes(tag + ' hair tab');
    await click('#crStyles .pick:nth-child(5)');      // ponytail
    await click('#crColors .sw:nth-of-type(4)');       // orange hair
    await click('.crTab:nth-child(2)');                // clothes
    await click('#crStyles .pick:nth-child(3)');      // hoodie
    await click('#crColors .sw:nth-of-type(3)');       // green
    await shot(`c-${tag}-clothes`); await sizes(tag + ' clothes tab');
    await click('.crTab:nth-child(3)');                // skin
    await click('#crColors .sw:nth-of-type(5)');
    await shot(`c-${tag}-skin`); await sizes(tag + ' skin tab');
    log(tag.padEnd(22), 'look', await S('JSON.stringify(SH.state.look)'), '| player', await S('JSON.stringify([SH.PLAYER_LOOK ? 1 : 0])'));
    // the preview keeps moving
    const a = await S(`document.getElementById('crPreview').toDataURL()`); await sleep(700); const b = await S(`document.getElementById('crPreview').toDataURL()`);
    log(tag.padEnd(22), 'preview moves:', a !== b);
  }
  await click('#crOk'); await sleep(600);
  for (let i = 0; i < 6 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
  // a dialog with Milo: the portrait changes over time
  await viewport(1280, 800, { dpr: 1 });
  await S(`SH.tp(SH.NPC.milo.x + 10, SH.NPC.milo.y + 60); SH.step(1 / 60, 2);`); await sleep(300);
  await S(`SH.interact(SH.interactables().find(o => o.id === 'milo'))`); await sleep(900);
  const pics = [];
  for (let i = 0; i < 4; i++) { pics.push(await S(`document.getElementById('dlgPortrait').toDataURL()`)); await sleep(450); }
  log('dialog portrait frames all different:', new Set(pics).size === pics.length, '| who', await S('SH.Dialog.who'), '| mouth', await S('SH.Dialog.mouth'));
  await shot('c-dialog');
  const saved = await S(`(() => { try { return JSON.parse(localStorage.getItem('sunnyHill.save.v1')).look; } catch (e) { return 'x'; } })()`);
  log('saved look:', JSON.stringify(saved));
}
