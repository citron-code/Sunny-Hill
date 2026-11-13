// Level 7, the Green Islands' south islets (garden, field, hill; for the unit's next topics): bridge ends on land, middles over
// water; this week their gates are locked: no way there on foot, the gate says so; the islets themselves have dry ways.
export default async function ({ evaluate, sleep, shot }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 },
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 }, trip: { st: 'green', d: SH.ISLE6.today(), seen: 1, landed: 1, seen3: 'meadow' } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE7.land()'); await lines(); await step(0.3);
  log('bridges:', await S(`JSON.stringify(SH.ISLE7.BRIDGES.map((B) => { const I = SH.ISLE7, m = [(B.a[0] + B.b[0]) / 2, (B.a[1] + B.b[1]) / 2]; return 'ends c' + Math.round(I.coastD(...B.a)) + '/c' + Math.round(I.coastD(...B.b)) + ' mid c' + Math.round(I.coastD(...m)) + ' len ' + Math.round(Math.hypot(B.b[0] - B.a[0], B.b[1] - B.a[1])); }))`));
  log('isles apart:', await S(`(() => { const I = SH.ISLE7, out = []; for (let y = 7000; y < 9950; y += 20) for (let x = 100; x < 4150; x += 20) { let n = 0; for (const L of I.ISLES) if (I.isleD(L, x, y) > -10) n++; if (n > 1 && !I.onBridge(x, y)) out.push(x + ',' + y); } return out.length ? out.slice(0, 6).join(' ') + ' (' + out.length + ')' : 'yes'; })()`));
  log('locked (no way from the pier):', await S(`JSON.stringify(['garden', 'field', 'hill'].map((id) => { const L = SH.ISLE7.ISLES.find((q) => q.id === id), p = SH.findPath(700, 8000, L.x, L.y), e = p && p[p.length - 1]; return id + ' ' + (!p || Math.hypot(e.x - L.x, e.y - L.y) > 300 ? 'yes' : 'NO'); }))`));
  log('ways inside:', await S(`JSON.stringify([['garden', 'field'], ['field', 'hill']].map(([f, t]) => { const I = SH.ISLE7, A = I.ISLES.find((q) => q.id === f), B = I.ISLES.find((q) => q.id === t), p = SH.findPath(A.x, A.y, B.x, B.y); if (!p) return f + '-' + t + ' none'; let wet = 0, prev = [A.x, A.y]; for (const q of p) { for (let k = 0; k <= 20; k++) { const x = prev[0] + (q.x - prev[0]) * k / 20, y = prev[1] + (q.y - prev[1]) * k / 20; if (I.coastD(x, y) < 0 && !I.onBridge(x, y)) wet++; } prev = [q.x, q.y]; } return f + '-' + t + ' wet ' + wet; }))`));
  await S('SH.tp(1240, 8400)'); await step(0.3);
  log('the gate:', await S(`(() => { const o = SH.interactables().find((o) => /^gate7_/.test(o.id)); if (!o) return 'none'; SH.interact(o); return SH.Dialog.open ? SH.Dialog.text : 'no words'; })()`)); await lines();
  await S('SH.tp(1330, 8330)'); await step(0.6); await shot('l7-gate');
  log('trees, flowers:', await S('SH.ISLE7.trees.length + " / " + SH.ISLE7.deco.length'));
  await S('SH.tp(2950, 9290)'); await step(0.8); await shot('l7-new-field-hill');
}
