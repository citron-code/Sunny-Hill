// Plays Quest 1 end to end through the real input paths (taps, Next button), in real time.
export default async function ({ evaluate, shot, savePng, sleep, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  const t0 = Date.now();
  async function nextAll(tag) {
    const lines = [];
    for (let i = 0; i < 20; i++) {
      if (!(await S('SH.Dialog.open'))) break;
      lines.push(await S(`(SH.Dialog.who||'-') + ': ' + SH.Dialog.text`));
      await sleep(420);
      await S(`document.getElementById('dlgNext').click()`);
      await sleep(80);
    }
    log(`  [${tag}]`, lines.join(' | '));
  }
  // Tap the character on screen if visible, otherwise walk toward it; wait until a dialog opens.
  async function goTalk(id) {
    for (let i = 0; i < 120; i++) {
      if (await S('SH.Dialog.open')) return true;
      const r = await S(`(() => {
        const it = SH.interactables().find(o => o.id === ${JSON.stringify(id)});
        if (!it) return 'missing';
        const sx = (it.x - SH.cam.x) * SH.view.scale, sy = ((it.y - 20) - SH.cam.y) * SH.view.scale;
        if (sx > 20 && sx < SH.view.cw - 20 && sy > 90 && sy < SH.view.ch - 20) { SH.tapAt(sx, sy, false); return 'tap'; }
        SH.walkTo(it.x, it.y + 18, it); return 'walk';
      })()`);
      if (r === 'missing') { log('  !! no interactable', id); return false; }
      await sleep(r === 'tap' ? 400 : 700);
    }
    log('  !! never reached', id); return false;
  }
  await S('SH.quickStart()');
  await nextAll('intro');
  log('card:', await S(`document.getElementById('qcText').textContent`));
  await goTalk('milo'); await sleep(300);
  await shot('10-milo-talk');
  await nextAll('milo');
  log('stage:', await S('SH.state.stage'), 'card:', await S(`document.getElementById('qcText').textContent`));
  await sleep(300); await shot('11-search-arrow');
  for (let k = 0; k < 2; k++) {
    const id = await S(`SH.Quests.target().id || 'treehouse'`);
    log('target ->', id);
    await goTalk(id); await sleep(200);
    if (k === 0) await shot('12-decoy');
    await nextAll(id);
    if (await S('SH.Dialog.open')) await nextAll('hint');
  }
  log('met:', JSON.stringify(await S('SH.state.q')));
  const tgt = await S(`SH.Quests.target() === SH.LANDMARK.treehouse`);
  log('arrow points at tree house:', tgt);
  await goTalk('treehouse'); await sleep(200);
  await shot('13-found-leo');
  await nextAll('treehouse');
  log('stage:', await S('SH.state.stage'), 'leo follow:', await S('SH.NPC.leo.follow'));
  await S(`SH.walkTo(SH.NPC.milo.x - 160, SH.NPC.milo.y + 170)`); await sleep(1500);
  await shot('14-leo-follows');
  await goTalk('milo'); await sleep(200);
  await nextAll('finish');
  await sleep(700); await shot('15-celebrate');
  await sleep(2500); await shot('16-after');
  log('stars:', await S('SH.state.stars'), 'quest:', await S('SH.state.quest'), 'done:', await S('JSON.stringify(SH.state.done)'), 'starBox:', await S(`document.getElementById('starBox').textContent`));
  log('milo marker:', await S(`SH.Quests.marker('milo')`), ' time(s):', ((Date.now() - t0) / 1000).toFixed(1));
  // reload: progress must survive
  await navigate(URL); await sleep(400);
  log('after reload stars:', await S('SH.state.stars'), 'quest:', await S('SH.state.quest'), 'leo hidden:', await S('SH.NPC.leo.hidden'), 'pip wander:', await S('!!SH.NPC.pip.wander'));
}
