// Close-ups of every 3D model, for checking them one by one:
//   g3-people-front / g3-people-threeq  every character, front and three-quarter
//   g3-player                           the player's two bodies and the accessories
//   g3-animals                          every animal
//   g3-b-<key>                          each building and prop, from the game's camera angle
// ONLY=b limits the run to buildings, ONLY=c to characters and animals.
export default async function ({ evaluate, savePng }) {
  const S = (e) => evaluate(e);
  const shoot = (code, w, h, eye, at, fov = 0.5) => S(`(() => { const cv = Snap.shoot(${w}, ${h}, { eye: ${JSON.stringify(eye)}, at: ${JSON.stringify(at)}, fov: ${fov} }, (R) => { ${code} });
    const out = document.createElement('canvas'); out.width = ${w}; out.height = ${h}; const g = out.getContext('2d'); g.fillStyle = '#cfe9ff'; g.fillRect(0, 0, ${w}, ${h}); g.drawImage(cv, 0, 0); return out.toDataURL('image/png'); })()`);
  const only = process.env.ONLY || '';
  if (only !== 'b') {
    const people = ['milo', 'leo', 'mom', 'dad', 'rosa', 'nomi', 'bob', 'max', 'lily', 'pip', 'pop', 'grandpa', 'mia'];
    for (const [name, yaw] of [['front', 0], ['threeq', 0.7]]) {
      const code = `const ids = ${JSON.stringify(people)}; ids.forEach((id, i) => drawPerson3(R, LOOKS[id], { x: (i - (ids.length - 1) / 2) * 44, z: 0, yaw: ${yaw}, t: 0.3, seed: 1.5, still: true }));`;
      savePng('g3-people-' + name, await shoot(code, 1600, 360, [0, 62, 460], [0, 40, 0]));
    }
    const kids = `refreshPlayerLook(); const looks = [PLAYER_LOOK];
      state.look = { body: 1, hair: 2, outfit: 1 }; refreshPlayerLook(); looks.push(PLAYER_LOOK);
      state.unlocked = ['hat','glasses','cape','crown'];
      state.wear = { hat: true }; refreshPlayerLook(); looks.push(PLAYER_LOOK);
      state.wear = { glasses: true, crown: true }; refreshPlayerLook(); looks.push(PLAYER_LOOK);
      state.wear = { cape: true }; refreshPlayerLook(); looks.push(PLAYER_LOOK);
      looks.forEach((L, i) => drawPerson3(R, L, { x: (i - 2) * 50, z: 0, yaw: i === 4 ? 2.6 : 0.35, t: 0.3, seed: 1.5, talk: i === 1 }));`;
    savePng('g3-player', await shoot(kids, 1000, 420, [0, 60, 380], [0, 36, 0]));
    const zoo = `const k = ${JSON.stringify(['dog', 'owl', 'cow', 'chicken', 'goat', 'lamb', 'horse', 'cat', 'frog', 'rabbit', 'duck', 'duckling'])}; let x = -520;
      k.forEach((a) => { const w = { cow: 90, horse: 110, goat: 60, dog: 50, lamb: 50 }[a] || 42; x += w / 2; if (typeof ANIMAL_KINDS3 === 'undefined' ? ['dog','owl','cow','chicken','goat','lamb','horse'].includes(a) : ANIMAL_KINDS3[a]) drawAnimal3(R, a, { x, z: 0, yaw: 0.9, t: 0.3 }); x += w / 2 + 16; });`;
    savePng('g3-animals', await shoot(zoo, 1600, 420, [0, 90, 560], [0, 34, 0]));
  }
  if (only !== 'c') {
    const keys = await S(`Object.keys(B3)`);
    for (const k of keys) {
      const box = await S(`(() => { const mb = new MB(3); B3['${k}'](mb); const m = pack(mb); return m.box; })()`);
      const cx = (box[0] + box[3]) / 2, cz = (box[2] + box[5]) / 2, hgt = box[4] - box[1];
      const size = Math.max(box[3] - box[0], box[5] - box[2], hgt) * 1.05 + 20, dist = size / Math.tan(0.25);
      const at = [cx, box[1] + hgt * 0.45, cz];
      const eye = [cx - dist * 0.3, at[1] + dist * 0.62, cz + dist * 0.75];
      const code = `const mb = new MB(3); B3['${k}'](mb); R.draw(pack(mb));`;
      savePng('g3-b-' + k, await shoot(code, 520, 420, eye, at));
    }
  }
}
