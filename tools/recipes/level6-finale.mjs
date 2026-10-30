// Level 6, the end of the school day: all the lessons done. The first time: Mr. Smith wants to see you; in his office he
// asks you to show Kim (the new student) the school: "Nice to meet you!", "When is recess? After math class.", then four
// questions ("Where is the cafeteria? It's near the gym.") and you walk there, Kim following; the nurse gives lollipops.
// Then home time: the bell, the report card (stickers, coins, +20), and the ship can sail. Kim sits in the lobby after.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const settle = async (out) => {          // the words go by; stop at a choice (or when nothing more happens)
    for (let i = 0; i < 120; i++) {
      if (await S('SH.Dialog.open')) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); continue; }
      if (await S('SH.SCHOOLIN.choosing')) return 'choose';
      if (await S(`!document.getElementById('karne') ? false : !document.getElementById('karne').classList.contains('hidden')`)) return 'karne';
      await step(0.1); await sleep(80);
      if (i > 30 && !(await S('SH.Dialog.open'))) return 'idle';
    }
    return 'idle';
  };
  const choices = () => S(`document.getElementById('lsQ').textContent + ' | ' + [...document.querySelectorAll('#lsBtns button')].map((b) => b.textContent).join(' / ')`);
  const pick = (t) => S(`[...document.querySelectorAll('#lsBtns button')].find((b) => b.textContent === ${JSON.stringify(t)}).click()`);
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";');
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    const L = {}; for (const id of ['english','math','music','pe','art','lunch','lost','reading','writing']) L[id] = { plays: 1, best: 8 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: L, art: { del: ['classroom', 'library', 'computer'] }, news: { a: 'zoe', b: 'sam' }, coins: 150, day: { d: SH.ISLE6.today(), in: 1, n: 9 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); { const o = []; await settle(o); }
  log('the garden, the day done: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  await S('SH.ISLE6.shipTalk()'); log('   the ship before home time:', (await (async () => { const o = []; await settle(o); return o.join(' | '); })()));
  await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  log('inside: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| kim', await S('JSON.stringify(SH.state.school.kim)'));
  await S('SH.tp(800, 2400)'); await step(0.3);
  log('in the office: arrow', await S('JSON.stringify(SH.Quests.target())'), '| staff', await S(`JSON.stringify(SH.SCHOOLIN.staff().map((p) => p.id + ' ' + Math.round(p.x) + ',' + Math.round(p.y)))`));
  await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-fi-office' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await talk('in6_smith');
  let out = []; let r = await settle(out); log('meet:', out.join(' | '), '->', r);
  log('   choice:', await choices()); await pick('Goodbye, Kim!'); await step(0.1); log('   a wrong one:', await S(`document.getElementById('lsS').textContent`)); await shot('l6-fi-choose' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await pick('Nice to meet you, Kim!'); await sleep(1000);
  out = []; r = await settle(out); log('   ', out.join(' | '), '->', r, '|', await choices()); await pick('After math class.'); await sleep(1000);
  out = []; r = await settle(out); log('   ', out.join(' | '), '->', r);
  const tour = await S('JSON.stringify(GAME_CONTENT.school.finale.tour.map((t) => [t.room, t.a]))').then(JSON.parse);
  const spot = { cafeteria: [340, 2450], nurse: [640, 2400], library: [1810, 2060], computer: [1860, 2450] };
  for (const [room, ans] of tour) {
    log('Kim asks:', await choices()); await pick(ans); await sleep(1000);
    out = []; r = await settle(out); log('   ', out.join(' | '), '-> card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
    await S(`SH.tp(${spot[room][0]}, ${spot[room][1]})`); await step(0.6);
    log('   kim follows at', await S('JSON.stringify(SH.SCHOOLIN.kimP && [Math.round(SH.SCHOOLIN.kimP.x), Math.round(SH.SCHOOLIN.kimP.y)])'));
    if (room === 'cafeteria') { await S('SH.tp(' + (spot[room][0] - 60) + ', ' + spot[room][1] + ')'); for (let i = 0; i < 12; i++) await step(0.1); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-fi-follow' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '')); }
    out = []; r = await settle(out); log('   there:', out.join(' | '), '->', r);
    while (r === 'choose' && /^Ms. Wilson/.test(await S("document.getElementById('lsQ').textContent"))) { log('   nurse:', await choices()); await shot('l6-fi-nurse' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '')); await pick('Yes, we are. Thank you!'); await sleep(1000); out = []; r = await settle(out); log('   ', out.join(' | '), '->', r); }
  }
  log('kim:', await S('JSON.stringify(SH.state.school.kim)'), '| day', await S('JSON.stringify(SH.state.school.day)'), '| home', await S('SH.state.school.home'));
  if (r !== 'karne') { out = []; r = await settle(out); log('   ', out.join(' | '), '->', r); }
  await sleep(300); await shot('l6-fi-karne' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  log('report card:', await S(`document.querySelector('#karne .kSheet').innerText.replace(/\\n+/g, ' / ')`), '| mode', await S('SH.game.mode'));
  await S(`document.querySelector('#karne .kOk').click()`); await sleep(1800); await step(0.2);
  out = []; r = await settle(out); log('after:', out.join(' | '), '| coins', await S('SH.Coins.get()'), '| card', await card());
  await S('SH.tp(1000, 2440)'); await step(0.3); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-fi-lobby' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  for (const id of ['in6_kim', 'in6_smith', 'in6_wilson', 'in6_penny']) {
    const p = await S(`JSON.stringify(SH.SCHOOLIN.staff().find((p) => 'in6_' + p.id === ${JSON.stringify(id)}))`).then(JSON.parse);
    await S(`SH.tp(${p.x}, ${p.y + 40})`); await step(0.2); await talk(id); out = []; await settle(out); log('talk', id, ':', out.join(' | '));
  }
  await S('SH.SCHOOLIN.exit()'); await step(0.5); out = []; await settle(out);
  log('the garden after home time: card', await card());
  await S('SH.ISLE6.shipTalk()'); await sleep(300); { const o = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { o.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } log('   the ship now (the first time: Sparky on the coins at home):', o.join(' | ')); } await sleep(300); log('   then: pick shown', await S(`(() => { const e = document.getElementById('seaPick'); return !!e && !e.classList.contains('hidden'); })()`));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
