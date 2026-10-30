// Level 6, lesson 4: PE in the gym. After the break the arrow goes to the gym; a star on the floor; Play: the camera holds the
// whole gym, Batuhan Teacher shows this / that / these / those with balls (in his hands, at his feet, far away under the
// hoop), then ten questions (the things out on the floor): the right word, you throw and score (a swish, two points on the
// scoreboard); a wrong one, off the ring. The end, Done (the last lesson for now: no break). Free time: the star asks.
// FLAT=1: the flat view. NARROW=1: a phone held upright (no big board at the top: the whole gym is the picture).
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S('SH.SCHOOLIN.lcam = null; SH.render()'); await shot(n); };
  const bar = () => S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent || '[picture]').join(' / ')`);
  const dayS = () => S('JSON.stringify((({ n, ph, br }) => ({ n, ph, br: br && Math.round(br) }))(SH.state.school.day))');
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 } }, day: { d: SH.ISLE6.today(), in: 1, n: 3 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);          // (after the door's blink)
  await S('SH.tp(1100, 2250)'); await step(0.3);
  log('in the hall: next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  // the gym: the star on the floor, the classmates on the bench, him with the balls
  await S('SH.tp(470, 2120)'); await step(0.4);
  log('in the gym: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`));
  await S('SH.tp(440, 2165)'); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-pe-room' + T);
  await S('SH.tp(380, 2110)'); await step(0.2); await talk('in6_teacher'); log('   him:', await lines());
  // Play: the explanation (the balls show it)
  await S('SH.tp(470, 2110)'); await step(0.2); await talk('spot6_gym'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
    const l = await say(); ex.push(l + '   [' + await S('JSON.stringify(SH.SCHOOLIN.peScene())') + ', his pose ' + await S('JSON.stringify(SH.SCHOOLIN.people()[0].act)') + ']');
    if (/Welcome to the gym/.test(l)) await snapShot('l6-pe-title' + T);
    if (/This is a ball/.test(l)) await snapShot('l6-pe-this' + T);
    if (/That is a ball/.test(l)) await snapShot('l6-pe-that' + T);
    if (/These are balls/.test(l)) await snapShot('l6-pe-these' + T);
    if (/Those are balls/.test(l)) await snapShot('l6-pe-those' + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained:\n  ' + ex.join('\n  '));
  const qs = [], seen = {};
  for (let r = 0; r < 10; r++) {
    for (let i = 0; i < 150 && !(await S('SH.SCHOOLIN.lesson.ph === "q" && SH.SCHOOLIN.lesson.picked < 0')); i++) { await step(0.2); await sleep(30); }
    const Q = await S('JSON.stringify((({ ans, opts, sc }) => ({ ans, opts, sc }))(SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n]))').then(JSON.parse), before = await bar();
    if (!seen[Q.ans]) { seen[Q.ans] = 1; await snapShot('l6-pe-q-' + Q.ans + T); }
    const pick = r === 3 || r === 7 ? Q.opts.findIndex((o) => o !== Q.ans) : Q.opts.indexOf(Q.ans);
    await S(`document.querySelectorAll('#lsBtns button')[${pick}].click()`);
    if (r === 0 || r === 3) {          // (the throw: in the air, then in, or off the ring)
      await step(0.5); await sleep(150); await snapShot('l6-pe-throw' + r + T);
      await step(0.65); await sleep(150); await snapShot('l6-pe-throw' + r + 'b' + T);
      log('   throw', r, await S('JSON.stringify(SH.SCHOOLIN.lesson.shot && { t: +SH.SCHOOLIN.lesson.shot.t.toFixed(2), ok: SH.SCHOOLIN.lesson.shot.ok })'), '| points', await S('SH.SCHOOLIN.lesson.pts'));
    }
    qs.push(JSON.stringify(Q.sc) + ' ' + before + '\n      -> ' + await bar());
  }
  log('questions:\n  ' + qs.join('\n  '));
  for (let i = 0; i < 60 && await S('SH.SCHOOLIN.lesson.ph !== "end"'); i++) { await step(0.25); await sleep(20); }
  log('end:', await bar(), '| points', await S('SH.SCHOOLIN.lesson.pts'), '| saved', await S('JSON.stringify(SH.state.school.les.pe)'), '| day', await dayS());
  await snapShot('l6-pe-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| day', await dayS(), '| player', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| card', await card(), '| board back', await S('SH.SCHOOLIN.gymQ.canvas === SH.SCHOOLIN.gymQ.canvas0'));
  log('a break now: place buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).map((o) => o.id))`), '(only the next lesson)');
  await S('Object.assign(SH.state.school.day, { n: 9, ph: null, br: 0 }); SH.Save.save()'); await step(0.2);          // (the day's lessons done: every place asks which lesson)
  // free time: the star asks which lesson (PE again)
  await S('SH.tp(470, 2110)'); await step(0.2); await talk('spot6_gym'); await step(0.2); log('the star now:', await bar());
  await S(`[...document.querySelectorAll('#lsBtns button')].pop().click()`); await step(0.2);
  // a replay: straight to the questions; then a new game puts the scoreboard back
  await talk('spot6_gym'); await step(0.2); await S(`document.querySelector('#lsBtns button').click()`); await step(0.2); await sleep(600);
  log('replay:', await lines(), '| phase', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph'), '| points', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.pts'));
  await S('SH.SCHOOLIN.reset()'); log('   reset: board back', await S('SH.SCHOOLIN.gymQ.canvas === SH.SCHOOLIN.gymQ.canvas0'), '| lesson', await S('!!SH.SCHOOLIN.lesson'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
