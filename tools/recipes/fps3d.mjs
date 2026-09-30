// Real frame rate of the 3D view (run with GL=gpu to use the graphics card): walks around for a few seconds.
export default async function ({ evaluate, sleep, viewport }) {
  const S = (e) => evaluate(e);
  console.log('renderer:', await S(`(() => { const g = SH.G3.R.gl, d = g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?'; })()`));
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) { await sleep(300); await S(`document.getElementById('dlgNext').click()`); }
  for (const [w, h, dpr] of [[1280, 800, 1], [1920, 1080, 1], [375, 667, 3], [1024, 768, 2]]) {
    await viewport(w, h, { dpr, mobile: w < 800 }); await sleep(400);
    await S('SH.tp(800, 775); SH.walkTo(1300, 420)');
    const r = await S(`new Promise((ok) => { const ts = []; let last = performance.now(); const f = (now) => { ts.push(now - last); last = now; if (ts.length < 120) requestAnimationFrame(f); else { ts.shift(); ts.sort((a, b) => a - b); ok({ median: ts[ts.length >> 1].toFixed(1), p95: ts[Math.floor(ts.length * 0.95)].toFixed(1) }); } }; requestAnimationFrame(f); })`);
    console.log(`${w}x${h}@${dpr}: frame median ${r.median} ms, 95th percentile ${r.p95} ms`);
  }
}
