// Level 7 (unit 3, the school trip), part 1: after the first home time Batuhan Teacher calls the class to line up (big news:
// a school trip!), the doors open, the gym is a TV studio for the day: the quiz show. Four rounds, ten questions: is it
// living (yes / no buzzers), animal or plant (it flies into its circle), mixed-up letters (tap them in order), the final
// (a page: tap the title and the three subtitles; what is it about?). The end, Done: golden tickets, the trip goes on.
// Then a child who comes back on another day before the show: the short call. FLAT=1: the flat view. NARROW=1: a phone.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S('SH.SCHOOLIN.lcam = null; SH.render()'); await shot(n); };
  const bar = () => S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`);
  const trip = () => S('JSON.stringify(SH.state.school.trip)');
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  const setState = (trip) => S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 },
      les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 }, pe: { plays: 1, best: 8 } }, day: { d: '01.11.2026', n: 9, home: 1, in: 1 }, trip: ${JSON.stringify(trip)} };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await setState({ st: '' });
  // the island: the bell, Batuhan Teacher calls the class; your star in the line; his big news
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true'); await step(0.5);
  log('called:', await S('JSON.stringify(SH.ISLE6.asm)'), '| card', await card(), '| due', await S('SH.TRIP.callDue()'));
  await S('SH.tp(SH.ISLE6.LINE.x, SH.ISLE6.LINE.y)');
  for (let i = 0; i < 80 && !(await S('SH.Dialog.open')); i++) await step(0.25);
  log('his news:', await lines());
  for (let i = 0; i < 100 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
  log('doors:', await S('JSON.stringify(SH.ISLE6.asm)'), '| trip', await trip(), '| day', await S('JSON.stringify(SH.state.school.day)'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| line-up due', await S('SH.ISLE6.lineDue()'));
  // the garden is empty (they are in the gym); in through the door, to the gym
  log('garden: kids gone', await S('SH.ISLE6.kidList().map((k) => k.gone).join()'), '| teacher gone', await S('SH.ISLE6.tchNow().gone'));
  await S('SH.SCHOOLIN.enter(true)'); await step(0.3); await sleep(900);
  await S('SH.tp(1100, 2250)'); await step(0.3);
  log('in the hall: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.tp(440, 2140)'); await step(0.4); log('the gym:', await lines());
  log('   card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`), '| people', await S(`JSON.stringify(SH.SCHOOLIN.people().map((p) => p.id + ' ' + p.x + ',' + p.y))`));
  log('   walls: desk', await S('!SH.circleFree(565, 2030, 4)'), '| way to the star', await S('JSON.stringify((SH.findPath(440, 2140, 590, 2030) || []).length)'));
  await S("document.getElementById('toast').classList.add('hidden')"); await snapShot('l7-show-studio' + T);
  await S('SH.tp(380, 2080)'); await step(0.2); await talk('in6_teacher'); log('   him:', await lines());
  // the show: his words (a flower, a ball, a bee on the turning table), then the rounds
  await S('SH.tp(590, 2044)'); await step(0.2); await talk('spot6_show'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(40); continue; }
    ex.push(await say() + '  [table: ' + await S('SH.TRIP.cur') + ']'); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); await step(0.05);
  }
  log('his words:\n  ' + ex.join('\n  '));
  const qs = [];
  for (let r = 0; r < 10; r++) {
    for (let i = 0; i < 200; i++) {
      if (await S('SH.Dialog.open')) { qs.push('   (' + await say() + ')'); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); await step(0.05); continue; }
      if (await S('SH.SCHOOLIN.lesson.ph === "q" && SH.SCHOOLIN.lesson.picked < 0 && SH.SCHOOLIN.lesson.n === ' + r)) break;
      await step(0.2); await sleep(20);
    }
    const Q = await S('JSON.stringify((({ t, id, w, ans, opts }) => ({ t, id, w, ans, opts }))(SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n]))').then(JSON.parse), before = Q.t === 'H' ? await S(`document.getElementById('pSay').textContent`) : await bar();
    if (Q.t === 'U') {          // the letters: in order (the first word: one wrong tile first)
      if (r === 6) await S(`(() => { const w = SH.SCHOOLIN.lesson.qs[6].w, b = [...document.querySelectorAll('#lsBtns .tile')].find((x) => x.textContent.toLowerCase() !== w[0]); b.click(); })()`);
      for (let k = 0; k < Q.w.length; k++) await S(`(() => { const L = SH.SCHOOLIN.lesson, Q = L.qs[L.n], b = [...document.querySelectorAll('#lsBtns .tile')].find((x) => !x.disabled && x.textContent.toLowerCase() === Q.w[Q.got]); b.click(); })()`);
      if (r === 6) await snapShot('l7-show-letters' + T);
    } else if (Q.t === 'H') {          // the page: a line first (not the title), then the title, then the three subtitles
      await step(0.2); await snapShot('l7-show-page' + T);
      const c = (r) => `SH.TRIP.pageTap((${r}[0] + ${r}[2]) / 2, (${r}[1] + ${r}[3]) / 2)`, R = 'SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n].rects';
      await S(c(R + '.body[0]')); const miss = await S(`document.getElementById('pSay').textContent`);
      await S(c(R + '.title')); const t1 = await S(`document.getElementById('pSay').textContent`);
      for (let k = 0; k < 3; k++) await S(c(R + '.subs[' + k + ']'));
      qs.push(`H ${before} -> miss: ${miss} -> title: ${t1} -> ${await S(`document.getElementById('pSay').textContent`)} | picked ${await S('SH.SCHOOLIN.lesson.picked')}`);
      continue;
    } else {
      const pick = r === 1 || r === 4 ? Q.opts.findIndex((o) => o !== Q.ans) : Q.opts.indexOf(Q.ans);
      await S(`document.querySelectorAll('#lsBtns button')[${pick}].click()`);
      if (Q.t === 'K' && r === 4) { await step(0.45); await snapShot('l7-show-fly' + T); log('   in the air:', await S('JSON.stringify(SH.TRIP.fly)')); }
    }
    qs.push(Q.t + ' ' + (Q.id || '') + ' ' + before + '\n      -> ' + await bar());
  }
  log('questions:\n  ' + qs.join('\n  '));
  for (let i = 0; i < 80 && await S('SH.SCHOOLIN.lesson.ph !== "end"'); i++) { if (await S('SH.Dialog.open')) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await step(0.25); await sleep(20); }
  log('end:', await bar(), '| sorted', await S('JSON.stringify(SH.TRIP.sorted)'), '| saved', await S('JSON.stringify(SH.state.school.les.show)'), '| coins', await S('SH.Coins.get()'), '| page hidden', await S(`document.getElementById('paint').classList.contains('hidden')`));
  await snapShot('l7-show-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| trip', await trip(), '| lesson', await S('!!SH.SCHOOLIN.lesson'), '| studio', await S('SH.TRIP.studioOn()'), '| card', await card(), '| board back', await S('SH.SCHOOLIN.gymQ.canvas === SH.SCHOOLIN.gymQ.canvas0'), '| desk free', await S('!SH.circleFree(565, 2030, 4)'));
  // another day, the show not played yet: the short call
  await S('SH.SCHOOLIN.reset(); SH.ISLE6.reset()'); await setState({ st: 'show', d: '02.11.2026' });
  await S('SH.ISLE6.land()'); await lines(); await step(0.5); await S('SH.tp(SH.ISLE6.LINE.x, SH.ISLE6.LINE.y)');
  for (let i = 0; i < 80 && !(await S('SH.Dialog.open')); i++) await step(0.25);
  log('next day:', await lines(), '| asm', await S('JSON.stringify(SH.ISLE6.asm && { ph: SH.ISLE6.asm.ph, trip: SH.ISLE6.asm.trip })'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
