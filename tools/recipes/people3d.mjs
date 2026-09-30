// Close-ups of the 3D people, for checking the models, faces and animation by eye:
//   p3-cast         every character, front and three-quarter
//   p3-hair         every hair style (front, side, back)
//   p3-clothes      every outfit the player can pick
//   p3-faces        the eye and mouth pictures, big
//   p3-walk         eight frames of the walk cycle
//   p3-idle         idle poses over time (fidgets, blinks, talking, waving)
export default async function ({ evaluate, savePng }) {
  const S = (e) => evaluate(e);
  const shoot = (code, w, h, eye, at, fov = 0.5) => S(`(() => { const cv = Snap.shoot(${w}, ${h}, { eye: ${JSON.stringify(eye)}, at: ${JSON.stringify(at)}, fov: ${fov} }, (R) => { ${code} });
    const out = document.createElement('canvas'); out.width = ${w}; out.height = ${h}; const g = out.getContext('2d'); g.fillStyle = '#cfe9ff'; g.fillRect(0, 0, ${w}, ${h}); g.drawImage(cv, 0, 0); return out.toDataURL('image/png'); })()`);
  const people = ['milo', 'leo', 'mom', 'dad', 'rosa', 'nomi', 'bob', 'max', 'lily', 'pip', 'pop', 'grandpa', 'mia'];
  for (const [name, yaw] of [['front', 0], ['threeq', 0.6]]) {
    const code = `const ids = ${JSON.stringify(people)}; ids.forEach((id, i) => drawPerson3(R, LOOKS[id], { x: (i - (ids.length - 1) / 2) * 48, z: 0, yaw: ${yaw}, t: 0.3, seed: 1.5, still: true }));`;
    savePng('p3-cast-' + name, await shoot(code, 1600, 380, [0, 62, 500], [0, 40, 0]));
  }
  const styles = await S(`Object.keys(HAIR3)`);
  const hairCode = (yaw) => `const st = ${JSON.stringify(styles)}, cols = ['#7a4a2a', '#2d2330', '#f2c14e', '#d9622b', '#5a3620', '#9a5530', '#e6e6ee', '#7a4a2a', '#2d2330', '#eceaf4'];
    st.forEach((s, i) => drawPerson3(R, { age: 'kid', skin: '#f7cfa6', hair: cols[i % cols.length], hairStyle: s, shirt: '#4aa3ff', pants: '#35507a', shorts: true, ties: '#ff7aa2', lashes: i > 2 },
      { x: (i - (st.length - 1) / 2) * 50, z: 0, yaw: ${yaw}, t: 0.3, seed: 1.5, still: true }));`;
  for (const [n, yaw] of [['front', 0.25], ['side', 1.4], ['back', Math.PI - 0.4]]) savePng('p3-hair-' + n, await shoot(hairCode(yaw), 1500, 300, [0, 60, 420], [0, 44, 0]));
  const clothes = `const L = [
      { shirt: '#ff5a5a', pants: '#35507a', shorts: true, socks: '#ffffff', shoes: '#4a6fd8', hairStyle: 'spiky' },
      { shirt: '#4aa3ff', stripes: '#ffffff', pants: '#35507a', shorts: true, socks: '#ffffff', shoes: '#4a6fd8', hairStyle: 'short' },
      { shirt: '#4cc36a', hoodie: true, pants: '#4a5a8a', shoes: '#ff7a3d', hairStyle: 'curly' },
      { shirt: '#fff4e0', overalls: '#a77bd8', pants: '#a77bd8', shorts: true, socks: '#ffffff', shoes: '#6b4430', hairStyle: 'bob' },
      { dress: '#ffd23c', socks: '#ffffff', shoes: '#ff5a8a', hairStyle: 'ponytail', lashes: true },
      { shirt: '#ffffff', skirt: '#ff8c42', socks: '#ffffff', shoes: '#ff5a8a', hairStyle: 'pigtails', lashes: true },
    ];
    L.forEach((l, i) => drawPerson3(R, Object.assign({ age: 'kid', skin: ['#fde3cc', '#f7cfa6', '#e6ae84', '#c68a5e', '#8e5b3c', '#f7cfa6'][i], hair: '#5a3620', ties: '#ff7aa2' }, l),
      { x: (i - 2.5) * 52, z: 0, yaw: 0.35, t: 0.3, seed: 1.5, still: true }));`;
  savePng('p3-clothes', await shoot(clothes, 1200, 380, [0, 56, 400], [0, 36, 0]));
  // the face pictures themselves
  savePng('p3-faces', await S(`(() => { const a = paintFace3({ skin: '#f7cfa6', lashes: true, freckles: true, brows: '#5a3620', iris: '#2f2833' });
    const out = document.createElement('canvas'); out.width = 512; out.height = 256; const g = out.getContext('2d'); g.fillStyle = '#f7cfa6'; g.fillRect(0, 0, 512, 256); g.drawImage(a, 0, 0); return out.toDataURL('image/png'); })()`));
  // close-up heads: every eye and mouth picture on the model
  const faces = `const L = LOOKS.milo; const fr = [['open','smile'],['half','smile'],['closed','smile'],['happy','open'],['open','wide'],['open','o']];
    fr.forEach(([e, m], i) => { const P = personModel3(L), hm = T3((i - 2.5) * 44, 0, 0); drawHeadParts3(R, P, hm, Object.assign(pose3(L, { t: 0, still: true }), { eyes: e, mouth: m })); });`;
  savePng('p3-heads', await shoot(faces, 1300, 260, [0, 46, 330], [0, 44, 0]));
  // walk cycle and idle
  const walk = `for (let i = 0; i < 8; i++) drawPerson3(R, LOOKS.milo, { x: (i - 3.5) * 46, z: 0, yaw: 1.2, t: 1, seed: 1.5, mv: 1, phase: i / 8 * TAU });`;
  savePng('p3-walk', await shoot(walk, 1400, 300, [0, 50, 420], [0, 32, 0]));
  const idle = `const ts = [0.5, 3.1, 5.4, 8.2, 10.9, 13.6, 16.3, 19.2, 22.1]; ts.forEach((t, i) => drawPerson3(R, LOOKS.pip, { x: (i - 4) * 46, z: 0, yaw: 0.3, t, seed: 0.8, talk: i === 7, wave: i === 8 }));`;
  savePng('p3-idle', await shoot(idle, 1500, 300, [0, 50, 440], [0, 32, 0]));
}
