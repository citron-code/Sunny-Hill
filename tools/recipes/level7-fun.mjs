// Level 7, the Green Islands' extras (you choose them; nothing waits for them): Sparky's hints, the bug net (catch, the jar,
// let go), the seed in the little garden (dig, water, the sun, water: a flower), feeding the forest's animals (a wrong one
// says no, thank you), the photo safari (stickers, the album); the treehouse lookout (its stairs step by step, the binoculars
// only up there); the class's places in the forest; the moving things drawn; no errors. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } };
  const say = () => S(`document.getElementById('fSay').textContent`);
  const btns = () => S(`[...document.querySelectorAll('#fBtns button')].map((b) => b.textContent).join(' / ')`);
  const click = (re) => S(`(() => { const b = [...document.querySelectorAll('#fBtns button')].find((b) => ${re}.test(b.textContent)); if (!b) return 'none'; b.click(); return 'ok'; })()`);
  const tap = (o) => S(`(() => { const G = SH.FUN.G, o = ${o}; if (!o) return 'no target'; G.tap(o.x, o.y); return 'ok'; })()`);
  const use = (id) => S(`(() => { const o = SH.interactables().find((o) => o.id === ${JSON.stringify(id)}); if (!o) return 'none'; SH.interact(o); return SH.game.mode + ' ' + (SH.FUN.G && SH.FUN.G.id); })()`);
  const X = () => S('JSON.stringify(SH.GREEN7.x())');
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 50,
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 }, trip: { st: 'green', d: SH.ISLE6.today(), seen: 1, landed: 1, seen3: 'meadow' } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE7.land()'); await lines(); await step(4);
  log('hint (camera):', await S(`document.getElementById('toast').textContent`), '| camera button', await S(`(() => { const b = document.getElementById('camBtn'); return (b.classList.contains('hidden') ? 'hidden' : 'shown') + (b.classList.contains('pulse') ? ', pulsing' : ''); })()`));
  await S('SH.tp(930, 7800)'); await step(0.3);
  log('hint (net):', await S(`document.getElementById('toast').textContent`), '| hints', await S('JSON.stringify(SH.GREEN7.x().hint)'));
  if (!T) await shot('l7-fun-world');
  for (const [x, y, w] of [[1000, 8000, 'meadow'], [2300, 7800, 'pond'], [3400, 8300, 'forest']]) { await S(`SH.tp(${x}, ${y})`); await step(0.2); log(`  draw time (${w}):`, await S('(() => { const t0 = performance.now(); for (let i = 0; i < 20; i++) SH.render(); return ((performance.now() - t0) / 20).toFixed(1) + " ms"; })()')); }
  // the bug net: four bugs, each into the jar and out again
  await S('SH.tp(930, 7745)'); await step(0.2);
  log('bug net:', await use('net7'), '|', await say());
  const bugs = [];
  for (let i = 0; i < 4; i++) {
    const r = await tap('(() => { const b = SH.FUN.G.bugs.find((b) => !b.got); return b && { x: b.x, y: b.y }; })()'); await sleep(600);
    if (i === 0) await shot('l7-fun-jar' + T);
    bugs.push(`${r}: ${await say()} [${await btns()}]`); await click('/Let it go/'); await sleep(1900); bugs.push('   ' + await say());
  }
  log('  ' + bugs.join('\n  ')); log('  end:', await btns(), '| net done', await S('SH.GREEN7.x().net')); await click('/Done/'); await step(0.2);
  // the seed: a sunflower
  await S('SH.tp(800, 8180)'); await step(0.2);
  log('seed:', await use('seed7'), '|', await say(), '[' + await btns() + ']'); await click('/Sunflower/'); await sleep(200);
  const sd = [await say()];
  await sleep(300); await tap('SH.FUN.G.hit.soil'); await sleep(1500); sd.push(await say());
  await tap('SH.FUN.G.hit.can'); await sleep(3600); sd.push(await say());
  await tap('SH.FUN.G.hit.cloud'); await sleep(3000); sd.push(await say());
  await tap('SH.FUN.G.hit.can'); await sleep(1500); await shot('l7-fun-seed' + T); await sleep(2000); sd.push(await say());
  log('  ' + sd.join('\n  '), '\n  garden:', await S('JSON.stringify(SH.GREEN7.x().seed)'), '| growth', await S('SH.FUN.G.g.toFixed(2)')); await click('/Done/'); await step(0.2);
  // feeding: a carrot to the bird first (no, thank you), then each the right one
  await S('SH.tp(3260, 8335)'); await step(0.2);
  log('feeding:', await use('feed7'), '|', await say()); await sleep(300);
  const fd = [];
  for (const [f, a] of [['carrot', 'bird'], ['carrot', 'rabbit'], ['nut', 'squirrel'], ['seeds', 'bird']]) {
    await tap(`SH.FUN.G.hit.${f}`); await sleep(150); fd.push(f + ': ' + await say()); await tap(`SH.FUN.G.hit.${a}`); await sleep(1700); fd.push('  ' + a + ': ' + await say());
    if (f === 'nut') await shot('l7-fun-feed' + T);
  }
  await sleep(2600); log('  ' + fd.join('\n  '), '\n  end:', await say(), '| fed', await S('JSON.stringify(SH.GREEN7.x().fed)')); await click('/Done/'); await step(0.2);
  // the photo safari: the frog, the deer (from the treehouse), the garden's sunflower; the album
  const snaps = [];
  for (const [x, y] of [[2232, 7700], [3560, 8298], [800, 8200], [1330, 7990]]) {
    await S(`SH.tp(${x}, ${y})`); await step(0.3); await S('SH.FUN.snap()'); await sleep(250);
    snaps.push(await S('SH.FUN.G ? SH.FUN.G.id + " " + (SH.FUN.G.s || "") : "no panel"') + ': ' + await say()); await sleep(1900); snaps.push('   ' + await say());
    await click('/Done/'); await step(0.1);
  }
  log('photos:\n  ' + snaps.join('\n  '), '\n  stickers', await S('Object.keys(SH.GREEN7.x().snap).join(",")'));
  await S(`SH.FUN.start('album7')`); await sleep(300); log('  album:', await S(`document.getElementById('fN').textContent`), '|', await say()); await shot('l7-fun-album' + T); await click('/Done/');
  // the treehouse: the stairs, heights all the way up; the binoculars only up there
  const tw = await S(`(() => { const I = SH.ISLE7, p = SH.findPath(3330, 8300, I.LOOKOUT[0], I.LOOKOUT[1]); if (!p) return 'no way'; let prev = [3330, 8300], h0 = I.standY(3330, 8300), jump = 0, top = 0, n = 0;
    for (const q of p) { const m = Math.max(1, Math.ceil(Math.hypot(q.x - prev[0], q.y - prev[1]) / 2)); for (let k = 1; k <= m; k++) { const x = prev[0] + (q.x - prev[0]) * k / m, y = prev[1] + (q.y - prev[1]) * k / m, h = I.standY(x, y); jump = Math.max(jump, Math.abs(h - h0)); h0 = h; top = Math.max(top, h); n++; } prev = [q.x, q.y]; }
    return 'way ' + p.length + ' points, highest ' + top.toFixed(1) + ', biggest step ' + jump.toFixed(2) + ' (' + n + ' samples)'; })()`);
  log('treehouse:', tw);
  await S('SH.tp(3380, 8300)'); await step(0.2); log('  binoculars from the ground:', await S(`SH.interactables().some((o) => o.id === 'bino7') ? 'YES' : 'no'`));
  await S(`SH.state.school.trip.ps = 1; SH.state.school.trip.dip = 3; SH.state.school.trip.fs = 1; Object.assign(SH.state.school.trip.got, { flower: 1, grass: 1, ant: 1, earthworm: 1, bee: 1, butterfly: 1, dragonfly: 1, mosquito: 1, frog: 1, tadpole: 1, fish: 1, lily: 1 }); Object.assign(SH.state.school.trip.bin, { bottle: 1, can: 1, cup: 1 }); SH.state.school.trip.seen3 = 'forest';`);
  await S('SH.tp(3560, 8296)'); await step(0.3); log('  up top:', await S(`SH.TRIP.stage3() + ', binoculars ' + (SH.interactables().some((o) => o.id === 'bino7') ? 'yes' : 'NO') + ', you at height ' + SH.ISLE7.standY(SH.player.x, SH.player.y)`));
  await shot('l7-fun-treehouse' + T);
  await S(`SH.TRIP.crewAt('forest')`); log('  the class in the forest:', await S(`SH.TRIP.crew.map((c) => c.id + (SH.GREEN7.standY(c.x, c.y) != null || SH.ISLE7.blocked(c.x, c.y) ? ' BAD' : ' ok')).join(', ')`));
  const errs = consoleLog.filter((c) => c.level === 'exception' || c.level === 'error');
  log('errors:', errs.length ? JSON.stringify(errs.slice(-5)) : 'none');
}
