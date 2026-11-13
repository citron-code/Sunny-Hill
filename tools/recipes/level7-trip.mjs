// Level 7 (unit 3, the school trip), part 2: after the quiz show the class waits on the school island's east pier, by the
// big school ship. You come: all aboard (up the gangplank, each to a place on the deck); "Is there a captain among us?"
// (a wrong answer first, then "I am a captain!"); the Junior Captain certificate; to the wheel; out to sea in the school
// ship with the class on its deck; to the Green Islands (three islands, bridges, a pond); it ties up; you step off, the
// class after you; Batuhan Teacher's welcome. Then a walk over both bridges to the forest. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const trip = () => S('JSON.stringify(SH.state.school.trip)');
  const where = () => S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])');
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 },
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 }, trip: { st: 'ship', d: SH.ISLE6.today(), seen: 1 } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  // out of the school: the garden is empty, the arrow goes to the east pier, the class waits there by the school ship
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true'); await step(0.5);
  log('garden:', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| kids gone', await S('SH.ISLE6.kidList().every((k) => k.gone)'), '| teacher gone', await S('SH.ISLE6.tchNow().gone'), '| class', await S('JSON.stringify(SH.TRIP.crew && SH.TRIP.crew.map((c) => c.id + " " + Math.round(c.x) + "," + Math.round(c.y)))'));
  log('   the way there:', await S('JSON.stringify((SH.findPath(SH.player.x, SH.player.y, 3460, 5500) || []).length)'), 'points | pier walkable', await S('SH.circleFree(3500, 5500, 12)'), '| pier height', await S('SH.ISLE6.standY(3500, 5500)'), '| plank', await S('SH.ISLE6.standY(3670, 5500).toFixed(1)'), '| deck', await S('SH.ISLE6.standY(3786, 5480).toFixed(1)'));
  await S('SH.tp(3330, 5500)'); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l7-trip-pier' + T);
  // onto the pier: all aboard
  await S('SH.tp(3440, 5500)'); await step(0.3);
  log('on the pier:', await lines());
  for (let i = 0; i < 200 && !(await S('SH.Dialog.open')) && !(await S("(() => { const l = document.getElementById('ls'); return !!l && !l.classList.contains('hidden'); })()")); i++) await step(0.25);
  log('aboard: you', await where(), '| class', await S('JSON.stringify(SH.TRIP.crew.map((c) => c.id + " " + Math.round(c.x) + "," + Math.round(c.y) + " h" + Math.round(c.h || 0)))'));
  if (!process.env.FLAT) await shot('l7-trip-deck' + T);
  log('captain?', await lines());
  for (let i = 0; i < 20 && await S("(() => { const l = document.getElementById('ls'); return !l || l.classList.contains('hidden'); })()"); i++) await step(0.2);
  log('   the bar:', await S(`document.getElementById('lsQ').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`));
  await S(`[...document.querySelectorAll('#lsBtns button')].find((b) => /pirate/.test(b.textContent)).click()`); await step(0.2); log('   pirate ->', await S(`document.getElementById('lsS').textContent`));
  await S(`[...document.querySelectorAll('#lsBtns button')].find((b) => /captain/.test(b.textContent)).click()`); await sleep(1100); await step(0.3);
  log('   ->', await lines(), '| certificate', await S("!document.getElementById('cert') || !document.getElementById('cert').classList.contains('hidden')"));
  await S('SH.CaptainCert.close()'); await step(0.3);
  log('after:', await lines());
  for (let i = 0; i < 60 && !(await S('SH.SEA.active')); i++) await step(0.2);
  log('at sea:', await S('JSON.stringify({ active: SH.SEA.active, trip: SH.SEA.trip, big: SH.SEA.big, K: SH.SEA.ship && SH.SEA.ship.K })'), '| trip', await trip(), '|', await lines(), '| card', await card());
  for (let i = 0; i < 40 && await S('SH.SEA.undock'); i++) await step(0.25);
  await step(1.5); await shot('l7-trip-sea' + T);
  // the voyage (quicker: the ship put near the islands), the islands come in sight; it ties up by itself
  await S('const g = SH.SEA.goal; SH.SEA.ship.x = g.x - 900; SH.SEA.ship.y = g.y - 500; SH.SEA.ship.a = 0.5');
  for (let i = 0; i < 40 && !(await S('SH.SEA.dock')); i++) await step(0.25);
  await step(1.2); await shot('l7-trip-arrive' + T);
  for (let i = 0; i < 120 && await S('SH.SEA.active'); i++) await step(0.25);
  log('tied up:', await S('JSON.stringify({ sea: SH.SEA.active, here: SH.ISLE7.here(), off: !!SH.ISLE7.off })'), '| trip', await trip(), '| you', await where());
  for (let i = 0; i < 80 && !(await S('SH.Dialog.open')); i++) await step(0.25);
  log('welcome:', await lines(), '| you', await where(), '| card', await card());
  for (let i = 0; i < 60 && await S('!!SH.TRIP.walk'); i++) await step(0.25);
  log('the class on land:', await S('JSON.stringify(SH.TRIP.crew.map((c) => c.id + " " + Math.round(c.x) + "," + Math.round(c.y)))'), '| talk', await S(`JSON.stringify(SH.interactables().map((o) => o.id))`));
  await S('SH.tp(860, 8060)'); await step(0.4); await shot('l7-trip-islands' + T);
  // over the bridges: the way from the pier to the forest; the pond and the sea are water
  log('ways: to the pond island', await S('(SH.findPath(700, 8000, 2100, 7860) || []).length'), '| to the forest', await S('(SH.findPath(700, 8000, 3300, 8150) || []).length'), '| bridge top', await S('SH.ISLE7.standY(1750, 7807).toFixed(1)'), '| bridge free', await S('SH.circleFree(1750, 7807, 12)'),
    '| pond free', await S('SH.circleFree(2290, 7690, 12)'), '| channel free', await S('SH.circleFree(1750, 7700, 12)'));
  await S('SH.tp(1700, 7840)'); await step(0.3); await shot('l7-trip-bridge' + T);
  await S('SH.tp(2290, 7880)'); await step(0.3); await shot('l7-trip-pond' + T);
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
