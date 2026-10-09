// Level 2 (Dr. Fizz's lab): the closed bridge, Sparky's call once the house is open, Dr. Fizz's story, the lab door
// into the big hall, Bongo's roar (in capital letters), his attacks (thrown, rolling and falling barrels), getting
// dizzy, the bananas with their am/is/are questions flying to Bongo, Bongo calming down, and the way out again.
// Game time is moved on with SH.step, so the result does not depend on how fast this computer draws.
export default async function ({ evaluate, sleep, shot, viewport }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  if (process.env.VIEW) { const [w, h] = process.env.VIEW.split('x').map(Number); await viewport(w, h); }
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const card = () => S(`document.getElementById('qcText').textContent`);
  const lines = async (pic) => {
    const out = [];
    for (let i = 0; i < 14 && await S('SH.Dialog.open'); i++) {
      if (pic && i === 1) await shot(pic);
      out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text + (document.getElementById('dialog').classList.contains('shout') ? ' [SHOUT]' : '')`));
      await S('SH.Dialog.shownAt = 0; SH.Dialog.next()');
    }
    return out.join(' | ');
  };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  await lines();
  const B = await S('SH.LAB.BRIDGE'), A = await S('SH.LAB.HALL'), P = await S('SH.LAB.APE'), R = await S('SH.LAB.ROOM');
  const door = (A.door0 + A.door1) / 2;
  // 1) before the house is open: the bridge is shut
  await S(`SH.tp(${B.x0 - 60}, ${B.y})`); await step(0.5); await shot('l2-bridge-closed');
  log('before: can cross', await S(`SH.circleFree(${B.x0 + 4}, ${B.y}, 8)`), '| nearest', await S('SH.nearestInteractable() && SH.nearestInteractable().id'));
  await S('SH.interact(SH.nearestInteractable())'); log('closed bridge:', await lines());
  // 2) the house is open (all 8 stars): Sparky hears Dr. Fizz, the bridge opens
  await S(`SH.state.stars = 8; SH.state.quest = 8; SH.state.finished = true; SH.state.finishedAt = '06.10.2026';
    SH.state.done = ['brother','family','chores','animals','where','bedtime','truefalse','final']; SH.Save.save(); SH.LAB.apply();`);
  await step(3);
  log('Sparky:', await lines());
  log('after: can cross', await S(`SH.circleFree(${B.x0 + 4}, ${B.y}, 8)`), '| card:', await card());
  await step(1); await shot('l2-bridge-open');
  // 3) Dr. Fizz at his door
  await S('SH.tp(SH.NPC.fizz.x + 10, SH.NPC.fizz.y + 60)'); await step(0.5); await shot('l2-lab');
  log('lab door shut:', !(await S(`SH.circleFree(${door}, ${A.y1}, 8)`)));
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fizz'))`); log('Dr. Fizz:', await lines());
  log('stage', await S('SH.state.lab.stage'), '| card:', await card(), '| banana counter shown', await S(`!document.getElementById('bananaBox').classList.contains('hidden')`));
  // 4) through the door (walking up into it): the big hall, Bongo's roar, the music stops for it
  log('lab door open:', await S(`SH.circleFree(${door}, ${A.y1}, 8)`));
  await S(`SH.tp(${door}, ${A.y1 + 40})`); await step(0.6); await shot('l2-door');
  await S('SH.keys.up = 1'); for (let i = 0; i < 30 && !(await S('SH.LAB.inRoom()')); i++) await step(0.1); await S('SH.keys.up = 0');
  log('in the hall:', await S('SH.LAB.inRoom()'), '| at', JSON.stringify(await S('[Math.round(SH.player.x), Math.round(SH.player.y)]')), '| music:', await S('SH.LAB.music()'), '| card:', await card());
  log('hall is bigger inside:', (R.x1 - R.x0) + 'x' + (R.y1 - R.y0), 'vs outside', (A.x1 - A.x0) + 'x' + (A.y1 - A.y0));
  await step(0.4);
  log('Bongo:', await lines('l2-roar'));
  log('roared', await S('SH.state.lab.roared'), '| music now:', await S('SH.LAB.music()'), '| boss bar shown', await S(`!document.getElementById('bossBar').classList.contains('hidden')`), '| banana', JSON.stringify(await S('SH.LAB.banana && [Math.round(SH.LAB.banana.x), Math.round(SH.LAB.banana.y)]')));
  await S('SH.LAB._hits = SH.LAB.hits; SH.LAB.hits = () => false');       // no hits while the pictures are taken
  await step(1.4); await shot('l2-hall');
  for (let i = 0; i < 60 && !(await S('SH.LAB.barrels.some((r) => r.kind === "arc" && !r.landed && r.t > 0.45)')); i++) await step(0.1);
  await shot('l2-throw');
  // every attack, as it looks: rolling barrels and barrels from the ceiling
  await S(`SH.LAB.barrels.length = 0; SH.LAB.attack = { type: 'roll', t: 0, n: 0 }`); await step(0.5); await shot('l2-lift'); await step(0.45); await shot('l2-roll');
  log('rolling barrels:', await S('SH.LAB.barrels.filter((r) => r.kind === "roll").length'));
  await S(`SH.LAB.barrels.length = 0; SH.LAB.attack = { type: 'rain', t: 0, n: 0 }`); await step(1.0); await shot('l2-rain');
  log('falling barrels:', await S('SH.LAB.barrels.filter((r) => r.kind === "drop").length'), '| shake', (await S('SH.LAB.shake')).toFixed(2));
  // a barrel landing on you: dizzy, no walking for a moment, then blinking (safe) for a moment more
  await S(`SH.LAB.hits = SH.LAB._hits; SH.player.inv = 0; SH.player.stun = 0; SH.LAB.attack = null; SH.LAB.cool = 99; SH.LAB.barrels.length = 0;
    SH.LAB.barrels.push({ kind: 'arc', sx: ${P.x}, sy: ${P.y}, tx: SH.player.x, ty: SH.player.y, t: 0.98, T: 1, landed: false, lt: 0, spin: 1 });`);
  await step(0.1); log('hit: dizzy for', (await S('SH.player.stun')).toFixed(2), 's, safe for', (await S('SH.player.inv')).toFixed(2), 's'); await shot('l2-dizzy');
  await S(`SH.LAB.barrels.push({ kind: 'arc', sx: ${P.x}, sy: ${P.y}, tx: SH.player.x, ty: SH.player.y, t: 0.98, T: 1, landed: false, lt: 0, spin: 1 });`);
  await step(0.1); log('a second barrel at once: dizzy again?', (await S('SH.player.stun')) > 1.25);
  let p0 = await S('[SH.player.x, SH.player.y]'); await S('SH.keys.left = 1'); await step(0.6); let p1 = await S('[SH.player.x, SH.player.y]');
  log('walks while dizzy:', Math.round(p1[0] - p0[0]));
  await step(1.0); p0 = await S('[SH.player.x, SH.player.y]'); await step(0.3); p1 = await S('[SH.player.x, SH.player.y]'); await S('SH.keys.left = 0');
  log('walks after:', Math.round(p1[0] - p0[0]));
  await S('SH.LAB.cool = 1; SH.LAB.hits = () => false');
  // 5) eight bananas, one after another: catch it, answer three questions (the first time once wrong), it flies to Bongo
  for (let k = 0; k < 8; k++) {
    for (let i = 0; i < 60 && !(await S('!!SH.LAB.banana && SH.LAB.banana.t > 0.4')); i++) await step(0.1);
    const b = await S('[SH.LAB.banana.x, SH.LAB.banana.y]'), d = await S(`Math.round(Math.hypot(SH.LAB.banana.x - SH.player.x, SH.LAB.banana.y - SH.player.y))`);
    const atk = await S('SH.LAB.attack ? SH.LAB.attack.type : "-"'), flying = await S('SH.LAB.barrels.length');
    await S(`SH.player.stun = 0; SH.player.inv = 0; SH.tp(${b[0]}, ${b[1]})`); await step(0.1);
    const mode = await S('SH.game.mode');
    const qs = [];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 60 && await S(`!document.querySelector('.tbBlank') || document.querySelector('.tbBlank').classList.contains('filled')`); i++) await sleep(100);
      const q = await S(`document.querySelector('.tbSent').textContent`), ans = await S('SH.LAB.questions()[SH.LAB.qOrder[SH.LAB.qi - 1]].answer');
      if (k === 0 && j === 0) {
        await S(`(() => { const a = SH.LAB.questions()[SH.LAB.qOrder[SH.LAB.qi - 1]].answer; [...document.querySelectorAll('.tbBtn')].find((b) => b.dataset.v !== a).click(); })()`);
        await sleep(300);
        log('  wrong answer: buttons dimmed', await S(`document.querySelectorAll('.tbBtn.dim').length`), '| still asking', await S(`!document.querySelector('.tbBlank').classList.contains('filled')`));
        await shot('l2-question');
      }
      await S(`document.querySelector('.tbBtn.tb-' + SH.LAB.questions()[SH.LAB.qOrder[SH.LAB.qi - 1]].answer).click()`);
      qs.push(q.replace('?', '___') + ' -> ' + ans);
      for (let i = 0; i < 80 && await S(`SH.game.mode === 'minigame' && !!document.querySelector('.tbBlank') && document.querySelector('.tbBlank').classList.contains('filled')`); i++) await sleep(100);
    }
    for (let i = 0; i < 50 && await S(`SH.game.mode === 'minigame'`); i++) await sleep(100);
    if (k === 0) { await step(0.35); await shot('l2-fly'); await step(0.6); await shot('l2-eat'); }
    log('banana', k + 1, '| was', d, 'away | attack then:', atk, flying, 'barrels | caught ->', mode, '| given', await S('SH.state.lab.bananas'), '| slots lit', await S(`document.querySelectorAll('#bbSlots span.on').length`), '|', qs.join(' ; '));
    await step(0.3);
  }
  await step(2.6); log('Bongo:', await lines());
  log('stage', await S('SH.state.lab.stage'), '| card:', await card(), '| barrels after calm', await S('SH.LAB.barrels.length'), '| music:', await S('SH.LAB.music()'), '| bar calm', await S(`document.getElementById('bossBar').classList.contains('calm')`));
  await step(1.5); await shot('l2-calm');
  // Bongo's present: his tie, worn at once, in the wardrobe too (and no longer on Bongo)
  log("Bongo's tie: unlocked", await S(`SH.state.unlocked.indexOf('tie') >= 0`), '| worn', await S('!!(SH.state.wear && SH.state.wear.tie)'), '| Bongo still has it', !(await S('SH.LAB.tieGiven()')));
  await S('SH.Wardrobe.open()'); await sleep(500); await shot('l2-wardrobe'); await S('SH.Wardrobe.close()');
  // 6) out through the door at the bottom of the hall, to Dr. Fizz
  await S(`SH.tp(${R.door}, ${R.y1 - 40})`); await S('SH.keys.down = 1'); for (let i = 0; i < 30 && await S('SH.LAB.inRoom()'); i++) await step(0.1); await S('SH.keys.down = 0');
  log('outside again:', !(await S('SH.LAB.inRoom()')), '| at', JSON.stringify(await S('[Math.round(SH.player.x), Math.round(SH.player.y)]')), '| boss bar hidden', await S(`document.getElementById('bossBar').classList.contains('hidden')`));
  await step(0.6); await shot('l2-out');
  await S('SH.tp(SH.NPC.fizz.x + 10, SH.NPC.fizz.y + 60)'); await step(0.3);
  await S(`SH.interact(SH.interactables().find((o) => o.id === 'fizz'))`); log('Dr. Fizz:', await lines());
  log('stage', await S('SH.state.lab.stage'), '| saved', await S(`(() => { try { return JSON.stringify(JSON.parse(localStorage.getItem('sunnyHill.save.v1')).lab); } catch (e) { return 'x'; } })()`));
}
