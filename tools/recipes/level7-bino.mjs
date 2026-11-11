// Level 7: the lookout's binoculars on the Green Islands' forest island, quickly: straight to the forest part (the sign
// read), up the lookout, each animal through the binoculars (a picture of each), its subtitle chosen. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`(() => { const o = SH.interactables().find((o) => o.id === ${JSON.stringify(id)}); if (!o) return 'none'; SH.interact(o); return 'ok'; })()`);
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 100,
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 },
      trip: { st: 'green', d: SH.ISLE6.today(), seen: 1, landed: 1, seen3: 'forest', got: { flower: 1, grass: 1, ant: 1, earthworm: 1, bee: 1, butterfly: 1, tadpole: 1, fish: 1, lily: 1, dragonfly: 1, mosquito: 1, frog: 1 }, bin: { bottle: 1, can: 1, cup: 1 }, ps: 1, dip: 3, fs: 1 } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE7.land()'); await lines(); await S('SH.game.paused = true'); await step(0.3);
  await S('SH.tp(3540, 8318)'); await step(0.4); await shot('l7-bino-lookout' + T);
  log('the binoculars:', await talk('bino7'));
  const G = { deer: 'Big Animals', rabbit: 'Small Animals', squirrel: 'Small Animals', bird: 'Birds' }, out = [];
  for (const id of ['deer', 'rabbit', 'squirrel', 'bird']) {
    for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) { await step(0.1); await sleep(60); }
    await sleep(1000); await shot('l7-bino-' + id + T);
    const l = await lines();
    for (let i = 0; i < 20 && !(await S(`(() => { const e = document.getElementById('ls'); return !!e && !e.classList.contains('hidden'); })()`)); i++) { await step(0.1); await sleep(60); }
    const r = await S(`(() => { const b = [...document.querySelectorAll('#lsBtns button')].find((b) => !b.disabled && b.textContent.trim() === ${JSON.stringify(G[id])}); if (!b) return 'none'; b.click(); return 'ok'; })()`);
    out.push(id + ': ' + l + ' -> ' + G[id] + ' ' + r); await sleep(1700); await step(0.1);
  }
  log(out.join('\n  '), '\n saw', await S('JSON.stringify(SH.state.school.trip.saw)'), '| stage', await S('SH.TRIP.stage3()'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
