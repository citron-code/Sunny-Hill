// The treasure map's ten X places: a picture of each (you a little to its left), to see that the X (and its coin) can be seen.
// FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot }) {
  const S = (e) => evaluate(e), T = process.env.FLAT ? '-2d' : '';
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";');
  for (let i = 0; i < 10 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()');
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true }); SH.state.eggs = { treasure: 1 }; SH.game.paused = true;`);
  for (let i = 0; i < 10 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()');
  for (const k of await S('JSON.stringify(Object.keys(SH.FUN.HUNT))').then(JSON.parse)) {
    const p = await S(`(SH.state.fun = SH.state.fun || {}, SH.state.fun.hunt = { stops: ['${k}', '${k}', '${k}'], i: 0 }, JSON.stringify(SH.FUN.HUNT['${k}']))`).then(JSON.parse);
    await S(`SH.tp(${p[0] - 130}, ${p[1] + 40})`); await S('SH.step(1 / 30, 8)'); await S("document.getElementById('toast').classList.add('hidden')");
    console.log(k, JSON.stringify(p), '| nearest at the X:', await S(`(SH.tp(${p[0]}, ${p[1] + 30}), SH.step(1 / 30, 2), (() => { const o = SH.nearestInteractable(); return o && o.id; })())`));
    await S(`SH.tp(${p[0] - 130}, ${p[1] + 40})`); await S('SH.step(1 / 30, 8)');
    await shot('fun-x-' + k + T);
  }
}
