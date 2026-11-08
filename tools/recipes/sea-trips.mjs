// Every trip, steered three ways: after the arrow (taps on the pier), a stick held at the place (the island's middle, or
// home), taps on the place. Each: where it ends and any place the ship stays still for 4 s (not docking).
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, ttSeen: 1, coinTold: 1, day: { d: SH.ISLE6.today(), n: 2 } }; SH.Save.save();`);
  await S('SH.game.paused = true; SH.ISLE6.STAY = false');
  const where = () => S(`SH.SEA.active ? 'at sea' : SH.ISLE6.here() ? 'school' : SH.ISLE5.here() ? 'isle5' : 'home'`);
  const place = { school: await S('JSON.stringify(SH.ISLE6.SEA_AT)').then(JSON.parse), isle5: await S('JSON.stringify(SH.ISLE5.SEA_AT)').then(JSON.parse), home: await S('JSON.stringify(SH.SEA.START)').then(JSON.parse) };
  const trips = (process.env.TRIPS || 'home-school,home-isle5,isle5-school,isle5-home,school-isle5,school-home').split(',');
  for (const trip of trips) for (const way of (process.env.WAYS || 'arrow,joy,tap').split(',')) {
    const [from, to] = trip.split('-');
    await S('SH.SEA.active && SH.SEA.end(true)'); await S('SH.keys.up = SH.keys.right = SH.keys.down = SH.keys.left = 0; SH.Joy.m = 0');
    if (from === 'home') {
      if (await S('SH.ISLE5.here() || SH.ISLE6.here()')) { await S('SH.SEA.arriveHome()'); await lines(); await step(0.3); }
      const h = await S('SH.SHIP.helmSpot()'); await S(`SH.tp(${h.x}, ${h.y})`); await step(0.3);
      await talk('shipwheel'); await S(`document.querySelector('#spList .spIsle.${to}').click()`);
    } else {
      const I = from === 'isle5' ? 'ISLE5' : 'ISLE6';
      await S(`SH.${I}.land()`); await lines(); await step(0.5); await lines();
      const D = await S(`JSON.stringify(SH.${I}.DOCK)`).then(JSON.parse);
      await S(`SH.tp(${D.x0 + 60}, ${(D.y0 + D.y1) / 2})`); await step(0.3);
      await talk(from === 'isle5' ? 'ship5' : 'ship6'); await S(`document.querySelector('#spList button.${to}').click()`);
    }
    await lines();
    for (let i = 0; i < 60 && await S('!SH.SEA.active'); i++) { await lines(); await step(0.25); }
    for (let i = 0; i < 40 && await S('!!SH.SEA.undock'); i++) { await lines(); await step(0.25); }
    const P = place[to]; let t = 0, last = null, still = 0; const stuck = [];
    for (; t < 300 && await S('SH.SEA.active || !!SH.ISLE6.off || !!SH.ISLE5.off'); t++) {
      await lines();
      const p = await S('SH.SEA.ship ? [Math.round(SH.SEA.ship.x), Math.round(SH.SEA.ship.y), !!SH.SEA.dock] : null');
      if (p && !p[2]) {
        if (way === 'arrow') await S('SH.SEA.goal && (SH.SEA.steer = { x: SH.SEA.goal.x, y: SH.SEA.goal.y, t: SH.game.t })');
        if (way === 'tap' && t % 3 === 0) await S(`SH.SEA.tap(${P.x}, ${P.y})`);
        if (way === 'joy') await S(`(() => { const s = SH.SEA.ship, dx = ${P.x} - s.x, dy = ${P.y} - s.y, d = Math.hypot(dx, dy); Object.assign(SH.Joy, { m: 1, vx: dx / d, vy: dy / d, speed: 1 }); })()`);
      } else await S('SH.Joy.m = 0');
      await step(0.5);
      if (p && last && !p[2] && Math.hypot(p[0] - last[0], p[1] - last[1]) < 8) { if (++still === 8) stuck.push(p.slice(0, 2).join(',') + ' @' + t * 0.5 + 's'); } else still = 0;
      if (p) last = p;
    }
    await S('SH.Joy.m = 0');
    const w = await where();
    log(`${trip} ${way}: ${w === to ? 'arrived' : 'ENDS ' + w} after ${t * 0.5} s${stuck.length ? ' | STILL at ' + stuck.join('; ') : ''}`);
    if (w !== to) { await S('SH.render()'); await shot(`trip-${trip}-${way}`); }
  }
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
