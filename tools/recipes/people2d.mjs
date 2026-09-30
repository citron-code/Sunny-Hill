// The flat 2D fallback's people: every villager, every hair style and every outfit, drawn like the 2D view draws them.
export default async function ({ evaluate, savePng }) {
  const S = (e) => evaluate(e);
  const row = (looks, w, h) => S(`(() => { const L = ${looks}; const out = document.createElement('canvas'); out.width = ${w}; out.height = ${h};
    const g = out.getContext('2d'); g.fillStyle = '#bfe6a0'; g.fillRect(0, 0, ${w}, ${h}); g.lineJoin = 'round'; g.lineCap = 'round';
    L.forEach((l, i) => { const x = 60 + i * (${w} - 120) / Math.max(1, L.length - 1); g.save(); g.translate(x, ${h} - 30); g.scale(2, 2);
      drawPerson(g, l, { dir: i % 5 === 4 ? 'right' : 'down', t: 0.3, seed: 1.5 }); g.restore(); });
    return out.toDataURL('image/png'); })()`);
  savePng('p2-cast', await row(`['milo','leo','mom','dad','rosa','nomi','bob','max','lily','pip','pop','grandpa','mia'].map((id) => LOOKS[id])`, 1500, 260));
  savePng('p2-hair', await row(`HAIR_STYLES.concat(['bun', 'bald']).map((s, i) => Object.assign(playerBaseLook({ style: HAIR_STYLES.indexOf(s) >= 0 ? s : 'short', hair: i % 6, outfit: i % 6 }), { hairStyle: s }))`, 1300, 260));
  savePng('p2-hair-back', await S(`(() => { const L = HAIR_STYLES.concat(['bun', 'bald']).map((s, i) => Object.assign(playerBaseLook({ style: 'short', hair: i % 6 }), { hairStyle: s }));
    const out = document.createElement('canvas'); out.width = 1300; out.height = 260; const g = out.getContext('2d'); g.fillStyle = '#bfe6a0'; g.fillRect(0, 0, 1300, 260); g.lineJoin = 'round'; g.lineCap = 'round';
    L.forEach((l, i) => { g.save(); g.translate(60 + i * 118, 230); g.scale(2, 2); drawPerson(g, l, { dir: i % 2 ? 'up' : 'left', t: 0.3, seed: 1.5 }); g.restore(); });
    return out.toDataURL('image/png'); })()`));
  savePng('p2-clothes', await row(`CLOTHES.map((c, i) => playerBaseLook({ style: HAIR_STYLES[i], clothes: c, outfit: i, skin: i % 5, hair: i }))`, 900, 260));
}
