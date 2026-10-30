// Level 6, lesson 3: Music in the music room. After the break the arrow goes to the music room (not the classroom); the desk
// says "Music is in the music room"; a star on the floor; Sing: the camera cuts to the big screen, Batuhan Teacher explains
// the short i, then the song (each word lights up), then ten questions (listen, the missing letter, rhyme, which word has
// the short i), the end, Done (the last lesson for now: no break). Free time: the star asks which lesson.
// FLAT=1: the flat view. NARROW=1: a phone held upright (the screen big at the top).
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
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 } }, day: { d: SH.ISLE6.today(), in: 1, n: 2 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3);
  await S('SH.tp(1100, 2250)'); await step(0.3);
  log('in the hall: next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  // the classroom's desk: not here
  await S('SH.tp(1552, 2045)'); await step(0.2); log('at the classroom desk: buttons', await S('JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id))'), '| card', await card());
  // the music room: the star on the floor, the classmates in a row, him by the screen
  await S('SH.tp(746, 2150)'); await step(0.4);
  log('in the music room: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| button', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`));
  await S('SH.tp(746, 2230)'); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-mu-room' + T);
  await talk('in6_teacher'); log('   him:', await lines());
  // Sing: the explanation and the song
  await S('SH.tp(746, 2160)'); await step(0.2); await talk('spot6_music'); await step(0.2); await sleep(600); await step(0.2);
  const ex = []; let sang = 0, singShot = 0;
  for (let i = 0; i < 500 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); if (sang && ++singShot === 40) await snapShot('l6-mu-sing' + T); continue; }
    const l = await say(); ex.push(l);
    if (/Music time! Everybody/.test(l)) await snapShot('l6-mu-title' + T);
    if (/Listen: i, i, i/.test(l)) await snapShot('l6-mu-sound' + T);
    if (/Six\. Pig\./.test(l)) await snapShot('l6-mu-iwords' + T);
    if (/let's sing/.test(l)) sang = 1;
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained (and sang):\n  ' + ex.join('\n  '));
  const qs = [], seen = {};
  for (let r = 0; r < 10; r++) {
    for (let i = 0; i < 150 && !(await S('SH.SCHOOLIN.lesson.ph === "q" && SH.SCHOOLIN.lesson.picked < 0')); i++) { await step(0.2); await sleep(30); }
    const Q = await S('JSON.stringify((({ t, ans, opts }) => ({ t, ans, opts }))(SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n]))').then(JSON.parse), before = await bar();
    if (!seen[Q.t]) { seen[Q.t] = 1; await snapShot('l6-mu-q-' + Q.t + T); }
    const pick = r === 3 || r === 7 ? Q.opts.findIndex((o) => o !== Q.ans) : Q.opts.indexOf(Q.ans);
    await S(`document.querySelectorAll('#lsBtns button')[${pick}].click()`);
    if (Q.t === 'P' && seen.P === 1) { seen.P = 2; await snapShot('l6-mu-q-P-done' + T); }
    qs.push(Q.t + ' ' + before + '\n      -> ' + await bar());
  }
  log('questions:\n  ' + qs.join('\n  '));
  for (let i = 0; i < 60 && await S('SH.SCHOOLIN.lesson.ph !== "end"'); i++) { await step(0.25); await sleep(20); }
  log('end:', await bar(), '| saved', await S('JSON.stringify(SH.state.school.les.music)'), '| day', await dayS());
  await snapShot('l6-mu-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| day', await dayS(), '| player', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| card', await card(), '| screen back', await S('SH.SCHOOLIN.musicQ.canvas === SH.SCHOOLIN.musicQ.canvas0'));
  log('a break now: place buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).map((o) => o.id))`), '(only the next lesson)');
  await S('Object.assign(SH.state.school.day, { n: 9, ph: null, br: 0 }); SH.Save.save()'); await step(0.2);          // (the day's lessons done: every place asks which lesson)
  // free time: the star asks which lesson (Music again), the desk asks too (English, Math)
  await S('SH.tp(746, 2150)'); await step(0.2); await talk('spot6_music'); await step(0.2); log('the star now:', await bar());
  await S(`[...document.querySelectorAll('#lsBtns button')].pop().click()`); await step(0.2);
  await S('SH.tp(1552, 2045)'); await step(0.2); await talk('seat6'); await step(0.2); log('the desk now:', await bar());
  await S(`[...document.querySelectorAll('#lsBtns button')].pop().click()`); await step(0.2);
  // a replay from the star: straight to the questions; then away (a new game) puts the screen back
  await S('SH.tp(746, 2150)'); await step(0.2); await talk('spot6_music'); await step(0.2); await S(`document.querySelector('#lsBtns button').click()`); await step(0.2); await sleep(600);
  log('replay:', await lines(), '| phase', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph'));
  await S('SH.SCHOOLIN.reset()'); log('   reset: screen back', await S('SH.SCHOOLIN.musicQ.canvas === SH.SCHOOLIN.musicQ.canvas0'), '| lesson', await S('!!SH.SCHOOLIN.lesson'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
