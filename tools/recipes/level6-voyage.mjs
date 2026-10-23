// Level 6: sailing to the school island. From home (the wheel asks: which island?), docking at the school's pier (no cut),
// stepping off; from the Parrot King's pier (on board up the gangplank, out to the north, then sailing); from the school's
// pier back to the Parrot King's (coming from the north: round to the south of his pier first). FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('qcText').textContent`);
  const pos = () => S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])');
  const picks = () => S(`JSON.stringify([...document.querySelectorAll('#spList .spIsle')].map((b) => b.textContent))`);
  const pick = (k) => S(`document.querySelector('#spList .spIsle.${k}').click()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = {}; SH.Save.save(); SH.SHIP.apply(true);`);
  // 1) at home: the card, Sparky's arrow at the wheel; the wheel asks which island
  await step(1); log('at home: card', await card(), '| arrow at the wheel', await S('(() => { const t = SH.Quests.target(), h = SH.SHIP.helmSpot(); return !!t && Math.hypot(t.x - h.x, t.y - h.y) < 40; })()'));
  const h = await S('SH.SHIP.helmSpot()'); await S(`SH.tp(${h.x}, ${h.y})`); await step(0.3);
  await talk('shipwheel'); log('the wheel asks:', await S(`!document.getElementById('seaPick').classList.contains('hidden')`), await picks());
  await S('SH.game.paused = true'); await shot('l6v-pick' + T); await S('SH.game.paused = false');
  await pick('school'); log('to the school island:', await lines(), '| at sea', await S('SH.SEA.active'), '| trip', await S('SH.SEA.trip'), '| card', await card());
  for (let i = 0; i < 30 && await S('!!SH.SEA.undock'); i++) await step(0.25);
  // out at sea: the school island in sight (it lies up in the north-east)
  await S('(() => { const S = SH.SEA.ship, g = SH.SEA.goal; S.x = g.x - 900; S.y = g.y + 1100; S.a = -0.9; })()'); await step(1.2);
  await S('SH.game.paused = true'); await shot('l6v-insight' + T); await S('SH.game.paused = false');
  await S('(() => { const S = SH.SEA.ship, g = SH.SEA.goal; S.x = g.x - 120; S.y = g.y + 700; S.a = -Math.PI / 2; })()'); await step(0.5);
  log('docking:', await S('!!SH.SEA.dock'));
  for (let i = 0; i < 60 && await S('SH.SEA.active'); i++) { await step(0.25); if (i === 10) { await S('SH.game.paused = true'); await shot('l6v-docking' + T); await S('SH.game.paused = false'); } }
  log('tied up: at sea', await S('SH.SEA.active'), '| on the island', await S('SH.ISLE6.here()'), '| stepping off', await S('!!SH.ISLE6.off'));
  for (let i = 0; i < 40 && await S('!!SH.ISLE6.off'); i++) await step(0.25);
  log('on the pier at', await pos(), '| Sparky:', await lines(), '| card', await card());
  // 2) back to the Parrot King's island from the school's pier (coming from the north)
  await S(`SH.tp(${await S('SH.ISLE6.DOCK.x0 + 70')}, ${await S('SH.ISLE6.SHIPAT.y')})`); await step(0.3);
  await talk('ship6'); log('the school\'s ship asks:', await picks()); await pick('isle5'); log(await lines());
  log('going on board:', await S('!!SH.ISLE6.aboard'));
  for (let i = 0; i < 40 && await S('!!SH.ISLE6.aboard'); i++) { await step(0.2); if (i === 4) { await S('SH.game.paused = true'); await shot('l6v-board' + T); await S('SH.game.paused = false'); } }
  log('out to sea: at sea', await S('SH.SEA.active'), '| trip', await S('SH.SEA.trip'), '| setting out', await S('!!SH.SEA.undock'), '| card', await card());
  await S('SH.game.paused = true'); await shot('l6v-depart' + T); await S('SH.game.paused = false');
  for (let i = 0; i < 30 && await S('!!SH.SEA.undock'); i++) await step(0.25);
  await S('(() => { const S = SH.SEA.ship, g = SH.SEA.goal; S.x = g.x + 200; S.y = g.y - 380; S.a = Math.PI / 2; })()'); await step(0.3);
  log('docking from the north:', await S('!!SH.SEA.dock'), '| its way passes south of the pier', await S('(() => { const D = SH.SEA.dock, g = SH.SEA.goal; return !!D && D.pts.some((p) => p.y > g.y + 300); })()'), '| never over the pier', await S('(() => { const D = SH.SEA.dock, g = SH.SEA.goal; return !!D && D.pts.every((p) => !(p.x > g.x + 40 && Math.abs(p.y - g.y) < 120)); })()'));
  for (let i = 0; i < 60 && await S('SH.SEA.active'); i++) await step(0.25);
  for (let i = 0; i < 40 && await S('!!SH.ISLE5.off'); i++) await step(0.25);
  log('on the Parrot King\'s pier:', await S('SH.ISLE5.here()'), '| Sparky:', await lines());
  // 3) from the Parrot King's pier to the school island
  await S(`SH.tp(${await S('SH.ISLE5.DOCK.x0 + 70')}, ${await S('SH.ISLE5.SHIPAT.y')})`); await step(0.3);
  await talk('ship5'); log('his ship asks:', await picks()); await pick('school'); log(await lines());
  for (let i = 0; i < 40 && await S('!!SH.ISLE5.aboard'); i++) await step(0.2);
  log('out to sea: trip', await S('SH.SEA.trip'), '| goal is the school pier', await S('(() => { const g = SH.SEA.goal, d = SH.ISLE6.seaDock(); return Math.hypot(g.x - d.x, g.y - d.y) < 1; })()'));
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
