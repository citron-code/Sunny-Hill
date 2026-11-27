// Level 7, week 2: the call at the morning line-up. After his words Batuhan Teacher says "Follow me!" and leads the class
// to the school ship on the east pier (not in through the school's doors); there TRIP's class waits; on the pier: all aboard.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), F = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const where = () => S(`(() => { const T = SH.ISLE6.tchNow(); return 'teacher ' + Math.round(T.x) + ',' + Math.round(T.y) + ' | kids ' + SH.ISLE6.kidList().map((k) => k.id + ' ' + Math.round(k.x) + ',' + Math.round(k.y) + ' h' + Math.round(k.h)).join('; '); })()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 150,
      les: { show: { plays: 1, best: 8 } }, day: { d: '20.11.2026', n: 9, home: 1, in: 1, trip: 1 },
      trip: { st: 'done', d: '20.11.2026', seen: 1, landed: 1, seen3: 'back', got: {}, bin: {}, saw: {}, end: 1, in: 1, poster: 1 } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  // the bell; your star; his news
  await S('SH.ISLE6.land()'); await lines(); await step(0.5);
  log('called:', await S('JSON.stringify(SH.ISLE6.asm)'), '| due', await S('WEEK2.due()'));
  await S('SH.tp(SH.ISLE6.LINE.x, SH.ISLE6.LINE.y)');
  for (let i = 0; i < 80 && !(await S('SH.Dialog.open')); i++) await step(0.25);
  log('his news:', await lines());
  // "Follow me!": to the east pier
  await step(0.2);
  log('follow:', await S('SH.ISLE6.asm && SH.ISLE6.asm.ph'), '| bubble', await S('JSON.stringify(SH.ISLE6.bub && SH.ISLE6.bub.text || null)'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| trip st', await S('TRIP.st().st'));
  log('   teacher path ends', await S(`(() => { const p = SH.ISLE6.tchNow().path; return p ? p.length + ' pts, last ' + Math.round(p[p.length - 1].x) + ',' + Math.round(p[p.length - 1].y) : 'none'; })()`), '| doors', await S('SH.ISLE6.doorK'));
  await step(5); log('   5 s on:', await where());
  await S(`(() => { const T = SH.ISLE6.tchNow(); SH.tp(T.x - 60, T.y + 70); })()`); await step(0.2); await sleep(200); await shot('l7w2-follow' + F);
  log('   talk to him:', await S(`SH.interact(SH.interactables().find((o) => o.id === 'teacher6'))`), await lines());
  // they all get there; TRIP's class takes over on the pier
  for (let i = 0; i < 120 && await S('!!SH.ISLE6.asm'); i++) await step(0.25);
  log('on the pier:', await S('JSON.stringify(SH.ISLE6.asm)'), '| trip', await S('JSON.stringify((({ st, wk }) => ({ st, wk }))(TRIP.st()))'), '| garden ones gone', await S('SH.ISLE6.tchNow().gone + " " + SH.ISLE6.kidList().map((k) => k.gone).join()'));
  log('   the class:', await S(`TRIP.crew.map((c) => c.id + ' ' + Math.round(c.x) + ',' + Math.round(c.y) + (Math.hypot(c.x - TRIP.PIER[c.id][0], c.y - TRIP.PIER[c.id][1]) < 4 ? ' ok' : ' OFF')).join('; ')`), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  // you come onto the pier: all aboard
  await S(`(() => { const E = SH.ISLE6.EAST.DOCK; SH.tp(E.x0 + 30, (E.y0 + E.y1) / 2); })()`); await step(0.3); await sleep(200); await shot('l7w2-pier' + F);
  log('all aboard:', await lines());
  for (let i = 0; i < 60 && await S('!!TRIP.walk'); i++) await step(0.25);
  log('   the wheel:', await lines(), '| trip st', await S('TRIP.st().st'));
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
