// The main menu (first visit, and with a saved game), the pause menu and the New Game question,
// at desktop, phone and sideways-phone sizes. Real clicks; checks buttons are reachable and big enough.
export default async function ({ evaluate, send, sleep, shot, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  async function click(sel) {
    const r = await S(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return 'missing'; const b = e.getBoundingClientRect();
      if (!b.width) return 'hidden'; const x = b.left + b.width / 2, y = b.top + b.height / 2;
      if (y > innerHeight || y < 0) return 'off screen'; const top = document.elementFromPoint(x, y);
      return [x, y, top === e || e.contains(top) ? 'ok' : 'covered by ' + (top && (top.id || top.className))]; })()`);
    if (!Array.isArray(r) || r[2] !== 'ok') { log('  !!', sel, Array.isArray(r) ? r[2] : r); if (!Array.isArray(r)) return false; }
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: 'left', clickCount: 1 });
    await sleep(300);
    return true;
  }
  const check = async (tag) => {
    const r = await S(`(() => { const small = [], off = [];
      for (const b of document.querySelectorAll('button, .pill, .tile')) { if (b.closest('.hidden')) continue; const r = b.getBoundingClientRect(); if (!r.width) continue;
        if (r.width < 55.5 || r.height < 55.5) small.push((b.id || b.className).slice(0, 14) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
        if (r.bottom > innerHeight + 1 || r.top < -1 || r.right > innerWidth + 1) off.push(b.id || b.className); }
      const res = { small, off, overflowX: document.documentElement.scrollWidth > innerWidth };
      const t = document.getElementById('titleText'), tb = t.getBoundingClientRect();
      if (!t.closest('.hidden')) res.logo = { oneLine: tb.height < parseFloat(getComputedStyle(t).fontSize) * 1.6, inside: tb.left >= -1 && tb.right <= innerWidth + 1 };
      return res; })()`);
    log(tag.padEnd(26), JSON.stringify(r));
  };
  for (const [w, h, tag, mobile] of [[1280, 800, 'desk', false], [375, 667, 'phone', true], [667, 375, 'land', true]]) {
    await viewport(w, h, { dpr: 1, mobile });
    await S('localStorage.clear()'); await navigate(URL); await sleep(1500);
    await shot(`m-${tag}-first`); await check(tag + ' main menu (first)');
    // New Game → parent screen
    await click('#tNew'); await sleep(400);
    log(tag.padEnd(26), 'after New Game:', await S('SH.game.mode'));
    await shot(`m-${tag}-parent`);
    // play a bit, then come back with a saved game
    await S(`SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; SH.Dialog.close(); SH.state.stars = 5; SH.state.eggs = { cat: 1, frog: 1, stones: 1 }; SH.state.unlocked = ['hat', 'glasses']; SH.state.wear = { hat: true }; SH.Save.save();`);
    await navigate(URL); await sleep(1800);
    await shot(`m-${tag}-saved`); await check(tag + ' main menu (saved)');
    await click('#tContinue'); await sleep(500);
    log(tag.padEnd(26), 'after Continue:', await S('SH.game.mode'), '| dialog:', await S('SH.Dialog.text'));
    await S(`SH.Dialog.close()`); await sleep(300);
    await click('#menuBtn'); await sleep(400);
    await shot(`m-${tag}-pause`); await check(tag + ' pause menu');
    await click('#mSound'); log(tag.padEnd(26), 'sound after toggle:', await S('SH.state.settings.sound')); await click('#mSound');
    await click('#mHome'); await sleep(600);
    log(tag.padEnd(26), 'after Main menu:', await S('SH.game.mode'));
    await click('#tNew'); await sleep(300);
    await shot(`m-${tag}-ask`); await check(tag + ' new game question');
    await click('#askNo'); await sleep(300);
    log(tag.padEnd(26), 'after No:', await S('SH.game.mode'), '| stars kept', await S('SH.state.stars'));
    await click('#tNew'); await click('#askYes'); await sleep(400);
    log(tag.padEnd(26), 'after Yes:', await S('SH.game.mode'), '| stars', await S('SH.state.stars'), '| saved', await S(`(() => { try { return JSON.parse(localStorage.getItem('sunnyHill.save.v1')).stars; } catch (e) { return 'x'; } })()`));
  }
}
