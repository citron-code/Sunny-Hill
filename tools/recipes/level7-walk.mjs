// Level 7: the class getting on and off the school ship, in pictures and numbers. On the school island's east pier (the
// teacher not on the gangplank), half way up the gangplank, all on the deck (the teacher by the wheel, the children at the
// bow); out at sea; at the Green Islands, half way down, and all on land before the teacher speaks; then off to the
// meadow on land (never over the water). Heights: on the pier 5, the deck about 43-54, the land 0.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await S('SH.Dialog.who')); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(','); };
  const crew = () => S('JSON.stringify(SH.TRIP.crew.map((c) => c.id[0] + " " + Math.round(c.x) + "," + Math.round(c.y) + " h" + (c.h == null ? "-" : Math.round(c.h))))');
  const water = (I) => S(`SH.TRIP.crew.filter((c) => { const h = c.h == null ? 0 : c.h, sea = ${I}.coastD(c.x, c.y) < 10 && !${I}.inDock(c.x, c.y) && ${I}.standY(c.x, c.y) < 3; return sea; }).map((c) => c.id).join() || 'none'`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 },
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 }, trip: { st: 'ship', d: SH.ISLE6.today(), seen: 1 } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true'); await step(0.5);
  log('on the pier:', await crew());
  await S('SH.tp(3440, 5500)'); await step(0.3); log('hello:', await lines());
  await step(2.2); log('half way:', await crew()); await shot('l7-walk-board');
  for (let i = 0; i < 120 && !(await S('SH.Dialog.open')); i++) await step(0.25);
  log('aboard:', await crew()); await shot('l7-walk-aboard');
  await lines(); for (let i = 0; i < 20 && await S(`(() => { const l = document.getElementById('ls'); return !l || l.classList.contains('hidden'); })()`); i++) await step(0.2);
  await S(`[...document.querySelectorAll('#lsBtns button')].find((b) => /captain/.test(b.textContent)).click()`); await sleep(1100); await step(0.3); await lines(); await S('SH.CaptainCert.close()'); await step(0.3); await lines();
  for (let i = 0; i < 60 && !(await S('SH.SEA.active')); i++) await step(0.2);
  await lines(); for (let i = 0; i < 40 && await S('SH.SEA.undock'); i++) await step(0.25);
  await S('SH.SEA.zoom = 0.62'); await step(0.6); await shot('l7-walk-sea');
  await S('const g = SH.SEA.goal; SH.SEA.ship.x = g.x - 900; SH.SEA.ship.y = g.y - 500; SH.SEA.ship.a = 0.5');
  for (let i = 0; i < 120 && await S('SH.SEA.active'); i++) await step(0.25);
  log('tied up at the Green Islands:', await crew());
  await step(3.4); log('coming down:', await crew(), '| over the water:', await water('SH.ISLE7')); await shot('l7-walk-off');
  for (let i = 0; i < 160 && !(await S('SH.Dialog.open')); i++) { await step(0.25); if (i % 8 === 0) { const w = await water('SH.ISLE7'); if (w !== 'none') log('   over the water at', i, w, await crew()); } }
  log('the welcome starts: walking', await S('!!SH.TRIP.walk'), '|', await crew()); await shot('l7-walk-landed');
  await lines(); await step(0.5);
  for (let i = 0; i < 120 && await S('!!SH.TRIP.walk'); i++) { await step(0.25); if (i % 6 === 0) { const w = await water('SH.ISLE7'); if (w !== 'none') log('   over the water at', i, w, await crew()); } }
  log('at the meadow:', await crew());
  // the way back: everything seen; on the islands' pier all go up the starboard gangplank (you round the wheel to it); home at
  // the east pier all come down the port one
  const you = () => S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y), Math.round(SH.ISLE7.standY(SH.player.x, SH.player.y) || 0)])');
  await S(`Object.assign(SH.state.school.trip, { st: 'green', landed: 1, seen3: 'end', got: { flower: 1, grass: 1, ant: 1, earthworm: 1, bee: 1, butterfly: 1, tadpole: 1, fish: 1, lily: 1, dragonfly: 1, mosquito: 1, frog: 1 },
    bin: { bottle: 1, can: 1, cup: 1 }, ps: 1, dip: 3, fs: 1, saw: { deer: 1, rabbit: 1, squirrel: 1, bird: 1 }, end: 1 }); SH.Save.save()`);
  await S('SH.ISLE7.land()'); await lines(); await step(0.5); for (let i = 0; i < 80 && await S('!!SH.TRIP.walk'); i++) await step(0.25);
  await S('SH.tp(560, 8000)'); await step(0.4); await lines();
  await step(2.4); log('back aboard, on the way:', await crew(), '| you', await you(), '| over the water:', await water('SH.ISLE7'));
  await step(1.6); log('   later:', await crew(), '| you', await you()); await shot('l7-walk-back');
  for (let i = 0; i < 80 && !(await S('SH.SEA.active')); i++) { if (await S('SH.Dialog.open')) await lines(); await step(0.25); }
  await lines(); for (let i = 0; i < 40 && await S('SH.SEA.undock'); i++) await step(0.25);
  await S('{ const g = SH.SEA.goal; SH.SEA.ship.x = g.x + 700; SH.SEA.ship.y = g.y - 500; SH.SEA.ship.a = Math.PI * 0.8; }');
  for (let i = 0; i < 160 && await S('SH.SEA.active'); i++) await step(0.25);
  log('tied up at the school:', await crew(), '| phase', await S('SH.TRIP.phase()'));
  await step(3); log('coming down:', await crew(), '| over the water:', await water('SH.ISLE6')); await shot('l7-walk-home');
  for (let i = 0; i < 80 && await S('!!SH.TRIP.walk'); i++) { if (await S('SH.Dialog.open')) break; await step(0.25); const w = await water('SH.ISLE6'); if (w !== 'none') log('   over the water at', i, w, await crew()); }
  log('on the pier:', await crew());
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
