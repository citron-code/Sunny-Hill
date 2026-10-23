// The game goes on where you were (this device): at home, on the school island, in the Parrot King's village, on his hill
// (then at the foot of his stairs), in Dr. Fizz's hall (at its door). Each time: walk there, the page is reloaded, Continue.
export default async function ({ evaluate, sleep, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const pos = () => S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])');
  const again = async () => {          // close the page and open it again: Continue
    await S('SH.Save.save(); location.reload()'); await sleep(2500);
    for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
    await sleep(400);
    await S(`document.getElementById('tContinue').click()`); await sleep(400);
    return lines();
  };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, stage: 'done', done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1 }; SH.Save.save();`);
  // at home
  await S('SH.tp(1500, 700)'); await step(2.2);
  log('kept:', await S('JSON.stringify(SH.state.at)'));
  log('home: words', await again(), '| at', await pos(), '(was 1500, 700)');
  // the school island, in the yard
  await S('SH.ISLE6.land()'); await lines(); await S('SH.tp(1900, 5700)'); await step(2.2);
  log('school: words', await again(), '| on the school island', await S('SH.ISLE6.here()'), '| at', await pos(), '(was 1900, 5700)');
  // the Parrot King's village
  await S('SH.ISLE5.land()'); await lines(); await S('SH.tp(880, 3540)'); await step(2.2);
  log('parrot village: words', await again(), '| there', await S('SH.ISLE5.here()'), '| at', await pos(), '(was 880, 3540)');
  // on his hill: back at the foot of the stairs
  await S('(() => { const H = SH.ISLE5.HILL; SH.tp(H.x, H.y + 40); })()'); await step(2.2); await lines();
  log('on the hill, kept', await S('JSON.stringify(SH.state.at)'));
  log('parrot hill: words', await again(), '| there', await S('SH.ISLE5.here()'), '| at the foot of the stairs', await S('(() => { const H = SH.ISLE5.HILL; return SH.player.x < H.x - H.rx && Math.abs(SH.player.y - SH.ISLE5.RAMP.y) < 40; })()'));
  // Dr. Fizz's hall
  await S('SH.LAB.enter()'); await lines(); await step(2.2);
  log('hall: words', await again(), '| in the hall', await S('SH.LAB.inRoom()'));
  // at sea it is not kept: the last place counts
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
