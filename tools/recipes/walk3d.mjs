// Walk cycles, seen from the side: the horse, goat, lamb and Sparky, eight moments of one step each,
// and Sparky following the player (how far behind he stays).
export default async function ({ evaluate, savePng, sleep, shot }) {
  const S = (e) => evaluate(e);
  const shoot = (code, w, h, eye, at, fov = 0.5) => S(`(() => { const cv = Snap.shoot(${w}, ${h}, { eye: ${JSON.stringify(eye)}, at: ${JSON.stringify(at)}, fov: ${fov} }, (R) => { ${code} });
    const out = document.createElement('canvas'); out.width = ${w}; out.height = ${h}; const g = out.getContext('2d'); g.fillStyle = '#cfe9ff'; g.fillRect(0, 0, ${w}, ${h}); g.drawImage(cv, 0, 0); return out.toDataURL('image/png'); })()`);
  for (const [kind, gap, y, dist] of [['horse', 70, 34, 560], ['goat', 44, 20, 380], ['lamb', 36, 14, 300], ['dog', 36, 14, 300]]) {
    const code = `const G = GAIT3['${kind}']; for (let i = 0; i < 8; i++) drawAnimal3(R, '${kind}', { x: (i - 3.5) * ${gap}, z: 0, yaw: Math.PI / 2, t: 1, moving: true, phase: i / 8 * TAU * 0.13 / G.rate });`;
    savePng('w-' + kind, await shoot(code, 1400, 260, [0, y + 10, dist], [0, y, 0], 0.5));
  }
  // Sparky behind a walking player
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
  await S('SH.keys.right = 1'); await sleep(2500); await shot('w-follow-walking');
  const a = await S('Math.round(Math.hypot(SH.player.x - SH.sparky.x, SH.player.y - SH.sparky.y))');
  await S('SH.keys.right = 0'); await sleep(1500); await shot('w-follow-stopped');
  const b = await S('Math.round(Math.hypot(SH.player.x - SH.sparky.x, SH.player.y - SH.sparky.y))');
  console.log('Sparky from the player: walking', a, '| stopped', b);
}
