// Level 6, the Sunny Shop: Ms. Penny by the shop's counter in the hall. Talk to her: the shop's screen, your Sunny Coins,
// ten things (for you, for Sparky, for your desk). Buy one: you ask "Can I have a blue cap, please?", she says "Here you
// are! 30 coins, please."; too few coins: "Sorry! You need 12 more coins." Wear it / take it off. You, Sparky and your
// desk as they look then (3D and the flat view).
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const o = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { o.push(await S('SH.Dialog.who + ": " + SH.Dialog.text')); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return o.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const said = () => S(`(() => { const e = document.getElementById('shopSay'); return e ? e.className + ': ' + e.textContent : '-'; })()`);
  const buy = async (id) => { await S(`SH.Shop.tryBuy(GAME_CONTENT.school.shop.items.find((x) => x.id === ${JSON.stringify(id)}))`); const a = await said(); await sleep(1500); return a + ' -> ' + await said() + ' | coins ' + await S('SH.Coins.get()'); };
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";');
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); } await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 } }, coins: 560, day: { d: SH.ISLE6.today(), in: 1, n: 1, ph: 'break', br: 100 } };
    SH.state.unlocked = ['uniform', 'hat']; SH.state.wear = { uniform: true, hat: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S('SH.tp(960, 2240)'); await step(0.3);
  log('by the shop: buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /penny|shop6/.test(o.id)).map((o) => o.id + ' ' + o.label))`));
  await talk('shop6'); log('the sign:', await lines(), '| mode', await S('SH.game.mode'), '| open', await S(`!document.getElementById('shop').classList.contains('hidden')`));
  log('   she says:', await said());
  log('   the things:', await S(`[...document.querySelectorAll('#shop .sItem')].map((c) => c.innerText.replace(/\\n+/g, ' ')).join(' || ')`));
  await shot('l6-shop-open' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  log('buy the cap:', await buy('cap'), '| look', await S('JSON.stringify({ hat: SH.look.hat, hatColor: SH.look.hatColor, wearHat: SH.state.wear.hat })'));
  log('buy the bandana:', await buy('bandana'));
  log('buy the gold cup:', await buy('trophy'));
  log('buy the goggles (too few):', await buy('goggles'), '| owned', await S('JSON.stringify(SH.state.school.shop)'));
  await shot('l6-shop-bought' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await S(`[...document.querySelectorAll('#shop .sWear')][0].click()`); log('take the cap off:', await said(), '| hat', await S('JSON.stringify(SH.look.hat)'));
  await S(`[...document.querySelectorAll('#shop .sWear')][0].click()`); log('wear it again:', await said(), '| hat', await S('JSON.stringify(SH.look.hat)'));
  await S(`document.querySelector('#shop .sX').click()`); log('closed: mode', await S('SH.game.mode'));
  await S('SH.tp(1100, 2262); Object.assign(SH.player, { _yaw: 0, dir: "down" }); SH.SCHOOLIN.zoom3D = () => 0.45'); await step(1); await S('Object.assign(SH.sparky, { x: 1150, y: 2300, _yaw: 0, _px: 1150, _pz: 2300 })'); await step(0.1);
  await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-shop-me' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await S('SH.tp(1552, 2150); Object.assign(SH.player, { _yaw: Math.PI, dir: "up" }); SH.SCHOOLIN.zoom3D = () => 0.4'); await step(0.6); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-shop-desk' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await S('SH.setView3(false)'); await sleep(300); await S('SH.tp(1100, 2262); SH.player.dir = "down"'); await step(0.4); await shot('l6-shop-me-2d' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await S('SH.tp(1552, 2060)'); await step(0.4); await shot('l6-shop-desk-2d' + (process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : ''));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
