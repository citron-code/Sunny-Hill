// Level 6, the school day goes on: English done -> the bell, a break (the classroom empties, its clock under the card, the
// classmates and Batuhan Teacher out in the garden) -> the bell (here: a child rings it in the garden) -> everyone walks in
// -> Math in the classroom (the festival's masks: count, listen and choose, add) -> no more lessons today (no break): free
// time, pick a lesson to play again. The break's clock ending by itself; the timetable board (done, next).
// FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S('SH.SCHOOLIN.lcam = null; SH.render()'); await shot(n); };
  const bar = () => S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent || '[picture]').join(' / ')`);
  const clock = () => S(`(() => { const e = document.getElementById('brk'); return e && !e.classList.contains('hidden') ? e.textContent : '(no clock)'; })()`);
  const dayS = () => S('JSON.stringify((({ n, ph, br }) => ({ n, ph, br: br && Math.round(br) }))(SH.state.school.day))');
  const play = async (shots) => {          // a whole lesson from the seat: the words (pictures of some), ten answers (8 right), the end
    await S('SH.tp(1552, 2045)'); await step(0.2); await talk('seat6'); await step(0.2); await sleep(600); await step(0.2);
    const ex = [];
    for (let i = 0; i < 150 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
      if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
      const l = await say(); ex.push(l);
      for (const [re, n] of (shots || []).filter(([re]) => re instanceof RegExp)) if (re.test(l)) await snapShot(n);
      await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
    }
    const qs = [];
    for (let r = 0; r < 10; r++) {
      for (let i = 0; i < 150 && !(await S('SH.SCHOOLIN.lesson.ph === "q" && SH.SCHOOLIN.lesson.picked < 0')); i++) { await step(0.2); await sleep(30); }
      const Q = await S('JSON.stringify((({ t, ans, opts }) => ({ t, ans, opts }))(SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n]))').then(JSON.parse), before = await bar();
      for (const [t, n] of (shots || []).filter(([re]) => typeof re === 'string')) if (t === Q.t && !qs.some((x) => x.startsWith(t + ' '))) await snapShot(n);
      const pick = r === 3 || r === 7 ? Q.opts.findIndex((o) => o !== Q.ans) : Q.opts.indexOf(Q.ans);
      await S(`document.querySelectorAll('#lsBtns button')[${pick}].click()`);
      qs.push(Q.t + ' ' + before + '\n      -> ' + await bar());
    }
    for (let i = 0; i < 60 && await S('SH.SCHOOLIN.lesson.ph !== "end"'); i++) { await step(0.25); await sleep(20); }
    return { ex, qs };
  };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { en: { plays: 1, best: 7 } }, day: { d: SH.ISLE6.today(), in: 1 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3);
  log('old English results moved:', await S('JSON.stringify(SH.state.school.les)'));
  await S('SH.tp(1490, 2150)'); await step(0.3);
  log('the day starts:', await dayS(), '| next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| people', await S('SH.SCHOOLIN.people().length'));
  // English (played before: straight to the questions), then the break
  const en = await play();
  log('English:', en.ex.join(' | '), '| end', await bar());
  log('   the timetable moved on:', await dayS(), '| next', await S('SH.SCHOOLIN.lessonName()'));
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| break', await dayS(), '| people in the classroom', await S('SH.SCHOOLIN.people().length'), '| card', await card());
  await step(0.5); log('   the clock:', await clock()); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-rc-break-class' + T);
  await S('SH.tp(1126, 2215)'); await step(0.3); await shot('l6-rc-timetable' + T); await talk('timetable6'); log('   the timetable:', await lines());
  await step(5); log('   five seconds later:', await clock());
  // out into the garden: everyone plays
  await S('SH.SCHOOLIN.exit()'); await step(0.6);
  log('the garden in the break: kids', await S(`JSON.stringify(SH.ISLE6.kidList().map((k) => k.id + (k.gone ? ' in' : ' out')))`), '| teacher', await S('SH.ISLE6.tchNow().gone ? "in" : "out"'), '| card', await card(), '| clock', await clock());
  await S(`(() => { const B = SH.ISLE6.BELL; SH.tp(B.x - 20, B.y + 60); })()`); await step(0.3); await shot('l6-rc-garden' + T);
  await talk('bell6'); await step(0.4);
  log('ringing the bell:', await dayS(), '| teacher says', await S(`(() => { const e = document.getElementById('tchB'); return e && !e.classList.contains('hidden') ? e.lastChild.textContent : ''; })()`), '| card', await card(), '| clock', await clock());
  await step(1.5); await shot('l6-rc-bell' + T);
  for (let i = 0; i < 80 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
  log('   all in:', await S(`JSON.stringify(SH.ISLE6.kidList().map((k) => k.gone))`), await S('SH.ISLE6.tchNow().gone'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  // Math
  await S('SH.SCHOOLIN.enter(true)'); await step(0.3); await S('SH.tp(1490, 2150)'); await step(0.3);
  log('Math time inside: people', await S('SH.SCHOOLIN.people().length'), '| card', await card());
  const ma = await play([[/festival!/, 'l6-rc-m-poster' + T], [/rabbit mask\. Hop/, 'l6-rc-m-mask' + T], [/one, two, three/, 'l6-rc-m-count' + T], [/How many masks do we need\? Four/, 'l6-rc-m-sum' + T], ['C', 'l6-rc-m-q-count' + T], ['L', 'l6-rc-m-q-listen' + T], ['S', 'l6-rc-m-q-add' + T]]);
  log('Math explained:\n  ' + ma.ex.join('\n  '));
  log('Math questions:\n  ' + ma.qs.join('\n  '));
  log('   end:', await bar(), '| saved', await S('JSON.stringify(SH.state.school.les)'), '| day', await dayS());
  await snapShot('l6-rc-m-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done (the last lesson for now):', await lines(), '| break?', await dayS(), '| card', await card(), '| people', await S('SH.SCHOOLIN.people().length'));
  // free time: sitting asks which lesson
  await S('SH.tp(1552, 2045)'); await step(0.2); await talk('seat6'); await step(0.2);
  log('sitting now:', await bar()); await shot('l6-rc-pick' + T);
  await S(`[...document.querySelectorAll('#lsBtns button')].pop().click()`); await step(0.2); log('   Not now: the bar', await S(`document.getElementById('ls').classList.contains('hidden')`));
  // the break's clock ending by itself (inside): the bell, everyone back in the classroom
  await S(`SH.state.school.day.n = 1; SH.state.school.day.ph = 'break'; SH.state.school.day.br = 2; SH.Save.save()`); await step(0.5);
  log('a break with 2 s left:', await clock()); await step(2.5);
  log('   after it:', await dayS(), '| toast', await S(`document.getElementById('toast').textContent`), '| people', await S('SH.SCHOOLIN.people().length'), '| card', await card());
  // the island in lesson time (after the page was opened again): nobody in the garden
  await S('SH.SCHOOLIN.exit()'); await step(0.6);
  log('the garden in lesson time:', await S(`JSON.stringify(SH.ISLE6.kidList().map((k) => !!k.gone))`), await S('!!SH.ISLE6.tchNow().gone'), '| card', await card(), '| talk to anyone?', await S(`SH.interactables().filter((o) => /teacher|kid/.test(o.id)).length`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
