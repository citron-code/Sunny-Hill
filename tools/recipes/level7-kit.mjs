// Level 7, the explorer's kit: the magnifier (a gold rim, a wooden handle; under its glass each living thing where it lives),
// in your hand while you look; the pond net (to the end of the little pier, into the water, up again); the bug net and the jar,
// the trowel, the seed packets, the watering can, the basket. 3D, then the flat view. Pictures (sheets): l7-kit-*. No errors.
export default async function ({ evaluate, sleep, shot, savePng, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } };
  const use = (id) => S(`(() => { const o = SH.interactables().find((o) => o.id === ${JSON.stringify(id)}); if (!o) return 'none'; SH.interact(o); return SH.game.mode; })()`);
  const barOn = () => S(`(() => { const l = document.getElementById('ls'); return !!l && !l.classList.contains('hidden'); })()`);
  const pick = async (text) => { for (let i = 0; i < 30 && !(await barOn()); i++) { await step(0.1); await sleep(40); } return S(`(() => { const b = [...document.querySelectorAll('#lsBtns button')].find((b) => !b.disabled && b.textContent.trim() === ${JSON.stringify(text)}); if (!b) return 'no ' + ${JSON.stringify(text)}; b.click(); return 'ok'; })()`); };
  const W = (id) => S(`SH.NATURE.word(${JSON.stringify(id)})`), K = (id) => S(`SH.NATURE.KIND[${JSON.stringify(id)}] === 'animal' ? 'It is an animal.' : 'It is a plant.'`);
  const held = () => S('JSON.stringify(SH.KIT.held())');
  // sheets of pictures, put together in the page
  await S(`window.SHEET = (cols, rows, w, h) => { const c = document.createElement('canvas'); c.width = cols * w; c.height = rows * h; const g = c.getContext('2d'); g.fillStyle = '#333'; g.fillRect(0, 0, c.width, c.height); let n = 0;
    return { add(src, sx, sy, sw, sh) { g.drawImage(src, sx || 0, sy || 0, sw || src.width, sh || src.height, (n % cols) * w + 2, Math.floor(n / cols) * h + 2, w - 4, h - 4); n++; }, url: () => c.toDataURL('image/png') }; };
    window.WORLD = (sh) => { SH.render(); const cv = SH.G3.on ? document.getElementById('gl') : document.getElementById('game'), k = cv.width / innerWidth, px = SH.G3.on ? cv.width / 2 : cv.width / 2; sh.add(cv, px - 220 * k, cv.height / 2 - 230 * k, 440 * k, 330 * k); };
    window.PAINT = (sh) => { const G = SH.FUN.G, g = document.getElementById('fCv').getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.lineJoin = 'round'; g.lineCap = 'round'; const d3 = SH.G3.on && SH.FUN.D3[G.id], t = performance.now() / 1000; if (d3) SH.FUN[d3](g, t); else G.draw(g, t); sh.add(document.getElementById('fCv')); };`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 50,
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 }, trip: { st: 'green', d: SH.ISLE6.today(), seen: 1, landed: 1, seen3: 'meadow', x7: { hint: { cam: 1, net: 1, seed: 1, feed: 1 }, seed: {}, fed: {}, snap: {} } } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE7.land()'); await lines(); await step(1);
  // the magnifier: each kind of place under the glass (a sheet of eight)
  await S('window.LS = SHEET(4, 2, 300, 300)');
  for (const id of ['bee', 'ant', 'earthworm', 'flower', 'bottle', 'tadpole', 'lily', 'frog']) await S(`SH.TRIP.panel('lens', '${id}'); LS.add(document.querySelector('#pnl7 canvas'))`);
  await S('SH.TRIP.panel(null)'); savePng('l7-kit-lenses', await S('LS.url()'));
  const views = [['3d', true], ['2d', false]];
  for (const [v, on] of views) {
    if (!on) { await S('SH.setView3(false)'); await sleep(300); }
    await S(`window.SW = SHEET(3, ${on ? 4 : 3}, 400, 300)`);
    // looking with the magnifier: it is in your hand
    const it = on ? 'bee' : 'butterfly', xy = await S(`(() => { const o = SH.ISLE7.ITEMS.find((o) => o.id === '${it}'); return [o.x, o.y]; })()`);
    await S(`SH.tp(${xy[0] + 30}, ${xy[1] + 40})`); await step(0.3); log(`[${v}] look (${it}):`, await use('n7_' + it)); await step(0.8);
    const box = await S(`(() => { const c = document.querySelector('#pnl7 canvas'), r = c.getBoundingClientRect(); return c.width + 'px canvas, shown ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' at ' + Math.round(r.left) + ',' + Math.round(r.top); })()`);
    log('  panel:', await S("document.getElementById('pnl7').className"), box, '| held', await held());
    await S('WORLD(SW)'); if (on) await shot('l7-kit-look');
    const a1 = await pick(await W(it)); await sleep(1600); await step(0.1); const a2 = await pick(await K(it)); await sleep(1600); await step(0.1);
    log('  answers:', a1, a2, '| held after', await held(), '| got', await S(`!!SH.state.school.trip.got['${it}']`));
    // the pond net: to the end of the little pier, down into the water, up again; what is in it?
    await S(`Object.assign(SH.state.school.trip, { got: Object.assign(SH.state.school.trip.got || {}, { flower: 1, grass: 1, ant: 1, earthworm: 1, bee: 1, butterfly: 1 }), bin: { bottle: 1, can: 1, cup: 1 }, ps: 1, seen3: 'pond' }); SH.Hud.refresh();`);
    await S('SH.tp(2290, 7850)'); await step(0.3); await lines(); await step(0.2); await lines(); log(`[${v}] dip:`, await use('dip7'), '| stage', await S('SH.TRIP.stage3()'));
    if (on) log('  the net hoop, how high (0.5 .. 1.2 s; the water is at -7):', await S(`(() => { const D = SH.TRIP.dipping, out = []; for (const t of [0.5, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]) { D.t = t; SH.step(1 / 30, 1); for (let i = 0; i < 12; i++) SH.render(); out.push(SH.KIT.tip3 ? SH.KIT.tip3[1].toFixed(1) : '-'); } return out.join(' '); })()`));
    await S('(() => { const D = SH.TRIP.dipping; D.t = 0.93; SH.step(1 / 30, 1); for (let i = 0; i < 12; i++) SH.render(); WORLD(SW); D.t = 1.62; SH.step(1 / 30, 1); for (let i = 0; i < 12; i++) SH.render(); WORLD(SW); })()'); await step(0.2);
    log('  you at', await S('SH.player.x.toFixed(0) + "," + SH.player.y.toFixed(0)'), '| panel', await S("document.getElementById('pnl7').className"), '| held', await held());
    const id = await S('SH.TRIP.dipping ? SH.TRIP.dipping.id : null'); const a3 = id ? await pick(await W(id)) : 'no dip'; await sleep(1600); await step(0.1);
    log('  caught', id, a3, '| held after', await held(), '| dipping', await S('!!SH.TRIP.dipping'));
    await step(0.5);
    // the games' tools: the bug net and the jar; the seed packets, the trowel, the packet, the watering can; the basket
    await S('SH.tp(930, 7745)'); await step(0.2); log(`[${v}] games:`, await use('net7')); await sleep(200);
    await S(`(() => { const G = SH.FUN.G; G.tick = () => {}; G.bugs.find((b) => b.id === 'butterfly').got = true; G.swing = { x: 150, y: 110, t: 0.2, got: 'butterfly' }; PAINT(SW); G.swing = null; G.jar = { id: 'bee', t: 1, out: null }; PAINT(SW); if (${on}) { G.jar.out = 0.45; PAINT(SW); } SH.FUN.close(); })()`);
    await S('SH.tp(800, 8180)'); await step(0.2); await use('seed7'); await sleep(200);
    await S(`(() => { const G = SH.FUN.G; G.tick = () => {}; if (${on}) PAINT(SW); G.kind = 'sunflower'; G.step = 'dig'; G.holeT = 0.2; PAINT(SW); G.holeT = 0.85; PAINT(SW); G.holeT = 2; G.step = 'water'; G.pourT = 0.5; G.g = 0.6; G.grow = 1; PAINT(SW); SH.FUN.close(); })()`);
    await S('SH.tp(3260, 8335)'); await step(0.2); await use('feed7'); await sleep(200);
    await S(`(() => { const G = SH.FUN.G; G.tick = () => {}; G.food = 'nut'; PAINT(SW); if (${on}) { G.fed = { bird: 1, rabbit: 1 }; G.food = null; PAINT(SW); } SH.FUN.close(); })()`);
    savePng('l7-kit-' + v, await S('SW.url()'));
    await S(`delete SH.state.school.trip.dip; SH.state.school.trip.got = { flower: 1, grass: 1, ant: 1, earthworm: 1 }; SH.state.school.trip.ps = 0; SH.Save.save()`);
  }
  const errs = consoleLog.filter((c) => c.level === 'exception' || c.level === 'error'); log('errors:', errs.length ? JSON.stringify(errs.slice(-3)) : 'none');
}
