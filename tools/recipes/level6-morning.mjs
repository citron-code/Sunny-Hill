// Level 6, the morning line-up (once a day, before school): on the island the bell rings, Batuhan Teacher goes to his place by
// the flag, the four classmates line up in the yard, a star waits for you in the middle; the school's door is shut. On the star:
// his little speech (the first day's; on later days a short one); he walks to the door and opens it, goes in, the classmates
// follow him one by one. Then you go in: the classroom has him by the board and them at their desks. Out again: break time,
// the garden as before. The next day: the line-up again. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 30 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const where = (o) => S(`JSON.stringify((() => { const o = ${o}; return o ? [Math.round(o.x), Math.round(o.y)] : null; })())`);
  const kids = () => S(`JSON.stringify(SH.ISLE6.kidList().map((k) => k.id + (k.gone ? ' in' : ' ' + Math.round(k.x) + ',' + Math.round(k.y))))`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, day: { d: '01.01.2026' } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); log('on the pier (yesterday the doors were open, today not yet):', await lines());
  await S('SH.game.paused = true'); await step(0.2);
  log('the line-up starts:', await S('JSON.stringify(SH.ISLE6.asm)'), '| toast', await S(`document.getElementById('toast').textContent`), '| card', await card());
  log('the door is shut:', await S('SH.ISLE6.doorK'));
  const L = await S('JSON.stringify(SH.ISLE6.LINE)').then(JSON.parse), SC = await S('JSON.stringify(SH.ISLE6.SCHOOL)').then(JSON.parse);
  // walk to the school's door first: still shut
  await S(`SH.tp(${SC.door}, ${SC.y1 + 70})`); await step(0.3);
  await talk('door6'); log('the door:', await lines(), '| in?', await S('SH.SCHOOLIN.here()'));
  await S('SH.keys.up = 1'); await step(1); await S('SH.keys.up = 0'); log('walking into it:', await S('SH.SCHOOLIN.here()'));
  // they gather
  await step(1.5); log('Batuhan Teacher on his way:', await where('SH.ISLE6.tchNow()'), '| bubble', await S(`(() => { const e = document.getElementById('tchB'); return e && !e.classList.contains('hidden') ? e.lastChild.textContent : ''; })()`));
  for (let i = 0; i < 60 && await S('!!SH.ISLE6.tchNow().path || SH.ISLE6.kidList().some((k) => k.path)'); i++) await step(0.5);
  log('everyone in line:', await where('SH.ISLE6.tchNow()'), await kids(), '| still waiting', await S('SH.ISLE6.asm.ph'));
  await S(`SH.tp(${L.x}, ${L.y + 140})`); await step(0.3); await shot('l6-line-gather' + T);
  // onto the star: the speech
  await S(`SH.walkTo(${L.x}, ${L.y})`); for (let i = 0; i < 40 && !(await S('SH.Dialog.open')); i++) await step(0.2);
  log('on the star:', await S('SH.ISLE6.asm.ph'), '| facing', await S('SH.player.dir'));
  await shot('l6-line-speech' + T);
  log('the speech (the first day):', await lines());
  log('after it: card', await card());
  for (let i = 0; i < 60 && await S('SH.ISLE6.asm.ph === "door"'); i++) await step(0.25);
  log('at the door:', await where('SH.ISLE6.tchNow()'), '| phase', await S('SH.ISLE6.asm.ph'), '| saved', await S('JSON.stringify(SH.state.school.day)'), 'days', await S('SH.state.school.days'));
  await step(0.4); await shot('l6-line-door' + T);
  for (let i = 0; i < 20 && await S('SH.ISLE6.doorK < 1 || SH.ISLE6.asm.ph === "open"'); i++) await step(0.2);
  log('open:', await S('SH.ISLE6.doorK'), '| phase', await S('SH.ISLE6.asm.ph'), '| card', await card());
  await step(1.2); await shot('l6-line-in' + T);
  for (let i = 0; i < 60 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
  log('all in:', await S('SH.ISLE6.asm && SH.ISLE6.asm.ph'), await kids(), '| teacher in', await S('!!SH.ISLE6.tchNow().gone'), '| who is to talk to outside', await S(`JSON.stringify(SH.interactables().filter((o) => /teacher|kid/.test(o.id)).map((o) => o.id))`));
  // in: the classroom
  await S(`SH.tp(${SC.door}, ${SC.y1 + 30})`); await step(0.2);
  await S('SH.keys.up = 1'); for (let i = 0; i < 20 && !(await S('SH.SCHOOLIN.here()')); i++) await step(0.1); await S('SH.keys.up = 0');
  log('inside:', await S('SH.SCHOOLIN.here()'), '| Sparky:', await lines(), '| card', await card());
  log('the arrow to:', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(1490, 2150)'); await step(0.4);
  log('in the classroom: card', await card(), '| found it', await S('JSON.stringify(SH.state.school.day)'));
  await talk('in6_teacher'); log('Batuhan Teacher:', await lines());
  await talk('in6_amy'); log('Amy:', await lines());
  await S("document.getElementById('toast').classList.add('hidden')"); await S('SH.tp(1490, 2140)'); await step(0.3); await shot('l6-line-classroom' + T);
  // out again: break time, the garden as before
  await S('SH.SCHOOLIN.exit()'); await step(0.5);
  log('out again:', await S('JSON.stringify(SH.ISLE6.asm)'), '| teacher', await S('JSON.stringify((({ k, x, y, gone }) => ({ k, x: Math.round(x), y: Math.round(y), gone }))(SH.ISLE6.tchNow()))'), '| kids', await kids(), '| door', await S('SH.ISLE6.doorK'), '| card', await card());
  await talk('teacher6'); log('Batuhan Teacher in the break:', (await lines()).slice(0, 160));
  // the next day: the line-up again, the short speech
  await S(`SH.state.school.day = { d: '01.01.2026' }; SH.Save.save()`); await step(0.3);
  log('the next day:', await S('JSON.stringify(SH.ISLE6.asm)'), '| door', await S('SH.ISLE6.doorK'));
  for (let i = 0; i < 80 && await S('!!SH.ISLE6.tchNow().path || SH.ISLE6.kidList().some((k) => k.path)'); i++) await step(0.5);
  await S(`SH.tp(${L.x}, ${L.y})`); for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) await step(0.2);
  log('the second day\'s speech:', await lines());
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
