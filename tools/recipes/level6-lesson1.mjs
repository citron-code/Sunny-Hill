// Level 6, lesson 1 (English, in the classroom): on a school day you find your desk (it has a star), sit down; the camera cuts
// to the board; Batuhan Teacher explains the six school words (the board shows each one) and this / that; then ten questions
// in the bar at the bottom (listen and choose, what is it, a gap, this / that), one try each (8 right, 2 wrong here), his word
// after each; the score at the end (yours only), Again or Done; Done: his last words, the bell, back beside your desk.
// Sitting down again: the questions straight away. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 30 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const snapShot = async (n) => { await S('SH.SCHOOLIN.lcam = null; SH.render()'); await shot(n); };          // (the lesson's camera glides: here, at once)
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const bar = () => S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent || '[picture]').join(' / ')`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, days: 1, day: { d: SH.ISLE6.today() } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3);
  await S('SH.tp(1490, 2150)'); await step(0.4);
  log('in the classroom: card', await card(), '| the arrow to', await S('JSON.stringify(SH.Quests.target())'));
  await talk('in6_teacher'); log('Batuhan Teacher:', await lines());
  await S("document.getElementById('toast').classList.add('hidden')"); await S('SH.tp(1520, 2070)'); await step(0.4); await snapShot('l6-l1-desk' + T);
  // sit down: the camera cuts to the board
  log('the button at your desk:', await S(`(() => { SH.tp(1552, 2045); SH.step(1 / 30, 3); const o = SH.interactables().find((o) => o.id === 'seat6'); return o && o.label; })()`));
  await talk('seat6'); await step(0.2); await sleep(600); await step(0.2);
  log('sitting:', await S('!!SH.SCHOOLIN.lesson'), '| at', await S('JSON.stringify([SH.player.x, SH.player.y])'));
  // the explanation: the board changes with each word
  const ex = [];
  for (let i = 0; i < 150 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(80); continue; }
    const line = await say(); ex.push(line);
    if (/Look at the board/.test(line)) await snapShot('l6-l1-title' + T);
    if (/^teacher: Desk/.test(line)) await snapShot('l6-l1-word' + T);
    if (/THIS desk/.test(line)) await snapShot('l6-l1-demo' + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('the explanation:\n  ' + ex.join('\n  '));
  // the questions
  const done = [];
  for (let r = 0; r < 10; r++) {
    for (let i = 0; i < 150 && !(await S('SH.SCHOOLIN.lesson.ph === "q" && SH.SCHOOLIN.lesson.picked < 0')); i++) { await step(0.2); await sleep(40); }          // (the next question comes when his word is said)
    const Q = await S('JSON.stringify((({ t, ans, ask, opts }) => ({ t, ans, ask, opts }))(SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n]))').then(JSON.parse);
    const before = await bar();
    if (Q.t === 'L' && !done.some((d) => d.startsWith('L'))) await snapShot('l6-l1-q-listen' + T);
    if (Q.t === 'G' && !done.some((d) => d.startsWith('G'))) await snapShot('l6-l1-q-gap' + T);
    if (Q.t === 'D' && !done.some((d) => d.startsWith('D'))) await snapShot('l6-l1-q-this' + T);
    if (Q.t === 'W' && !done.some((d) => d.startsWith('W'))) await snapShot('l6-l1-q-what' + T);
    const pick = r === 2 || r === 6 ? Q.opts.findIndex((o) => o !== Q.ans) : Q.opts.indexOf(Q.ans);
    if (r === 4) await S(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '${pick + 1}' }))`); else await S(`document.querySelectorAll('#lsBtns button')[${pick}].click()`);
    const after = await bar();
    done.push(Q.t + ' ' + before + '\n      -> ' + after);
    if (r === 2) await snapShot('l6-l1-wrong' + T);
  }
  log('the questions:\n  ' + done.join('\n  '));
  for (let i = 0; i < 30 && await S('SH.SCHOOLIN.lesson.ph !== "end"'); i++) await step(0.25);
  log('the end:', await bar(), '| saved', await S('JSON.stringify(SH.state.school.les)'), '| day', await S('JSON.stringify(SH.state.school.day)'));
  await snapShot('l6-l1-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| back', await S('!SH.SCHOOLIN.lesson'), '| at', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| card', await card(), '| can walk', await S(`(() => { const y = SH.player.y; SH.keys.down = 1; SH.step(1 / 30, 10); SH.keys.down = 0; return Math.round(SH.player.y - y); })()`));
  await step(0.5); await snapShot('l6-l1-after' + T);
  await talk('in6_teacher'); log('Batuhan Teacher after the lesson:', await lines());
  // again: straight to the questions
  await S('SH.tp(1552, 2045)'); await step(0.2); await talk('seat6'); await step(0.2); await sleep(600); await step(0.2);
  log('sitting again:', await lines(), '| questions', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
