// Where shall we sail? Every ship asks, with every other place: from home (the Parrot King's island, the school island),
// from the Parrot King's island (Sunny Hill, the school island), from the school island (Sunny Hill, the Parrot King's
// island). Sailing home ties up at Sunny Hill's quay (you at the wheel at home). This week (ISLE6.STAY) the school
// island's ship does not sail. The page's own clock is stopped: the steps here move the game. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const pick = () => S(`document.getElementById('seaPick').classList.contains('hidden') ? 'no choice' : [...document.querySelectorAll('#spList button')].map((b) => b.textContent).join(' / ')`);
  const choose = (k) => S(`document.querySelector('#spList button.${k}').click()`);
  const where = () => S(`SH.SEA.active ? 'at sea' : SH.ISLE6.here() ? 'the school island' : SH.ISLE5.here() ? "the Parrot King's island" : 'Sunny Hill'`);
  const card = () => S(`document.getElementById('qcText').textContent`);
  const sail = async () => {          // the child steers after Sparky's arrow (a tap on where it points, again and again) until the ship is in
    for (let i = 0; i < 60 && await S('!SH.SEA.active'); i++) { await lines(); await step(0.25); }          // (first up the gangplank to the wheel)
    let t = 0;
    for (; t < 160 && await S('SH.SEA.active || !!SH.ISLE5.off || !!SH.ISLE6.off'); t++) {
      await lines();
      await S('SH.SEA.active && SH.SEA.ship && !SH.SEA.dock && !SH.SEA.undock && SH.SEA.goal && (SH.SEA.steer = { x: SH.SEA.goal.x, y: SH.SEA.goal.y, t: SH.game.t })');
      await step(0.5);
      if (t % 20 === 0 && process.env.TRACE) log('    …', t * 0.5, 's', await S(`JSON.stringify({ sea: SH.SEA.active, trip: SH.SEA.trip, ship: SH.SEA.ship && [Math.round(SH.SEA.ship.x), Math.round(SH.SEA.ship.y), Math.round(SH.SEA.ship.v)], undock: !!SH.SEA.undock, dock: !!SH.SEA.dock, mode: SH.game.mode, dialog: SH.Dialog.open, off5: !!SH.ISLE5.off, off6: !!SH.ISLE6.off })`));
    }
    return t * 0.5;
  };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1 };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.Save.save();`);
  await S('location.reload()'); await sleep(2500);          // (a saved game, as a child has it: the ship afloat, its deck walkable)
  for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
  await sleep(400); await S(`document.getElementById('tContinue').click()`); await sleep(400); await lines(); await step(0.3); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  const start = await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])').then(JSON.parse);
  await S('SH.game.paused = true');
  // 1) the Parrot King's island: home, or the school island
  await S('SH.ISLE5.land()'); await lines(); await step(0.5);
  const D5 = await S('JSON.stringify(SH.ISLE5.DOCK)').then(JSON.parse);
  await S(`SH.tp(${D5.x0 + 60}, ${(D5.y0 + D5.y1) / 2})`); await step(0.3);
  await talk('ship5'); log("the Parrot King's ship asks:", await pick());
  await shot('l6-ships-pick' + T);
  await choose('home'); log('  home:', await lines());
  for (let i = 0; i < 40 && await S('!SH.SEA.active'); i++) await step(0.25);
  log('  at sea, the card says', await card(), '| the arrow to', await S('JSON.stringify(SH.SEA.goal)'));
  const t1 = await sail();
  log('  →', await where(), 'after', t1, 's | at the wheel', await S(`(() => { const h = SH.SHIP.helmSpot(); return Math.hypot(SH.player.x - h.x, SH.player.y - h.y) < 5; })()`), '| Sparky:', await lines(), '| card', await card());
  await shot('l6-ships-home' + T);
  log('  can walk off the ship', await S(`!!SH.findPath(SH.player.x, SH.player.y, ${start[0]}, ${start[1]})`));
  // 2) home: the Parrot King's island or the school island
  await talk('shipwheel'); log('the home wheel asks:', await pick());
  await choose('school'); await lines();
  const t2 = await sail();
  log('  →', await where(), 'after', t2, 's');
  await lines(); await step(1); await lines();
  // 3) the school island, this week: its ship stays
  const D6 = await S('JSON.stringify(SH.ISLE6.DOCK)').then(JSON.parse);
  await S(`SH.tp(${D6.x0 + 60}, SH.ISLE6.SHIPAT.y)`); await step(0.3);
  await talk('ship6'); log("the school island's ship this week:", await lines(), '| a choice', await pick(), '| still here', await where());
  await shot('l6-ships-stay' + T);
  // 4) next week (STAY off): home or the Parrot King's island
  await S('SH.ISLE6.STAY = false'); await talk('ship6'); log('next week it asks:', await pick());
  await choose('isle5'); log('  the Parrot King:', await lines());
  const t3 = await sail();
  log('  →', await where(), 'after', t3, 's');
  await S('SH.ISLE6.STAY = true; SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
