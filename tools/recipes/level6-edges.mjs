// Level 6, the school day's corners: Restart in a lesson and after the line-up; the page opened again in a lesson; no sound in
// "Listen and choose"; a new day while you are inside; talking to Batuhan Teacher on his way to the doors; the This & That
// Corner while they line up; phones (landscape, portrait: the board big at the top).
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const setup = (day) => S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { en: { plays: 1, best: 7 } }, day: { d: ${day ? 'SH.ISLE6.today()' : "'01.01.2026'"}, in: 1 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  const sit = async () => { await S('SH.tp(1552, 2045)'); await step(0.2); await talk('seat6'); await step(0.2); await sleep(600); await step(0.2); await lines(); for (let i = 0; i < 20 && !(await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "q"')); i++) { await step(0.2); await lines(); } };
  const canWalk = () => S(`(() => { const x = SH.player.x, y = SH.player.y; SH.keys.left = 1; SH.step(1 / 30, 12); SH.keys.left = 0; return Math.round(Math.hypot(SH.player.x - x, SH.player.y - y)); })()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();

  // 1. Restart in the middle of a lesson
  await setup(true); await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.2);
  await sit(); log('1. in a lesson:', await S('SH.SCHOOLIN.lesson.ph'), '| bar', await S(`!document.getElementById('ls').classList.contains('hidden')`));
  await S('SH.resetInPlace()'); await sleep(300);
  log('   Restart: lesson', await S('SH.SCHOOLIN.lesson'), '| bar hidden', await S(`document.getElementById('ls').classList.contains('hidden')`), '| lsOn', await S(`document.body.classList.contains('lsOn')`), '| mode', await S('SH.game.mode'));
  await S('SH.quickStart("Ayşe")'); await lines(); await S('SH.game.paused = true'); await step(0.3);
  log('   after it, at home: can walk', await canWalk(), '| inside the school?', await S('SH.SCHOOLIN.here()'));

  // 2. Restart after the line-up (the classmates had gone in): they are back in the garden
  await setup(false); await S('SH.ISLE6.land()'); await lines(); await step(0.2);
  await S(`(() => { const I = SH.ISLE6; I.asm.ph = 'done'; for (const k of I.kidList()) k.gone = true; I.tchNow().gone = true; })()`);
  await S('SH.resetInPlace()'); await sleep(300); await S('SH.quickStart("Ayşe")'); await lines(); await S('SH.game.paused = true');
  log('2. Restart after the line-up: kids gone', await S('JSON.stringify(SH.ISLE6.kidList().map((k) => !!k.gone))'), '| teacher gone', await S('!!SH.ISLE6.tchNow().gone'), '| line-up', await S('JSON.stringify(SH.ISLE6.asm)'));

  // 3. the page opened again in the middle of a lesson: inside, not stuck
  await setup(true); await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.2);
  await S('SH.tp(1500, 2140)'); await step(0.3); await S('SH.Where.keep()'); await sit();
  await S('SH.Where.keep()'); log('3. kept while in the lesson:', await S('JSON.stringify(SH.state.at)'));
  await S('location.reload()'); await sleep(2500); for (let i = 0; i < 60 && !(await S('!!(window.SH && SH.booted)')); i++) await sleep(250);
  await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";');
  await S(`document.querySelector('#title .continue, #tContinue') && document.querySelector('#title .continue, #tContinue').click()`); await sleep(300);
  if (await S(`SH.game.mode === 'title'`)) await S('SH.Title && SH.Title.go ? SH.Title.go() : SH.startGame && SH.startGame()');
  await sleep(500); const back = await lines(); await S('SH.game.paused = true'); await step(0.3);
  log('   opened again:', back, '| mode', await S('SH.game.mode'), '| inside', await S('SH.SCHOOLIN.here()'), '| lesson', await S('SH.SCHOOLIN.lesson'), '| at', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| can walk', await canWalk());

  // 4. no sound: "Listen and choose" shows the word
  await S('SH.state.settings.sound = false'); await S('SH.tp(1500, 2140)'); await step(0.2);
  await sit();
  for (let i = 0; i < 12 && (await S('SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n].t')) !== 'L'; i++) { await S(`document.querySelectorAll('#lsBtns button')[0].click()`); for (let j = 0; j < 30 && await S('SH.SCHOOLIN.lesson.picked >= 0'); j++) await step(0.25); }
  await sleep(500); await step(0.1);
  log('4. no sound, listen:', await S(`document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent`), '| answer', await S('SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n].ans'));
  await S(`document.querySelectorAll('#lsBtns button')[0].click()`); const t0 = Date.now(); for (let j = 0; j < 40 && await S('SH.SCHOOLIN.lesson.picked >= 0'); j++) await step(0.25);
  log('   the next question came (no voice to wait for): ', await S('SH.SCHOOLIN.lesson.picked < 0'));
  await S('SH.state.settings.sound = true; SH.SCHOOLIN.reset(); SH.jumpTo ? 0 : 0');

  // 5. a new day while you are inside: no lesson people, the default words; out: the line-up
  await S(`SH.state.school.day = { d: '01.01.2026', in: 1, l1: 1 }; SH.Save.save()`); await S('SH.tp(1490, 2150)'); await step(0.4);
  log('5. a new day inside: people', await S('SH.SCHOOLIN.people().length'), '| seat button', await S(`!!SH.interactables().find((o) => o.id === 'seat6')`), '| card', await card());
  await S('SH.SCHOOLIN.exit()'); await step(0.5);
  log('   out: line-up', await S('JSON.stringify(SH.ISLE6.asm && SH.ISLE6.asm.ph)'), '| door', await S('SH.ISLE6.doorK'));

  // 6. on his way to the doors he says "come in"; 7. This & That while they line up: the line-up waits
  const L = await S('JSON.stringify(SH.ISLE6.LINE)').then(JSON.parse), A = await S('JSON.stringify(SH.ISLE6.TT)').then(JSON.parse);
  await S(`SH.tp(${A.star.x + 20}, ${A.star.y + 40})`); await step(0.2); await talk('tt6'); await step(0.5);
  log('7. This & That in a line-up:', await S('SH.ISLE6.tt.on'), '| teacher comes over?', await S('SH.ISLE6.tchNow().k'), '| line-up', await S('SH.ISLE6.asm.ph'));
  await S('SH.ISLE6.ttStop()'); await step(0.3);
  for (let i = 0; i < 80 && await S('!!SH.ISLE6.tchNow().path'); i++) await step(0.5);
  await S(`SH.tp(${L.x}, ${L.y})`); for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) await step(0.2); await lines();
  for (let i = 0; i < 10 && await S('SH.ISLE6.asm.ph !== "door"'); i++) await step(0.1);
  await talk('teacher6'); log('6. on his way to the doors:', await lines());

  // 8. phones: landscape (low) and portrait (the board big at the top)
  await S('SH.state.school.day = { d: SH.ISLE6.today(), in: 1 }; SH.Save.save()');          // (the doors open today)
  await S('SH.game.paused = false'); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.2); await lines();
  await viewport(800, 380, { mobile: true, dpr: 2 }); await step(0.2);
  await sit(); await step(0.3);
  await S('SH.SCHOOLIN.lcam = null; SH.render()');          // (the camera glides to the board: here, at once)
  log('8. phone, landscape: narrow', await S(`document.body.classList.contains('lsNarrow')`)); await shot('l6-edge-phone-land');
  await viewport(390, 844, { mobile: true, dpr: 2 }); await step(0.3);
  await S('SH.SCHOOLIN.lcam = null; SH.render()'); log('   phone, portrait: narrow', await S(`document.body.classList.contains('lsNarrow')`), '| board shown', await S(`getComputedStyle(document.getElementById('lsBoard')).display`)); await shot('l6-edge-phone-port');
  await viewport(1280, 800); await step(0.3);
  log('   back to a wide screen: board shown', await S(`getComputedStyle(document.getElementById('lsBoard')).display`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
