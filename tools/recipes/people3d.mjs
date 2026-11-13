// Close-ups of the 3D people, for checking the models, faces and animation by eye:
//   p3-cast         every character, front and three-quarter
//   p3-hair         every hair style (front, side, back)
//   p3-clothes      every outfit the player can pick
//   p3-faces        the eye and mouth pictures, big
//   p3-walk         eight frames of the walk cycle
//   p3-idle         idle poses over time (fidgets, blinks, talking, waving)
//   p3-gaze         heads looking ahead, left, right, up and down (the iris moves over the eye's white)
//   p3-react        the reactions: joy (jump and clap), think (hand under the chin), oops (head scratch)
//   p3-moves        each kind of person's own idle moves (the teacher's watch and wink, a hop, tiptoe, a back stretch)
//   p3-sway         a skirt, a dress, a coat, long hair, a ponytail and a hat swinging after a stop
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
    const out = document.createElement('canvas'); out.width = 512; out.height = 512; const g = out.getContext('2d'); g.fillStyle = '#f7cfa6'; g.fillRect(0, 0, 512, 512); g.drawImage(a, 0, 0); return out.toDataURL('image/png'); })()`));
  // close-up heads: every eye and mouth picture on the model
  const faces = `const fr = [['open','smile'],['half','smile'],['closed','smile'],['happy','open'],['open','wide'],['open','o'],['surprised','o'],['wink','smile'],['laugh','laugh'],['open','hmm']];
    ['milo', 'teacher'].forEach((id, r) => { const L = LOOKS[id], P = personModel3(L); fr.forEach(([e, m], i) => { const hm = T3((i - 4.5) * 46, r * -50, 0); m4t(hm, 0, -P.d.hy + 44, 0); drawHeadParts3(R, P, hm, Object.assign(pose3(L, { t: 0, still: true }), { eyes: e, mouth: m })); }); });`;
  savePng('p3-heads', await shoot(faces, 1500, 360, [0, 20, 235], [0, 19, 0]));
  const gaze = `const G = [[0, 0], [-1, 0], [1, 0], [0, 1], [0, -1], [0.85, 0.9]];
    ['milo', 'mom', 'teacher', 'pirate'].forEach((id, r) => { const L = LOOKS[id], P = personModel3(L); G.forEach(([x, y], i) => { const hm = T3((i - 2.5) * 46, r * -50, 0); m4t(hm, 0, -P.d.hy + 44, 0); drawHeadParts3(R, P, hm, Object.assign(pose3(L, { t: 0, still: true }), { gx: x, gy: y })); }); });`;
  savePng('p3-gaze', await shoot(gaze, 1000, 520, [0, -30, 470], [0, -32, 0]));
  // walk cycle and idle
  const walk = `for (let i = 0; i < 8; i++) drawPerson3(R, LOOKS.milo, { x: (i - 3.5) * 46, z: 0, yaw: 1.2, t: 1, seed: 1.5, mv: 1, phase: i / 8 * TAU });`;
  savePng('p3-walk', await shoot(walk, 1400, 300, [0, 50, 420], [0, 32, 0]));
  const idle = `const ts = [0.5, 3.1, 5.4, 8.2, 10.9, 13.6, 16.3, 19.2, 22.1]; ts.forEach((t, i) => drawPerson3(R, LOOKS.pip, { x: (i - 4) * 46, z: 0, yaw: 0.3, t, seed: 0.8, talk: i === 7, wave: i === 8 }));`;
  savePng('p3-idle', await shoot(idle, 1500, 300, [0, 50, 440], [0, 32, 0]));
  // reactions, part way in (age in seconds)
  const react = `const R3 = [['milo', 'joy', 0.3], ['milo', 'joy', 0.62], ['pip', 'think', 1], ['milo', 'oops', 0.8], ['teacher', 'joy', 0.4], ['teacher', 'think', 1], ['dad', 'oops', 0.8], ['amy', 'think', 1.2]];
    R3.forEach(([id, kind, age], i) => drawPerson3(R, LOOKS[id], { x: (i - 3.5) * 52, z: 0, yaw: -0.25, t: 2, seed: 1.5, react: { kind, age } }));`;
  savePng('p3-react', await shoot(react, 1500, 340, [0, 46, 265], [0, 36, 0]));
  // each one's own idle moves: find the moments by the idle slot (t + seed * 3.1) / 4.6 that picks each move
  const moves = await S(`(() => { const out = []; const want = [['teacher', 9], ['teacher', 10], ['teacher', 6], ['pip', 12], ['milo', 13], ['dad', 14], ['mom', 14]];
    for (const [id, c] of want) { const L = LOOKS[id], kid = L.age !== 'adult', sd = 1.1;
      for (let slot = 0; slot < 400; slot++) { const h = hash1(slot * 7.13 + sd * 13.7); let k = Math.floor(h * 9); if (L.model) k = IDLE_TEACHER3[k]; else if (kid) { if (k === 4) k = 12; else if (k === 5) k = 13; } else if (k === 4) k = 14;
        if (k === c) { out.push([id, (slot + (c === 10 ? 0.3 : 0.32)) * 4.6 - sd * 3.1]); break; } } }
    return JSON.stringify(out); })()`).then(JSON.parse);
  const movesCode = `const M = ${JSON.stringify(moves)}; M.forEach(([id, t], i) => drawPerson3(R, LOOKS[id], { x: (i - (M.length - 1) / 2) * 56, z: 0, yaw: 0.35, t, seed: 1.1 }));`;
  savePng('p3-moves', await shoot(movesCode, 1400, 340, [0, 46, 265], [0, 36, 0]));
  // swinging after a stop: walk to the left for a second, stop, and picture the swing 0.12 s later
  const sway = `const ids = ['zoe', 'nomi', 'fizz', 'malia', 'max', 'amy'];
    ids.forEach((id, i) => { const x0 = (i - 2.5) * 60, st = (t, x) => ({ x, z: 0, yaw: -Math.PI / 2, t, seed: 9 + i, mv: 0, scale: 1 });
      for (let k = 0; k <= 60; k++) sway3(LOOKS[id], st(k / 60, x0 + 60 - k * 1.8));
      for (let k = 1; k <= 7; k++) sway3(LOOKS[id], st(1 + k / 60, x0 + 60 - 108));
      drawPerson3(R, LOOKS[id], st(1 + 7 / 60, x0 + 60 - 108)); });`;
  savePng('p3-sway', await shoot(sway, 1400, 340, [-48, 46, 265], [-48, 36, 0]));
}
