// A picture of each free-play game's screen in the 3D view (its 3D scene), quickly: fish, apples, kite, potions, the map,
// digging (near and far), hide and seek (asking, counting), the race podium. ONLY=potion,race: just those.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), only = (process.env.ONLY || '').split(',').filter(Boolean), want = (k) => !only.length || only.includes(k);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";');
  for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()');
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true }); SH.state.lab = { stage: 'done' }; SH.state.ship = { stage: 'ready', got: [], capt: 1, sailed: 1 }; SH.state.sea = { stage: 'won', hits: 5, map: 1 }; SH.state.isle = { stage: 'won', f: 5, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, coinTold: 1 }; SH.state.wear = { uniform: true }; SH.state.eggs = { treasure: 1 }; SH.refreshPlayerLook(); SH.Speech.speak = () => {};`);
  const pic = async (n) => { await sleep(500); await S("document.getElementById('toast').classList.add('hidden')"); await shot('fun3d-' + n); };
  const close = () => S('SH.FUN.close()');
  if (want('fish')) {
    await S(`SH.FUN.start('fish')`); await sleep(300); await S(`(() => { const G = SH.FUN.G; SH.FUN.fishCast(); G.bob.t = 1; G.ph = 'bite'; })()`); await pic('fish-bite');
    await S(`(() => { const G = SH.FUN.G; G.kinds[G.r] = 2; SH.FUN.fishPull(); })()`); await sleep(900); await pic('fish-near');
    await close(); await S(`SH.FUN.start('fish')`); await sleep(300); await S(`(() => { const G = SH.FUN.G; SH.FUN.fishCast(); G.bob.t = 1; G.kinds[G.r] = 3; SH.FUN.fishPull(); })()`); await sleep(1100); await pic('fish-far'); await close();
  }
  if (want('apples')) { await S(`SH.FUN.start('apples')`); await sleep(2400); await pic('apples'); await close(); }
  if (want('kite')) { await S(`SH.FUN.start('kite')`); await S('SH.FUN.G.time = 60'); await sleep(2600); await pic('kite'); await close(); }
  if (want('potion')) { await S(`SH.FUN.start('potion')`); await sleep(5400); await S(`SH.FUN.potTap(...SH.FUN.tapAt3('red', 60))`); await sleep(500); await pic('potion-pick'); await S(`SH.FUN.potTap(...SH.FUN.tapAt3('blue', 153))`); await sleep(700); await pic('potion-pour'); await sleep(900); await pic('potion-made'); await close(); }
  if (want('map')) { await S(`(SH.state.fun = SH.state.fun || {}, SH.state.fun.hunt = null, SH.FUN.huntStart())`); await sleep(900); await pic('map'); await close(); }
  if (want('dig')) {
    await S(`SH.state.fun.hunt = { stops: ['tent', 'boat', 'barn'], i: 0 }; SH.FUN.start('dig')`); await sleep(300); await pic('dig-x');
    for (let k = 0; k < 3; k++) { await S('SH.FUN.digTap(200, 222)'); await sleep(150); } await sleep(1300); await pic('dig-found');
    await S(`(() => { const G = SH.FUN.G; G.ph = 'far'; G.t = 0; })()`); await sleep(400); await pic('dig-far'); await close();
    await S(`SH.state.fun.hunt = { stops: ['tent', 'windmill', 'barn'], i: 2 }; SH.FUN.start('dig')`); await sleep(200); for (let k = 0; k < 3; k++) { await S('SH.FUN.digTap(200, 222)'); await sleep(150); } await sleep(1000); await S(`SH.FUN.G.ph = 'open'`); await sleep(800); await pic('dig-chest'); await close();
    await S('SH.state.fun.hunt = null');
  }
  if (want('hide')) {
    await S(`SH.FUN.start('hide', 'pip')`); await sleep(600); await pic('hide-ask');
    await S(`document.querySelector('#fBtns button').click()`); await S('SH.FUN.G.t = 4.6'); await sleep(500); await pic('hide-count');
    await S('SH.FUN.G.t = 9.6'); await sleep(400); await pic('hide-gone'); await S(`SH.FUN.G.ph = 'x'`); await close(); await S('SH.FUN.hideStop && SH.FUN.hideStop()');
  }
  if (want('race')) { await S(`SH.FUN.race = { ph: 'res', order: ['amy', 'player', 'zoe', 'ben', 'sam'], me: 1 }; SH.FUN.start('race')`); await sleep(800); await pic('race'); await close(); }
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
