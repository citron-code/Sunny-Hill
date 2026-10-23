// Level 6: coming back to the school island after passing the quiz (a saved game, the TEST menu's shortcut, Continue):
// the gate is open and stays walkable both ways; a new game (quiz not passed) has it shut again.
export default async function ({ evaluate, sleep, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  const pos = () => S('[Math.round(SH.player.x), Math.round(SH.player.y)]');
  const walk = async (dx, secs) => { await S(`SH.keys.${dx > 0 ? 'right' : 'left'} = 1`); await step(secs); await S('SH.keys.right = 0; SH.keys.left = 0'); return pos(); };
  const story = (school) => S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = ${JSON.stringify(school)}; SH.Save.save();`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  // 1) a saved game where the quiz is passed: land on the pier (as the TEST shortcut and Continue do)
  await story({ stage: 'pass', met: 1, tries: 1, best: 30, yard: 1 });
  await S('SH.ISLE6.land()'); await lines(); await step(0.5); await lines();
  const G = await S('SH.ISLE6.GATE.x');
  await S(`SH.tp(${G - 60}, SH.ISLE6.SHIPAT.y)`); await step(0.2);
  const inP = await walk(1, 2.2);
  log('walking in through the gate: from', G - 60, 'to', JSON.stringify(inP), inP[0] > G + 40 ? 'OK, in' : 'STUCK at the gate');
  const outP = await walk(-1, 2.2);
  log('walking out again: to', JSON.stringify(outP), outP[0] < G - 30 ? 'OK, out' : 'STUCK at the gate');
  log('a path from the pier to the yard:', await S(`!!SH.findPath(${G - 60}, SH.ISLE6.SHIPAT.y, 1900, 5700)`));
  // 2) after a reload and Continue (on the island again)
  await S('SH.Save.save(); location.reload()'); await sleep(2500);
  for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
  await sleep(400); await S(`document.getElementById('tContinue').click()`); await sleep(400); await lines(); await step(0.5); await lines();
  log('after Continue: on the school island', await S('SH.ISLE6.here()'));
  await S(`SH.tp(${G - 60}, SH.ISLE6.SHIPAT.y)`); await step(0.2);
  const inP2 = await walk(1, 2.2);
  log('in through the gate again:', JSON.stringify(inP2), inP2[0] > G + 40 ? 'OK, in' : 'STUCK at the gate');
  // 3) a new game in the same page: the quiz not passed, the gate shut
  await story({});
  await S('SH.ISLE6.land()'); await lines(); await step(0.5);
  await S(`SH.tp(${G - 60}, SH.ISLE6.SHIPAT.y)`); await step(0.2);
  const shut = await walk(1, 2.2);
  log('not passed: the gate stops you', JSON.stringify(shut), shut[0] < G ? 'OK, shut' : 'GOT THROUGH');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
