// Level 6, inside the school: in through the front door (Sparky's word the first time), the lobby, the corridor, every room
// (its name for a moment as you walk in), the shut doors and the notice wall, a doorway's board see-through while you are
// behind it, out through the lobby's door into the garden. A picture of every room. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, day: { d: SH.ISLE6.today() } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.game.paused = true');
  // walk up to the school's door: in
  const SC = await S('JSON.stringify(SH.ISLE6.SCHOOL)').then(JSON.parse);
  await S(`SH.tp(${SC.door}, ${SC.y1 + 70})`); await step(0.3);
  log('at the door: the button says', await S(`(() => { const o = SH.interactables().find((o) => o.id === 'door6'); return o && o.label; })()`));
  await S('SH.keys.up = 1'); for (let i = 0; i < 40 && !(await S('SH.SCHOOLIN.here()')); i++) await step(0.1); await S('SH.keys.up = 0');
  log('walked in:', await S('SH.SCHOOLIN.here()'), '| at', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| Sparky:', await lines(), '| card', await card());
  await step(0.6); await sleep(900); await shot('l6-in-lobby' + T);          // (after the dark flash)
  log('the room:', await S('SH.SCHOOLIN.room'), '| toast', await S(`document.getElementById('toast').textContent`));
  // every room: stand in it, its name, a picture
  const rooms = await S('JSON.stringify(SH.SCHOOLIN.ROOMS.filter((r) => !r.shut && r.id !== "stairs").map((r) => ({ id: r.id, row: r.row, x: r.door || (r.x0 + r.x1) / 2, x0: r.x0, x1: r.x1 })))').then(JSON.parse);
  const row = await S('JSON.stringify(SH.SCHOOLIN.ROW)').then(JSON.parse);
  for (const r of rooms) {
    if (r.id === 'lobby') continue;
    const y = r.row === 'n' ? row.n[1] + 40 : row.s[0] - 40, ty = r.row === 'n' ? row.n[1] - 70 : row.s[0] + 70;
    await S(`SH.tp(${r.x}, ${y})`); await step(0.2);
    const path = await S(`!!SH.findPath(SH.player.x, SH.player.y, ${r.x}, ${ty})`);
    await S(`SH.walkTo(${r.x}, ${ty})`); for (let i = 0; i < 30 && await S('SH.player.moving || !!SH.player.path'); i++) await step(0.2);
    await step(0.3);
    log(r.id + ': a way in', path, '| in it', await S('SH.SCHOOLIN.room') === r.id, '| toast', await S(`document.getElementById('toast').textContent`));
    await step(0.5);
    await shot('l6-in-' + r.id + T);
  }
  // the corridor, the notice wall, the shut doors
  await S("document.getElementById('toast').classList.add('hidden')");
  await S(`SH.tp(1090, ${(row.n[1] + row.s[0]) / 2 + 30})`); await step(0.5); await shot('l6-in-notice' + T);
  for (const id of ['shop6', 'timetable6', 'festival6', 'teachers6', 'science6', 'boys6', 'stairs6', 'lost6']) { await talk(id); log(id + ':', await lines()); }
  await S(`SH.tp(300, ${(row.n[1] + row.s[0]) / 2})`); await step(0.5); await shot('l6-in-corridor-west' + T);
  await S(`SH.tp(1880, ${(row.n[1] + row.s[0]) / 2})`); await step(0.5); await shot('l6-in-corridor-east' + T);
  // a doorway's board: see-through while you stand behind it
  await S(`SH.tp(800, ${row.s[0] - 30})`); await step(0.6);
  log('behind the principal\'s doorway: its board', await S('(() => { const T = SH.SCHOOLIN.tall.find((T) => Math.abs(T.cx - 800) < 2); return T && T.k.toFixed(2); })()'));
  await shot('l6-in-seethrough' + T);
  // out through the lobby's door, into the garden
  await S(`SH.tp(1090, ${row.s[1] - 60})`); await step(0.2);
  await S('SH.keys.down = 1'); for (let i = 0; i < 40 && await S('SH.SCHOOLIN.here()'); i++) await step(0.1); await S('SH.keys.down = 0');
  log('out:', !(await S('SH.SCHOOLIN.here()')), '| on the island', await S('SH.ISLE6.here()'), '| at', await S('JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])'), '| card', await card());
  await step(0.5); await sleep(900); await shot('l6-in-out' + T);
  // the second time in: no word from Sparky; the page opened again inside: back inside
  await talk('door6'); await step(0.3); log('in again (the Open button):', await S('SH.SCHOOLIN.here()'), '| words', JSON.stringify(await lines()));
  await S(`SH.tp(1460, ${row.s[0] + 120})`); await step(0.3); await S('SH.Where.keep()');
  log('kept:', await S('JSON.stringify(SH.state.at)'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
