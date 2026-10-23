// Level 6: the This & That Corner on the school island. Sparky's word the first time; walking about, the tags over the
// tables change (near: THIS / THESE, far: THAT / THOSE); the poster; Play on the star: 10 rounds (8 right, 2 wrong here),
// the sentence after each, the right word after a wrong one, the score, stars, the best kept (on the child's own screen only); "One more round?": Continue (a second round), Done (closed); no ✕ in a round; the student list gets the number of games, not the score; keys 1-4.
// The page's own clock is stopped: the steps here move the game. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const tags = () => S(`JSON.stringify(['near', 'far'].map((k) => SH.ISLE6.ttTagText(k).text))`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1 };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true');
  const A = await S('JSON.stringify(SH.ISLE6.TT)').then(JSON.parse);
  // the first time in the corner
  await S(`SH.tp(${A.star.x}, ${A.star.y + 30})`); await step(0.3);
  log('Sparky, the first time:', await lines());
  log('on the star: tags', await tags());
  await shot('l6-tt-near' + T);
  await S(`SH.tp(${A.far.x + 50}, ${A.far.y + 30})`); await step(0.3);
  log('by the far table: tags', await tags());
  await shot('l6-tt-far' + T);
  await S(`SH.tp(${A.poster.x}, ${A.poster.y + 60})`); await step(0.2); await talk('ttposter6'); log('the poster:', await lines());
  await shot('l6-tt-poster' + T);
  // a game
  await S(`SH.tp(${A.star.x + 20}, ${A.star.y + 40})`); await step(0.2);
  log('a Play button on the star:', await S(`(() => { const o = SH.interactables().find((o) => o.id === 'tt6'); return o && o.label; })()`));
  const T0 = await S('JSON.stringify((({ k, x, y }) => ({ k, x: Math.round(x), y: Math.round(y) }))(SH.ISLE6.tchNow()))');
  await talk('tt6'); await step(0.2);
  const bub = () => S(`(() => { const e = document.getElementById('tchB'); return e && !e.classList.contains('hidden') ? e.lastChild.textContent : ''; })()`);
  { let i = 0; for (; i < 60 && (await S('SH.ISLE6.tchNow().k')) !== 'coach'; i++) await step(0.25);
    log('Batuhan Teacher comes over: from', T0, 'in', (i * 0.25).toFixed(1), 's | stands at', await S('JSON.stringify([Math.round(SH.ISLE6.tch.x), Math.round(SH.ISLE6.tch.y)])'), '| says', await bub()); }
  await S('(() => { const R = SH.ISLE6.tt; R.n = 0; R.right = 0; R.bag = SH.ISLE6.ttBag(); SH.ISLE6.ttNext(); })()');          // (the rounds from the start, with him there)
  log('the bar:', await S(`!document.getElementById('tt').classList.contains('hidden')`), '|', await S(`document.getElementById('ttN').textContent + ' ' + document.getElementById('ttQ').textContent`), '| buttons', await S(`[...document.querySelectorAll('#ttBtns button')].map((b) => b.textContent).join(' / ')`));
  log('you stay on the star:', await S(`(() => { SH.keys.up = 1; SH.step(1 / 30, 20); SH.keys.up = 0; return Math.round(Math.hypot(SH.player.x - ${A.star.x}, SH.player.y - ${A.star.y})); })()`), 'away | nothing else to talk to', await S('SH.interactables().length === 0'));
  await shot('l6-tt-ask' + T);
  const kinds = [];
  for (let r = 0; r < 10; r++) {
    const q = await S(`JSON.stringify((({ near, many, answer, thing }) => ({ near, many, answer, thing: thing[0] }))(SH.ISLE6.tt))`).then(JSON.parse);
    const shown = await S(`JSON.stringify(SH.ISLE6.ttSlots2D('near').concat(SH.ISLE6.ttSlots2D('far')))`).then(JSON.parse);
    const okShown = (q.near ? shown.slice(0, 3) : shown.slice(3)).filter(Boolean).length === (q.many ? 3 : 1) && (q.near ? shown.slice(3) : shown.slice(0, 3)).every((e) => !e);
    const pick = r === 3 || r === 7 ? (q.answer + 1) % 4 : q.answer;
    if (r === 5) await S(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '${pick + 1}' }))`);          // (a key, once)
    else await S(`document.querySelectorAll('#ttBtns button')[${pick}].click()`);
    const fb = await S(`document.getElementById('ttQ').textContent + ' | ' + document.getElementById('ttS').textContent`);
    kinds.push((q.near ? 'near' : 'far') + (q.many ? '3' : '1') + (okShown ? '' : '!') + ' ' + q.thing + ' -> ' + fb + ' || teacher: ' + (await bub()));
    if (r === 3) await shot('l6-tt-wrong' + T);
    if (r === 4) await shot('l6-tt-right' + T);
    if (r === 4) await shot('l6-tt-coach' + T);
    for (let i = 0; i < 40 && await S('SH.ISLE6.tt.picked >= 0 && !SH.ISLE6.tt.done'); i++) await step(0.25);
  }
  log('the rounds:\n  ' + kinds.join('\n  '));
  await step(2.6); log('Batuhan Teacher at the end:', await bub()); await shot('l6-tt-coach-end' + T);
  log('the end:', await S(`document.getElementById('ttN').textContent + ' | ' + document.getElementById('ttQ').textContent + ' | ' + document.getElementById('ttS').textContent`), '| buttons', await S(`[...document.querySelectorAll('#ttBtns button')].map((b) => b.textContent).join(' / ')`), '| saved', await S('JSON.stringify(SH.state.school.tt)'), '| no ✕', await S(`!document.querySelector('#tt .ttX')`));
  await shot('l6-tt-end' + T);
  await S(`document.querySelector('#ttBtns .again').click()`); await step(0.2);
  log('Continue: a new round', await S(`document.getElementById('ttN').textContent`), '| Batuhan Teacher stays', await S('SH.ISLE6.tchNow().k'), '| says', await bub());
  await step(11); log('a child who waits long:', await bub());
  const said2 = [];
  for (let r = 0; r < 10; r++) { await S(`document.querySelectorAll('#ttBtns button')[SH.ISLE6.tt.answer].click()`); said2.push(await bub()); for (let i = 0; i < 40 && await S('SH.ISLE6.tt.picked >= 0 && !SH.ISLE6.tt.done'); i++) await step(0.25); }
  log('round 2, all right, he says:\n    ' + said2.map((x, i) => (i + 1) + '. ' + (x || '-')).join('\n    '));
  log('round 2:', await S(`document.getElementById('ttN').textContent + ' | ' + document.getElementById('ttQ').textContent`), '| games', await S('SH.state.school.tt.plays'));
  await S(`document.querySelector('#ttBtns .done').click()`); await step(0.2);
  await step(0.5); log('after the game Batuhan Teacher goes on:', JSON.stringify(await S('(({ k, coach }) => ({ k, coach }))(SH.ISLE6.tchNow())')));
  log('closed:', await S(`document.getElementById('tt').classList.contains('hidden')`), '| can walk', await S(`(() => { SH.keys.down = 1; SH.step(1 / 30, 15); SH.keys.down = 0; return Math.round(SH.player.y - ${A.star.y}); })()`), '| tags back', await tags());
  // the student list shows how many games (no scores: the teacher's wish), most games first in each class
  await sleep(1400);          // (the 'New best!' word comes a moment after the score)
  log('sent to the list: games', await S('ScoreBoard.entry().look.ttp'), '| no score sent', await S('ScoreBoard.entry().look.tt === undefined'), '| on this device', await S(`JSON.stringify(ScoreBoard.local().map((x) => x.name + ' ' + x.look.ttp))`), '| toast', await S(`document.getElementById('toast').textContent`));
  await S(`localStorage.setItem(ScoreBoard.KEY + '.online', JSON.stringify([
    { id: 'k1', name: 'Ava', cls: 'B', look: { school: 1, ttp: 6 }, wear: [], rounds: 0 }, { id: 'k2', name: 'Tom', cls: 'B', look: { school: 1 }, wear: [], rounds: 2 },
    { id: 'k3', name: 'Finn', cls: 'B', look: { school: 1, ttp: 1 }, wear: ['cape'], rounds: 0 }, { id: 'k4', name: 'Ella', cls: 'A', look: { school: 1, ttp: 3 }, wear: [], rounds: 0 },
    { id: 'k5', name: 'Jack', cls: 'A', look: { school: 1, ttp: 12 }, wear: [], rounds: 0 }])); SH.ISLE6.paintList(ScoreBoard.pick(ScoreBoard.cached(), 'school'))`);
  log('the board by the door:', await S(`JSON.stringify(SH.ISLE6.listRows.map((r) => r.cls + ' ' + r.name + ' ' + ScoreBoard.ttPlays(r)))`));
  const LI = await S('JSON.stringify(SH.ISLE6.LIST)').then(JSON.parse);
  await S(`SH.tp(${LI.x}, ${LI.y + 80})`); await step(0.3); await talk('list6'); await sleep(200);
  log('the list:', await S(`[...document.querySelectorAll('#bdList li')].map((l) => l.textContent + (l.classList.contains('me') ? '*' : '')).join(' | ')`));
  log('the Parrot board still only rounds:', await S(`JSON.stringify(ScoreBoard.pick(ScoreBoard.cached(), 'isle').map((r) => r.name))`));
  await shot('l6-tt-list-panel' + T);
  await S(`document.getElementById('bdOk').click()`); await step(0.3);
  await S(`SH.tp(${LI.x - 20}, ${LI.y + 150})`); await step(0.5);
  if (!T) await S('SH.ISLE6.zoom = 0.62'); await S('SH.step(1 / 60, 1)'); await shot('l6-tt-list-board' + T);
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
