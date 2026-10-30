// Level 6, lesson 6: Reading in the library. After the break the arrow goes to the library; a star on the rug; Read:
// Batuhan Teacher talks (the arrow over the new books, the old books, the board, the return cart), then you put six books
// from the cart on the right shelves ("This is an old math book."): a wrong bookcase or shelf, he says why and the right one
// blinks. Then story time: guess from the title what the book is about, then read it with him (tap the duck, the cake,
// the gift; close the book). The end: the score (ten), Done (the last lesson: no break). FLAT=1, NARROW=1.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render(); SH.SCHOOLIN.artDraw()"); await shot(n); };
  const words = () => S(`document.getElementById('pN').textContent + ' | ' + document.getElementById('pSay').textContent`);
  const tapAt = (x, y) => S(`SH.SCHOOLIN.bookTap(${x}, ${y})`);
  const slot = (age, kind) => S(`JSON.stringify(SH.SCHOOLIN.bookSlotRect('${age}', '${kind}'))`).then(JSON.parse).then(([x, y, w, h]) => tapAt(x + w / 2, y + h / 2));
  const idle = async () => { for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); } };
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 }, lost: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, day: { d: SH.ISLE6.today(), in: 1, n: 7 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S('SH.tp(1100, 2250)'); await step(0.3);
  log('in the hall: next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(1810, 2120)'); await step(0.4);
  log('in the library: card', await card(), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  await S('SH.tp(1810, 2165)'); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-rd-room' + T);
  await S('SH.tp(1862, 2000)'); await step(0.2); await talk('in6_teacher'); log('   him:', await lines());
  // Read: his words (the arrow)
  await S('SH.tp(1810, 2110)'); await step(0.2); await talk('spot6_library'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
    const l = await say(); ex.push(l + '   [arrow ' + await S('JSON.stringify(SH.SCHOOLIN.artNow())') + ']');
    for (const [re, n] of [[/Welcome to the library/, 'title'], [/These books are new/, 'new'], [/These books are old/, 'old'], [/writing books and math/, 'kinds'], [/Look at the cart/, 'cart']]) if (re.test(l)) await snapShot('l6-rd-' + n + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained:\n  ' + ex.join('\n  '));
  await step(0.2); log('the books: phase', await S('SH.SCHOOLIN.lesson.ph'), '|', await words());
  await snapShot('l6-rd-shelf0' + T);
  const out = [];
  for (let r = 0; r < 6; r++) {
    const b = await S('JSON.stringify((({ age, kind }) => ({ age, kind }))(SH.SCHOOLIN.lesson.books[SH.SCHOOLIN.lesson.i]))').then(JSON.parse), w0 = await words(), tries = [];
    const note = async (what) => tries.push(what + ' -> ' + (await words()).split(' | ')[1]);
    if (r === 1) { await slot(b.age === 'new' ? 'old' : 'new', b.kind); await note('the wrong bookcase'); await step(0.2); await snapShot('l6-rd-hint' + T); }
    if (r === 4) { await slot(b.age, b.kind === 'math' ? 'reading' : 'math'); await note('the wrong shelf'); }
    await tapAt(5, 295); await note('the floor (nothing)');
    await slot(b.age, b.kind); await note('right');
    if (r === 2) { await sleep(220); await S('SH.SCHOOLIN.artDraw()'); await shot('l6-rd-fly' + T); }
    out.push(JSON.stringify(b) + ' | ' + w0 + '\n      ' + tries.join('\n      ') + '\n      right so far: ' + await S('SH.SCHOOLIN.lesson.right'));
    await idle();
  }
  log('the shelves:\n  ' + out.join('\n  '));
  log('story time: phase', await S('SH.SCHOOLIN.lesson.ph'), '|', await words(), '| shelves', await S('Object.keys(SH.SCHOOLIN.lesson.shelf).length'));
  await snapShot('l6-rd-predict' + T);
  await tapAt(290, 150); log('   the bus:', await words());
  await tapAt(290, 60); log('   duck and cake:', await words()); await sleep(300); await snapShot('l6-rd-predicted' + T);
  await idle();
  for (let pg = 0; pg < 4; pg++) {
    log('page', pg + 1, '| phase', await S('SH.SCHOOLIN.lesson.ph'), '|', await words());
    if (pg === 0) await snapShot('l6-rd-page1' + T);
    if (pg === 1) { await tapAt(120, 124); log('   the cat:', await words()); }
    if (pg === 3) { await snapShot('l6-rd-page4' + T); await tapAt(200, 170); break; }
    const it = await S('JSON.stringify(GAME_CONTENT.school.lessons.reading.pages[SH.SCHOOLIN.lesson.page].it.find((i) => i.ok))').then(JSON.parse);
    await tapAt(it.x, it.y); log('   tapped the', it.n, '->', (await words()).split(' | ')[1]);
    await idle();
  }
  await step(0.3); await sleep(300);
  log('end:', await S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent`), '| saved', await S('JSON.stringify(SH.state.school.les.reading)'), '| day', await S('JSON.stringify(SH.state.school.day)'));
  await snapShot('l6-rd-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| panel hidden', await S(`document.getElementById('paint').classList.contains('hidden')`), '| card', await card(), '| board back', await S('SH.SCHOOLIN.libQ.canvas === SH.SCHOOLIN.libQ.canvas0'));
  log('a break now: place buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).map((o) => o.id))`), '(only the next lesson)');
  await S('Object.assign(SH.state.school.day, { n: 9, ph: null, br: 0 }); SH.Save.save()'); await step(0.2);          // (the day's lessons done: every place asks which lesson)
  // free time: the star asks which lesson (Reading again)
  await S('SH.tp(1810, 2110)'); await step(0.2); await talk('spot6_library'); await step(0.2); log('the star now:', await S(`document.getElementById('lsQ').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`));
  await S(`document.querySelector('#lsBtns button').click()`); await step(0.2); await sleep(600);
  log('again:', await lines(), '| phase', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph'), '| shelves', await S('Object.keys(SH.SCHOOLIN.lesson.shelf).length'));
  await S('SH.SCHOOLIN.reset()'); log('reset: panel hidden', await S(`document.getElementById('paint').classList.contains('hidden')`), '| lesson', await S('!!SH.SCHOOLIN.lesson'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
