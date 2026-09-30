// A few views of the 3D village: start, Milo's house, the farm, the lake, the forest, and a phone screen.
export default async function ({ evaluate, shot, sleep, viewport }) {
  const S = (e) => evaluate(e);
  console.log('3D:', JSON.stringify(await S(`({ ok: SH.G3.ok, on: SH.G3.on, why: SH.G3.why, buildMs: SH.G3.buildMs, chunks: SH.W3.chunks.length, verts: SH.W3.chunks.reduce((a, c) => a + c.n, 0) })`)));
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) { await sleep(350); await S(`document.getElementById('dlgNext').click()`); }
  const spots = (process.env.SPOTS || 'start:1200:1125,milo:720:680,farm:1880:620,lake:1700:1350,forest:1040:1640,backyard:470:560,meadow:420:850').split(',');
  for (const s of spots) {
    const [name, x, y] = s.split(':');
    await S(`SH.tp(${x}, ${y})`); await sleep(700);
    await shot('3d-' + name);
  }
  if (!process.env.SPOTS) {
    await viewport(375, 667, { dpr: 2, mobile: true }); await S(`SH.tp(1200, 1125)`); await sleep(700); await shot('3d-phone');
  }
}
