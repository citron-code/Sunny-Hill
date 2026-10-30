// Level 6: a close look at the music room and the gym (their things), for pictures: from the front, the whole room in view
// (a camera like the gym lesson's), then the usual 3D view and the flat view with you in the room. No lesson is played.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: {}, day: { d: SH.ISLE6.today(), in: 1, n: 2 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S(`SH.SCHOOLIN.STAGES.music.fit = SH.SCHOOLIN.STAGES.music.fit || { c: [740, 40, 2030], pitch: 0.62, D: 520, pts: [[626, 150, 1882], [856, 150, 1882], [626, 0, 2160], [856, 0, 2160]], look: 1 }`);
  for (const [room, id, n, at] of [['music', 'music', 2, [746, 2150]], ['gym', 'pe', 3, [470, 2110]]]) {
    await S(`SH.state.school.day.n = ${n}; SH.tp(${at[0]}, ${at[1]})`); await step(0.3);
    await S("document.getElementById('toast').classList.add('hidden')");
    await S(`SH.SCHOOLIN.lesson = { id: '${id}', ph: 'look', n: 0, right: 0, picked: -1, cheer: 0 }; SH.SCHOOLIN.lcam = null`); await step(0.2);
    await S('SH.SCHOOLIN.lcam = null; SH.render()'); await shot('l6-look-' + room);
    await S('SH.SCHOOLIN.lesson = null; document.body.classList.remove("lsOn", "lsNarrow")'); await S(`SH.tp(${at[0]}, ${at[1] + 30})`); await step(0.3);
    await shot('l6-look-' + room + '-3d');
    await S('SH.setView3(false)'); await sleep(300); await step(0.2); await shot('l6-look-' + room + '-2d'); await S('SH.setView3(true)'); await sleep(300); await step(0.2);
  }
  // the drums, close
  await S('SH.state.school.day.n = 2; SH.tp(746, 2150)'); await step(0.3);
  await S(`SH.SCHOOLIN.STAGES.music.fit = { c: [672, 20, 2015], pitch: 0.8, D: 300, pts: [[626, 62, 1978], [720, 62, 1978], [626, 0, 2058], [720, 0, 2058]], look: 1 };
    SH.SCHOOLIN.lesson = { id: 'music', ph: 'look', n: 0, right: 0, picked: -1, cheer: 0 }; SH.SCHOOLIN.lcam = null`); await step(0.2);
  await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render()"); await shot('l6-look-drums');
  await S('SH.SCHOOLIN.lesson = null; document.body.classList.remove("lsOn", "lsNarrow")'); await step(0.2);
  await S('SH.setView3(false)'); await sleep(300); await S('SH.tp(672, 2075)'); await step(0.3); await shot('l6-look-drums-2d'); await S('SH.setView3(true)'); await sleep(300);
  await S('if (SH.SCHOOLIN.STAGES.music.fit && SH.SCHOOLIN.STAGES.music.fit.look) delete SH.SCHOOLIN.STAGES.music.fit; SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
