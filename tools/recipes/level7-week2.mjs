// Level 7, week 2 (unit 3: There is / There are): a school day after the trip the call opens the second week; on the Green
// Islands Grandma Daisy's garden from her cards, the books' titles and subtitles, your pond and its sentences (word tiles),
// the pond song, the dragonfly helicopter (back to the pier); at school the postcard, on its stand. Waits are cut short.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await S('SH.Dialog.who')); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(','); };
  const talk = (id) => S(`(() => { const o = SH.interactables().find((o) => o.id === ${JSON.stringify(id)}); if (!o) return 'none'; SH.interact(o); return 'ok'; })()`);
  const G = (e) => S(`(() => { const G = FUN.G; return ${e}; })()`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  const M6 = '{ flower: 1, grass: 1, ant: 1, earthworm: 1, bee: 1, butterfly: 1, tadpole: 1, fish: 1, lily: 1, dragonfly: 1, mosquito: 1, frog: 1 }';
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 150,
      les: { show: { plays: 1, best: 8 } }, day: { d: '20.11.2026', n: 9, home: 1, in: 1, trip: 1 },
      trip: { st: 'done', d: '20.11.2026', seen: 1, landed: 1, seen3: 'back', got: ${M6}, bin: { bottle: 1, can: 1, cup: 1 }, ps: 1, dip: 3, fs: 1, saw: { deer: 1, rabbit: 1, squirrel: 1, bird: 1 }, end: 1, in: 1, poster: 1 } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  // the call: a new school day after the trip
  log('the call is due:', await S('WEEK2.due()'), '| lines', await S('TRIP.callLines()[1][1]'));
  await S('TRIP.opened()'); log('   the day:', await S('JSON.stringify((({ st, wk, landed }) => ({ st, wk, landed }))(TRIP.st()))'), '| still due', await S('WEEK2.due()'));
  // (the voyage is week 1's: straight onto the islands)
  await S(`Object.assign(TRIP.st(), { st: 'green' }); SH.Save.save(); SH.ISLE7.land()`); await sleep(200); await lines(); await S('SH.ISLE7.landed()'); await sleep(100);          // (as if the class came down the gangplank: the welcome)
  log('landed:', await lines(), '| stage', await S('WEEK2.stage()'), '| card', await card());
  // Grandma Daisy's garden
  await S('SH.tp(1185, 9050)'); await step(0.3); log('Grandma Daisy:', await talk('g8_gran'), await lines(), '| game', await G('G && G.id'));
  await sleep(300);
  const cards = await S('GAME_CONTENT.trip.w2.garden.cards.length'), ZC = { tree: [62, 150], bed: [200, 140], pond: [332, 186], grass: [200, 206] };
  for (let i = 0; i < 60 && !(await G('!G3.on || !!G.z3')); i++) await sleep(100);          // (3D: the garden drawn once)
  for (let i = 0; i < cards; i++) {
    const c = JSON.parse(await S(`JSON.stringify(GAME_CONTENT.trip.w2.garden.cards[${i}])`));
    if (i === 0) await G(`G.tap(200, 206)`);          // (a place before a thing: nothing)
    if (i === 1) { await G(`(() => { const t = G.tray.find((o) => o.id === 'purple'); G.tap(t.x, t.y); const z = G3.on && G.z3 ? [G.z3.bed.x, G.z3.bed.y] : [${ZC.bed}]; G.tap(z[0], z[1]); })()`); log('   a purple flower for red ones:', await S('$("fSay").textContent')); }
    for (let k = 0; k < c.n; k++) await G(`(() => { const t = G.tray.find((o) => o.id === ${JSON.stringify(c.id)}); G.tap(t.x, t.y); const z = G3.on && G.z3 ? [G.z3[${JSON.stringify(c.z)}].x, G.z3[${JSON.stringify(c.z)}].y] : [${ZC[c.z]}]; G.tap(z[0], z[1]); })()`);
    if (i === 3) { await sleep(150); await shot('l7w2-garden' + T); }
  }
  log('   the garden:', await S('JSON.stringify(TRIP.st().w2)'), '|', await S('$("fSay").textContent'));
  await S('FUN.close()'); await step(0.5); log('books:', await lines(), '| stage', await S('WEEK2.stage()'));
  // the books
  await S('SH.tp(1420, 9188)'); await step(0.3); log('   the shed:', await talk('shed8'), await lines());
  await sleep(300);
  for (let b = 0; b < 3; b++) {
    const B = JSON.parse(await S(`JSON.stringify(GAME_CONTENT.trip.w2.books.list[${b}])`));
    await G(`G.tap(100 + G.opts.indexOf(${JSON.stringify(B.guess[0])}) * 100, 252)`); for (let i = 0; i < 60 && !(await G('G.step === "put" && G.tray.length > 0')); i++) await sleep(150);          // (her words first, then the stickers)
    for (const [id] of B.subs) await G(`(() => { const s = FUN.book8Slots()[${B.subs.findIndex((q) => q[0] === id)}], t = G.tray.find((o) => o.id === ${JSON.stringify(id)}); G.tap(t.x, t.y); G.tap(s[0], s[1]); })()`), await sleep(60);
    if (b === 0) await shot('l7w2-book' + T);
    for (let i = 0; i < 40 && await G(`G && !G.over && G.b === ${b}`); i++) await sleep(250);
  }
  log('   books done:', await S('TRIP.st().w2.books'), '|', await S('$("fSay").textContent'));
  await S('FUN.close()'); await step(0.5); log('pond:', await lines(), '| stage', await S('WEEK2.stage()'), '| class walking', await S('!!TRIP.walk'));
  // your pond
  await S('SH.tp(2420, 9348)'); await step(0.3); log('   the field:', await talk('pond8'), await lines());
  await sleep(300);
  for (let i = 0; i < 60 && !(await G('!G3.on || !!G.z3')); i++) await sleep(100);          // (3D: the scene drawn once)
  for (let i = 0; i < 3; i++) await G('G3.on && G.z3 ? G.tap(G.z3.pond.x, G.z3.pond.y) : G.tap(200, 146)');
  for (let i = 0; i < 3; i++) await G('G3.on && G.z3 ? G.tap(G.z3.can.x, G.z3.can.y) : G.tap(348, 206)');
  const add = async (id, n) => { for (let k = 0; k < n; k++) await G(`(() => { const t = G.tray.find((o) => o.id === ${JSON.stringify(id)}); if (t) G.tap(t.x, t.y); })()`), await sleep(40); };
  for (let i = 0; i < 60 && !(await G('!!(G.tray && G.tray.find((o) => o.id === "lily"))')); i++) await sleep(100); await add('lily', 2); await add('cattail', 2); await S('FUN.pond8Next()'); for (let i = 0; i < 60 && !(await G('!!(G.tray && G.tray.find((o) => o.id === "koi"))')); i++) await sleep(100);
  await add('koi', 3); await add('frog', 1); await add('strider', 1); await add('dragonfly', 2); await sleep(200); await shot('l7w2-pond' + T);
  await S('FUN.pond8Next()'); log('   to the words:', await G('G.step + " " + JSON.stringify(G.n)'));
  for (const id of ['koi', 'frog']) {
    for (let i = 0; i < 60 && !(await G(`!!(G.tray && G.tray.find((o) => o.id === ${JSON.stringify(id)}))`)); i++) await sleep(100);
    await G(`(() => { const t = G.tray.find((o) => o.id === ${JSON.stringify(id)}); G.tap(t.x, t.y); })()`); for (let i = 0; i < 60 && !(await G('!!(G && G.want && G.tilePos && G.tilePos.length === G.tiles.length)')); i++) await sleep(100);          // (the tiles drawn)
    if (id === 'koi') { await G(`(() => { const k = G.tiles.findIndex((w) => w !== G.want[0]); const o = G.tilePos[k]; G.tap(o.x, o.y); })()`); log('   a wrong word:', await S('$("fSay").textContent')); }
    for (let k = 0; k < 6 && await G('!!(G && G.want)'); k++) { for (let i = 0; i < 60 && !(await G('!G.want || (G.tilePos && G.tilePos.length === G.tiles.length)')); i++) await sleep(60); await G(`(() => { if (!G || !G.want) return; const k = G.tiles.indexOf(G.want[G.built.length]); const o = G.tilePos[k]; if (o) G.tap(o.x, o.y); })()`); }
    log('   said:', await G('G.said[G.said.length - 1]'));
    await sleep(3600);
  }
  for (let i = 0; i < 30 && await G('G && !G.over'); i++) await sleep(250);
  log('   the pond:', await S('JSON.stringify(TRIP.st().w2.pond)'), '|', await S('$("fSay").textContent'));
  await S('FUN.close()'); await step(0.5); log('song:', await lines(), '| stage', await S('WEEK2.stage()'));
  // the song (cut short: two verses)
  for (let i = 0; i < 80 && await S('!!TRIP.walk'); i++) await step(0.25);          // (the class gets to the pond)
  { const t = JSON.parse(await S('JSON.stringify(SH.Quests.target())')); await S(`SH.tp(${t.x}, ${t.y})`); await step(0.2); }          // (you: where the arrow points)
  log('   the class:', await S(`TRIP.crew.map((c) => c.id + ' ' + Math.round(c.x) + ',' + Math.round(c.y) + (c.moving ? ' walking' : '')).join('; ')`), '| walk', await S('!!TRIP.walk'));
  log('   at the pond: button', await S('(nearestInteractable() || {}).id'), '| the class', await S(`SH.interactables().filter((o) => o.id.startsWith('g7_')).map((o) => o.id.slice(3) + ' ' + Math.round(Math.hypot(o.x - SH.player.x, (o.y - SH.player.y) * 1.3))).join(', ')`));
  if (!T) await shot('l7w2-pondclass');
  await step(0.2); log('   sing:', await talk('song8'), await lines());
  await sleep(300); await G('(G.pt = 4.2, 0)'); for (let i = 0; i < 60 && await G('G.ph !== "verse"'); i++) await sleep(100); for (let i = 0; i < 40 && !(await G('!G3.on || !!G.pop3')); i++) await sleep(100); await G('G3.on && G.pop3 ? G.tap(G.pop3.x, G.pop3.y) : G.tap(200, 150)'); log('   verse 1:', await G('G.ph + " " + G.hit + " " + G.v'), '|', await S('$("fSay").textContent'));
  await shot('l7w2-song' + T);
  await G('(G.v = GAME_CONTENT.trip.w2.song.verses.length - 1, G.ph = "verse", G.pt = 99, 0)'); for (let i = 0; i < 60 && await G('!!G && !G.over'); i++) await sleep(100);
  log('   song done:', await S('TRIP.st().w2.song'), '|', await G('G && G.over'));
  await S('FUN.close()'); await step(0.5); log('heli:', await lines(), '| stage', await S('WEEK2.stage()'));
  // the dragonfly helicopter
  await S('SH.tp(3720, 9330)'); await step(0.3); log('   the pad:', await talk('heli8'), await lines());
  await sleep(300);
  for (let k = 0; k < 5; k++) {
    await G('(G.pt = 2.25, 0)'); for (let i = 0; i < 60 && await G('G.ph !== "look"'); i++) await sleep(100);
    for (let i = 0; i < 40 && !(await G('!G3.on || G.items.every((o) => o.p3)')); i++) await sleep(100);          // (3D: where each one is seen)
    for (let i = 0; i < 4; i++) await G('(() => { const o = G.items.find((q) => !q.hit); if (o) { const q = G3.on && o.p3 ? o.p3 : o; G.tap(q.x, q.y); } })()'), await sleep(40);
    log('   stop', k + 1, await G('G.ph'), '|', await S('$("fSay").textContent'));
    if (k === 2) await shot('l7w2-heli' + T);
    await G('(G.pt = G.wait + 0.01, 0)'); for (let i = 0; i < 60 && await G('G.ph === "said"'); i++) await sleep(100);
  }
  log('   home:', await G('G.ph'), await S(`[...document.querySelectorAll('#fBtns button')].map((b) => b.textContent).join('|')`));
  await S(`[...document.querySelectorAll('#fBtns button')].find((b) => /✔/.test(b.textContent)).click()`); await sleep(300);
  log('   on the pier:', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y), SH.ISLE7.inDock(SH.player.x, SH.player.y)])'), '| stage', await S('WEEK2.stage()'), '|', await lines());
  log('   before boarding:', await S('JSON.stringify({ cap: TRIP.cap, busy: TRIP.busy3, mode: game.mode, off: !!SH.ISLE7.off, st: TRIP.stage3(), dock: SH.ISLE7.inDock(SH.player.x, SH.player.y), dlg: SH.Dialog.open })'));
  await step(0.5); log('   all aboard:', await lines(), '| sea', await S('SH.SEA.active'));
  // back at school: the postcard (the voyage home is week 1's)
  await S(`SH.SEA.active && (SH.SEA.active = false); Object.assign(TRIP.st(), { st: 'poster', in: 1 }); SH.Save.save(); TRIP.crew = null; TRIP.walk = null`);
  log('school card:', await S('TRIP.card4()[1]'));
  await S('TRIP.posterStart()'); log('   postcard:', await lines(), '| game', await G('G && G.id'));
  await S(`[...document.querySelectorAll('#fBtns button')][0].click()`); for (let i = 0; i < 60 && !(await G('!!(G.tray && G.tray.find((o) => o.id === "frog"))')); i++) await sleep(100);          // (the living things drawn)
  await G(`(() => { for (const id of ['frog', 'frog', 'koi', 'butterfly']) { const t = G.tray.find((o) => o.id === id); if (t) G.tap(t.x, t.y); } })()`); await sleep(300); await shot('l7w2-card' + T);
  await S(`[...document.querySelectorAll('#fBtns button')].find((b) => /✔/.test(b.textContent)).click()`); for (let i = 0; i < 60 && !(await S('!!TRIP.st().w2.card || SH.Dialog.open')); i++) await sleep(100);
  log('   the end:', await lines(), '|', await S('JSON.stringify((({ st, wk }) => ({ st, wk }))(TRIP.st()))'), '| card', await S('JSON.stringify(TRIP.st().w2.card)'), '| lines', await S('JSON.stringify(WEEK2.cardLines(TRIP.st().w2.card))'));
  log('   the stand:', await S('!!WEEK2.wallCard().canvas'), '| due again', await S('WEEK2.due()'), '| call due', await S('TRIP.callDue()'));
  // the islands seen in the world: the garden, your pond
  await S(`Object.assign(TRIP.st(), { st: 'green' }); SH.ISLE7.land()`); await lines(); await S('SH.tp(1250, 9230)'); await step(0.6); await shot('l7w2-world-garden' + T);
  await S('SH.tp(2420, 9330)'); await step(0.6); await shot('l7w2-world-pond' + T);
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
