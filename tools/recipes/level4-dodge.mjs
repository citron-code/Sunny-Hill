// Level 4 balance: how often Captain Grumble hits our ship, for four ways of playing, after 0, 2 and 4 hits (run with GL=gpu).
// still: no keys (the ship sails on by itself); straight: a new direction every 3 s; clicks: a mouse click near the ship every
// 1.5 s (the computer); dodge: sails away from every red ring. No crates: the cannon stays loaded and nobody fires back.
// On 2026-10-14 the user found the ship hit far too often on the computer. Before the fix (40 s each, hits / balls) at 4 hits:
// still 22/66, straight 16/66, clicks 21/66, dodge 3/66. A first fix made it too easy (the user: "not that easy"; 4 hits: still
// 5/36, straight 2/45, clicks 3/42). Now (his old pace, the first ball a little ahead, a second one ahead from 2 hits):
// 0 hits: still 6/10, straight 0/12, clicks 1/12, dodge 0/12 | 2 hits: still 7/22, straight 1/30, clicks 3/26, dodge 0/32 |
// 4 hits: still 8/36, straight 4/60, clicks 8/48, dodge 2/60. (He shows up far out at sea: the ship starts next to that spot.)
export default async function ({ evaluate, sleep }) {
  const S = (e) => evaluate(e);
  const lines = async () => { for (let i = 0; i < 12 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await lines();
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] }); SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };`);
  // (one tick of a way of playing; k counts ticks of 0.1 s)
  const play = {
    still: `SH.keys.left = SH.keys.right = SH.keys.up = SH.keys.down = 0;`,
    straight: `{ const d = Math.floor(k / 30) % 4; SH.keys.right = +(d === 0); SH.keys.down = +(d === 1); SH.keys.left = +(d === 2); SH.keys.up = +(d === 3); }`,
    clicks: `SH.keys.left = SH.keys.right = SH.keys.up = SH.keys.down = 0; if (k % 15 === 0) { const s = SH.SEA.ship, a = Math.random() * 6.28; SH.SEA.tap(s.x + Math.cos(a) * 220, s.y + Math.sin(a) * 220); }`,
    dodge: `{ const s = SH.SEA.ship; let L = null; for (const b of SH.SEA.balls) if (b.t >= 0 && Math.hypot(b.tx - s.x, b.ty - s.y) < 300) L = b;
      let vx, vy; if (L) { vx = s.x - L.tx; vy = s.y - L.ty; } else { const d = Math.floor(k / 30) % 4; vx = [1, 0, -1, 0][d]; vy = [0, 1, 0, -1][d]; }
      SH.keys.right = +(vx > Math.abs(vy) * 0.4); SH.keys.left = +(-vx > Math.abs(vy) * 0.4); SH.keys.down = +(vy > Math.abs(vx) * 0.4); SH.keys.up = +(-vy > Math.abs(vx) * 0.4); }`,
  };
  const SECS = +(process.env.SECS || 40);
  for (const h of [0, 2, 4]) {
    const row = [];
    for (const [name, code] of Object.entries(play)) {
      await S(`SH.state.sea = { stage: 'fight', hits: ${h}, told: 1 }; SH.SEA.active && SH.SEA.end(); SH.SEA.start()`); await lines();
      // out to where he waits, and his hello
      await S('(() => { const s = SH.SEA.ship, G = SH.SEA.goal; s.x = G.x - 600; s.y = G.y; s.a = 0; })()');
      for (let i = 0; i < 40 && !(await S('SH.Dialog.open')); i++) await S('SH.step(1 / 30, 6)');
      await lines();
      await S(`(() => { const E = SH.SEA; E.loaded = true; E.nHit = 0; E.nBall = 0; if (!E._hu) { E._hu = E.hitUs; E.hitUs = function (b) { this.nHit++; return this._hu(b); }; } window.__seen = new WeakSet(); })()`);
      for (let k = 0; k < SECS * 10; k++) {
        await S(`(() => { const k = ${k}; ${code} for (const b of SH.SEA.balls) if (!__seen.has(b)) { __seen.add(b); SH.SEA.nBall++; } SH.step(1 / 30, 3); })()`);
      }
      const [hit, ball] = await S('[SH.SEA.nHit, SH.SEA.nBall]');
      row.push(`${name} ${hit}/${ball}`);
    }
    await S('SH.keys.left = SH.keys.right = SH.keys.up = SH.keys.down = 0');
    console.log(`hits ${h} (${SECS} s): hit / balls fired ->`, row.join(' | '));
  }
}
