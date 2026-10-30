// Free play after the school: on Sunny Hill the dock (fishing), the orchard (apples with Uncle Max), the meadow (a kite),
// Dr. Fizz's table (colour potions). Each place: can you stand there, is its button the nearest. Then each game is played:
// fishing and apples ask this / that / these / those and give Sunny Coins; the kite and the potions do not.
// The coin box: shown on Sunny Hill too; tapping it, Sparky says where to get coins. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const o = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { o.push(await S('SH.Dialog.who + ": " + SH.Dialog.text')); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return o.join(' | '); };
  const say = () => S(`document.getElementById('fN').textContent + ' | ' + document.getElementById('fSay').textContent`);
  const btns = () => S(`[...document.querySelectorAll('#fBtns button')].map((b) => b.textContent).join(' / ')`);
  const coins = () => S('SH.Coins.get()');
  const waitBtns = async (re) => { for (let i = 0; i < 80; i++) { if (new RegExp(re).test(await btns())) return true; await sleep(100); } return false; };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, inside: 1, days: 1, coins: 100, home: '01.01.2026' };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save(); SH.Hud.refresh();`);
  await S('SH.game.paused = true'); await step(0.2);
  log('coin box on Sunny Hill:', await S(`!document.getElementById('coinBox').classList.contains('hidden')`), '| coins', await coins());
  await S(`document.getElementById('coinBox').click()`); log('   tapped:', await lines());
  for (const id of ['fish', 'apples', 'kite', 'potion']) {
    const p = await S(`JSON.stringify(SH.FUN.SPOT.${id})`).then(JSON.parse);
    await S(`SH.tp(${p.x}, ${p.y + 22})`); await step(0.3);
    log(id, 'spot', JSON.stringify(p), '| free', await S(`SH.circleFree(${p.x}, ${p.y + 22}, 13)`), '| path', await S(`!!SH.findPath(${id === 'potion' ? '2752, 600' : '1200, 1100'}, ${p.x}, ${p.y + 22})`), '| nearest', await S('(() => { const o = SH.nearestInteractable(); return o ? o.id + " " + o.label : null; })()'));
    await S("document.getElementById('toast').classList.add('hidden')"); await shot('fun-spot-' + id + T);
  }
  log('the lab: its exit spot free', await S('SH.circleFree(2830, 566, 13)'), '| the way from the bridge to its door', await S('!!SH.findPath(2540, 622, 2830, 540)'));
  // fishing
  let c0 = await coins();
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_fish'))`); await sleep(300);
  log('fishing:', await say(), '| mode', await S('SH.game.mode'));
  for (let r = 0; r < 6; r++) {
    await waitBtns('Cast'); await S(`document.querySelector('#fBtns button').click()`);
    await waitBtns('Pull'); if (r === 0) await shot('fun-fish-bite' + T); await S(`document.querySelector('#fBtns button').click()`);
    await waitBtns('This'); if (r < 4) await shot('fun-fish-ask' + r + T);
    const k = await S('SH.FUN.G.kinds[SH.FUN.G.r]'), pick = r === 2 ? (k + 1) % 4 : k;
    const before = await say(); await S(`document.querySelectorAll('#fBtns button')[${pick}].click()`);
    log('   cast', r + 1, 'kind', k, '|', before, '->', await say()); await sleep(1000);
  }
  await waitBtns('Again'); log('   end:', await say(), '| coins', c0, '->', await coins(), '| album', await S('JSON.stringify(SH.state.fun.fish)')); await shot('fun-fish-end' + T);
  await S(`document.querySelectorAll('#fBtns button')[1].click()`); await step(0.1);
  // apples
  c0 = await coins();
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_apples'))`); await sleep(2200);
  for (let r = 0; r < 6; r++) {
    for (let i = 0; i < 40 && !(await S('!!SH.FUN.G.near && !SH.FUN.G.done')); i++) await sleep(100);
    const o = await S('JSON.stringify((({ k, isFar, many, color, need }) => ({ k, isFar, many, color, need }))(SH.FUN.G))').then(JSON.parse), order = await say();
    if (r === 0) await shot('fun-apples-order' + T);
    if (r === 1) { await S(`(() => { const G = SH.FUN.G, L = G.isFar ? G.near : G.far, a = L.find((a) => a.on); { const q = SH.G3.on && a.p3 ? a.p3 : a; SH.FUN.appleTap(q.x, q.y); }; })()`); log('   the other tree:', await say()); await shot('fun-apples-wrong' + T); }
    await S(`(() => { const G = SH.FUN.G, L = G.isFar ? G.far : G.near; for (const a of L.filter((a) => a.on && a.col === G.color)) { const q = SH.G3.on && a.p3 ? a.p3 : a; SH.FUN.appleTap(q.x, q.y); }; })()`);
    log('   order', r + 1, JSON.stringify(o), '|', order, '->', await say()); await sleep(1700);
  }
  await waitBtns('Again'); log('   end:', await say(), '| coins', c0, '->', await coins()); await shot('fun-apples-end' + T);
  await S(`document.querySelectorAll('#fBtns button')[1].click()`); await step(0.1);
  // the kite (shortened: steered to the balloons)
  c0 = await coins();
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_kite'))`); await sleep(400);
  await S('SH.FUN.G.time = 12');
  for (let i = 0; i < 95; i++) { await S('(() => { const G = SH.FUN.G, b = G && G.balls.filter((b) => b.x > 100).sort((p, q) => p.x - q.x)[0]; if (G) G.hold = !!b && b.y < G.ky; })()'); if (i === 50) await shot('fun-kite' + T); await sleep(100); }          // (up and down to the next balloon)
  log('kite: popped while steering', await S('SH.FUN.G.popped')); await S('SH.FUN.G.time = 0.3');
  await waitBtns('Again'); log('kite:', await say(), '| coins', c0, '->', await coins());
  await S(`document.querySelectorAll('#fBtns button')[1].click()`); await step(0.1);
  // the potions
  c0 = await coins();
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_potion'))`); await sleep(5200);
  const MIX = { purple: ['red', 'blue'], green: ['blue', 'yellow'], orange: ['red', 'yellow'], pink: ['red', 'white'], lightblue: ['blue', 'white'] }, BX = { red: 60, blue: 153, yellow: 246, white: 339 };
  for (let r = 0; r < 5; r++) {
    for (let i = 0; i < 40 && await S('SH.FUN.G.busy'); i++) await sleep(100);
    const goal = await S('SH.FUN.G.goals[SH.FUN.G.r]'), ask = await say();
    if (r === 0) { await S(`SH.FUN.potTap(...SH.FUN.tapAt3('yellow', ${BX.yellow})); SH.FUN.potTap(...SH.FUN.tapAt3('white', ${BX.white}))`); await sleep(1200); log('   a wrong mix:', await say()); await shot('fun-potion-wrong' + T); for (let i = 0; i < 40 && await S('SH.FUN.G.busy'); i++) await sleep(100); }
    const [a, b] = MIX[goal]; await S(`SH.FUN.potTap(...SH.FUN.tapAt3('${a}', ${BX[a]})); SH.FUN.potTap(...SH.FUN.tapAt3('${b}', ${BX[b]}))`); await sleep(1200);
    log('   potion', r + 1, ask, '->', await say()); if (r === 1) await shot('fun-potion-right' + T); await sleep(1600);
  }
  await waitBtns('Again'); log('   end:', await say(), '| coins', c0, '->', await coins());
  await S(`document.querySelectorAll('#fBtns button')[1].click()`); await step(0.1);
  log('after: mode', await S('SH.game.mode'), '| saved', await S('JSON.stringify(SH.state.fun)'));
  // the ship from the school the first time: Sparky tells where to get coins
  await S('SH.ISLE6.land()'); await lines(); await S('SH.ISLE6.shipTalk()'); log('the school ship, the first time:', await lines());
  await S('SH.ISLE6.shipTalk()'); await sleep(300); log('   the second time: the pick', await S(`(() => { const e = document.getElementById('seaPick'); return !!e && !e.classList.contains('hidden'); })()`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
