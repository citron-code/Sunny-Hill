// Level 6, a whole school day from the start, the way a child plays it: the line-up in the yard, in through the door, then
// every item of the timetable in turn (going where Sparky's arrow points, starting it at its place), the breaks (one in the
// garden ended with the bell, one left to run out, the rest ended by going to the next place), Kim's tour, home time and the
// report card, the Sunny Shop with the coins of the day, and out to the ship. At each step: the card, the arrow, the coins,
// and anything left on the screen that should be gone. Most answers right (one wrong in each). FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const card = () => S(`document.getElementById('questCard').textContent.replace(/\\s*🔊\\s*$/, '').trim()`);
  const arrow = () => S('JSON.stringify(SH.Quests.target())').then(JSON.parse);
  const coins = () => S('SH.Coins.get()');
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const W = { lines: 0, words: 0 }, issues = [], t0 = Date.now(), log = (...a) => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's]', ...a);
  const lines = async () => { const out = []; for (let i = 0; i < 60 && await S('SH.Dialog.open'); i++) { const l = await say(); out.push(l); W.lines++; W.words += l.split(' ').length; await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(25); } return out.join(' | '); };
  const leftovers = async (where) => {          // things that should be gone between lessons
    const r = await S(`JSON.stringify({ ls: !document.getElementById('ls') || document.getElementById('ls').classList.contains('hidden'), paint: !document.getElementById('paint') || document.getElementById('paint').classList.contains('hidden'),
      tags: document.querySelectorAll('#ltags span').length, lsOn: document.body.classList.contains('lsOn'), mode: SH.game.mode, lesson: !!SH.SCHOOLIN.lesson })`).then(JSON.parse);
    const bad = []; if (!r.ls) bad.push('the lesson bar still shown'); if (!r.paint) bad.push('the panel still shown'); if (r.tags) bad.push(r.tags + ' name tags left'); if (r.lsOn) bad.push('body.lsOn left'); if (r.mode !== 'play') bad.push('mode ' + r.mode); if (r.lesson) bad.push('a lesson still on');
    if (bad.length) { issues.push(where + ': ' + bad.join(', ')); log('   !!', where, bad.join(', ')); }
  };
  const goPlace = async (what) => {          // follow the arrow: to the doorway, then to the place
    if (await S('SH.SCHOOLIN.onBreak()')) {          // (a break: no arrow; the child goes to the next lesson's place)
      const P = await S('JSON.stringify(SH.SCHOOLIN.STAGES[SH.SCHOOLIN.nextLesson().room].spot)').then(JSON.parse);
      await S(`SH.tp(${P.x}, ${P.y + 12})`); await step(0.3); return 'a break: to the place';
    }
    const a1 = await arrow(); if (!a1) { issues.push(what + ': no arrow'); log('   !! no arrow for', what); return null; }
    await S(`SH.tp(${a1.x}, ${a1.y})`); await step(0.3);
    const a2 = await arrow(); if (a2) { await S(`SH.tp(${a2.x}, ${a2.y})`); await step(0.3); }
    return [a1, a2];
  };
  const startAt = async (id) => {          // the place's button; his words
    const it = await S(`JSON.stringify(SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).map((o) => o.id))`).then(JSON.parse);
    const near = await S('(() => { const o = SH.nearestInteractable(); return o ? o.id : null; })()');
    if (near !== id) { issues.push(id + ': the nearest button is ' + near); log('   !! nearest button', near, 'not', id); }
    await talk(id); await step(0.2); await sleep(600); await step(0.2);
    const ex = [];
    for (let i = 0; i < 500 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
      if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
      const l = await say(); ex.push(l); W.lines++; W.words += l.split(' ').length; await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(25); await step(0.05);
    }
    return { buttons: it, said: ex.length };
  };
  const finish = async () => { for (let i = 0; i < 100 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph !== "end"'); i++) { await step(0.2); await sleep(60); } return S(`document.getElementById('lsN').textContent`); };
  const done = async () => { await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2); return lines(); };
  // ---- the kinds of lessons
  const quiz = async () => {          // english, math, music, pe: ten questions in the bar
    let r = 0;
    for (let i = 0; i < 400 && r < 10 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph !== "end"'); i++) {
      if (!(await S('SH.SCHOOLIN.lesson.ph === "q" && SH.SCHOOLIN.lesson.picked < 0'))) { await step(0.2); await sleep(30); continue; }
      const k = await S(`(() => { const Q = SH.SCHOOLIN.lesson.qs[SH.SCHOOLIN.lesson.n], j = Q.opts.indexOf(Q.ans); return ${r} === 3 ? (j + 1) % Q.opts.length : j; })()`);
      await S(`document.querySelectorAll('#lsBtns button')[${k}].click()`); r++;
    }
  };
  const art = async () => {
    await S(`SH.SCHOOLIN.artApron('apron')`); await sleep(1700); await step(0.1);
    for (let r = 0; r < 10; r++) {
      const St = await S('JSON.stringify(SH.SCHOOLIN.lesson.steps[SH.SCHOOLIN.lesson.i])').then(JSON.parse);
      const tap = (p) => S(`(() => { const [x, y] = SH.SCHOOLIN.ART_CENTER[${JSON.stringify(p)}]; SH.SCHOOLIN.artTap(x, y); })()`);
      if (St.tool === 'pencil' && await S('SH.SCHOOLIN.lesson.dull')) { await S(`SH.SCHOOLIN.artTool('pencil'); SH.SCHOOLIN.artColor('${St.color}')`); await tap(St.part); await S('SH.SCHOOLIN.artSharpen()'); }
      if (r === 3) { await S(`SH.SCHOOLIN.artTool('${St.tool}'); SH.SCHOOLIN.artColor('${St.color || 'red'}')`); await tap(St.part === 'sky' ? 'grass' : 'sky'); }
      if (!St.free) await S(`SH.SCHOOLIN.artTool('${St.tool}')`);
      await S(`SH.SCHOOLIN.artColor('${St.free ? 'purple' : St.color}')`); await tap(St.part);
      for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); }
    }
  };
  const lunch = async () => {
    let r = 0;
    for (let i = 0; i < 1500 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph !== "end"'); i++) {
      if (!(await S('SH.SCHOOLIN.lesson.waitAns'))) { await step(0.1); await sleep(70); continue; }
      const right = await S(`(() => { const L = SH.SCHOOLIN.lesson, N = GAME_CONTENT.school.lessons.writing.kids, C = GAME_CONTENT.school.lessons.lunch, q = document.getElementById('lsQ').textContent, bs = [...document.querySelectorAll('#lsBtns button')];
        if (q === C.whose) { const want = L.k < 4 ? C.turn.replace('{n}', N[L.order[L.k]][0]) : C.mine; return bs.findIndex((b) => b.textContent === want); }
        if (q === C.you) return bs.findIndex((b) => /please/.test(b.textContent));
        return bs.findIndex((b) => b.textContent.indexOf(L.food[L.order[L.k]]) >= 0); })()`);
      await S(`document.querySelectorAll('#lsBtns button')[${r === 3 ? (right + 1) % 3 : right}].click()`); r++;
    }
  };
  const lost = async () => {
    for (let r = 0; r < 5; r++) {
      const it = await S('JSON.stringify(SH.SCHOOLIN.lesson.items[SH.SCHOOLIN.lesson.i])').then(JSON.parse);
      if (r === 2) await S(`(() => { const p = SH.SCHOOLIN.LOSTP.find(([q]) => q !== ${JSON.stringify(it.owner)}), [x, y, w, h] = SH.SCHOOLIN.lostCell(p[1], p[2]); SH.SCHOOLIN.lostTap(x + w / 2, y + h / 2); })()`);
      await S(`(() => { const p = SH.SCHOOLIN.LOSTP.find(([q]) => q === ${JSON.stringify(it.owner)}), [x, y, w, h] = SH.SCHOOLIN.lostCell(p[1], p[2]); SH.SCHOOLIN.lostTap(x + w / 2, y + h / 2); })()`);
      await S(`SH.SCHOOLIN.lostTap(10 + GAME_CONTENT.school.lessons.lost.words.indexOf(${JSON.stringify(it.w)}) * 95 + 44, 264)`);
      for (let i = 0; i < 80 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); }
    }
  };
  const reading = async () => {
    for (let r = 0; r < 6; r++) {
      const b = await S('JSON.stringify((({ age, kind }) => ({ age, kind }))(SH.SCHOOLIN.lesson.books[SH.SCHOOLIN.lesson.i]))').then(JSON.parse);
      const slot = (age, kind) => S(`(() => { const [x, y, w, h] = SH.SCHOOLIN.bookSlotRect('${age}', '${kind}'); SH.SCHOOLIN.bookTap(x + w / 2, y + h / 2); })()`);
      if (r === 3) await slot(b.age === 'new' ? 'old' : 'new', b.kind);
      await slot(b.age, b.kind);
      for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); }
    }
    await S('SH.SCHOOLIN.bookTap(290, 60)'); for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); }
    for (let pg = 0; pg < 4; pg++) {
      if (pg === 3) { await S('SH.SCHOOLIN.bookTap(200, 170)'); break; }
      await S(`(() => { const it = GAME_CONTENT.school.lessons.reading.pages[SH.SCHOOLIN.lesson.page].it.find((i) => i.ok); SH.SCHOOLIN.bookTap(it.x, it.y); })()`);
      for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); }
    }
  };
  const writing = async () => {
    for (let r = 0; r < 5; r++) {
      if (r === 2) await S(`(() => { const [, x] = SH.SCHOOLIN.NEWSKEYS[0]; })()`);
      await S(`(() => { const [a, b] = SH.SCHOOLIN.lesson.xs[0]; SH.SCHOOLIN.newsTap((a + b) / 2, 200); })()`);
      if (r === 2) await S(`SH.SCHOOLIN.newsTap(SH.SCHOOLIN.NEWSKEYS[0][1] + 35, 260)`);
      await S(`SH.SCHOOLIN.newsTap(SH.SCHOOLIN.NEWSKEYS[1][1] + 35, 260)`);
      for (let i = 0; i < 70 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); }
    }
  };
  const PLAY = { english: quiz, math: quiz, music: quiz, pe: quiz, art, lunch, lost, reading, writing };
  const SPOT = { english: 'seat6', math: 'seat6', music: 'spot6_music', pe: 'spot6_gym', art: 'spot6_art', lunch: 'spot6_cafeteria', lost: 'spot6_lobby', reading: 'spot6_library', writing: 'spot6_computer' };

  // ---- the morning
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1 };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); log('the pier:', await lines());
  await S('SH.game.paused = true'); await step(0.2);
  log('card', await card(), '| coins', await coins(), '| coin box', await S(`!document.getElementById('coinBox').classList.contains('hidden')`));
  for (let i = 0; i < 80 && await S('!!SH.ISLE6.tchNow().path || SH.ISLE6.kidList().some((k) => k.path)'); i++) await step(0.5);
  { const L = await S('JSON.stringify(SH.ISLE6.LINE)').then(JSON.parse); await S(`SH.tp(${L.x}, ${L.y})`); for (let i = 0; i < 30 && !(await S('SH.Dialog.open')); i++) await step(0.2); }
  log('the line-up speech:', (await lines()).slice(0, 200) + '...');
  for (let i = 0; i < 120 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
  log('doors open, all in: card', await card(), '| arrow', JSON.stringify(await arrow()));
  { const SC = await S('JSON.stringify(SH.ISLE6.SCHOOL)').then(JSON.parse); await S(`SH.tp(${SC.door}, ${SC.y1 + 30})`); await step(0.2); await S('SH.keys.up = 1'); for (let i = 0; i < 20 && !(await S('SH.SCHOOLIN.here()')); i++) await step(0.1); await S('SH.keys.up = 0'); }
  log('inside:', await lines(), '| card', await card());

  // ---- the timetable
  const TT = await S('JSON.stringify(SH.SCHOOLIN.TIMETABLE.map((t) => t.id))').then(JSON.parse);
  for (let n = 0; n < TT.length; n++) {
    const id = TT[n], c0 = await coins(), next = await S('SH.SCHOOLIN.nextLesson() && SH.SCHOOLIN.nextLesson().id');
    if (next !== id) { issues.push('lesson ' + n + ': next is ' + next + ', not ' + id); log('   !! next', next); }
    const cardGo = await card(), way = await goPlace(id), cardThere = await card();
    log(`== ${n + 1}. ${id} | card "${cardGo}" | arrow ${JSON.stringify(way)} | there "${cardThere}"`);
    const st = await startAt(SPOT[id]);
    await PLAY[id](); const end = await finish();
    log(`   played: buttons ${JSON.stringify(st.buttons)}, his words ${st.said} | end "${end}" | coins ${c0} -> ${await coins()}`);
    if (n === 0 || id === 'lunch' || id === 'writing') await shot('l6-day-' + id + T);
    const bye = await done();
    for (let i = 0; i < 10 && !(await S('SH.Dialog.open')); i++) { await step(0.2); await sleep(60); }
    const after = await lines();
    log('   done:', bye, after ? '| then: ' + after : '', '| day', await S('JSON.stringify(SH.state.school.day)'));
    await step(0.5); await leftovers('after ' + id);
    if (await S('SH.SCHOOLIN.onBreak()')) {
      const brk = await S('SH.state.school.day.br');
      log('   break: clock', await S(`document.getElementById('brk').textContent`), '| card', await card(), '| people inside', await S('SH.SCHOOLIN.people().length'));
      if (n === 0) {          // the first break: out to the garden, play a little, ring the bell
        await S('SH.SCHOOLIN.exit()'); await step(0.6);
        log('   in the garden: kids', await S(`SH.ISLE6.kidList().filter((k) => !k.gone).length`), '| teacher out', await S('!SH.ISLE6.tchNow().gone'), '| card', await card());
        await S(`(() => { const B = SH.ISLE6.BELL; SH.tp(B.x - 20, B.y + 60); })()`); await step(0.3); await talk('bell6'); await step(0.5);
        for (let i = 0; i < 80 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
        log('   the bell: break over', !(await S('SH.SCHOOLIN.onBreak()')), '| card', await card(), '| arrow', JSON.stringify(await arrow()));
        const a = await arrow(); await S(`SH.tp(${a.x}, ${a.y + 30})`); await step(0.2); await S('SH.keys.up = 1'); for (let i = 0; i < 20 && !(await S('SH.SCHOOLIN.here()')); i++) await step(0.1); await S('SH.keys.up = 0'); await lines();
      } else if (n === 1) {          // the second: let it run out (inside)
        await step(brk + 1); log('   ran out: break over', !(await S('SH.SCHOOLIN.onBreak()')), '| big', await S(`document.getElementById('bigMsg') ? document.getElementById('bigMsg').textContent : ''`), '| card', await card());
      } else log('   (ended by going to the next place)');
    }
  }
  log('the day done: card', await card(), '| arrow', JSON.stringify(await arrow()), '| coins', await coins());

  // ---- Kim
  for (let i = 0; i < 10 && !(await S('SH.Dialog.open')); i++) { await step(0.2); await sleep(80); }
  log('the call:', await lines());
  await goPlace('kim');
  log('in the office: nearest', await S('(() => { const o = SH.nearestInteractable(); return o ? o.id : null; })()'));
  await talk('in6_smith');
  const choose = async (pickRight) => { for (let i = 0; i < 60; i++) { if (await S('SH.Dialog.open')) { await lines(); continue; } if (await S('SH.SCHOOLIN.choosing')) break; await step(0.1); await sleep(60); }
    const q = await S(`document.getElementById('lsQ').textContent`); await S(`(() => { const bs = [...document.querySelectorAll('#lsBtns button')], C = GAME_CONTENT.school.finale, q = document.getElementById('lsQ').textContent;
      const t = C.tour.find((x) => q.indexOf(x.q) >= 0), want = t ? t.a : [C.hi, C.recess, C.nurse].find((x) => x.q === q).opts.find((o) => o[1])[0]; bs.find((b) => b.textContent === want).click(); })()`); await sleep(1000); return q; };
  log('Kim:', await choose(), '/', await choose());
  for (let k = 0; k < 4; k++) {
    const q = await choose(); await lines();
    const way = await goPlace('kim ' + k); for (let i = 0; i < 6; i++) await step(0.1);
    log('   ' + q + ' -> walked', JSON.stringify(way), '| kim at', await S('JSON.stringify(SH.SCHOOLIN.kimP && [Math.round(SH.SCHOOLIN.kimP.x), Math.round(SH.SCHOOLIN.kimP.y)])'));
    for (let i = 0; i < 20 && !(await S('SH.Dialog.open')) && !(await S('SH.SCHOOLIN.choosing')); i++) { await step(0.1); await sleep(60); }
    if (k === 1) { for (let i = 0; i < 20 && !(await S('SH.SCHOOLIN.choosing')); i++) { if (await S('SH.Dialog.open')) await lines(); else { await step(0.1); await sleep(60); } } log('   the nurse:', await choose()); }
  }
  for (let i = 0; i < 60 && !(await S(`!!document.getElementById('karne') && !document.getElementById('karne').classList.contains('hidden')`)); i++) { if (await S('SH.Dialog.open')) await lines(); else { await step(0.2); await sleep(80); } }
  log('the report card:', await S(`document.querySelector('#karne .kSheet').innerText.replace(/\\n+/g, ' / ')`));
  await shot('l6-day-karne' + T);
  await S(`document.querySelector('#karne .kOk').click()`); await sleep(1800); await step(0.2);
  for (let i = 0; i < 10 && !(await S('SH.Dialog.open')); i++) { await step(0.2); await sleep(60); } log('after:', await lines(), '| card', await card(), '| coins', await coins());
  await leftovers('after home time');

  // ---- the shop: spend the day's coins
  await S('SH.tp(926, 2250)'); await step(0.3); await talk('in6_penny'); await sleep(300);
  const can = await S(`JSON.stringify(GAME_CONTENT.school.shop.items.filter((x) => x.p <= SH.Coins.get()).map((x) => x.id + ' ' + x.p))`);
  log('the shop: you can buy', can);
  await S(`SH.Shop.tryBuy(GAME_CONTENT.school.shop.items.find((x) => x.id === 'cap'))`); await sleep(1600);
  await S(`SH.Shop.tryBuy(GAME_CONTENT.school.shop.items.find((x) => x.id === 'trophy'))`); await sleep(1600);
  log('   bought', await S('JSON.stringify(SH.state.school.shop)'), '| coins', await coins(), '| she says', await S(`document.getElementById('shopSay').textContent`));
  await S(`document.querySelector('#shop .sX').click()`); await step(0.2); await leftovers('after the shop');

  // ---- out to the ship
  await S('SH.SCHOOLIN.exit()'); await step(0.6); await lines();
  log('the garden: card', await card(), '| coin box', await S(`!document.getElementById('coinBox').classList.contains('hidden')`));
  await S('SH.ISLE6.shipTalk()'); await sleep(300); log('the ship, the first time: Sparky on coins at home:', await lines()); await sleep(300); log('the ship: where to?', await S(`(() => { const e = document.getElementById('seaPick'); return !!e && !e.classList.contains('hidden'); })()`));
  await S('SH.game.paused = false');
  log('the day in words: ' + W.lines + ' lines of dialog, ' + W.words + ' words');
  log('ISSUES:', issues.length ? '\n  ' + issues.join('\n  ') : 'none');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-8)));
}
