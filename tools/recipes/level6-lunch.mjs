// Level 6, lunch in the cafeteria: after Art the arrow goes to the cafeteria; the classmates stand in a line at the counter,
// a star at its end for you; Line up: Batuhan Teacher talks (the arrow over the line, the menu), then for each classmate
// "Whose turn is it?" (their names over their heads), the child asks for something and you help (which food?), the child
// takes the tray to the table and the line moves up; then your turn ("It's my turn!") and you ask nicely (please!).
// Ten things scored; no break after lunch (the lost and found box next). FLAT=1, NARROW=1.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render()"); await shot(n); };
  const bar = () => S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`);
  const tags = () => S(`[...document.querySelectorAll('#ltags span')].filter((s) => s.style.display !== 'none').map((s) => (s.className ? '[' + s.className + '] ' : '') + s.textContent).join(', ')`);
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, day: { d: SH.ISLE6.today(), in: 1, n: 5 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S('SH.tp(1100, 2250)'); await step(0.3);
  log('in the hall: next', await S('SH.SCHOOLIN.lessonName()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| coins', await S('SH.Coins.get()'));
  await S('SH.tp(374, 2560)'); await step(0.4);
  log('the line places free:', await S('JSON.stringify(SH.SCHOOLIN.LUNCH.slots.map(([x, y]) => SH.circleFree(x, y, 11)))'), '| star reachable', await S('!!SH.findPath(1100, 2250, 438, 2566)'));
  log('in the cafeteria: card', await card(), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-lu-room' + T);
  await S('SH.tp(190, 2540)'); await step(0.2); await talk('in6_teacher'); log('   him:', await lines());
  await S('SH.tp(374, 2540)'); await step(0.2); await talk('spot6_cafeteria'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
    const l = await say(); ex.push(l + '   [arrow ' + await S('JSON.stringify(SH.SCHOOLIN.artNow())') + ']');
    if (/We stand in a line/.test(l)) await snapShot('l6-lu-line' + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained:\n  ' + ex.join('\n  '));
  log('order', await S('JSON.stringify(SH.SCHOOLIN.lesson.order)'), '| foods', await S('JSON.stringify(SH.SCHOOLIN.lesson.food)'));
  const out = []; let r = 0, shotTags = 0;
  for (let i = 0; i < 1200 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph !== "end"'); i++) {
    if (!(await S('SH.SCHOOLIN.lesson.waitAns'))) { await step(0.1); await sleep(80); if (++shotTags === 30) { await snapShot('l6-lu-walk' + T); log('   walking: tags', await tags()); } continue; }
    const b = await bar(), opts = await S(`JSON.stringify([...document.querySelectorAll('#lsBtns button')].map((b) => b.classList.contains('bad') ? 0 : 1))`);
    if (r === 0) { await snapShot('l6-lu-q-turn' + T); log('   tags:', await tags()); }
    if (r === 1) { await sleep(300); await step(0.1); await snapShot('l6-lu-q-food' + T); log('   tags:', await tags()); }
    // the right one: ask the game which it is
    const right = await S(`(() => { const L = SH.SCHOOLIN.lesson, N = GAME_CONTENT.school.lessons.writing.kids, C = GAME_CONTENT.school.lessons.lunch, q = document.getElementById('lsQ').textContent, bs = [...document.querySelectorAll('#lsBtns button')];
      if (q === C.whose) { const want = L.k < 4 ? C.turn.replace('{n}', N[L.order[L.k]][0]) : C.mine; return bs.findIndex((b) => b.textContent === want); }
      if (q === C.you) return bs.findIndex((b) => /please/.test(b.textContent));
      return bs.findIndex((b) => b.textContent.indexOf(L.food[L.order[L.k]]) >= 0); })()`);
    const pick = r === 2 || r === 9 ? (right + 1) % 3 : right;
    await S(`document.querySelectorAll('#lsBtns button')[${pick}].click()`); await step(0.1);
    out.push(b + '\n      -> picked ' + (pick === right ? 'right' : 'wrong') + ' | ' + await bar() + ' | right so far ' + await S('SH.SCHOOLIN.lesson.right'));
    if (r === 9) { await sleep(2200); await step(0.1); await snapShot('l6-lu-rude' + T); }
    r++;
  }
  log('the line:\n  ' + out.join('\n  '));
  await sleep(500); await step(0.3);
  log('end:', await bar(), '| saved', await S('JSON.stringify(SH.state.school.les.lunch)'), '| day', await S('JSON.stringify(SH.state.school.day)'), '| coins', await S('SH.Coins.get()'), '| seats', await S(`JSON.stringify(Object.entries(SH.SCHOOLIN.lesson.kp).map(([k, o]) => k + ' ' + Math.round(o.x) + ',' + Math.round(o.y) + (o.sit ? ' sit' : '')))`), '| me', await S(`JSON.stringify((({ x, y, sit }) => ({ x: Math.round(x), y: Math.round(y), sit }))(SH.SCHOOLIN.lesson.pp))`));
  await snapShot('l6-lu-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| day', await S('JSON.stringify(SH.state.school.day)'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| tags left', await S(`document.querySelectorAll('#ltags span').length`));
  // after lunch (no break): you can walk out of the cafeteria to the lobby (the lost and found box)
  await sleep(2800); await step(0.5); await lines();
  const me = () => S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])');
  log('after lunch: you at', await me(), '| mode', await S('SH.game.mode'), '| lesson', await S('!!SH.SCHOOLIN.lesson'), '| free', await S('SH.circleFree(SH.player.x, SH.player.y, 12)'), '| card', await card());
  for (const k of ['up', 'right', 'down', 'left']) { const a = await me(); await S(`SH.keys.${k} = 1`); await step(0.4); await S(`SH.keys.${k} = 0`); log('   key', k, a, '->', await me()); }
  const sp = await S('JSON.stringify(SH.SCHOOLIN.STAGES.lobby.spot)').then(JSON.parse);
  log('   a way to the lobby:', await S(`!!SH.findPath(SH.player.x, SH.player.y, ${sp.x}, ${sp.y + 30})`));
  await S(`SH.walkTo(${sp.x}, ${sp.y + 30})`); const trail = []; for (let i = 0; i < 40; i++) { await step(0.25); if (i % 5 === 4) trail.push(await me()); } log('   walking to the lobby:', trail.join(' '), '| card', await card());
  await snapShot('l6-lu-after' + T);
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
