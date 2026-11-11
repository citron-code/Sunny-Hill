// Level 7 (unit 3, the school trip), part 3: the Green Islands' stations, played through. The meadow: the magnifier on six
// living things (what is it? an animal or a plant?) and three bits of litter (is it living? no: the bin); the notebook. The
// pond: the sign (what is it about?), three dips with the net, the dragonfly and the mosquito, hopping on the water lilies
// to the frog and back; the notebook. The forest: the sign, the lookout's binoculars (big animals, small animals, birds?).
// Batuhan Teacher: what did you see? The notebook. FLAT=1: the flat view. NARROW=1: a phone held upright.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`(() => { const o = SH.interactables().find((o) => o.id === ${JSON.stringify(id)}); if (!o) return 'none'; SH.interact(o); return 'ok'; })()`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const barOn = () => S(`(() => { const l = document.getElementById('ls'); return !!l && !l.classList.contains('hidden'); })()`);
  const bar = () => S(`document.getElementById('lsQ').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`);
  const pick = async (text) => { for (let i = 0; i < 30 && !(await barOn()); i++) { if (await S('SH.Dialog.open')) await lines(); await step(0.1); await sleep(80); } const q = await bar(); const r = await S(`(() => { const b = [...document.querySelectorAll('#lsBtns button')].find((b) => !b.disabled && b.textContent.trim() === ${JSON.stringify(text)}); if (!b) return false; b.click(); return true; })()`); await sleep(1050); await step(0.1); return q + (r ? '' : '  [NOT FOUND: ' + text + ']'); };
  const wrong = () => S(`(() => { const b = [...document.querySelectorAll('#lsBtns button')].find((b) => !b.disabled && !/Yes|No|animal|plant/.test(b.textContent)); b.click(); return b.textContent + ' -> ' + document.getElementById('lsS').textContent; })()`);
  const okNote = async () => { for (let i = 0; i < 30 && !(await S(`!!document.getElementById('pnl7') && document.getElementById('pnl7').className === 'note'`)); i++) { if (await S('SH.Dialog.open')) await lines(); await step(0.2); await sleep(30); } const on = await S(`!!document.getElementById('pnl7') && document.getElementById('pnl7').className === 'note'`); if (on) await S(`document.querySelector('#pnl7 .ok7').click()`); await step(0.2); return on; };
  const T7 = () => S('JSON.stringify((({ got, bin, ps, dip, fs, saw, end, seen3 }) => ({ got: Object.keys(got || {}).length, bin: Object.keys(bin || {}).length, ps, dip, fs, saw: Object.keys(saw || {}).length, end, seen3 }))(SH.state.school.trip)) + " " + SH.TRIP.stage3()');
  const W = (id) => S(`SH.NATURE.word(${JSON.stringify(id)})`), K = (id) => S(`SH.NATURE.KIND[${JSON.stringify(id)}] === 'animal' ? 'It is an animal.' : 'It is a plant.'`);
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 3, home: '01.11.2026', kim: { st: 'tour', done: 1 }, coins: 50,
      les: { show: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), n: 9, home: 1, in: 1, trip: 1 }, trip: { st: 'green', d: SH.ISLE6.today(), seen: 1, landed: 1, seen3: 'meadow' } };
    SH.state.unlocked = ['uniform', 'captain']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE7.land()'); await lines(); await S('SH.game.paused = true'); await step(0.5);
  log('on the islands:', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| class', await S('JSON.stringify(SH.TRIP.crew.map((c) => c.id + " " + Math.round(c.x) + "," + Math.round(c.y)))'), '|', await T7());
  // the meadow: the living things with the magnifier, the litter in the bin
  const meadow = ['ant', 'flower', 'grass', 'earthworm', 'bee', 'butterfly', 'bottle', 'can', 'cup'], qs = [];
  for (const id of meadow) {
    const it = await S(`JSON.stringify(SH.ISLE7.ITEMS.find((i) => i.id === ${JSON.stringify(id)}))`).then(JSON.parse);
    await S(`SH.tp(${it.x}, ${it.y + 40})`); await step(0.2);
    const r = await talk('n7_' + id);
    if (id === 'ant') { await step(0.2); await sleep(200); if (!process.env.NARROW) await shot('l7-isles-lens' + T); qs.push('   wrong: ' + await wrong()); await sleep(300); }
    const q1 = await pick(await W(id));
    const q2 = await pick(it.litter ? "No, it isn't." : await K(id));
    qs.push(`${id} (${r}): ${q1}  ->  ${q2}  -> ${await S(`document.getElementById('toast').textContent`)}`);
  }
  log('meadow:\n  ' + qs.join('\n  ')); log('   now', await T7(), '| card', await card());
  for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) await step(0.2);
  log('meadow done:', await lines()); await step(0.3);
  if (!process.env.NARROW) await shot('l7-isles-note' + T);
  log('   notebook:', await okNote(), '| then', await lines(), '| coins', await S('SH.Coins.get()'));
  for (let i = 0; i < 80 && await S('!!SH.TRIP.walk'); i++) await step(0.25);
  log('   the class at the pond:', await S('JSON.stringify(SH.TRIP.crew.map((c) => c.id + " " + Math.round(c.x) + "," + Math.round(c.y)))'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  // the pond: the sign, the net, the flyers, the frog
  await S('SH.tp(1960, 7900)'); await step(0.2); log('pond sign:', await talk('sign7p'), await pick("It's about plants and animals in a pond."), '|', await lines());
  for (let i = 0; i < 10; i++) { await step(0.2); if (await S('SH.Dialog.open')) { log('   ', await lines()); break; } }
  const pond = [];
  for (let n = 0; n < 3; n++) {
    await S('SH.tp(2290, 7800)'); await step(0.2); const r = await talk('dip7'); await sleep(900); await step(0.2);
    const id = await S(`SH.TRIP.CATCH[${n}]`); if (n === 0 && !process.env.NARROW) await shot('l7-isles-dip' + T);
    pond.push(`dip ${n + 1} (${r}): ${id} ${await pick(await W(id))}`);
  }
  for (const id of ['dragonfly', 'mosquito']) { const it = await S(`JSON.stringify(SH.ISLE7.ITEMS.find((i) => i.id === ${JSON.stringify(id)}))`).then(JSON.parse); await S(`SH.tp(${it.sx}, ${it.sy})`); await step(0.2); pond.push(`${id} (${await talk('n7_' + id)}): ${await pick(await W(id))} -> ${await pick(await K(id))}`); }
  log('pond:\n  ' + pond.join('\n  ')); for (let i = 0; i < 10; i++) { await step(0.2); if (await S('SH.Dialog.open')) { log('   ', await lines()); break; } }
  await S('SH.tp(2290, 7800)'); await step(0.2); log('hop:', await talk('hop7'), '| card', await card());
  for (let i = 0; i < 60 && !(await S('SH.Dialog.open')); i++) { await step(0.1); if (i === 8 && !process.env.NARROW) await shot('l7-isles-hop' + T); }
  log('   at the frog: you', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '|', await lines(), '|', await pick(await W('frog')));
  for (let i = 0; i < 80 && await S('!!SH.TRIP.hop || SH.TRIP.busy3'); i++) await step(0.1);
  log('   back on the little pier: you', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '|', await T7());
  for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) await step(0.2);
  log('pond done:', await lines(), '| notebook', await okNote(), '|', await lines());
  for (let i = 0; i < 120 && await S('!!SH.TRIP.walk'); i++) await step(0.25);
  // the forest: the sign, the binoculars
  await S('SH.tp(2965, 8150)'); await step(0.2); log('forest sign:', await talk('sign7f'), await pick("It's about animals in a forest."), '|', await lines());
  for (let i = 0; i < 10; i++) { await step(0.2); if (await S('SH.Dialog.open')) { log('   ', await lines()); break; } }
  await S('SH.tp(3540, 8300)'); await step(0.2); log('lookout:', await talk('bino7'));
  const zoo = [];
  for (const id of ['deer', 'rabbit', 'squirrel', 'bird']) {
    for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) { await step(0.1); await sleep(60); }
    if (id === 'deer' && !process.env.NARROW) await shot('l7-isles-bino' + T);
    const l = await lines(), g = { deer: 'Big Animals', rabbit: 'Small Animals', squirrel: 'Small Animals', bird: 'Birds' }[id];
    zoo.push(`${l} -> ${await pick(g)}`); await sleep(800); await step(0.1);
  }
  log('binoculars:\n  ' + zoo.join('\n  '), '\n   now', await T7());
  for (let i = 0; i < 20 && !(await S('SH.Dialog.open')); i++) await step(0.2);
  log('forest done:', await lines()); for (let i = 0; i < 80 && await S('!!SH.TRIP.walk'); i++) await step(0.25);
  log('   card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  if (!process.env.NARROW) { await S('SH.tp(3440, 8330)'); await step(0.3); await shot('l7-isles-forest' + T); }
  const tc = await S('JSON.stringify([Math.round(SH.TRIP.crew[0].x), Math.round(SH.TRIP.crew[0].y)])').then(JSON.parse);
  await S(`SH.tp(${tc[0]}, ${tc[1] + 60})`); await step(0.2); log('the teacher:', await talk('g7_teacher'), await lines(), '| notebook', await okNote(), '|', await lines(), '|', await T7(), '| card', await card(), '| coins', await S('SH.Coins.get()'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
