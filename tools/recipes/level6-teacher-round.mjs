// Batuhan Teacher's own round in the school garden (gate, flowers, list, bell, nap, goalkeeper, crab): what he does at each
// stop, and that what he holds there (the watering can) is put away when he walks on; he walks (not slides). FLAT=1.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true }); SH.state.lab = { stage: 'done' }; SH.state.ship = { stage: 'ready', got: [], capt: 1, sailed: 1 }; SH.state.sea = { stage: 'won', hits: 5, map: 1 }; SH.state.isle = { stage: 'won', f: 5, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, coinTold: 1, kim: { done: 1 }, home: SH.ISLE6.today(), day: { d: SH.ISLE6.today(), in: 1, n: 9, home: 1 } }; SH.state.wear = { uniform: true }; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true'); await step(0.5); await lines();
  await S('SH.tp(1900, 5700)'); await step(0.3);          // (you far away: he does not wait for you)
  const st = () => S(`JSON.stringify((({ k, i, act, moving, sitting, x, y }) => ({ k, i, act: act || null, moving, sitting: !!sitting, x: Math.round(x), y: Math.round(y) }))(SH.ISLE6.tchNow()))`);
  const seen = []; let last = '', bad = 0, slides = 0, px = null;
  for (let s = 0; s < 1400; s++) {
    await step(0.25); if (await S('SH.Dialog.open')) { if (s < 4) log('   (words:', await S('SH.Dialog.who + ": " + SH.Dialog.text'), ')'); await lines(); }
    const o = JSON.parse(await st());
    if (s === 20) log('   after 5 s:', JSON.stringify(o), '| mode', await S('SH.game.mode'), '| asm', await S('JSON.stringify(SH.ISLE6.asm)'), '| gone', await S('SH.ISLE6.tchNow().gone'), '| st', await S('SH.ISLE6.tchNow().st'));
    if (o.act && o.k !== 'water') bad++;          // (the can, or anything in his hands, where it does not belong)
    if (px && Math.hypot(o.x - px[0], o.y - px[1]) > 6 && !o.moving && !o.sitting && o.k === 'walk') slides++;
    px = [o.x, o.y];
    const key = o.k + (o.act ? '+' + o.act : '');
    if (key !== last) { seen.push(key + '@' + o.x + ',' + o.y); last = key; if (o.k === 'water') { await S('SH.render()'); await shot('l6-tch-water' + T); } }
    if (o.k === 'walk' && seen.length > 3 && seen[seen.length - 2].startsWith('water')) { await S(`SH.tp(${o.x + 60}, ${o.y + 90})`); await step(0.5); await S('SH.render()'); await shot('l6-tch-after-water' + T); await S('SH.tp(1900, 5700)'); }
    if (seen.filter((k) => k.startsWith('gate')).length >= 2) break;
  }
  log('his round:', seen.join(' → '));
  log('something in his hands away from the flowers:', bad, '| slid without walking:', slides);
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
