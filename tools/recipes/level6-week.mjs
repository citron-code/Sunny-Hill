// The school day on this week's topics (GAME_CONTENT.weeks; unit 3 week 2: there is / there are, the garden, the pond).
// English (pond words; one or many), math (frogs and fish: there are ...), music (the pond song; listen; one or many) and PE
// (there is / there are, then shoot) are played through; art: a pond to paint (all ten parts); reading: the books about
// nature on their shelves; writing: the newspaper's first words. Then with wkOff the lessons have their own words again.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const snapShot = async (n) => { await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render()"); await shot(n); };
  const L = (e) => S(`(() => { const L = SH.SCHOOLIN.lesson; return ${e}; })()`);
  const pSay = () => S(`document.getElementById('pSay').textContent`);
  await S('window.SH_WEEK = 1');          // (this week's words, as in the game)
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), in: 1, n: 0 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await step(0.3); await sleep(1200);
  log('this week:', await S('SH.SCHOOLIN.week() && SH.SCHOOLIN.week().id'), '| boards', await S(`['english','math','music','pe','art','reading','writing'].map((id) => LESSON(id).board).join(' / ')`));
  const explain = async () => { const ex = []; for (let i = 0; i < 400 && await L('!!L && L.ph === "explain"'); i++) { if (await S('SH.Dialog.open')) { ex.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } else { await step(0.15); await sleep(40); } } return ex; };
  const stop = async () => { await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lsStop()'); await lines(); await step(0.2); };
  for (const [id, pic] of [['english', 1], ['math', 1], ['music', 0], ['pe', 0]]) {
    await S(`SH.SCHOOLIN.lsSit(${JSON.stringify(id)})`); await sleep(600);
    const ex = await explain(), qs = [];
    for (let i = 0; i < 500 && await L('!!L && L.ph === "q"'); i++) {
      if (await S('SH.Dialog.open')) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); continue; }
      const r = await L('(() => { const Q = L.qs[L.n]; if (!Q || L.picked >= 0) return null; SH.SCHOOLIN.lsAnswer(Q.opts.indexOf(Q.ans)); return Q.t + " " + (Q.full || Q.ans); })()');
      if (r) { qs.push(r); if (qs.length === 4 && pic) await snapShot('l6-week-' + id + T); }
      await step(0.25); await sleep(30);
    }
    log(id + ':', ex.length, 'lines (' + ex.slice(1, 3).join(' | ') + ')\n   ', qs.length, 'answers:', qs.join(' / '), '| right', await L('L && L.right'));
    await stop();
  }
  // art: the apron, then the pond's ten parts
  await S(`SH.SCHOOLIN.lsSit('art')`); await sleep(600); await explain(); await step(0.2);
  await S(`SH.SCHOOLIN.artApron('apron')`); await sleep(1700); await step(0.1);
  const steps = [], tapPart = (part) => S(`(() => { const [x, y] = SH.SCHOOLIN.ART2.center[${JSON.stringify(part)}]; SH.SCHOOLIN.artTap(x, y); })()`);
  for (let r = 0; r < 10 && await L('!!L && L.ph === "paint"'); r++) {
    const St = JSON.parse(await L('JSON.stringify(L.steps[L.i])'));
    await S(`SH.SCHOOLIN.artTool('${St.tool}'); SH.SCHOOLIN.artColor('${St.free ? 'purple' : St.color}')`);
    if (St.tool === 'pencil' && await L('L.dull')) { await tapPart(St.part); await S('SH.SCHOOLIN.artSharpen()'); }
    await tapPart(St.part);
    steps.push(St.part + ' ' + (St.color || 'free') + ' ' + St.tool + ' -> ' + await pSay());
    for (let i = 0; i < 40 && await L('!!L && L.busy'); i++) { await sleep(100); await step(0.05); }
    if (r === 5) await snapShot('l6-week-art' + T);
  }
  log('art:', steps.join('\n    '), '\n    painting', await S('JSON.stringify(SH.state.school.artPic || null)'), '| right', await L('L && L.right'));
  await stop();
  // reading: the books' kinds; the first two on their shelves
  await S(`SH.SCHOOLIN.lsSit('reading')`); await sleep(600); const rex = await explain(); await step(0.2);
  const books = [];
  for (let r = 0; r < 2; r++) {
    const b = JSON.parse(await L('JSON.stringify(L.books[L.i])'));
    books.push(b.age + ' ' + b.kind + ': ' + await pSay());
    await S(`(() => { const [x, y, w, h] = SH.SCHOOLIN.bookSlotRect(${JSON.stringify(b.age)}, ${JSON.stringify(b.kind)}); SH.SCHOOLIN.bookTap(x + w / 2, y + h / 2); })()`);
    books.push('   -> ' + await pSay());
    for (let i = 0; i < 40 && await L('!!L && L.busy'); i++) { await sleep(100); await step(0.05); }
  }
  await snapShot('l6-week-reading' + T);
  log('reading:', rex.slice(2, 4).join(' | '), '\n   ', books.join('\n    '), '| kinds', await S('SH.SCHOOLIN.bookKinds().join()'));
  await stop();
  // writing: the newspaper's words
  await S(`SH.SCHOOLIN.lsSit('writing')`); await sleep(600); const wex = await explain(); await step(0.2);
  log('writing:', wex.slice(2, 5).join(' | '), '| now:', await pSay());
  await stop();
  // without this week: the lessons' own words
  await S('SH.SCHOOLIN.wkOff = true'); log('own words again:', await S(`['english','math','pe','art'].map((id) => LESSON(id).board).join(' / ')`), '| art picture', await S('SH.SCHOOLIN.artK()')); await S('SH.SCHOOLIN.wkOff = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
