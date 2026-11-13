// The same pictures every time, to compare the game's look before and after a change (TAG=before / TAG=after):
// the main menu, the village (start, Milo's house, the farm, the lake, the forest), a talk with its portrait, the Parrot
// King's village, out at sea, the school island (garden, This & That Corner, the front), the classroom, and a phone.
// GL=gpu TAG=a node tools/drive.mjs tools/recipes/lookbook.mjs [url] [outdir]   (SPOTS=title,village,... for some only)
export default async function ({ evaluate, sleep, shot, viewport }) {
  const S = (e) => evaluate(e), TAG = process.env.TAG || 'a', log = (...a) => console.log(...a);
  const want = (k) => !process.env.SPOTS || process.env.SPOTS.split(',').includes(k);
  const lines = async () => { for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  const settle = async (ms = 700) => { await S('SH.game.paused = false'); await sleep(ms); };
  const snap = async (name) => { await shot(`look-${TAG}-${name}`); log('shot', name); };
  const tp = (x, y) => S(`SH.tp(${x}, ${y})`);
  if (want('title')) { await sleep(2500); await snap('title'); }
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, coinTold: 1, day: { d: SH.ISLE6.today() } };
    SH.Save.save();`);
  if (want('village')) {
    for (const [name, x, y] of [['start', 1200, 1125], ['milo', 720, 680], ['farm', 1880, 620], ['lake', 1700, 1350], ['forest', 1040, 1640]]) {
      await tp(x, y); await settle(); await snap('v-' + name);
    }
  }
  if (want('talk')) {
    await S('SH.tp(SH.NPC.milo.x, SH.NPC.milo.y + 60)'); await settle(400);
    await S(`SH.interact(SH.interactables().find((o) => o.id === 'milo'))`); await sleep(900); await snap('talk'); await lines();
  }
  if (want('phone')) {
    await viewport(844, 390, { dpr: 2, mobile: true }); await tp(1200, 1125); await settle(900); await snap('phone');
    await viewport(1280, 800); await settle(300);
  }
  if (want('parrot')) {
    await S('SH.ISLE5.land()'); await lines(); await settle(500); await lines();
    await tp(880, 3530); await settle(); await lines(); await snap('p-village');
  }
  if (want('sea')) {          // from the Parrot King's pier toward the school island
    if (!(await S('SH.ISLE5.here()'))) { await S('SH.ISLE5.land()'); await lines(); await settle(400); }
    const D = await S('JSON.stringify(SH.ISLE5.DOCK)').then(JSON.parse);
    await tp(D.x0 + 60, (D.y0 + D.y1) / 2); await settle(300);
    await S(`SH.interact(SH.interactables().find((o) => o.id === 'ship5'))`); await sleep(300);
    await S(`(() => { const b = document.querySelector('#spList button.school'); if (b) b.click(); })()`); await lines();
    for (let i = 0; i < 60 && !(await S('SH.SEA.active && !SH.SEA.undock')); i++) { await lines(); await sleep(250); }
    await S('SH.SEA.goal && (SH.SEA.steer = { x: SH.SEA.goal.x, y: SH.SEA.goal.y, t: SH.game.t })'); await sleep(2500); await snap('sea');
    await S('SH.SEA.active && SH.SEA.end(true)');
  }
  if (want('school')) {
    await S('SH.ISLE6.land()'); await lines(); await settle(500); await lines();
    const SC = await S('JSON.stringify(SH.ISLE6.SCHOOL)').then(JSON.parse);
    for (const [name, x, y] of [['garden', 1500, 5600], ['corner', 900, 5700], ['front', SC.door, SC.y1 + 120]]) {
      await tp(x, y); await settle(); await lines(); await snap('s-' + name);
    }
    await S('SH.SCHOOLIN.enter(true)'); await settle(900); await lines();
    const row = await S('JSON.stringify(SH.SCHOOLIN.ROW)').then(JSON.parse);
    await tp(1490, row.n[1] - 110); await settle(); await lines(); await snap('s-classroom');
  }
}
