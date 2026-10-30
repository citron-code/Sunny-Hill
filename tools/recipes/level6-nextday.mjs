// Level 6, a school day not finished goes on the next day: yesterday the child stopped after Art (five lessons done, lunch
// next); today the line-up again (Batuhan Teacher says where we start), the doors open, and the day goes on from lunch.
// A finished day (home time) starts again from English the next day. On a break only the next lesson's place has a button.
export default async function ({ evaluate, sleep, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const o = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { o.push(await S('SH.Dialog.who + ": " + SH.Dialog.text')); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return o.join(' | '); };
  const card = () => S(`document.getElementById('questCard').textContent.replace(/\s*🔊\s*$/, '').trim()`);
  const morning = async (day) => {
    await S(`SH.state.school.day = ${JSON.stringify(day)}; SH.Save.save(); if (!SH.ISLE6.here()) SH.ISLE6.land(); if (SH.SCHOOLIN.here()) SH.SCHOOLIN.exit(); SH.ISLE6.recess()`); await lines(); await S('SH.game.paused = true'); await step(0.4); await lines();
    for (let i = 0; i < 80 && await S('!!SH.ISLE6.tchNow().path || SH.ISLE6.kidList().some((k) => k.path)'); i++) await step(0.5);
    const L = await S('JSON.stringify(SH.ISLE6.LINE)').then(JSON.parse); await S(`SH.tp(${L.x}, ${L.y})`); for (let i = 0; i < 30 && !(await S('SH.Dialog.open')); i++) await step(0.2);
    const speech = await lines();
    for (let i = 0; i < 120 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
    return speech;
  };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, inside: 1, days: 2, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 } } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  log('yesterday stopped after Art (in a break): the speech:', await morning({ d: '01.01.2026', in: 1, n: 5, ph: 'break', br: 40 }));
  log('   today:', await S('JSON.stringify(SH.state.school.day)'), '| next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card());
  log('yesterday finished (home time): the speech:', await morning({ d: '01.01.2026', in: 1, n: 9, home: 1 }));
  log('   today:', await S('JSON.stringify(SH.state.school.day)'), '| next', await S('SH.SCHOOLIN.lessonName()'));
  // a break: only the next place's button
  await S('SH.SCHOOLIN.enter(true)'); await step(0.3); await lines();
  await S(`Object.assign(SH.state.school.day, { n: 3, ph: 'break', br: 90 })`); await step(0.2);
  await S('SH.tp(1100, 2250)'); await step(0.2);
  log('a break before PE, in the hall: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(440, 2160)'); await step(0.2); log('   in the gym: arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.SCHOOLIN.exit()'); await step(0.5); await lines(); log('   in the garden: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| clock', await S('SH.state.school.day.br')); await S('SH.SCHOOLIN.enter(true)'); await step(0.3); await lines();
  log('a break before PE: place buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).map((o) => o.id))`));
  await S(`Object.assign(SH.state.school.day, { n: 9, ph: null })`); await step(0.2);
  log('the day done: place buttons', await S(`SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).length`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
