// Level 6, the lost and found box in the lobby (after lunch, no break between): the arrow goes to the lobby; Help: Batuhan
// Teacher talks (the arrow over the box), then five things come out of the box with name tags: tap the owner's photo, then
// ask him "Is this ___ cap?" with my / your / his / her (a boy's: his, a girl's: her, his mug: your, your lunchbox: my).
// A wrong photo or word: he says why, the right one blinks. Ten scored, then a break (Reading next). FLAT=1, NARROW=1.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render(); SH.SCHOOLIN.artDraw()"); await shot(n); };
  const words = () => S(`document.getElementById('pN').textContent + ' | ' + document.getElementById('pSay').textContent`);
  const photo = (id) => S(`(() => { const p = SH.SCHOOLIN.LOSTP.find(([q]) => q === ${JSON.stringify(id)}), [x, y, w, h] = SH.SCHOOLIN.lostCell(p[1], p[2]); SH.SCHOOLIN.lostTap(x + w / 2, y + h / 2); })()`);
  const word = (w) => S(`(() => { const k = GAME_CONTENT.school.lessons.lost.words.indexOf(${JSON.stringify(w)}); SH.SCHOOLIN.lostTap(10 + k * 95 + 44, 264); })()`);
  const idle = async () => { for (let i = 0; i < 80 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); } };
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 9 } }, art: { del: ['classroom', 'library', 'computer'] }, day: { d: SH.ISLE6.today(), in: 1, n: 6 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S('SH.tp(800, 2250)'); await step(0.3);
  log('in the hall: next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(990, 2560)'); await step(0.4);
  log('by the box: card', await card(), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-lf-room' + T);
  await S('SH.tp(990, 2540)'); await step(0.2); await talk('spot6_lobby'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
    const l = await say(); ex.push(l + '   [arrow ' + await S('JSON.stringify(SH.SCHOOLIN.artNow())') + ']');
    if (/Every thing has a name tag/.test(l)) await snapShot('l6-lf-box' + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained:\n  ' + ex.join('\n  '));
  log('the things:', await S('JSON.stringify(SH.SCHOOLIN.lesson.items.map((i) => i.owner + ":" + i.x + ":" + i.w))'));
  await snapShot('l6-lf-who' + T);
  const out = [];
  for (let r = 0; r < 5; r++) {
    const it = await S('JSON.stringify(SH.SCHOOLIN.lesson.items[SH.SCHOOLIN.lesson.i])').then(JSON.parse), w0 = await words(), tries = [];
    const note = async (what) => tries.push(what + ' -> ' + (await words()).split(' | ')[1]);
    if (r === 1) { await photo(it.owner === 'me' ? 'teacher' : 'me'); await note('a wrong photo'); await step(0.2); await snapShot('l6-lf-hint' + T); }
    await photo(it.owner); await note('the owner');
    if (r === 0) await snapShot('l6-lf-ask' + T);
    if (r === 2) { await word(it.w === 'his' ? 'her' : it.w === 'her' ? 'his' : it.w === 'my' ? 'your' : 'my'); await note('a wrong word'); }
    await word(it.w); await note('the right word');
    await sleep(2000); await step(0.1); if (r === 0) await snapShot('l6-lf-answer' + T);
    await idle();
    out.push(JSON.stringify(it) + ' | ' + w0 + '\n      ' + tries.join('\n      ') + '\n      right so far: ' + await S('SH.SCHOOLIN.lesson.right'));
  }
  log('the box:\n  ' + out.join('\n  '));
  await step(0.3); await sleep(300);
  log('end:', await S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent`), '| saved', await S('JSON.stringify(SH.state.school.les.lost)'), '| coins', await S('SH.Coins.get()'));
  await snapShot('l6-lf-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| day', await S('JSON.stringify(SH.state.school.day)'), '| card', await card());
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
