// Rough draw cost per frame. Headless Chrome draws in software, so real devices are faster; this is an upper bound.
export default async function ({ evaluate, viewport, sleep }) {
  const S = (e) => evaluate(e);
  await S('SH.quickStart()');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) { await sleep(400); await S(`document.getElementById('dlgNext').click()`); }
  for (const [w, h, dpr, where] of [[1280, 800, 1, 'square'], [375, 667, 2, 'square'], [1024, 768, 2, 'farm'], [667, 375, 2, 'forest']]) {
    await viewport(w, h, { dpr, mobile: w < 800 }); await sleep(300);
    const p = { square: [800, 760], farm: [1300, 460], forest: [760, 980] }[where];
    const r = await S(`(() => { SH.tp(${p[0]}, ${p[1]}); SH.game.paused = true; const n = 60, t0 = performance.now();
      for (let i = 0; i < n; i++) SH.step(1 / 60); const ms = (performance.now() - t0) / n; SH.game.paused = false; return ms.toFixed(2); })()`);
    console.log(`${w}x${h} dpr${dpr} ${where}: ${r} ms per frame (update + draw)`);
  }
}
