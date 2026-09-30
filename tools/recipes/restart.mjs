// Starting over from every place a parent might try it, with real mouse clicks, at several screen sizes:
// Menu → Main menu → New Game during play, the same over an open dialog, and the certificate's "Play again".
export default async function ({ evaluate, send, sleep, shot, navigate, URL, viewport }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  async function click(sel) {
    const r = await S(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return 'missing'; const b = e.getBoundingClientRect();
      if (!b.width) return 'hidden'; const x = b.left + b.width / 2, y = b.top + b.height / 2;
      if (y > innerHeight || y < 0) return 'off screen at y=' + Math.round(y) + ' of ' + innerHeight;
      const top = document.elementFromPoint(x, y);
      return [x, y, top === e || e.contains(top) ? 'ok' : 'covered by ' + (top && (top.id || top.className || top.tagName))]; })()`);
    if (!Array.isArray(r)) { log('  !!', sel, r); return false; }
    if (r[2] !== 'ok') log('  !!', sel, r[2]);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: 'left', clickCount: 1 });
    await sleep(250);
    return true;
  }
  const saved = () => S(`(() => { try { const s = localStorage.getItem('sunnyHill.save.v1'); return s ? JSON.parse(s).stars : null; } catch (e) { return 'error'; } })()`);
  const waitReload = async () => { await sleep(1200); for (let i = 0; i < 50; i++) { try { if (await S('!!window.SH && !!SH.game')) return; } catch { } await sleep(100); } };
  const setup = async (extra) => {
    await S(`localStorage.clear()`); await navigate(URL); await sleep(300);
    await S(`SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; SH.Dialog.close(); SH.state.stars = 5; SH.state.quest = 5; SH.Save.save(); ${extra || ''}`);
    await sleep(300);
  };
  for (const [w, h, tag] of [[1366, 657, 'laptop'], [375, 667, 'phone'], [667, 375, 'phone-landscape']]) {
    await viewport(w, h, { dpr: 1, mobile: w < 800 });
    // 1) menu during play
    await setup();
    await click('#menuBtn'); await click('#mHome'); const ok1 = await click('#tNew'); if (ok1) await click('#askYes');
    await waitReload();
    log(tag.padEnd(16), 'menu→Main menu→New    : saved', await saved(), '| mode', await S('SH.game.mode'));
    // 2) menu while a dialog is open
    await setup(`SH.interact(SH.interactables().find(o => o.id === 'milo'));`);
    await click('#menuBtn'); await click('#mHome'); const ok2 = await click('#tNew'); if (ok2) await click('#askYes');
    await waitReload();
    log(tag.padEnd(16), 'over a dialog         : saved', await saved(), '| mode', await S('SH.game.mode'));
    // 3) the certificate's Play again
    await setup(`SH.state.finished = true; SH.state.stars = 8; SH.Save.save(); SH.Cert.open();`);
    await sleep(400);
    if (tag === 'laptop') await shot('r2-cert');
    const ok3 = await click('#certAgain'); if (ok3) { await shot('r2-ask-' + tag); await click('#askYes'); }
    await waitReload();
    log(tag.padEnd(16), 'certificate Play again: saved', await saved(), '| mode', await S('SH.game.mode'));
  }
}
