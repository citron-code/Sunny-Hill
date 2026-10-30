// Free play, part 2: the camera (📷 at the top) and the photo album on Sunny Hill; the treasure map in the old chest in the
// forest (three X, dig, this / that, the chest); hide and seek with Pip and Pop (count to ten, Sparky's clues, found);
// the race on the school island's sports field (Ready... Steady... Go!, first, second...). Each place: free, reachable.
// VIEW=844x390: a phone. The page's own clock is stopped for the race: the steps here move the game. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = (process.env.FLAT ? '-2d' : '') + (process.env.VIEW ? '-' + process.env.VIEW : '');
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const o = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { o.push(await S('SH.Dialog.who + ": " + SH.Dialog.text')); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return o.join(' | '); };
  const say = () => S(`document.getElementById('fN').textContent + ' | ' + document.getElementById('fSay').textContent`);
  const btns = () => S(`[...document.querySelectorAll('#fBtns button')].map((b) => b.textContent).join(' / ')`);
  const coins = () => S('SH.Coins.get()');
  const waitBtns = async (re) => { for (let i = 0; i < 100; i++) { if (new RegExp(re).test(await btns())) return true; await sleep(100); } log('   !! no buttons like', re, '| now:', await btns()); return false; };
  const waitQ = async (not) => { for (let i = 0; i < 100; i++) { const s = await say(); if (/What do you say\?/.test(s) && s !== not && await S("!!document.querySelector('#fBtns button:not([disabled])')")) return s; await sleep(100); } log('   !! no new question; now:', await say()); return ''; };
  const nearest = () => S('(() => { const o = SH.nearestInteractable(); return o ? o.id + " " + o.label : null; })()');
  const card = () => S('JSON.stringify(SH.Quests.card())');
  const click = (i) => S(`document.querySelectorAll('#fBtns button')[${i}].click()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.VIEW) { const [w, h] = process.env.VIEW.split('x').map(Number); await viewport(w, h, { dpr: 2, mobile: true }); await sleep(300); }
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.eggs = { treasure: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, inside: 1, days: 1, coins: 100, coinTold: 1, kim: { done: 1 }, home: SH.ISLE6.today(), day: { d: SH.ISLE6.today(), n: 9, ph: 'lesson', home: 1 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save(); SH.Hud.cardKey = ''; SH.Hud.refresh();`);
  await S('SH.game.paused = true'); await step(0.2);
  log('the card at home after school:', await card());
  // ---- the places: free and reachable
  for (const [what, key] of [['treasure X', 'HUNT'], ['hiding place', 'HIDES']]) {
    const P = await S(`JSON.stringify(SH.FUN.${key})`).then(JSON.parse), bad = [];
    for (const [k, [x, y]] of Object.entries(P)) { const free = await S(`SH.circleFree(${x}, ${y}, 13)`), path = await S(`!!SH.findPath(1200, 1100, ${x}, ${y})`); if (!free || !path) bad.push(k + (free ? '' : ' not free') + (path ? '' : ' no way')); }
    log(what + 's:', Object.keys(P).length, '| not good:', JSON.stringify(bad));
  }
  // ---- the camera
  log('the camera button:', await S(`!document.getElementById('camBtn').classList.contains('hidden')`));
  const B = await S('JSON.stringify({ x: SH.LANDMARK.benchL.x, y: SH.LANDMARK.benchL.y })').then(JSON.parse);
  let c0 = await coins();
  const photo = async (name, x, y, wrong) => {
    await S(`SH.tp(${x}, ${y})`); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')");
    await S(`document.getElementById('camBtn').click()`); await sleep(200);
    const G = await S('SH.FUN.G ? JSON.stringify({ id: SH.FUN.G.id, s: SH.FUN.G.s, near: SH.FUN.G.near }) : "none"');
    if (!/photo/.test(G)) { log('  ', name, '->', G, '|', await say()); return; }
    await waitBtns('This'); const g = JSON.parse(G), many = await S(`SH.FUN.sentence('${g.s}').many`), k = (g.near ? 0 : 1) + (many ? 2 : 0);
    if (name === 'cat') await shot('fun-photo-cat' + T); if (name === 'windmill') await shot('fun-photo-mill' + T);
    const before = await say(); await click(wrong ? (k + 1) % 4 : k); await sleep(300); const after = await say();
    await waitBtns('Album'); log('  ', name, G, '|', before, '->', after, '->', (await say()).split(' | ')[1], '| coins', await coins());
  };
  await photo('cat', B.x - 2, B.y + 36);
  await click(1); await step(0.1);
  await photo('cat again', B.x - 2, B.y + 36); await click(1); await step(0.1);
  const M = await S('JSON.stringify(SH.EGGS.mill)').then(JSON.parse);
  await photo('windmill', M.x - 190, M.y + 50); await click(1); await step(0.1);
  await photo('ducks (a wrong word)', 1640, 1395, true); await click(1); await step(0.1);
  await photo('nothing here', 1500, 820);
  await shot('fun-album-none' + T); await S('SH.FUN.close()'); await step(0.1);
  log('camera coins:', c0, '->', await coins(), '| saved', await S('JSON.stringify(SH.state.fun.photo)'), '| pictures kept', await S(`Object.keys(JSON.parse(localStorage.getItem(SH.FUN.albumKey()) || '{}')).join(',')`));
  await photo('cat (the album)', B.x - 2, B.y + 36); await click(0); await sleep(600);
  log('the album:', await say()); await shot('fun-album' + T);
  await S('SH.FUN.albumTap(50, 30)'); await sleep(400); log('   a photo, big:', await say()); await shot('fun-album-big' + T);
  await S('SH.FUN.close()'); await step(0.1);
  // ---- the treasure map
  const TR = await S('JSON.stringify(SH.EGGS.treasure)').then(JSON.parse);
  await S(`SH.tp(${TR.x}, ${TR.y + 50})`); await step(0.3);
  log('at the old chest:', await nearest()); c0 = await coins();
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_map'))`); await sleep(300); log('the map:', await say());
  await waitBtns('This'); await shot('fun-map' + T); await click(0); await waitBtns('Go'); log('   ', await say(), '| stops', await S('JSON.stringify(SH.state.fun.hunt)'));
  await click(0); await step(0.2); log('   the card:', await card(), '| the arrow to', await S('JSON.stringify(SH.Quests.target())'));
  for (let i = 0; i < 3; i++) {
    const X = await S('JSON.stringify(SH.FUN.HUNT[SH.state.fun.hunt.stops[SH.state.fun.hunt.i]])').then(JSON.parse);
    await S(`SH.tp(${X[0]}, ${X[1] + 40})`); await step(0.3);
    if (i === 0) { await S("document.getElementById('toast').classList.add('hidden')"); await shot('fun-x-world' + T); }
    log('  X', i + 1, 'at', JSON.stringify(X), '| nearest', await nearest());
    await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_dig'))`); await sleep(200);
    for (let k = 0; k < 3; k++) { await S('SH.FUN.digTap(200, 222)'); await sleep(150); }
    const q1 = await waitQ(''); if (i === 0) await shot('fun-dig-found' + T); if (i === 2) await shot('fun-dig-chest' + T);
    const G = await S('JSON.stringify({ item: SH.FUN.G.item, kind: SH.FUN.G.kind, next: SH.FUN.G.next })').then(JSON.parse);
    await click(G.kind); await sleep(400); const a1 = await say();
    if (i < 2) {
      const q2 = await waitQ(q1), many = await S(`!!SH.FUN.HUNT_MANY['${G.next}']`); if (i === 0) await shot('fun-dig-far' + T);
      await click(many ? 3 : 1); await sleep(300); const a2 = await say(); await waitBtns('Go');
      log('    ', q1, '->', a1, '||', q2, '->', a2, '||', await say()); await click(0); await step(0.2);
      log('     card:', await card());
    } else {
      const q2 = await waitQ(q1); await shot('fun-dig-open' + T); await click(2); await waitBtns('Again');
      log('    ', q1, '->', a1, '||', q2, '|| end:', await say(), '| coins', c0, '->', await coins(), '| hunt', await S('JSON.stringify(SH.state.fun.hunt)'), '| hunted', await S('SH.state.fun.hunted'));
      await click(1); await step(0.1);
    }
  }
  log('after the hunt: the card', await card(), '| the map again at the chest:', await S(`(SH.tp(${TR.x}, ${TR.y + 50}), SH.step(1/30, 3), (() => { const o = SH.nearestInteractable(); return o && o.id; })())`));
  // ---- hide and seek
  const P0 = await S('JSON.stringify([SH.NPC.pip.x, SH.NPC.pip.y])').then(JSON.parse);
  await S(`SH.tp(${P0[0]}, ${P0[1] + 40})`); await step(0.3); log('by Pip:', await nearest());
  await S(`SH.interact(SH.nearestInteractable())`); await sleep(400); log('hide and seek:', await say(), '|', await btns()); await shot('fun-hide-ask' + T);
  await click(0); await sleep(300); await S('SH.FUN.G.t = 5.5'); await sleep(700); await shot('fun-hide-count' + T);
  await S('SH.FUN.G.t = 30'); for (let i = 0; i < 60 && !(await S('SH.Dialog.open')); i++) await sleep(100);
  log('   hidden:', await S('JSON.stringify(SH.FUN.hs && SH.FUN.hs.spot)'), '| Sparky:', await lines(), '| card', await card());
  for (const id of ['pip', 'pop']) {
    const n = await S(`JSON.stringify({ x: SH.NPC.${id}.x, y: SH.NPC.${id}.y, at: SH.NPC.${id}.hideAt })`).then(JSON.parse);
    await S(`SH.tp(${n.x + 10}, ${n.y + 55})`); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')");
    if (id === 'pip') await shot('fun-hide-found' + T);
    log('  ', id, n.at, '| nearest', await nearest(), '| a talk button too?', await S(`SH.interactables().some((o) => o.id === '${id}')`));
    await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_found_${id}'))`); log('    ', await lines());
  }
  await step(1); log('after: hs', await S('SH.FUN.hs'), '| homes', await S('JSON.stringify([SH.NPC.pip.home, SH.NPC.pop.home])'), '| walking about again', await S('!!SH.NPC.pip.wander'), '| games', await S('SH.state.fun.hides'), '| card', await card());
  // ---- the race (the school island)
  await S('SH.ISLE6.land()'); await lines(); await step(0.5); await lines();
  const R = await S('JSON.stringify(SH.FUN.RACE)').then(JSON.parse);
  await S(`SH.tp(${R.x0 - 40}, ${R.lanes[2] + 40})`); await step(0.3);
  log('the race: free', await S(`[0,1,2,3,4].every((i) => SH.circleFree(${R.x0 + 200}, SH.FUN.RACE.lanes[i], 12))`), '| nearest', await nearest(), '| card', await card());
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fun_race'))`); log('   ', await lines());
  await step(1); await shot('fun-race-count' + T);
  log('   counting: you stay', await S(`(() => { SH.keys.right = 1; SH.step(1 / 30, 10); SH.keys.right = 0; return Math.round(SH.player.x - ${R.x0}); })()`), '| card', await card(), '| buttons', await S('SH.interactables().length'));
  await step(2);
  log('   go:', await S('SH.FUN.race && SH.FUN.race.ph'));
  await S('SH.keys.right = 1'); for (let i = 0; i < 40 && await S(`SH.player.x < ${R.x1}`); i++) { await step(0.1); if (i === 8) await shot('fun-race-run' + T); }
  await S('SH.keys.right = 0');
  log('   finish:', await S('JSON.stringify(SH.FUN.race && SH.FUN.race.order)'));
  for (let i = 0; i < 60 && (await S('SH.game.mode')) !== 'fun'; i++) await step(0.2);
  log('   results:', await say()); await shot('fun-race-podium' + T);
  await waitBtns('first'); const me = await S('SH.FUN.G.me'); await click(me); await sleep(300); log('   I am:', await say());
  await waitBtns('Again'); log('   end:', await say(), '| coins (none)', await coins());
  await click(1); await step(0.5);
  log('after the race: mode', await S('SH.game.mode'), '| race', await S('SH.FUN.race'), '| kids', await S('JSON.stringify(SH.ISLE6.kidList().map((k) => k.id + (k.run ? " run" : "")))'), '| the race button again', await S(`SH.interactables().some((o) => o.id === 'fun_race')`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
