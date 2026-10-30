// Level 6, lesson 7: Writing in the computer lab, a school newspaper. After the Reading break the arrow goes to the computer
// lab; your computer has a star; Type: Batuhan Teacher talks (the arrow over the newspaper board in the corridor: a question
// starts with a big letter, ends with a question mark), then five broken questions on your screen ("what is your name"):
// tap the first letter (big), press the "?" key, a classmate answers, the answer goes into the newspaper with their photo.
// A wrong letter or key: he says why, the right one blinks. The end: it is printed; it goes on the board in the corridor.
// FLAT=1, NARROW=1.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render(); SH.SCHOOLIN.artDraw()"); await shot(n); };
  const words = () => S(`document.getElementById('pN').textContent + ' | ' + document.getElementById('pSay').textContent`);
  const tapAt = (x, y) => S(`SH.SCHOOLIN.newsTap(${x}, ${y})`);
  const letter = (i) => S(`(() => { const [a, b] = SH.SCHOOLIN.lesson.xs[${i}]; SH.SCHOOLIN.newsTap((a + b) / 2, 200); })()`);
  const key = (k) => S(`(() => { const [, x] = SH.SCHOOLIN.NEWSKEYS.find(([q]) => q === ${JSON.stringify(k)}); SH.SCHOOLIN.newsTap(x + 35, 260); })()`);
  const idle = async () => { for (let i = 0; i < 60 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); } };
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, reading: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 }, lost: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, kim: { st: 'tour', i: 4, done: 1 }, day: { d: SH.ISLE6.today(), in: 1, n: 8, home: 1 } };          // (Kim and home time done before: the writing lesson alone)
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S('SH.tp(1100, 2250)'); await step(0.3);
  log('in the hall: next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(1126, 2215)'); await step(0.3); await shot('l6-wr-timetable' + T);
  await S('SH.tp(1738, 2250)'); await step(0.4); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-wr-board-before' + T);
  await S('SH.tp(1830, 2560)'); await step(0.4);
  log('in the computer lab: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-wr-room' + T);
  await S('SH.tp(2010, 2462)'); await step(0.2); await talk('in6_teacher'); log('   him:', await lines());
  // Type: his words
  await S('SH.tp(1797, 2552)'); await step(0.2); await talk('spot6_computer'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
    const l = await say(); ex.push(l + '   [arrow ' + await S('JSON.stringify(SH.SCHOOLIN.artNow())') + ']');
    for (const [re, n] of [[/newspaper board/, 'news'], [/big letter/, 'cap'], [/question mark\./, 'mark'], [/Fix the questions/, 'computer']]) if (re.test(l)) await snapShot('l6-wr-' + n + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained:\n  ' + ex.join('\n  '));
  await step(0.2); log('the questions: phase', await S('SH.SCHOOLIN.lesson.ph'), '|', await words());
  await snapShot('l6-wr-q0' + T);
  const out = [];
  for (let r = 0; r < 5; r++) {
    const St = await S('JSON.stringify(SH.SCHOOLIN.lesson.steps[SH.SCHOOLIN.lesson.i])').then(JSON.parse), w0 = await words(), tries = [];
    const note = async (what) => tries.push(what + ' -> ' + (await words()).split(' | ')[1]);
    if (r === 0) { await key('?'); await note('a key first'); }
    if (r === 1) { await letter(4); await note('another letter'); await step(0.2); await snapShot('l6-wr-hint' + T); }
    await letter(0); await note('the first letter');
    if (r === 2) { await key('.'); await note('a dot'); await step(0.2); await snapShot('l6-wr-dot' + T); }
    if (r === 3) { await key('!'); await note('!'); }
    await key('?'); await note('?');
    if (r === 0) { await sleep(1500); await step(0.1); await snapShot('l6-wr-answer' + T); }
    await idle();
    out.push(JSON.stringify({ s: St.s, photo: St.photo, by: St.by }) + ' | ' + w0 + '\n      ' + tries.join('\n      ') + '\n      right so far: ' + await S('SH.SCHOOLIN.lesson.right') + ' | news: ' + await S('JSON.stringify(SH.SCHOOLIN.lesson.news)'));
    if (r === 3) await snapShot('l6-wr-q4' + T);
  }
  log('the questions:\n  ' + out.join('\n  '));
  await sleep(700); await snapShot('l6-wr-print' + T);
  for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson.ph !== "end"'); i++) { await sleep(150); await step(0.05); }
  log('end:', await S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent`), '| saved', await S('JSON.stringify(SH.state.school.les.writing)'), '| news', await S('JSON.stringify(SH.state.school.news)'), '| day', await S('JSON.stringify(SH.state.school.day)'));
  await snapShot('l6-wr-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| panel hidden', await S(`document.getElementById('paint').classList.contains('hidden')`), '| card', await card(), '| player', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'));
  await S('SH.tp(1738, 2250)'); await step(0.4); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-wr-board-after' + T);
  // free time: your computer asks which lesson (Writing again)
  await S('SH.tp(1797, 2552)'); await step(0.2); await talk('spot6_computer'); await step(0.2); log('the star now:', await S(`document.getElementById('lsQ').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`));
  await S(`document.querySelector('#lsBtns button').click()`); await step(0.2); await sleep(600);
  log('again:', await lines(), '| phase', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph'), '| news', await S('JSON.stringify(SH.SCHOOLIN.lesson.news)'));
  await S('SH.SCHOOLIN.reset()'); log('reset: panel hidden', await S(`document.getElementById('paint').classList.contains('hidden')`), '| lesson', await S('!!SH.SCHOOLIN.lesson'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
