// The whole village seen from high above, in 3D (and the 2D map with OVERVIEW2D=1), for checking the layout.
export default async function ({ evaluate, savePng, sleep }) {
  const S = (e) => evaluate(e);
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) { await sleep(300); await S(`document.getElementById('dlgNext').click()`); }
  if (process.env.OVERVIEW2D) savePng('map-2d', await S('SH.overview(0.5)'));
  savePng('map-3d', await S(`(() => {
    const cv = Snap.shoot(1600, 1200, { eye: [W / 2, 3000, H / 2 + 1500], at: [W / 2, 0, H / 2 + 60], fov: 0.72, near: 200, far: 9000 }, (R) => {
      for (const c of W3.chunks) R.draw(c);
      for (const o of W3.tall) R.draw(o.mesh, o.m);
      R.mode('blend'); R.draw(W3.shadows); R.draw(W3.water); R.mode('opaque');
      for (const n of NPCS) if (!n.hidden && n.kind === 'person') drawPerson3(R, n.look, { x: n.x, z: n.y, yaw: 0, t: 0.3, scale: 1.6 });
    });
    const out = document.createElement('canvas'); out.width = 1600; out.height = 1200; const g = out.getContext('2d'); g.fillStyle = '#8fd46a'; g.fillRect(0, 0, 1600, 1200); g.drawImage(cv, 0, 0); return out.toDataURL('image/png');
  })()`));
  console.log(JSON.stringify(await S(`({ trees: SH.W3.tall.length, chunks: SH.W3.chunks.length, verts: SH.W3.chunks.reduce((a, c) => a + c.n, 0), start: [SH.player.x, SH.player.y] })`)));
}
