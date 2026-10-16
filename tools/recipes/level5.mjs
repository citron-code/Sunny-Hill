// Level 5 (the Parrot King's island): after Grumble's map the ship's wheel takes you there (straight on from level 4, or
// from the harbour). Out at sea the island comes into view; at its pier you go on foot. The villagers are in cages (the
// king put them there); he is on his hill. Up there he says things wrong ("I is the king!"): run to the right word among
// three on clouds, while his coconuts fall (red rings; a hit: a moment of stars). Three right words, a crown feather;
// five feathers (family, am/is/are, not, questions, short forms), and he says sorry, the cages open, the villagers mend
// our ship. Next time: the school island. Game time is moved on with SH.step, so the result does not depend on how fast
// this computer draws.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  if (process.env.VIEW) { const [w, h] = process.env.VIEW.split('x').map(Number); await viewport(w, h); }
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const card = () => S(`(Hud.cardKey = '', Hud.refresh(), document.getElementById('qcText').textContent)`);
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const walk = async (x, y) => { await S(`SH.walkTo(${x}, ${y})`); for (let i = 0; i < 90 && await S('!!SH.player.path') && !(await S('SH.Dialog.open')); i++) await step(0.25); };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await lines();
  // where level 4 ends: Grumble's map found (the trip from the harbour is the one tested here)
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'], unlocked: ['hat','glasses','cape','crown','tie','captain'], wear: { captain: true } });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 4, map: 1 }; SH.state.isle = { stage: '' }; SH.Save.save(); SH.LAB.apply(); SH.SHIP.apply(true);`);
  await step(0.3); log('home card:', await card(), '| Sparky points at the wheel', JSON.stringify(await S('SH.Quests.target()')));
  // 1) the wheel: off to the island
  const h = await S('SH.SHIP.helmSpot()'); await S(`SH.tp(${h.x}, ${h.y})`); await step(0.3);
  await talk('shipwheel'); log('wheel:', await lines(), '| at sea', await S('SH.SEA.active'), '| card:', await card(), '| Fire button hidden', await S(`document.getElementById('seaFire').classList.contains('hidden')`));
  await S('(() => { const s = SH.SEA.ship, g = SH.SEA.goal; s.x = g.x - 1000; s.y = g.y - 300; s.a = 0.15; })()'); await step(2); await shot('l5-approach');
  // the ship may not sail onto the beach
  await S('(() => { const s = SH.SEA.ship, o = SH.ISLE5.seaOff(); s.x = SH.ISLE5.C.x + o.x; s.y = SH.ISLE5.C.y + o.y - 600; s.a = Math.PI / 2; })()'); await step(1.5);
  log('kept off the island: from its coast', await S('(() => { const s = SH.SEA.ship, o = SH.ISLE5.seaOff(); return Math.round(SH.ISLE5.coastD(s.x - o.x, s.y - o.y)); })()'), '(must be below -150)');
  // 2) at the pier
  await S('(() => { const s = SH.SEA.ship, g = SH.SEA.goal; s.x = g.x - 300; s.y = g.y; s.a = 0; })()'); await step(0.3);
  // near the pier the ship steers itself in and ties up (no cut): then we walk off it, down the gangplank
  log('ties up by itself:', await S('!!SH.SEA.dock'), '| steering ignored', await S('(() => { SH.keys.up = 1; return true; })()'));
  for (let i = 0; i < 60 && await S('SH.SEA.active || !!SH.ISLE5.off'); i++) { if (i === 4) await S('SH.keys.up = 0'); await step(0.25); }
  await S('SH.keys.up = 0');
  log('landed:', !(await S('SH.SEA.active')), '| on the island', await S('SH.ISLE5.here()'), '| dialog:', await lines(), '| card:', await card());
  await step(0.6); await shot('l5-pier');
  await talk('ship5'); log('our ship:', await lines());
  // 3) the village: the people in cages
  await walk(880, 3560);
  log('village:', await lines(), '| stage', await S('SH.state.isle.stage'), '| card:', await card());
  await step(0.3); await shot('l5-village');
  for (const id of ['nani', 'koa', 'malia', 'kai']) { await talk('v5_' + id); log('  ' + id + ':', await lines()); }
  // 4) up the hill: the way up is on its west side (the rocky sides are too steep)
  log('from the south, the way up goes round by the ramp:', await S('(() => { const p = SH.findPath(1830, 3730, 1830, 3420); return !!p && p.some((q) => q.x < 1560 && Math.abs(q.y - 3420) < 60); })()'));
  await walk(1500, 3420); await shot('l5-ramp');
  await walk(1700, 3420);
  log('the king:', await lines(), '| stage', await S('SH.state.isle.stage'), '| vines close the way down', await S('SH.ISLE5.barrier'), '| music', await S('SH.ISLE5.music()'));
  { const x0 = await S('SH.player.x'); await S('SH.keys.right = 1'); await step(0.5); await S('SH.keys.right = 0');          // (once you could not move up there: your feet were caught in the vines)
    log('you can move up there: moved', Math.round((await S('SH.player.x')) - x0), '(must be over 40) | a tap on the hilltop lands where it was', await S('(() => { const H = SH.ISLE5.HILL, x = H.x + 60, y = H.y + 30, h = G3.on ? SH.ISLE5.standY(x, y) : 0, p = worldToScreen(x, h, y), w = screenToWorld(p.x, p.y); return Math.round(Math.hypot(w.x - x, w.y - y)); })()'), '(must be 0..2)'); }
  await step(1.2); await shot('l5-round');
  log('he says:', await S(`document.getElementById('isleSay').textContent`), '| words', await S(`JSON.stringify(SH.ISLE5.words.map((w) => w.w + (w.ok ? '*' : '')))`), '| labels shown', await S(`[...document.querySelectorAll('#isleWords .iw')].filter((e) => !e.classList.contains('hidden')).length`));
  // a wrong word: it pops, the king laughs; a coconut on the head: stars
  await S(`(() => { const w = SH.ISLE5.words.find((w) => !w.ok); SH.tp(w.x, w.y); })()`); await step(0.2);
  log('wrong word: words left', await S('SH.ISLE5.words.length'), '| toast', await S(`document.getElementById('toast').textContent`));
  await S('SH.player.inv = 0; SH.ISLE5.coconuts.push({ sx: SH.ISLE5.king.x, sy: SH.ISLE5.king.y, sh: 150, tx: SH.player.x, ty: SH.player.y, t: 1.4, T: 1.5, spin: 0 })'); await step(0.2);
  log('coconut on the head: dizzy', await S('SH.player.stun > 0'), '| toast', await S(`document.getElementById('toast').textContent`));
  await S('SH.player.stun = 0; SH.player.inv = 0');
  // 5) fifteen right words: five feathers
  for (let r = 0; r < 20 && !(await S('SH.state.isle.f >= 5')); r++) {
    for (let i = 0; i < 40 && !(await S('SH.ISLE5.words.length > 0 && SH.ISLE5.words.every((w) => w.t >= 0)')); i++) await step(0.2);
    const said = await S(`document.getElementById('isleSay').textContent`);
    await S(`(() => { SH.player.stun = 0; const w = SH.ISLE5.words.find((w) => w.ok); if (w) SH.tp(w.x, w.y); })()`); await step(0.2);
    for (let i = 0; i < 10 && await S('!!SH.ISLE5.fly'); i++) await step(0.1);
    await step(0.2);
    log('  ' + said.replace('🦜', '') + '  ->  ' + (await S(`document.getElementById('isleSay').textContent`)).replace('🦜', '') + '  | feathers', await S('SH.state.isle.f'));
    if (r === 0) await shot('l5-dizzy');
    if (r === 7) await shot('l5-later');
    await step(0.6);
  }
  log('bar', await S(`[...document.querySelectorAll('#bbSlots span.on')].length`), '| saved', await S(`(() => { try { return JSON.stringify(JSON.parse(localStorage.getItem('sunnyHill.save.v1')).isle); } catch (e) { return 'x'; } })()`));
  // 6) he says sorry; the cages open; the villagers mend our ship
  await step(2.2); log('won:', await lines());
  { const from = await S('[Math.round(SH.player.x), Math.round(SH.player.y)]'); let n = 0;          // (no jump: you walk down the stairs and along the path; the cages open as you come)
    for (; n < 80 && await S('!!SH.ISLE5.march'); n++) await step(0.2);
    log('walked down to the village:', JSON.stringify(from), '->', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| cages open', await S('SH.ISLE5.cageK > 0.9'), '| villagers talk', await S('SH.Dialog.open && SH.Dialog.who')); }
  await step(0.3); await shot('l5-free');
  log('rest:', await lines()); await step(3);
  log('saved', await S('JSON.stringify(SH.state.isle)'), '| ship mended (damage)', await S('SH.state.sea.dmg'), '| vines gone', !(await S('SH.ISLE5.barrier')), '| card:', await card());
  await shot('l5-end');
  for (const id of ['nani', 'kai']) { await talk('v5_' + id); log('  ' + id + ' (free):', await lines()); }
  await talk('ship5'); log('our ship:', await lines());
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
