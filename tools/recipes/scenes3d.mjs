// Jumps straight into each quest's scene and takes a full-size 3D screenshot of it.
export default async function ({ evaluate, shot, sleep }) {
  const S = (e) => evaluate(e);
  const next = async () => { for (let i = 0; i < 10 && await S('SH.Dialog.open'); i++) { await sleep(300); await S(`document.getElementById('dlgNext').click()`); } };
  const at = (id, stage, q, extra) => S(`(() => { const s = SH.state; s.quest = SH.Quests.index('${id}'); s.stage = '${stage}'; s.q = ${JSON.stringify(q)};
    s.done = ['brother','family','chores','animals','where','bedtime','truefalse','final'].slice(0, s.quest); s.stars = s.quest; ${extra || ''} })()`);
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await next();
  await at('chores', 'active', { placed: ['shirt'], wrong: {}, carry: 'book' });
  await S('SH.tp(1220, 640)'); await sleep(800); await shot('s3-chores');
  await at('animals', 'active', { home: ['goat'] });
  await S(`(() => { const h = SH.HERD; h[0].st = 'pen'; h[0].x = h[0].pen.x; h[0].y = h[0].pen.y; for (const a of h.slice(1)) { a.st = 'follow'; } SH.tp(SH.PEN_GATE.x + 110, SH.PEN_GATE.y - 40); for (const [i, a] of h.slice(1).entries()) { a.x = SH.PEN_GATE.x + 150 + i * 40; a.y = SH.PEN_GATE.y - 60 + i * 10; } })()`);
  await sleep(1500); await shot('s3-animals');
  await at('bedtime', 'find', { given: [], carry: 'pjPip' });
  await S(`SH.tp(1900, 660); SH.NPC.pip.sleeping = SH.NPC.pop.sleeping = true; SH.game.sleepT = 99;`); await sleep(2500); await shot('s3-bedtime');
  await S(`SH.NPC.pip.sleeping = SH.NPC.pop.sleeping = false; SH.game.sleepT = 0;`);
  await at('final', 'available', {}, `SH.state.unlocked = ['hat','glasses','cape','crown']; SH.state.wear = { glasses: true, cape: true, crown: true }; SH.Wardrobe.close();`);
  await S(`(() => { SH.state.stars = 7; })()`);
  await S('SH.tp(SH.DOOR.x, SH.DOOR.y + 75)'); await sleep(1200); await shot('s3-door');
  await S('SH.tp(SH.LANDMARK.treehouse.x, SH.LANDMARK.treehouse.y + 90)'); await sleep(800); await shot('s3-treehouse');
  await S('SH.tp(1782, 1370)'); await sleep(800); await shot('s3-dock');
  // a dialog with the owl
  await at('truefalse', 'available', {});
  await S(`(() => { const it = SH.interactables().find(o => o.id === 'owl'); SH.tp(it.x, it.y + 40); SH.interact(it); })()`); await sleep(1000); await shot('s3-owl-dialog');
}
