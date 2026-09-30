// 1) The in-place reset (used where a page cannot reload itself): reset in the middle of Quest 4 with
//    animals following, Leo found, surprises found and a mini game open, then play Quest 1 again.
// 2) On a phone held sideways, every window's main buttons can be pressed without scrolling.
export default async function ({ evaluate, sleep, shot, viewport }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  await viewport(900, 600);
  await S(`SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; SH.Dialog.close();`);
  // a messy state: Quest 4 in progress, two animals following, secrets found, an accessory worn, a mini game open
  await S(`(() => { const s = SH.state; s.quest = SH.Quests.index('animals'); s.stage = 'active'; s.q = { home: ['goat'] };
    s.done = ['brother','family','chores']; s.stars = 3; s.unlocked = ['hat']; s.wear = { hat: true }; s.eggs = { cat: 1, frog: 1 };
    for (const a of SH.HERD.slice(1)) a.st = 'follow'; SH.EGGS.cat.awake = 5; SH.EGGS.treasure.open = 1;
    SH.MINI.trueFalse(SH.Quests.content(SH.Quests.index('truefalse')), () => {}); })()`);
  await sleep(300);
  await S('SH.resetInPlace(SH.state.settings)');
  await sleep(400);
  const st = await S(`({ mode: SH.game.mode, stars: SH.state.stars, quest: SH.state.quest, eggs: Object.keys(SH.state.eggs).length, wear: JSON.stringify(SH.state.wear),
    mgHidden: document.getElementById('mg').classList.contains('hidden'), parent: !document.getElementById('parent').classList.contains('hidden'),
    herd: SH.HERD.map(a => a.st).join(','), leoHidden: SH.NPC.leo.hidden, decoysWander: ['pip','pop','nomi'].every(id => !!SH.NPC[id].wander),
    saved: (() => { try { return JSON.parse(localStorage.getItem('sunnyHill.save.v1')).stars; } catch (e) { return 'x'; } })() })`);
  log('after in-place reset:', JSON.stringify(st));
  await shot('r3-after-reset');
  // go through the parent screen and the creator with real buttons, then play Quest 1
  await S(`document.getElementById('pStart').click()`); await sleep(300);
  await S(`document.getElementById('crName').value = 'Deniz'; document.getElementById('crOk').click()`); await sleep(300);
  const next = async () => { for (let i = 0; i < 10 && await S('SH.Dialog.open'); i++) { await sleep(300); await S(`document.getElementById('dlgNext').click()`); } };
  await next();
  const use = async (id) => { await S(`(() => { const it = SH.interactables().find(o => o.id === '${id}'); SH.tp(it.x, it.y + 34); SH.step(1 / 60, 2); SH.interact(SH.interactables().find(o => o.id === '${id}')); })()`); await sleep(200); await next(); };
  await use('milo');
  for (let k = 0; k < 2; k++) await use(await S(`SH.Quests.target().id`));
  await use('treehouse'); await use('milo');
  await sleep(500);
  log('quest 1 again: stars', await S('SH.state.stars'), '| name', await S('SH.state.name'), '| hat worn', await S('!!(SH.state.wear && SH.state.wear.hat)'));
  // every window at 667 x 375
  await viewport(667, 375, { dpr: 2, mobile: true }); await sleep(300);
  const reach = async (label, sels) => {
    const r = await S(`${JSON.stringify(sels)}.map((sel) => { const e = document.querySelector(sel); const b = e.getBoundingClientRect();
      const x = b.left + b.width / 2, y = b.top + b.height / 2; const top = document.elementFromPoint(x, y);
      return sel + (b.width && y > 0 && y < innerHeight && (top === e || e.contains(top)) ? ' ok' : ' NOT REACHABLE (y=' + Math.round(y) + ')'); })`);
    log(label.padEnd(12), r.join(' | '));
  };
  await S(`document.getElementById('menuBtn').click()`); await sleep(200);
  await shot('r3-menu-landscape'); await reach('menu', ['#mRestart', '#mClose', '#mSound', '#mInfo']);
  await S(`document.getElementById('mRestart').click()`); await sleep(200); await reach('ask', ['#askYes', '#askNo']);
  await S(`document.getElementById('askNo').click(); document.getElementById('mClose').click()`); await sleep(200);
  await S(`SH.state.finished = true; SH.state.finishedAt = '30.09.2026'; SH.Cert.open()`); await sleep(500);
  await shot('r3-cert-landscape'); await reach('certificate', ['#certAgain', '#certWalk']);
  await S(`SH.Cert.close(); SH.Wardrobe.open()`); await sleep(300); await reach('wardrobe', ['#wdOk']); await S('SH.Wardrobe.close()');
  await S(`SH.Parent.open(true)`); await sleep(300); await shot('r3-parent-landscape'); await reach('parent', ['#pStart']);
  await S(`document.getElementById('pStart').click(); SH.Creator.open()`); await sleep(300); await reach('creator', ['#crOk']);
}
