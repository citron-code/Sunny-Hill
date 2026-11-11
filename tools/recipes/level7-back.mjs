// Level 7 (unit 3, the school trip), part 4: the islands are done (Batuhan Teacher saw the notebook). The class walks back to
// the pier; you step onto it: all aboard; you sail the school ship back to the school island's east pier (it ties up from
// the east side); you step off, the class after you; welcome back; they walk in; into the school, the classroom, your desk:
// our poster (stickers onto Animals or Plants; one wrong first); Done: the trip is over, the poster stands by the classroom
// door, the garden is as before. FLAT=1: the flat view. NARROW=1: a phone held upright.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`(() => { const o = SH.interactables().find((o) => o.id === ${JSON.stringify(id)}); if (!o) return 'none'; SH.interact(o); return 'ok'; })()`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const trip = () => S('JSON.stringify((({ st, end, in: i, poster }) => ({ st, end, in: i, poster }))(SH.state.school.trip))');
  const where = () => S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])');
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  const M6 = '{ flower: 1, grass: 1, ant: 1, earthworm: 1, bee: 1, butterfly: 1, tadpole: 1, fish: 1, lily: 1, dragonfly: 1, mosquito: 1, frog: 1 }';
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 150,
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 },
      trip: { st: 'green', d: SH.ISLE6.today(), seen: 1, landed: 1, seen3: 'end', got: ${M6}, bin: { bottle: 1, can: 1, cup: 1 }, ps: 1, dip: 3, fs: 1, saw: { deer: 1, rabbit: 1, squirrel: 1, bird: 1 }, end: 1 } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE7.land()'); await lines(); await S('SH.game.paused = true'); await step(0.5);
  log('the end of the walk:', await S('SH.TRIP.stage3()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| class walking', await S('!!SH.TRIP.walk'));
  // onto the pier: all aboard (the class still on its way comes at once)
  await S('SH.tp(560, 8000)'); await step(0.4); log('on the pier:', await lines());
  for (let i = 0; i < 80 && !(await S('SH.SEA.active')); i++) { if (await S('SH.Dialog.open')) await lines(); await step(0.25); }
  log('at sea:', await S('JSON.stringify({ trip: SH.SEA.trip, big: SH.SEA.big, goalE: SH.SEA.goalE })'), '|', await trip(), '|', await lines(), '| card', await card());
  for (let i = 0; i < 40 && await S('SH.SEA.undock'); i++) await step(0.25);
  // the voyage (quicker: the ship put near the school island's east side); it ties up by itself, from the east
  await S('const g = SH.SEA.goal; SH.SEA.ship.x = g.x + 700; SH.SEA.ship.y = g.y - 500; SH.SEA.ship.a = Math.PI * 0.8');
  for (let i = 0; i < 40 && !(await S('SH.SEA.dock')); i++) await step(0.25);
  await step(1); await shot('l7-back-dock' + T);
  for (let i = 0; i < 120 && await S('SH.SEA.active'); i++) await step(0.25);
  log('tied up:', await S('JSON.stringify({ sea: SH.SEA.active, school: SH.ISLE6.here() })'), '| you', await where(), '|', await trip());
  for (let i = 0; i < 100 && !(await S('SH.Dialog.open')); i++) await step(0.2);
  log('welcome back:', await lines(), '| you', await where(), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| doors', await S('SH.ISLE6.doorK'));
  for (let i = 0; i < 160 && await S('!!SH.TRIP.walk'); i++) await step(0.25);
  log('   the class went in:', await S('SH.TRIP.crew === null'), '| garden kids gone', await S('SH.ISLE6.kidList().every((k) => k.gone)'));
  // into the school, the classroom, your desk: the poster
  await S('SH.SCHOOLIN.enter(true)'); await step(0.3); await sleep(800);
  await S('SH.tp(1100, 2250)'); await step(0.3); log('in the school:', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(1500, 2110)'); await step(0.3); log('the classroom:', await card(), '| people', await S('JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + (p.sit ? " sits" : "")))'), '| buttons', await S('JSON.stringify(SH.interactables().filter((o) => /seat6|poster6/.test(o.id)).map((o) => o.id + " " + o.label))'));
  await S('SH.tp(1552, 2045)'); await step(0.2); log('   the desk:', await talk('seat6'), await lines());
  for (let i = 0; i < 20 && !(await S(`!!document.getElementById('pnl7') && document.getElementById('pnl7').classList.contains('poster')`)); i++) await step(0.2);
  await sleep(200); if (!process.env.NARROW) await shot('l7-back-poster0' + T);
  const placed = [];
  for (let i = 0; i < 20 && await S('SH.TRIP.pst && SH.TRIP.pst.left.length > 0'); i++) {
    const id = await S('SH.TRIP.pst.left[0]'), k = await S(`SH.NATURE.KIND[${JSON.stringify(id)}]`);
    await S(`SH.TRIP.pst.sel = ${JSON.stringify(id)}`);
    if (i === 0) placed.push('wrong ' + id + ': ' + await S(`SH.TRIP.posterPut(${JSON.stringify(k === 'animal' ? 'plant' : 'animal')})`) + ' ' + await S(`document.getElementById('toast').textContent`));
    placed.push(id + ' ' + k + ': ' + await S(`SH.TRIP.posterPut(${JSON.stringify(k)})`));
    await step(0.05);
  }
  log('poster:', placed.join(' · '));
  await sleep(200); if (!process.env.NARROW) await shot('l7-back-poster' + T);
  log('   Done button:', await S(`getComputedStyle(document.querySelector('#pnl7 .ok7')).display`));
  await S(`document.querySelector('#pnl7 .ok7').click()`); await step(0.3);
  log('the end:', await lines(), '|', await trip(), '| coins', await S('SH.Coins.get()'), '| card', await card());
  await S('SH.tp(1612, 2232)'); await step(0.3); log('   the poster by the door:', await talk('poster6'), await lines()); if (!process.env.NARROW) await shot('l7-back-wall' + T);
  // back in the garden: the class plays again; the school ship's word
  await S('SH.SCHOOLIN.exit()'); await step(0.5); await sleep(600);
  log('the garden:', await card(), '| kids back', await S('SH.ISLE6.kidList().every((k) => !k.gone)'), '| line-up due', await S('SH.ISLE6.lineDue()'));
  await S('SH.tp(3640, 5500)'); await step(0.3); log('   the school ship:', await talk('ship6e'), await lines());
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
