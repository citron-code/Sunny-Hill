// Level 3 (the ship): Dr. Fizz's secret, Tess the engineer and her list, everyone busy at their jobs around the island,
// the eight parts (three questions each), the ship growing on the slipway, the launch, the harbour gate and the deck.
// Game time is moved on with SH.step, so the result does not depend on how fast this computer draws.
export default async function ({ evaluate, sleep, shot, savePng, viewport }) {
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
  // answer the three questions of a part (the first one once wrong, the first time)
  const quiz = async (id, wrongFirst) => {
    const qs = [];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 60 && await S(`!document.querySelector('.tbBlank') || document.querySelector('.tbBlank').classList.contains('filled')`); i++) await sleep(100);
      const sent = await S(`document.querySelector('.tbSent').textContent`);
      const ans = await S(`(() => { const s = document.querySelector('.tbSent').textContent; const q = SH.SHIP.questions(${JSON.stringify(id)}).find((q) => q.text.replace(/_{2,}/, '?') === s); return q ? q.answer : null; })()`);
      if (wrongFirst && j === 0) {
        await S(`[...document.querySelectorAll('.tbBtn')].find((b) => b.dataset.v && b.dataset.v !== ${JSON.stringify(ans)}).click()`); await sleep(300);
        log('  wrong answer: buttons dimmed', await S(`document.querySelectorAll('.tbBtn.dim').length`)); await shot('l3-question');
      }
      await S(`[...document.querySelectorAll('.tbBtn')].find((b) => b.dataset.v === ${JSON.stringify(ans)}).click()`);
      qs.push(sent + ' -> ' + ans);
      for (let i = 0; i < 80 && await S(`SH.game.mode === 'minigame' && !!document.querySelector('.tbBlank') && document.querySelector('.tbBlank').classList.contains('filled')`); i++) await sleep(100);
    }
    for (let i = 0; i < 50 && await S(`SH.game.mode === 'minigame'`); i++) await sleep(100);
    return qs.join(' ; ');
  };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  await lines();
  // the first eight quests done, Bongo calm: Dr. Fizz is about to tell his secret
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, unlocked: ['hat', 'glasses', 'cape', 'crown'], finished: true, finishedAt: '07.10.2026', done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'calm', bananas: 8, told: 1, roared: 1 }; SH.Save.save(); SH.LAB.apply();`);
  await step(0.5);
  // 1) Dr. Fizz's secret
  await S('SH.tp(SH.NPC.fizz.x + 10, SH.NPC.fizz.y + 60)'); await step(0.3);
  await talk('fizz'); log('Dr. Fizz:', await lines());
  log('ship stage', await S('SH.state.ship.stage'), '| card:', await card(), '| tie', await S(`SH.state.unlocked.indexOf('tie') >= 0`));
  // 2) Tess, and her list
  await S('SH.tp(SH.NPC.tess.x - 40, SH.NPC.tess.y - 30)'); await step(0.6); await shot('l3-tess');
  await talk('tess'); log('Tess:', await lines());
  log('mode', await S('SH.game.mode'), '| list shows', await S(`document.querySelectorAll('.ptItem').length`), 'people'); await sleep(400); await shot('l3-list');
  await S(`document.querySelector('.ptItem').click()`); await sleep(200);
  await S(`document.getElementById('ptOk').click()`); await sleep(200);
  log('Sparky:', await lines());
  log('stage', await S('SH.state.ship.stage'), '| card:', await card(), '| parts counter shown', await S(`!document.getElementById('partsBox').classList.contains('hidden')`));
  // 3) everyone at work: where they are and what they do
  await step(2);
  log('at work:', await S(`SH.SHIP.PEOPLE.map((id) => { const n = SH.NPC[id]; return id + '@' + Math.round(n.x) + ',' + Math.round(n.y) + (n.act ? ':' + n.act : n.moving ? ':walking' : ''); }).join('  ')`));
  for (const id of ['dad', 'mom', 'bob', 'rosa', 'max', 'lily', 'nomi', 'owl']) {
    await S(`(() => { const n = SH.NPC['${id}']; SH.tp(n.x - 150, n.y + 110); })()`); await step(0.2); await shot('l3-work-' + id);
  }
  // 4) the parts, one by one; the ship grows on the slipway
  for (let k = 0; k < 8; k++) {
    const id = await S(`SH.SHIP.PEOPLE[${k}]`);
    await S(`(() => { const n = SH.NPC['${id}']; SH.tp(n.x + 40, n.y + 50); })()`); await step(0.3);
    const stopped = await S(`!SH.NPC['${id}'].moving`);
    await talk(id); const said = await lines();
    const qs = await quiz(id, k === 0);
    const gave = await lines();
    log(`part ${k + 1}: ${id} stopped ${stopped} | ${said} | ${qs} | ${gave} | got ${await S('SH.state.ship.got.length')} | box ${await S(`document.getElementById('partsCount').textContent`)}`);
    if (k % 2 === 1 || k === 0) { await S(`SH.tp(${3000}, ${1350})`); await step(0.4); await shot('l3-ship-' + (k + 1)); }
  }
  await step(2.5); log('Sparky:', await lines());
  log('stage', await S('SH.state.ship.stage'), '| card:', await card());
  // 5) back to Tess: the launch
  await S('SH.tp(SH.NPC.tess.x - 40, SH.NPC.tess.y - 30)'); await step(0.3);
  await talk('tess'); log('Tess:', await lines());
  log('launching', await S('SH.SHIP.launchT > 0'), '| you can move', !(await S('SH.SHIP.cut')), '| Captain Bob watches from the quay', await S(`(() => { const b = SH.NPC.bob; return Math.round(b.x) + ',' + Math.round(b.y) + (b.rt ? ' (still at work!)' : ''); })()`));
  await step(1.2); await shot('l3-launch-1'); await step(1.2); await shot('l3-launch-2'); await step(0.6); await shot('l3-launch-3');
  await step(2); log('Tess:', await lines());
  log('stage', await S('SH.state.ship.stage'), '| card:', await card(), '| gate open', await S(`SH.circleFree(${3130}, ${1340}, 8)`), '| deck walkable', await S(`SH.circleFree(SH.SHIP.AFLOAT, SH.SHIP.SLIP.y, 8)`));
  await step(6);
  log('Captain Bob walked aboard', await S('SH.SHIP.onDeck(SH.NPC.bob.x, SH.NPC.bob.y)'), '| marker', await S(`SH.Quests.marker('bob')`), '| card:', await card());
  // 6) through the gate, up the gangplank, onto the deck, to the wheel
  await S(`SH.tp(${3170}, ${1340})`); await step(0.5); await shot('l3-harbour');
  const path = await S(`(() => { const h = SH.SHIP.helmSpot(), p = SH.findPath(SH.player.x, SH.player.y, h.x, h.y); return p ? p.length : 0; })()`);
  await S(`(() => { const h = SH.SHIP.helmSpot(); SH.walkTo(h.x, h.y); })()`); for (let i = 0; i < 40 && await S('!!SH.player.path'); i++) await step(0.2);
  log('walked on board: path', path, '| on deck', await S('SH.SHIP.onDeck(SH.player.x, SH.player.y)'), '| standing at', (await S('SH.SHIP.deckY(SH.player.x, SH.player.y)'))?.toFixed?.(1));
  await step(0.5); await shot('l3-deck');
  // 7) the wheel: Captain Bob gives his old captain's hat, and the Junior Captain certificate (a sea chart) opens
  await talk('shipwheel'); log('wheel:', await lines());
  log('hat unlocked', await S(`SH.state.unlocked.indexOf('captain') >= 0`), '| wearing it', await S('SH.look.hat'), '| mode', await S('SH.game.mode'));
  await step(0.8); await shot('l3-hat');
  await step(2); log('certificate open', await S(`SH.game.mode === 'capcert' && !document.getElementById('capCert').classList.contains('hidden')`), '| buttons', await S(`document.getElementById('capSave').textContent + ' / ' + document.getElementById('capOk').textContent`));
  await sleep(600); await shot('l3-cert');
  await savePng('l3-cert-picture', await S(`SH.CaptainCert.draw(document.createElement('canvas')).toDataURL('image/png')`));
  await S(`document.getElementById('capOk').click()`); await sleep(200);
  log('closed: mode', await S('SH.game.mode'), '| card:', await card(), '| saved', await S(`(() => { try { return JSON.stringify(JSON.parse(localStorage.getItem('sunnyHill.save.v1')).ship); } catch (e) { return 'x'; } })()`));
  await step(4); log('Captain Bob back at work', await S('!!SH.NPC.bob.rt'), '| marker', await S(`SH.Quests.marker('bob')`));
  // the wardrobe: six things now, one hat at a time
  await S('SH.Wardrobe.open()'); await sleep(300); await shot('l3-wardrobe');
  log('wardrobe items', await S(`document.querySelectorAll('#wdItems .pick').length`));
  await S(`[...document.querySelectorAll('#wdItems .pick')][0].click()`); await sleep(100);
  log('hat on: captain hat', await S('SH.state.wear.captain'), '| look', await S('SH.look.hat'));
  await S(`[...document.querySelectorAll('#wdItems .pick')][5].click()`); await sleep(100);
  log('captain hat on: hat', await S('SH.state.wear.hat'), '| look', await S('SH.look.hat'));
  await S('SH.Wardrobe.close()');
  // the wheel again: the certificate opens again
  await talk('shipwheel'); log('wheel again:', await lines()); log('certificate again', await S(`SH.game.mode === 'capcert'`));
  await S(`document.getElementById('capOk').click()`); await sleep(100);
}
