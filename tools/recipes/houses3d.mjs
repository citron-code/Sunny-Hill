// The village's houses up close, from about the game camera's angle (and a little from the side).
export default async function ({ evaluate, savePng }) {
  const keys = (process.env.KEYS || 'houseMilo,myHouse,cottage,barn,tent,apartment').split(',');
  for (const k of keys) {
    const r = await evaluate(`(() => { const mb = new MB(3); B3['${k}'](mb); const m = pack(mb); window.__h = m; return m.box; })()`);
    const cx = (r[0] + r[3]) / 2, cz = (r[2] + r[5]) / 2, hgt = r[4] - r[1], size = Math.max(r[3] - r[0], hgt) * 0.62 + 30;
    const dist = size / Math.tan(0.25), at = [cx, r[1] + hgt * 0.42, cz];
    for (const [tag, side] of [['', 0.18], ['-side', 0.62]]) {
      const eye = [cx + Math.sin(side) * dist * 0.72, at[1] + dist * 0.62, cz + Math.cos(side) * dist * 0.72];
      savePng('h-' + k + tag, await evaluate(`(() => { const cv = Snap.shoot(820, 620, { eye: ${JSON.stringify(eye)}, at: ${JSON.stringify(at)}, fov: 0.5 }, (R) => {
        const g = new MB(1); g.color('#9ddc6e').cyl(${cx}, -3, ${cz} + 30, ${size * 1.6}, ${size * 1.6}, 3, 24); R.draw(pack(g)); R.draw(window.__h); });
        const out = document.createElement('canvas'); out.width = 820; out.height = 620; const g = out.getContext('2d'); g.fillStyle = '#cfe9ff'; g.fillRect(0, 0, 820, 620); g.drawImage(cv, 0, 0); return out.toDataURL('image/png'); })()`));
    }
  }
}
