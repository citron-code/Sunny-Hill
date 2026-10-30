// Level 6, the end of a break in the garden: only the break's clock (no darkening), it runs out: the bell, "Go to class!" big
// on the screen (and said), the classmates run back into the school at once, Batuhan Teacher hurries after them.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } };
  const kids = () => S(`JSON.stringify(SH.ISLE6.kidList().map((k) => k.id + (k.gone ? ' in' : ' ' + Math.round(k.x) + ',' + Math.round(k.y))))`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), in: 1, n: 1, ph: 'break', br: 8 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true');
  await S(`(() => { const Y = SH.ISLE6.YARD; SH.tp(1900, Y.y0 + 200); })()`); await step(1); await sleep(900);          // (after the door's blink)
  log('the break in the garden: clock', await S(`document.getElementById('brk').textContent`), '| kids', await kids(), '| card', await S(`document.getElementById('questCard').textContent.trim()`));
  await shot('l6-br-garden');
  for (let i = 0; i < 40 && await S('SH.SCHOOLIN.onBreak()'); i++) await step(0.25);
  await step(0.2); await sleep(350);
  log('the clock ran out:', await S('JSON.stringify(SH.state.school.day)'), '| on the screen', await S(`(() => { const e = document.getElementById('bigMsg'); return e && !e.classList.contains('hidden') ? e.textContent : '(nothing)'; })()`), '| clock shown', await S(`!document.getElementById('brk').classList.contains('hidden')`));
  await shot('l6-br-go');
  const p0 = await kids(); await step(1); const p1 = await kids();
  log('running:', p0, '->', p1, '| teacher', await S('JSON.stringify([Math.round(SH.ISLE6.tchNow().x), Math.round(SH.ISLE6.tchNow().y)])'));
  await sleep(300); await shot('l6-br-run');
  for (let i = 0; i < 40 && await S('SH.ISLE6.asm && SH.ISLE6.asm.ph !== "done"'); i++) await step(0.25);
  log('all in after', await S('SH.ISLE6.asm && SH.ISLE6.asm.t.toFixed(1)'), 's:', await kids(), '| card', await S(`document.getElementById('questCard').textContent.trim()`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
