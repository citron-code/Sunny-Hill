// Level 6: Batuhan Teacher's round on the island after the quiz (the uniform and the student list done): the gate, water
// the flowers, read the student list, a nap on a bench (talk to him: "I was not sleeping"), ring the bell, in goal (a shot
// at him is saved), the crab on the south beach (it runs, he chases, lunges, misses, it gets into the sea), back to the
// gate. Before the quiz he stays at the gate. The page's own clock is stopped: the steps here move the game. FLAT=1: 2D.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const tch = () => S(`JSON.stringify((({ k, x, y, sitting, path }) => ({ k, x: Math.round(x), y: Math.round(y), sitting: !!sitting, walking: !!path }))(SH.ISLE6.tchNow()))`).then(JSON.parse);
  const bub = () => S(`(() => { const e = document.getElementById('tchB'); return e && !e.classList.contains('hidden') ? '💬 ' + e.lastChild.textContent : '(no bubble)'; })()`);          // (his words: a bubble beside him, not a message in the middle)
  const mid = () => S(`(() => { const e = document.getElementById('toast'); return e && !e.classList.contains('hidden') && /Heh|flowers|crab|Saved|Ding/.test(e.textContent) ? 'IN THE MIDDLE: ' + e.textContent : 'nothing in the middle'; })()`);
  const story = (school) => S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = ${JSON.stringify(school)};
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  // before the quiz: at the gate
  await story({ stage: 'land', met: 1 });
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true');
  await S('SH.tp(1150, 5300)'); await step(40);
  log('before the quiz, after 40 s:', JSON.stringify(await tch()));
  // after it: his round (you far away, in the playground)
  await story({ stage: 'pass', met: 1, tries: 1, best: 30, yard: 1, uniform: 1, listed: 1 });
  const seen = [], far = 'SH.tp(1150, 5300)';
  await S(far);
  let last = '', napTalk = '', saved = '', crab = null;
  for (let i = 0; i < 520; i++) {
    await step(0.5);
    const t = await tch();
    if (t.k !== last) { last = t.k; seen.push(t.k + (t.walking ? '' : ' @' + t.x + ',' + t.y)); }
    if (t.k === 'water' && !seen.includes('shot water')) { seen.push('shot water'); await S(`SH.tp(${t.x + 30}, ${t.y + 110})`); await step(0.1); await S("SH.ISLE6.tchSay('water')"); await step(0.2); log('watering:', await bub(), '|', await mid()); await shot('l6-tch-water' + T); await S(far); }
    if (t.k === 'nap' && !napTalk) {          // talk to him on his bench
      await S(`SH.tp(${t.x}, ${t.y + 70})`); await step(0.2); await shot('l6-tch-nap' + T);
      await S(`SH.interact(SH.interactables().find((o) => o.id === 'teacher6'))`); napTalk = await lines(); await S(far);
    }
    if (t.k === 'keeper' && !saved) {          // a shot straight at him
      await step(1); const g = await S('JSON.stringify(SH.ISLE6.GOALS[0])').then(JSON.parse), k = await tch();
      await S(`Object.assign(SH.ISLE6.ball, { x: ${k.x + 90}, y: ${k.y}, vx: 0, vy: 0, h: 0, vh: 0, goalT: 0, cool: 0 }); SH.ISLE6.kid('ben').hx = SH.ISLE6.kid('ben').x; SH.tp(${k.x + 130}, ${k.y})`);
      await S('SH.keys.left = 1'); await step(0.6); await S('SH.keys.left = 0'); await step(0.4);
      saved = (await bub()) + ' | ' + (await mid()) + ' | goals ' + (await S('SH.state.school.goals | 0'));
      await shot('l6-tch-keeper' + T); await S(far);
    }
    if (t.k === 'crab' && !crab) {
      crab = await S(`JSON.stringify({ x: Math.round(SH.ISLE6.crabRun.x), y: Math.round(SH.ISLE6.crabRun.y) })`);
      await S(`SH.tp(${t.x + 40}, ${t.y - 90})`); await step(3); await shot('l6-tch-crab' + T);
      log('the chase, 3 s in: crab', crab, '->', await S(`JSON.stringify({ x: Math.round(SH.ISLE6.crabRun.x), y: Math.round(SH.ISLE6.crabRun.y) })`), '| teacher', JSON.stringify(await tch()), '|', await bub(), '|', await mid());
      { const said = new Set(); for (let j = 0; j < 30 && await S('!!SH.ISLE6.crabRun'); j++) { await S('(() => { const T = SH.ISLE6.tchNow(); SH.player.x = T.x + 40; SH.player.y = T.y - 90; })()'); await step(0.5); const b = await bub(); if (b[0] !== '(') said.add(b); }
        log('  his bubbles during the chase:', [...said].join(' / ') || 'none', '|', await mid()); }
      log('the crab got away:', await S('!SH.ISLE6.crabRun'), '| it lives on at', await S('JSON.stringify([Math.round(SH.ISLE6.CRABS[0].x), Math.round(SH.ISLE6.CRABS[0].y)])'), '| on the sand', await S('(() => { const c = SH.ISLE6.CRABS[0]; return SH.ISLE6.coastD(c.x, c.y) > 0; })()'));
      await S(far);
    }
    if (t.k === 'gate' && seen.filter((x) => x.startsWith('gate')).length > 1 && !t.walking) break;
  }
  log('his round:', seen.filter((x) => !x.startsWith('shot')).join(' → '));
  log('woken up on the bench:', napTalk.slice(0, 160));
  log('a shot at the keeper:', saved);
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
