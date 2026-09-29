// Phone checks: 375x667 portrait and 667x375 landscape with real touch input. Walks the first-visit flow
// (parent screen, creator, intro), then opens every mini game, the wardrobe and the certificate at phone size,
// and measures horizontal overflow, buttons under 56px and whether anything spills off the screen.
export default async function ({ evaluate, shot, send, sleep, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  async function touch(x, y) {
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(60);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(140);
  }
  async function touchEl(sel) {
    const r = await S(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })()`);
    if (!r) throw new Error('no element ' + sel);
    await touch(r[0], r[1]);
  }
  async function checks(tag) {
    const r = await S(`(() => {
      const small = [], off = [];
      for (const b of document.querySelectorAll('button, #questCard, .sw')) {
        const r = b.getBoundingClientRect();
        if (!r.width || !r.height || b.closest('.hidden')) continue;
        if (r.width < 55.5 || r.height < 55.5) small.push((b.id || b.className || b.textContent).slice(0, 18) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
        if (r.left < -1 || r.right > innerWidth + 1) off.push((b.id || b.textContent).slice(0, 18));
      }
      return { overflowX: document.documentElement.scrollWidth > innerWidth, small, off };
    })()`);
    log(tag.padEnd(22), JSON.stringify(r));
  }
  const phone = (w, h) => viewport(w, h, { dpr: 2, mobile: true });

  // ---------------- first visit, portrait
  await S('localStorage.clear()');
  await phone(375, 667);
  await navigate(URL); await sleep(400);
  log('first screen mode:', await S('SH.game.mode'));
  await shot('70-phone-parent'); await checks('parent');
  await touchEl('#pStart'); await sleep(500);
  log('after parent:', await S('SH.game.mode'));
  await touchEl('#crOutfit .sw:nth-of-type(3)'); await touchEl('#crHair .sw:nth-of-type(4)'); await touchEl('#crBody .pick:nth-child(2)');
  await S(`document.getElementById('crName').value = 'Deniz'`);
  await shot('71-phone-creator'); await checks('creator');
  await touchEl('#crOk'); await sleep(500);
  log('after creator:', await S('SH.game.mode'), 'name', await S('SH.state.name'), 'look', await S('JSON.stringify(SH.state.look)'));
  await shot('72-phone-intro');
  for (let i = 0; i < 4; i++) { await sleep(400); await touchEl('#dlgNext'); }
  // real touch to walk
  const before = await S('[SH.player.x, SH.player.y]');
  await touch(120, 250); await sleep(1500);
  const after = await S('[SH.player.x, SH.player.y]');
  log('touch-walk moved from', before.map(Math.round), 'to', after.map(Math.round));

  // ---------------- every mini game at phone size (portrait, then landscape)
  const games = [
    ['family', 'pickPerson'], ['where', 'pickPlace'], ['bedtime', 'sequence'], ['truefalse', 'trueFalse'],
    ['final', 'familyBuilder'], ['final', 'aboutMe'], ['final', 'familyResult'],
  ];
  for (const [w, h, tag] of [[375, 667, 'p'], [667, 375, 'l']]) {
    await phone(w, h); await sleep(300);
    await S(`SH.state.family = { mother: 1, father: 1, sister: 1, cousin: 2, grandmother: 1 }; SH.state.age = 8; SH.state.country = 'japan';`);
    for (const [qid, fn] of games) {
      await S(`(() => { const C = SH.Quests.content(SH.Quests.index('${qid}')); if (SH.game.mode !== 'play') SH.MG.close(); SH.MINI.${fn}(C, () => {}); })()`);
      await sleep(500);
      if (fn === 'aboutMe') { await shot(`73-${tag}-age`); await checks(tag + ' age'); await touchEl('#mgNext'); await sleep(300); }
      const name = `73-${tag}-${fn}`;
      await shot(name); await checks(tag + ' ' + fn);
      const fits = await S(`(() => { const c = document.getElementById('mgCard'); return [c.scrollHeight, c.clientHeight]; })()`);
      if (fits[0] > fits[1] + 2) log('   (scrolls: content', fits[0], 'in', fits[1], ')');
      await S('SH.MG.close()'); await sleep(150);
    }
    await S('SH.Wardrobe.open()'); await sleep(300); await shot(`74-${tag}-wardrobe`); await checks(tag + ' wardrobe'); await S('SH.Wardrobe.close()');
    await S(`SH.state.finishedAt = '29.09.2026'; SH.Cert.open()`); await sleep(600); await shot(`75-${tag}-cert`); await checks(tag + ' cert');
    const certFits = await S(`(() => { const c = document.getElementById('certCard'); return [c.scrollHeight, c.clientHeight]; })()`);
    if (certFits[0] > certFits[1] + 2) log('   (cert scrolls: content', certFits[0], 'in', certFits[1], ')');
    await S('SH.Cert.close()');
    await S(`document.getElementById('menuBtn').click()`); await sleep(200); await shot(`76-${tag}-menu`); await checks(tag + ' menu');
    await S(`document.getElementById('mClose').click()`);
  }
  // world view in landscape with a dialog
  await S(`SH.tp(SH.NPC.milo.x + 10, SH.NPC.milo.y + 60)`); await sleep(300);
  await S(`SH.interact(SH.interactables().find(o => o.id === 'milo'))`); await sleep(500);
  await shot('77-land-dialog'); await checks('landscape dialog');
}
