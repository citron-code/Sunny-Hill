// a visual tour of the Parrot King's island: the same spots every time, so before/after can be compared
// (shots tools/shots/tour-<TAG>-<spot>.png; FLAT=1: the flat view). GL=gpu TAG=x node tools/drive.mjs tools/recipes/level5-tour.mjs
export default async function ({ evaluate, sleep, shot }) {
  const S = (e) => evaluate(e), TAG = (process.env.TAG || 'a') + (process.env.FLAT ? '-2d' : '');
  const lines = async () => { for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] }); SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 }; SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 4, map: 1 }; SH.state.isle = { stage: 'met' };`);
  await S('SH.ISLE5.land()'); await lines();
  const spots = [['pier', 600, 3440], ['village', 880, 3530], ['cages', 900, 3420], ['jungle', 1150, 3430], ['ramp', 1300, 3440], ['top', 1760, 3470], ['throne', 1940, 3480], ['beach', 1300, 3790]];
  for (const [name, x, y] of spots) {
    await S(`SH.tp(${x}, ${y})`); await S('SH.step(1 / 30, 20)'); await lines(); await S('SH.step(1 / 30, 10)'); await sleep(250);
    await shot('tour-' + TAG + '-' + name);
  }
}
