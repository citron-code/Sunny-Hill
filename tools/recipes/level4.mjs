// Level 4 (the sea): after the Junior Captain certificate Sparky calls you back to the ship, and the wheel takes you out.
// Practice first: a floating crate (three questions load the cannon), then a real drag on the Fire button to aim at a
// target buoy. Then far out to sea (Sunny Hill out of sight), where Captain Grumble's ship comes: his cannonballs to dodge
// (each hit leaves our ship a little more broken), a crate for every shot (one grammar topic per hit: family, am/is/are,
// not, questions, short answers; each hit brings back a page of the family album), a miss to load again. After five hits
// he runs away, his last ball finds us, and he drops his treasure map: it shows the Parrot King's island, where we can fix
// our broken ship (next time).
// Game time is moved on with SH.step, so the result does not depend on how fast this computer draws.
export default async function ({ evaluate, sleep, shot, savePng, send, consoleLog, viewport }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  if (process.env.VIEW) { const [w, h] = process.env.VIEW.split('x').map(Number); await viewport(w, h); }
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const card = () => S(`document.getElementById('qcText').textContent`);
  const lines = async () => {
    const out = [];
    for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); }
    return out.join(' | ');
  };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  // the three questions a crate asks (the first one once wrong, when asked); returns "sentence -> answer" for each
  const quiz = async (wrongFirst) => {
    const qs = [];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 60 && await S(`!document.querySelector('.tbBlank') || document.querySelector('.tbBlank').classList.contains('filled')`); i++) await sleep(100);
      const [sent, ans, topic] = await S(`(() => { const s = document.querySelector('.tbSent').textContent; for (const t of ['family', 'tobe', 'not', 'ask', 'short']) { const q = SH.SEA.questions(t).find((q) => q.text.replace(/_{2,}/, '?') === s); if (q) return [s, q.answer, t]; } return [s, null, '?']; })()`);
      if (wrongFirst && j === 0) {
        await S(`[...document.querySelectorAll('.tbBtn')].find((b) => b.dataset.v && b.dataset.v !== ${JSON.stringify(ans)}).click()`); await sleep(300);
        log('  wrong answer: buttons dimmed', await S(`document.querySelectorAll('.tbBtn.dim').length`)); await shot('l4-question');
      }
      await S(`[...document.querySelectorAll('.tbBtn')].find((b) => b.dataset.v === ${JSON.stringify(ans)}).click()`);
      qs.push(`[${topic}] ${sent} -> ${ans}`);
      for (let i = 0; i < 80 && await S(`SH.game.mode === 'minigame' && !!document.querySelector('.tbBlank') && document.querySelector('.tbBlank').classList.contains('filled')`); i++) await sleep(100);
    }
    for (let i = 0; i < 50 && await S(`SH.game.mode === 'minigame'`); i++) await sleep(100);
    return qs;
  };
  const toCrate = () => S(`(() => { const c = SH.SEA.crates[0], s = SH.SEA.ship; s.x = c.x - 120; s.y = c.y; s.a = 0; s.v = 0; })()`);
  // sail up to the next crate (waiting for one to float up), until its questions open
  const openCrate = async () => {
    for (let i = 0; i < 60; i++) {
      if (await S("SH.game.mode === 'minigame'")) return true;
      await lines();
      if (await S('SH.SEA.crates.length > 0')) await toCrate();
      await step(0.25);
    }
    log('  !! the crate questions never opened'); return false;
  };
  // a real drag on the Fire button (mouse events through the browser), towards a point on the sea
  const drag = async (target, name) => {
    const b = await S(`(() => { const r = document.getElementById('seaFire').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const vec = `(() => { const S = SH.SEA, c = S.cannonPos(), T = ${target}, d = Math.hypot(T.x - c.x, T.y - c.y), len = 18 + Math.min(1, Math.max(0, (d - 170) / (S.RANGE - 170))) * 130, k = SH.G3.on ? Math.sin(SH.CAM3.pitch) : 1, a = Math.atan2((T.y - c.y) * k, T.x - c.x); return { dx: Math.cos(a) * len, dy: Math.sin(a) * len }; })()`, v = await S(vec);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: b.x, y: b.y, button: 'left', buttons: 1, clickCount: 1 });
    for (let i = 1; i <= 5; i++) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b.x + v.dx * i / 5, y: b.y + v.dy * i / 5, button: 'left', buttons: 1 });
    await step(0.2); if (name) await shot(name);
    log('  aiming:', await S(`document.getElementById('seaFire').classList.contains('aiming')`), '| lands', JSON.stringify(await S(`(() => { const p = SH.SEA.aimPoint(); return p && [Math.round(p.x), Math.round(p.y)]; })()`)), '| wanted', JSON.stringify(await S(`(() => { const T = ${target}; return [Math.round(T.x), Math.round(T.y)]; })()`)));
    // the ship sails on while you aim: a last look at the ring before letting go
    const w = await S(vec);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b.x + w.dx, y: b.y + w.dy, button: 'left', buttons: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b.x + w.dx, y: b.y + w.dy, button: 'left', buttons: 0, clickCount: 1 });
  };

  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await lines();
  // where level 3 ends: the ship in the harbour, the captain's hat on, the Junior Captain certificate seen
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, finishedAt: '14.10.2026', done: ['brother','family','chores','animals','where','bedtime','truefalse','final'], unlocked: ['hat','glasses','cape','crown','tie','captain'], wear: { captain: true }, family: { mother: 1, father: 1, sister: 1, grandmother: 1, cousin: 2 } });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 }; SH.state.sea = { stage: '', hits: 0 };
    SH.Save.save(); SH.LAB.apply(); SH.SHIP.apply(true);`);
  // 1) Sparky: the ship is ready, let's sail
  await step(3); log('Sparky:', await lines(), '| card:', await card(), '| marker on the wheel', JSON.stringify(await S('SH.Quests.target()')));
  // 2) the wheel: out to sea
  const h = await S('SH.SHIP.helmSpot()'); await S(`SH.tp(${h.x}, ${h.y})`); await step(0.3);
  await talk('shipwheel'); log('wheel:', await lines());
  await step(0.2); log('at sea', await S('SH.SEA.active'), '| sail:', await lines(), '| card:', await card(), '| Fire button', await S(`document.getElementById('sfLbl').textContent`), '| action button hidden', await S(`getComputedStyle(document.getElementById('actBtn')).display === 'none' || document.getElementById('actBtn').classList.contains('hidden')`));
  await step(1); await shot('l4-sea');
  // the Fire button before any crate: no
  await S(`(() => { const b = document.getElementById('seaFire'), r = b.getBoundingClientRect(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, clientX: r.left + 20, clientY: r.top + 20 })); })()`);
  log('Fire without a crate: shakes', await S(`document.getElementById('seaFire').classList.contains('nope')`), '| toast', await S(`(document.getElementById('toast') || {}).textContent || ''`));
  // 3) steering with the arrow keys
  const a0 = await S('[SH.SEA.ship.x, SH.SEA.ship.y, SH.SEA.ship.a]');
  await S('SH.keys.up = 1'); await step(1); await S('SH.keys.up = 0; SH.keys.right = 1'); await step(1); await S('SH.keys.right = 0');
  const a1 = await S('[SH.SEA.ship.x, SH.SEA.ship.y, SH.SEA.ship.a]');
  log('sailed', Math.round(Math.hypot(a1[0] - a0[0], a1[1] - a0[1])), 'turned', (a1[2] - a0[2]).toFixed(2), '| crate', JSON.stringify(await S('SH.SEA.crates.map((c) => [Math.round(c.x), Math.round(c.y)])')), '| sailed into it:', await S("SH.game.mode === 'minigame'"));
  await shot('l4-sailing');
  // 4) the practice crate
  if (await S("SH.game.mode !== 'minigame'")) { await toCrate(); await step(0.3); }
  log('crate opens the questions:', await S('SH.game.mode'));
  log(' ', (await quiz(true)).join('\n   '));
  log('loaded', await S('SH.SEA.loaded'), '| dialog:', await lines(), '| card:', await card(), '| button', await S(`document.getElementById('sfLbl').textContent`));
  // 5) aim at the target buoy with a real drag, and fire
  await drag('SH.SEA.buoy', 'l4-aim');
  await step(0.4); await shot('l4-shot');
  await step(1.4); log('buoy hit', await S('!SH.SEA.buoy'), '| loaded', await S('SH.SEA.loaded'));
  // 6) out to sea: Sparky's arrow points far away; Grumble comes only when Sunny Hill is far behind (no crates on the way)
  await step(1.8); log('Sparky:', await lines(), '| card:', await card(), '| goal', JSON.stringify(await S('SH.SEA.goal')));
  await S('SH.keys.right = 1'); await step(4); await S('SH.keys.right = 0');
  log('sailing out: x', await S('Math.round(SH.SEA.ship.x)'), '| pirate yet', await S('!!SH.SEA.pirate'), '| crates on the way', await S('SH.SEA.crates.length'));
  await shot('l4-voyage');
  await S('(() => { const s = SH.SEA.ship, G = SH.SEA.goal; s.x = G.x - 1000; s.y = G.y; s.a = 0; })()'); await step(1);
  log('far out: pirate', await S('!!SH.SEA.pirate'), '| our ship', await S('Math.round(SH.SEA.ship.x) - 3400'), 'from the island coast');
  await step(1.5); await shot('l4-pirate-comes');
  await step(4); log('Grumble:', await lines(), '| stage', await S('SH.state.sea.stage'), '| music', await S('SH.SEA.music()'), '| boss bar', await S(`!document.getElementById('bossBar').classList.contains('hidden') && document.getElementById('bbName').textContent`));
  // 7) his cannonballs: red rings where they fall; a hit slows us down for a moment and leaves a burnt plank
  let incoming = 0, hits = 0;
  for (let i = 0; i < 24; i++) { await step(0.25); incoming = Math.max(incoming, await S('SH.SEA.balls.length')); if (await S('SH.SEA.ship.inv > 1.6')) hits++; }
  log('his volleys: up to', incoming, 'balls in the air | we were hit', hits, 'times (damage', await S('SH.state.sea.dmg | 0'), ') | crates', await S('SH.SEA.crates.length'));
  await shot('l4-fight');
  // 8) a miss: load, fire at the empty sea, load again
  await openCrate(); const q0 = await quiz(false); await lines();
  await S(`(() => { const S = SH.SEA, s = S.ship, P = S.pirate; S.fire({ x: s.x - (P.x - s.x) * 0.6, y: s.y - (P.y - s.y) * 0.6 }); })()`);
  await step(2); log('a miss: hits still', await S('SH.state.sea.hits'), '| loaded', await S('SH.SEA.loaded'), '| card:', await card(), '| first questions:', q0[0]);
  // 9) five hits: a crate (one topic each), then a shot ahead of his ship (a shot that misses: load again, as a child would)
  for (let k = 0, tries = 0; k < 5 && tries < 12; tries++) {
    await openCrate();
    const qs = await quiz(false); await lines();
    await S(`(() => { const P = SH.SEA.pirate; SH.SEA.fire({ x: P.x + Math.cos(P.a) * P.v * 1.2, y: P.y + Math.sin(P.a) * P.v * 1.2 }); })()`);
    if (k === 1) { await step(0.5); await shot('l4-hit-flight'); }
    for (let i = 0; i < 20 && await S('SH.SEA.shots.length > 0'); i++) await step(0.2);          // until the ball comes down
    await step(0.3);
    const now = await S('SH.state.sea.hits');
    log(now > k ? 'hit ' + now : 'missed: load again', '| bar', await S(`[...document.querySelectorAll('#bbSlots span.on')].length`), '| card:', await card());
    log('   ' + qs.join('\n    '));
    if (now > k && now === 3) await shot('l4-hit');
    k = now;
  }
  // 10) he runs away: his last ball finds us, his map falls into the sea; we fish it out
  await step(1); await shot('l4-last-hit');
  await step(1.5); log('Grumble runs:', await lines(), '| stage', await S('SH.state.sea.stage'));
  for (let i = 0; i < 20 && !(await S('!!SH.SEA.mapItem')); i++) await step(0.2);
  log('map in the sea', await S('!!SH.SEA.mapItem'), '| our ship damage', await S('SH.state.sea.dmg'), '| card:', await card(), '| Fire button hidden', await S(`document.getElementById('seaFire').classList.contains('hidden')`));
  await step(0.6); await shot('l4-map-dropped');
  await step(8); log('Grumble gone', await S('!SH.SEA.pirate'), '| boss bar hidden', await S(`document.getElementById('bossBar').classList.contains('hidden')`), '| music', await S('SH.SEA.music()'));
  await S('(() => { const m = SH.SEA.mapItem, s = SH.SEA.ship; s.x = m.x - 120; s.y = m.y; s.a = 0; s.v = 0; })()'); await step(0.3);
  log('the map opens', await S(`SH.game.mode === 'capcert'`), '| saved', await S('JSON.stringify(SH.state.sea)'));
  await sleep(600); await shot('l4-map');
  await savePng('l4-map-picture', await S(`SH.CaptainCert.draw(document.createElement('canvas')).toDataURL('image/png')`));
  await S(`document.getElementById('capOk').click()`); await sleep(200);
  log('Sparky:', await lines());
  log('back in the harbour', !(await S('SH.SEA.active')), '| card:', await card(), '| saved', await S(`(() => { try { return JSON.stringify(JSON.parse(localStorage.getItem('sunnyHill.save.v1')).sea); } catch (e) { return 'x'; } })()`));
  await shot('l4-home');
  // 11) the wheel again: next time, the Parrot King's island; Captain Bob still shows the certificate
  await talk('shipwheel'); log('wheel again:', await lines(), '| at sea', await S('SH.SEA.active'));
  await talk('bob'); await lines(); log('Captain Bob: certificate', await S(`SH.game.mode === 'capcert'`)); await S(`document.getElementById('capOk').click()`); await sleep(100);
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
