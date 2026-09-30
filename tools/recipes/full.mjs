// Plays the whole game, quests 1-8, then reloads and checks the save. Takes a screenshot at every step
// worth looking at. Some answers are wrong on purpose so "Try again!" and the glowing hint are exercised.
export default async function ({ evaluate, shot, sleep, navigate, URL, viewport }) {
  // software WebGL is slow at full size; VIEW=640x400 keeps the 3D run close to real time
  if (process.env.VIEW) { const [vw, vh] = process.env.VIEW.split("x").map(Number); await viewport(vw, vh); }
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  const t0 = Date.now();
  const fail = (m) => { throw new Error(m); };

  async function waitFor(expr, ms = 8000, what = expr) {
    for (let t = 0; t < ms; t += 100) { if (await S(expr)) return; await sleep(100); }
    fail('timed out waiting for ' + what);
  }
  async function nextAll(tag) {
    const lines = [];
    for (let i = 0; i < 30; i++) {
      if (!(await S('SH.Dialog.open'))) break;
      lines.push(await S(`(SH.Dialog.who||'-') + ': ' + SH.Dialog.text`));
      await sleep(400);
      await S(`document.getElementById('dlgNext').click()`);
      await sleep(60);
    }
    log(`  [${tag}]`, lines.join(' | '));
  }
  // Stand next to something and use it (Talk / Take / Put / Give / Open / Look).
  async function use(id) {
    await waitFor(`SH.game.mode === 'play'`, 8000, 'play mode before ' + id);
    const ok = await S(`(() => {
      const it = SH.interactables().find(o => o.id === ${JSON.stringify(id)});
      if (!it) return false;
      SH.tp(it.x, it.y + 34); SH.step(1 / 60, 2);
      const again = SH.interactables().find(o => o.id === ${JSON.stringify(id)});
      SH.interact(again); return true;
    })()`);
    if (!ok) fail('nothing to use: ' + id + ' ' + JSON.stringify(await S('SH.interactables().map(o => o.id + ":" + o.label)')));
    await sleep(150);
  }
  async function walkTo(x, y, until, ms = 15000) {
    await S(`SH.walkTo(${x}, ${y})`);
    for (let t = 0; t < ms; t += 200) {
      if (until && await S(until)) return;
      if (!until && !(await S('SH.player.path'))) return;
      await sleep(200);
    }
    if (until) fail('walk never reached: ' + until);
  }
  const mg = (v) => S(`(() => { const b = document.querySelector('#mgBody [data-v="${v}"]'); if (!b) return false; b.click(); return true; })()`);
  const mgOpen = () => S(`SH.game.mode === 'minigame'`);
  const prompt = () => S(`document.getElementById('mgPrompt').textContent`);
  const stars = () => S('SH.state.stars');

  await S('SH.quickStart("Ayşe")');
  await nextAll('intro');

  // ---------------- Quest 1
  await use('milo'); await nextAll('Q1 milo');
  for (let k = 0; k < 2; k++) { const id = await S(`SH.Quests.target().id`); await use(id); await nextAll('Q1 ' + id); }
  await use('treehouse'); await nextAll('Q1 treehouse');
  await use('milo'); await nextAll('Q1 finish');
  log('Q1 stars', await stars());
  await sleep(3200);

  // ---------------- Quest 2: photo
  log('card:', await S(`document.getElementById('qcText').textContent`), '| marker mom:', await S(`SH.Quests.marker('mom')`));
  await use('mom'); await nextAll('Q2 intro');
  await waitFor(`SH.game.mode === 'minigame'`);
  for (let i = 0; i < 6; i++) {
    const p = await prompt(); const want = p.replace('Where is the ', '').replace('?', '');
    if (i === 0) { await mg(want === 'father' ? 'mother' : 'father'); await sleep(500); await shot('40-q2-wrong-hint'); }
    await mg(want); await sleep(250);
    if (i === 0) await shot('41-q2-right');
    await waitFor(`!document.getElementById('mgPrompt').textContent.startsWith('Yes') || SH.game.mode !== 'minigame'`, 9000, 'Q2 next question');
  }
  await waitFor(`SH.Dialog.open`); await nextAll('Q2 finish');
  log('Q2 stars', await stars(), 'unlocked', await S('JSON.stringify(SH.state.unlocked)'), 'wear', await S('JSON.stringify(SH.state.wear)'));
  await sleep(3200);
  await shot('42-after-q2-hat');

  // ---------------- Quest 3: chores
  await use('rosa'); await nextAll('Q3 intro');
  await sleep(300); await shot('43-q3-mess');
  const items = await S('SH.CHORE_ITEMS.map(i => [i.id, i.target])');
  let firstWrong = true;
  for (const [id, target] of items) {
    await use(id);
    if (firstWrong) {
      await sleep(300); await shot('44-q3-carry');
      const wrong = target === 'basket' ? 'shelf' : 'basket';
      await use(wrong); await sleep(200); await use(wrong); await sleep(300);
      log('  hint glow on:', await S('SH.Quests.hintId()'));
      await shot('45-q3-hint'); firstWrong = false;
    }
    await use(target); await sleep(200);
  }
  log('  placed', await S('JSON.stringify(SH.state.q.placed)'));
  await sleep(300); await shot('46-q3-done');
  await use('rosa'); await nextAll('Q3 finish');
  log('Q3 stars', await stars());
  await sleep(3000);

  // ---------------- Quest 4: animals
  log('herd before:', await S(`JSON.stringify(SH.HERD.map(a => [a.id, a.st, Math.round(a.x), Math.round(a.y)]))`));
  await use('nomi'); await nextAll('Q4 intro');
  // the horse: walk there for real, then lead it home
  const horse = await S(`(() => { const a = SH.HERD.find(a => a.id === 'horse'); return [a.x, a.y]; })()`);
  await walkTo(horse[0], horse[1] + 20, `SH.HERD.find(a => a.id === 'horse').st === 'follow'`);
  for (const id of ['goat', 'lamb']) {
    const p = await S(`(() => { const a = SH.HERD.find(a => a.id === '${id}'); return [a.x, a.y]; })()`);
    await walkTo(p[0], p[1] + 20, `SH.HERD.find(a => a.id === '${id}').st === 'follow'`, 20000);
  }
  await sleep(600); await shot('47-q4-following');
  await walkTo(360, 940, `SH.state.q.home.length >= 3`, 30000);
  await sleep(2500); await shot('48-q4-pen');
  await use('nomi'); await nextAll('Q4 finish');
  log('Q4 stars', await stars(), 'unlocked', await S('JSON.stringify(SH.state.unlocked)'));
  await sleep(3200);

  // ---------------- Quest 5: where do they live
  await use('bob'); await nextAll('Q5 intro');
  await waitFor(`SH.game.mode === 'minigame'`);
  const qs = await S(`SH.Quests.content().questions.map(q => q.answer)`);
  for (let i = 0; i < qs.length; i++) {
    if (i === 1) {
      const wrong = await S(`[...document.querySelectorAll('#mgBody [data-v]')].map(b => b.dataset.v).find(v => v !== '${qs[i]}')`);
      await mg(wrong); await sleep(300); await mg(wrong); await sleep(500); await shot('50-q5-hint');
    }
    if (i === 0) { await sleep(300); await shot('49-q5'); }
    await mg(qs[i]); await sleep(200);
    await waitFor(`SH.game.mode !== 'minigame' || !document.querySelector('#mgBody .pick.ok')`, 9000, 'Q5 next');
  }
  await waitFor(`SH.Dialog.open`); await nextAll('Q5 finish');
  log('Q5 stars', await stars());
  await sleep(3000);

  // ---------------- Quest 6: bedtime
  await use('lily'); await nextAll('Q6 intro');
  await sleep(1500); await shot('51-q6-evening');
  for (const id of ['pjPip', 'pjPop']) {
    const p = await S(`(() => { const p = SH.PAJAMAS.find(p => p.id === '${id}'); return [p.x, p.y]; })()`);
    if (id === 'pjPip') { await S(`SH.tp(${p[0] - 60}, ${p[1] + 10})`); await sleep(300); await shot('52-q6-behind-haystack'); }
    await use(id); await use('lily'); await sleep(300);
    if (await S('SH.Dialog.open')) break;
  }
  await nextAll('Q6 sort intro');
  await waitFor(`SH.game.mode === 'minigame'`);
  await sleep(300); await shot('53-q6-cards');
  await mg('2'); await sleep(400); await mg('1'); await sleep(500);
  await shot('54-q6-cards-wrong');
  // taps during the short pause after a correct card are ignored, so keep tapping until the card sits in its slot
  for (let k = 0; k < 3; k++) {
    await waitFor(`(() => { const b = document.querySelector('#mgBody [data-v="${k}"]'); if (!b || b.parentElement.classList.contains('slot')) return true; b.click(); return false; })()`, 9000, 'Q6 card ' + k);
  }
  await shot('55-q6-cards-done');
  await waitFor(`SH.Dialog.open`, 12000); await sleep(600); await shot('56-q6-sleeping');
  await nextAll('Q6 finish');
  log('Q6 stars', await stars(), 'unlocked', await S('JSON.stringify(SH.state.unlocked)'));
  await sleep(3000);

  // ---------------- Quest 7: true or false
  await use('owl'); await nextAll('Q7 intro');
  await waitFor(`SH.game.mode === 'minigame'`);
  const answers = await S(`SH.Quests.content().statements.map(s => s.answer)`);
  for (let i = 0; i < answers.length; i++) {
    if (i === 2) { await mg(answers[i] ? 'down' : 'up'); await sleep(500); await shot('57-q7-wrong'); }
    await mg(answers[i] ? 'up' : 'down'); await sleep(1100);
    if (i === 2) await shot('58-q7-right');
    await S(`document.getElementById('mgNext').click()`); await sleep(250);
  }
  await waitFor(`SH.Dialog.open`); await nextAll('Q7 finish');
  log('Q7 stars', await stars(), 'house unlocked', await S('SH.LANDMARK.myHouse.unlocked'));
  await waitFor(`SH.Dialog.open`, 6000, 'Sparky unlock dialog'); await nextAll('Q8 unlock');

  // ---------------- Quest 8: my family
  await S(`SH.tp(SH.DOOR.x, SH.DOOR.y + 70)`); await sleep(400); await shot('59-q8-door');
  await use('door');
  await waitFor(`SH.game.mode === 'minigame'`);
  for (const m of ['mother', 'father', 'sister', 'aunt', 'cousin', 'cousin', 'grandmother']) { await mg(m); await sleep(120); }
  await S(`document.querySelector('#mgBody .undoRow button').click()`); await sleep(200);
  await shot('60-q8-family');
  await S(`document.getElementById('mgNext').click()`); await sleep(300);
  await mg('7'); await sleep(300); await shot('61-q8-age');
  await S(`document.getElementById('mgNext').click()`); await sleep(300);
  await mg('japan'); await sleep(200); await mg('turkey'); await sleep(300); await shot('62-q8-country');
  await S(`document.getElementById('mgNext').click()`); await sleep(600);
  log('  result:', JSON.stringify(await S(`[...document.querySelectorAll('#mgBody .lines div')].map(d => d.textContent)`)));
  await shot('63-q8-result');
  await S(`document.getElementById('mgNext').click()`);
  await waitFor(`SH.game.mode === 'cert'`, 8000, 'certificate');
  await sleep(1200); await shot('64-certificate');
  log('FINAL stars', await stars(), 'finished', await S('SH.state.finished'), 'date', await S('SH.state.finishedAt'), 'unlocked', await S('JSON.stringify(SH.state.unlocked)'));
  await S(`document.getElementById('certWalk').click()`); await sleep(300);
  log('card after:', await S(`document.getElementById('qcText').textContent`));
  await use('mirror'); await sleep(300); await shot('65-wardrobe');
  await S(`document.getElementById('wdOk').click()`);
  log('total time (s):', ((Date.now() - t0) / 1000).toFixed(0));
  log('NPCs away from home:', await S(`JSON.stringify(Object.values(SH.NPC).filter(n => !n.hidden && Math.hypot(n.x - n.home.x, n.y - n.home.y) > 30).map(n => [n.id, Math.round(n.x), Math.round(n.y), !!n.path]))`));
  log('herd:', await S(`JSON.stringify(SH.HERD.map(a => [a.id, a.st, Math.round(a.x), Math.round(a.y)]))`));

  await navigate(URL); await sleep(400);
  log('after reload: mode', await S('SH.game.mode'), 'stars', await stars(), 'finished', await S('SH.state.finished'),
    'family', await S('JSON.stringify(SH.state.family)'), 'title hi:', await S(`document.getElementById('titleHi').textContent`));
  await shot('66-title-return');
}
