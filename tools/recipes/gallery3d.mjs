// Close-up line-ups of every 3D character and animal, front and three-quarter, for checking the models.
export default async function ({ evaluate, savePng }) {
  const S = (e) => evaluate(e);
  const shoot = (code, w, h, eye, at) => S(`(() => { const cv = Snap.shoot(${w}, ${h}, { eye: ${JSON.stringify(eye)}, at: ${JSON.stringify(at)}, fov: 0.5 }, (R) => { ${code} });
    const out = document.createElement('canvas'); out.width = ${w}; out.height = ${h}; const g = out.getContext('2d'); g.fillStyle = '#cfe9ff'; g.fillRect(0, 0, ${w}, ${h}); g.drawImage(cv, 0, 0); return out.toDataURL('image/png'); })()`);
  const people = ['milo', 'leo', 'mom', 'dad', 'rosa', 'nomi', 'bob', 'max', 'lily', 'pip', 'pop', 'grandpa', 'mia'];
  for (const [name, yaw] of [['front', 0], ['threeq', 0.7]]) {
    const code = `const ids = ${JSON.stringify(people)}; ids.forEach((id, i) => drawPerson3(R, LOOKS[id], { x: (i - (ids.length - 1) / 2) * 44, z: 0, yaw: ${yaw}, t: 0.3, seed: 1.5 }));`;
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
  const zoo = `const k = ['dog', 'owl', 'cow', 'chicken', 'goat', 'lamb', 'horse'], xs = [-300, -210, -110, -10, 70, 160, 270];
    k.forEach((a, i) => drawAnimal3(R, a, { x: xs[i], z: 0, yaw: 0.9, t: 0.3 }));`;
  savePng('g3-animals', await shoot(zoo, 1600, 420, [0, 90, 520], [0, 34, 0]));
}
