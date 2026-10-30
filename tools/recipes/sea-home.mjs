// Sailing home to Sunny Hill: from the Parrot King's pier, home; pictures while the ship comes into the harbour (the
// last part steers itself), at the quay, and just after (you at the wheel at home). FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const shipAt = () => S(`SH.SEA.ship ? JSON.stringify([Math.round(SH.SEA.ship.x), Math.round(SH.SEA.ship.y), +SH.SEA.ship.a.toFixed(2), Math.round(SH.SEA.ship.v)]) : 'none'`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, coinTold: 1 };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.Save.save();`);
  await S('location.reload()'); await sleep(2500);
  for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
  await sleep(400); await S(`document.getElementById('tContinue').click()`); await sleep(400); await lines(); await step(0.3); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S('SH.game.paused = true');
  await S('SH.ISLE5.land()'); await lines(); await step(0.5);
  const D5 = await S('JSON.stringify(SH.ISLE5.DOCK)').then(JSON.parse);
  await S(`SH.tp(${D5.x0 + 60}, ${(D5.y0 + D5.y1) / 2})`); await step(0.3);
  await talk('ship5'); await S(`document.querySelector('#spList button.home').click()`); log('home:', await lines());
  for (let i = 0; i < 60 && await S('!SH.SEA.active'); i++) { await lines(); await step(0.25); }
  let n = 0, t = 0;
  for (; t < 200 && await S('SH.SEA.active') && !(await S('SH.SEA.ship && SH.SEA.ship.x < SH.SEA.START.x + 1500')); t++) {          // (out at sea: quick steps)
    await lines(); await S('SH.SEA.ship && !SH.SEA.undock && SH.SEA.goal && (SH.SEA.steer = { x: SH.SEA.goal.x, y: SH.SEA.goal.y, t: SH.game.t })'); await step(0.5);
  }
  await S('SH.game.paused = false');          // (near home: the game's own clock, every frame drawn, the camera as a child sees it)
  for (let i = 0; i < 90 && await S('SH.SEA.active'); i++) {
    await S('SH.Dialog.open && (SH.Dialog.shownAt = 0, SH.Dialog.next())');
    await S('SH.SEA.ship && !SH.SEA.dock && !SH.SEA.undock && SH.SEA.goal && (SH.SEA.steer = { x: SH.SEA.goal.x, y: SH.SEA.goal.y, t: SH.game.t })');
    log('  ', (i * 0.6).toFixed(1), 's', (await S('!!SH.SEA.dock')) ? 'docking' : 'near', await shipAt()); if (n < 30) await shot('sea-home-' + String(n++).padStart(2, '0') + T);
    await sleep(450);
  }
  await S('SH.game.paused = true');
  log('arrived: sea', await S('SH.SEA.active'), '| player', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'));
  await shot('sea-home-arrive' + T);
  log('Sparky:', await lines()); await step(1); await shot('sea-home-after' + T);
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
