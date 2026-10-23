// Level 6: the school garden is a playground now. After the quiz Batuhan Teacher asks you to take off your hat and gives you
// the school uniform (a white polo with a little red K); a child who passed before gets it on the next talk. The ball rolls
// and scores goals (counted in English), the swings, the slide and the seesaw (with Sparky) take you for a ride, hopscotch
// says its numbers, four classmates in uniform play on their own (Ben football, Zoe the swing, Sam hopscotch, Amy a walk), talk (and cheer after a goal), the fountain takes a coin, the sandbox has toys. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const has = (id) => S(`!!SH.interactables().find((o) => o.id === ${JSON.stringify(id)})`);
  const toast = () => S(`document.getElementById('toast').textContent`);
  const paper = (right) => S(`(() => { const Q = SH.SchoolQuiz, list = document.getElementById('qpList'); Q.items.forEach((q, i) => { const want = i < ${right} ? q.ans : q.opts.find((o) => o !== q.ans); [...list.children[i].querySelectorAll('.qpOpt')].find((b) => b.lastChild.textContent === want).click(); }); return Q.picks.filter((p) => p != null).length; })()`);
  const story = (school) => S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = ${JSON.stringify(school)};
    SH.state.unlocked = ['hat', 'glasses', 'cape', 'crown', 'tie', 'captain']; SH.state.wear = {}; SH.wearAccessory('captain', true); SH.Save.save();`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  // 1) the quiz passed: hats off, the uniform on
  await story({});
  await S('SH.ISLE6.land()'); await lines();
  await S('(() => { const T = SH.ISLE6.TEACHER; SH.tp(T.x - 60, T.y + 20); })()'); await step(0.4);
  log('before: wearing the captain\'s hat', await S('!!SH.state.wear.captain'), '| hat on the look', await S('SH.look.hat'));
  await talk('teacher6'); await lines(); await paper(30);
  await S(`document.getElementById('qpHand').click()`); await sleep(300); await S(`document.getElementById('qpHand').click()`); await sleep(200);
  log('passed:', await lines());
  log('the student list asks for a name and class:', await S(`!document.getElementById('prof').classList.contains('hidden')`), '| title', await S(`document.getElementById('pfTitle').textContent`));
  await S(`(() => { const i = document.getElementById('pfName'); i.value = 'Ayşe'; i.dispatchEvent(new Event('input')); document.querySelectorAll('#pfClass button')[1].click(); document.getElementById('pfOk').click(); })()`);
  log('on the list:', await lines(), '| listed', await S('SH.state.school.listed'), '| class', await S('SH.state.cls'), '| sent as passed', await S('JSON.stringify(ScoreBoard.entry().look)'), '| on this device', await S(`ScoreBoard.local().some((x) => x.look && x.look.school)`));
  log('after: uniform', await S('!!SH.state.wear.uniform'), '| unlocked', await S(`SH.state.unlocked.includes('uniform')`), '| hats off', await S('!SH.state.wear.captain && !SH.state.wear.hat && !SH.state.wear.crown'), '| look', await S('JSON.stringify({ shirt: SH.look.shirt, polo: SH.look.polo, emblem: SH.look.emblem, hat: SH.look.hat || null })'), '| saved', await S('JSON.stringify(SH.state.school)'));
  for (let i = 0; i < 20 && await S('SH.ISLE6.gateK < 1'); i++) await step(0.2);
  log('the gate opened after it:', await S('SH.ISLE6.gateK'));
  await S('(() => { const T = SH.ISLE6.TEACHER; SH.tp(T.x + 70, T.y + 30); SH.player.dir = "down"; })()'); await step(0.5);
  await shot('l6-uniform' + T);
  // 2) passed before the uniform existed: the next talk gives it
  await story({ stage: 'pass', met: 1, tries: 1, best: 28, yard: 1 }); await S('SH.refreshPlayerLook && SH.refreshPlayerLook()');
  await S('(() => { const T = SH.ISLE6.TEACHER; SH.tp(T.x + 60, T.y + 20); })()'); await step(0.3);
  await talk('teacher6'); log('passed before, the next talk:', await lines());
  log('  uniform', await S('!!SH.state.wear.uniform'), '| hat off', await S('!SH.state.wear.captain'), '| then a joke again:', (await (async () => { await talk('teacher6'); return lines(); })()).slice(0, 80));
  // 3) the football
  const F = await S('JSON.stringify(SH.ISLE6.FIELD)').then(JSON.parse), my = (F.y0 + F.y1) / 2, mx = (F.x0 + F.x1) / 2;
  await S(`SH.tp(${mx - 80}, ${my})`); await step(0.3);
  const b0 = await S('JSON.stringify([Math.round(SH.ISLE6.ball.x), Math.round(SH.ISLE6.ball.y)])');
  await S('SH.keys.right = 1'); await step(0.8); await S('SH.keys.right = 0'); await step(0.6);
  log('the ball: was at', b0, '| after running into it', await S('JSON.stringify([Math.round(SH.ISLE6.ball.x), Math.round(SH.ISLE6.ball.y)])'), '| rolled', await S(`SH.ISLE6.ball.x > ${mx + 30}`));
  const G = await S('JSON.stringify(SH.ISLE6.GOALS)').then(JSON.parse), gx = G[1][0], gy = G[1][1];
  await S(`Object.assign(SH.ISLE6.ball, { x: ${gx - 90}, y: ${gy}, vx: 0, vy: 0, h: 0, vh: 0, goalT: 0 }); SH.tp(${gx - 130}, ${gy})`); await step(0.1);
  await S(`Object.assign(SH.ISLE6.ball, { x: ${gx - 90}, y: ${gy} })`);
  await S('SH.keys.right = 1'); await step(0.5); await S('SH.keys.right = 0'); await step(0.5);
  log('a goal:', await S('SH.state.school.goals'), '| toast', await toast(), '| in the net', await S(`SH.ISLE6.ball.goalT > 0`), '| the classmates cheer', await S('SH.ISLE6.cheerT > 0'));
  await shot('l6-goal' + T);
  await step(2.2); log('the ball is back in the middle:', await S(`Math.abs(SH.ISLE6.ball.x - ${mx}) < 5`));
  // 4) the swings
  const SW = await S('JSON.stringify(SH.ISLE6.SWINGS)').then(JSON.parse);
  await S(`SH.tp(${SW[0] + 25}, ${SW[1] + 40})`); await step(0.2);
  log('the swing is still with no one on it:', await S('Math.abs(SH.ISLE6.swingA(1)) < 0.05'), '| a Play button', await has('swing6'), '| label', await S(`SH.interactables().find((o) => o.id === 'swing6').label`));
  await talk('swing6'); await step(2.6);
  log('on the swing: riding', await S('SH.ISLE6.ride && SH.ISLE6.ride.k'), '| angle', await S('SH.ISLE6.swingA(1).toFixed(2)'), '| seat height', await S('SH.ISLE6.ride.p.seat.toFixed(1)'), '| sitting legs', await S('SH.ISLE6.ride.p.legs.toFixed(2)'), '| nothing to talk to', await S('SH.interactables().length === 0'), '| Where saves nothing', await S('SH.Where.now() === null'));
  await shot('l6-swing' + T);
  await S('SH.keys.down = 1'); await step(0.15); await S('SH.keys.down = 0'); await step(0.5);
  log('off the swing (a key):', await S('!SH.ISLE6.ride'), '| beside it', await S(`JSON.stringify([Math.round(SH.player.x), Math.round(SH.player.y)])`), '| can walk', await S(`!!SH.findPath(SH.player.x, SH.player.y, ${SW[0] + 25}, ${SW[1] + 140})`));
  // 5) the slide
  const SL = await S('JSON.stringify(SH.ISLE6.SLIDE)').then(JSON.parse);
  await S(`SH.tp(${SL[0] - 70}, ${SL[1] + 22})`); await step(0.2);
  await S('SH.game.paused = true');          // (the page's own clock stops: the ride goes by the steps here only)
  await talk('slide6'); await step(1.3);
  log('up the ladder:', await S('SH.ISLE6.ride.p.h.toFixed(1)'));
  await shot('l6-slide-up' + T);
  await step(0.55); log('sliding down: seat', await S('SH.ISLE6.ride && SH.ISLE6.ride.p.seat != null ? SH.ISLE6.ride.p.seat.toFixed(1) : "-"'), '| arms', await S('SH.ISLE6.ride && SH.ISLE6.ride.p.arms'));
  await shot('l6-slide-down' + T);
  await step(1.2); await S('SH.game.paused = false'); log('the slide ends by itself:', await S('!SH.ISLE6.ride'), '| at the bottom', await S(`JSON.stringify([Math.round(SH.player.x - ${SL[0]}), Math.round(SH.player.y - ${SL[1]})])`));
  // 6) the seesaw, with Sparky
  const SS = await S('JSON.stringify(SH.ISLE6.SEESAW)').then(JSON.parse);
  await S(`SH.tp(${SS[0] - 50}, ${SS[1] + 26})`); await step(0.2);
  log('the seesaw is level with no one on it:', await S('SH.ISLE6.seesawA() === 0'));
  await talk('seesaw6'); await step(1.0);
  log('on the seesaw: tilt', await S('SH.ISLE6.seesawA().toFixed(2)'), '| you', await S('SH.ISLE6.ride.p.seat.toFixed(1)'), '| Sparky', await S('SH.ISLE6.ride.p.dog.h.toFixed(1)'), '| Sparky on the other end', await S(`Math.abs(SH.sparky.x - ${SS[0] + 52}) < 2`));
  await shot('l6-seesaw' + T);
  await S(`SH.walkTo(${SS[0] - 50}, ${SS[1] + 160})`); await step(0.1);
  log('off the seesaw (a tap):', await S('!SH.ISLE6.ride'), '| walking away', await S('!!SH.player.path'));
  await step(1.5);
  // 7) hopscotch
  const H = await S('JSON.stringify(SH.ISLE6.HOPS)').then(JSON.parse), said = [];
  const spots = [H[0], H[1], H[2], [(H[3][0] + H[4][0]) / 2, H[3][1]], H[5], [(H[6][0] + H[7][0]) / 2, H[6][1]]];
  await S(`SH.tp(${H[0][0]}, ${H[0][1] + 40})`); await step(0.2);
  for (const [x, y] of spots) { await S(`SH.player.x = ${x}; SH.player.y = ${y}`); await step(0.15); said.push(await toast()); }
  log('hopscotch:', said.join(' / '), '| lit', await S('SH.ISLE6.hop.lit.filter((v) => v != null).length'));
  await S(`SH.player.x = ${spots[3][0]}; SH.player.y = ${spots[3][1]}`); await step(0.15);
  await shot('l6-hopscotch' + T);
  // 8) the classmates play on their own (you far away from them), then talk; the fountain, the bus, the flag
  const kids = () => S(`JSON.stringify(SH.ISLE6.kidList().map((k) => ({ id: k.id, x: Math.round(k.x), y: Math.round(k.y), on: !!k.on, mode: k.mode || '', moving: k.moving })))`).then(JSON.parse);
  const Y = await S('JSON.stringify(SH.ISLE6.YARD)').then(JSON.parse);
  await S(`SH.tp(${Y.x1 - 40}, ${Y.y0 + 40}); Object.assign(SH.ISLE6.ball, { x: ${mx}, y: ${my}, vx: 0, vy: 0, h: 0, goalT: 0 })`); await step(0.2);
  const k0 = await kids(), ball0 = await S('[Math.round(SH.ISLE6.ball.x), Math.round(SH.ISLE6.ball.y)]'), seen = { zoe: 0, sam: 0, amy: new Set(), ben: 0 };
  for (let i = 0; i < 40; i++) {
    await step(0.5); const K = await kids();
    if (K.find((k) => k.id === 'zoe').on && Math.abs(await S('SH.ISLE6.swingA(0)')) > 0.2) seen.zoe++;
    if (K.find((k) => k.id === 'sam').mode === 'hop') seen.sam++;
    const a = K.find((k) => k.id === 'amy'); seen.amy.add(Math.round(a.x / 100) + ',' + Math.round(a.y / 100));
    if (i === 12) await shot('l6-kids-play' + T);
  }
  log('20 s on their own: Ben moved the ball', JSON.stringify(ball0), '->', await S('JSON.stringify([Math.round(SH.ISLE6.ball.x), Math.round(SH.ISLE6.ball.y)])'), '| your goals still', await S('SH.state.school.goals'),
    '| Zoe swinging high', seen.zoe, 'times | Sam hopping', seen.sam, '| Amy at', seen.amy.size, 'places | hopscotch lit by Sam', await S('SH.ISLE6.hop.lit.filter((v) => v != null).length'));
  log('  where they started:', JSON.stringify(k0.map((k) => k.id + ' ' + k.x + ',' + k.y)), '| now:', JSON.stringify((await kids()).map((k) => k.id + ' ' + k.x + ',' + k.y + (k.on ? ' on the swing' : '') + (k.mode ? ' ' + k.mode : ''))));
  // Ben steps aside when you come to the ball
  await S(`(() => { const b = SH.ISLE6.ball; Object.assign(b, { goalT: 0, vx: 0, vy: 0 }); SH.tp(b.x - 60, b.y); })()`); await step(3);
  log('you at the ball: Ben steps back and watches', await S(`(() => { const k = SH.ISLE6.kid('ben'), b = SH.ISLE6.ball; return Math.round(Math.hypot(k.x - b.x, k.y - b.y)); })()`), 'away');
  // Sam waits while you are on the hopscotch
  await S(`SH.tp(${H[2][0]}, ${H[2][1]})`); await step(1.5);
  log('you on the hopscotch: Sam waits', await S(`SH.ISLE6.kid('sam').mode !== 'hop'`));
  for (const id of ['amy', 'ben', 'zoe', 'sam']) {
    const k = await S(`JSON.stringify((({ x, y }) => ({ x, y }))(SH.ISLE6.kid('${id}')))`).then(JSON.parse);
    await S(`SH.tp(${k.x}, ${k.y + 60})`); await step(0.1);
    await talk('kid6_' + id); const st = await S(`(() => { const k = SH.ISLE6.kid('${id}'); return (k.on ? 'still on the swing' : 'stopped') + (k.h ? ' in the air' : ''); })()`); const a = await lines(); await talk('kid6_' + id); const b = await lines();
    log(id + ' (' + st + '):', a, '||', b);
  }
  { const k = await S(`JSON.stringify((({ x, y }) => ({ x, y }))(SH.ISLE6.kid('amy')))`).then(JSON.parse); await S(`SH.tp(${k.x + 120}, ${k.y + 40})`); await step(0.5); await shot('l6-classmates' + T); }
  const Fo = await S('JSON.stringify(SH.ISLE6.FOUNTAIN)').then(JSON.parse);
  await S(`SH.tp(${Fo.x}, ${Fo.y + 100})`); await step(0.2); await talk('fountain6'); await step(0.6);
  log('the fountain:', await toast(), '| ripples', await S('SH.ISLE6.ripples.length'));
  await shot('l6-fountain' + T);
  const B = await S('JSON.stringify(SH.ISLE6.BUS)').then(JSON.parse);
  await S(`SH.tp(${B.x}, ${B.y + 70})`); await step(0.2); await talk('bus6'); log('the bus:', await lines());
  const Fl = await S('JSON.stringify(SH.ISLE6.FLAG)').then(JSON.parse);
  await S(`SH.tp(${Fl.x}, ${Fl.y + 50})`); await step(0.2); await talk('flag6'); log('the flag:', await lines());
  const SB = await S('JSON.stringify(SH.ISLE6.SANDBOX)').then(JSON.parse);
  await S(`SH.tp(${SB[0]}, ${SB[1] + 70})`); await step(0.2); await talk('sand6'); log('the sandbox:', await lines());
  // 9) the student list by the school door (with a few children from the online list)
  await S(`localStorage.setItem(ScoreBoard.KEY + '.online', JSON.stringify([
    { id: 'k1', name: 'Ava', cls: 'A', look: { school: 1 }, wear: [], rounds: 3 }, { id: 'k2', name: 'Tom', cls: 'A', look: { school: 1 }, wear: ['cape'], rounds: 0 },
    { id: 'k3', name: 'Ella', cls: 'C', look: { school: 1 }, wear: [], rounds: 0 }, { id: 'k4', name: 'Jack', cls: 'D', look: { school: 1 }, wear: [], rounds: 5 },
    { id: 'k5', name: 'Nora', cls: 'B', look: {}, wear: [], rounds: 2 }, { id: 'k6', name: 'Finn', cls: 'B', look: { school: 1 }, wear: ['captain'], rounds: 0 }]))`);
  const LI = await S('JSON.stringify(SH.ISLE6.LIST)').then(JSON.parse);
  await S(`SH.tp(${LI.x}, ${LI.y + 80})`); await step(0.3);
  log('the board: a Look button', await has('list6'));
  await talk('list6'); await sleep(200);
  log('the list:', await S(`document.getElementById('bdTitle').textContent`), '|', await S(`[...document.querySelectorAll('#bdList li')].map((l) => (l.classList.contains('bdGroup') ? '[' : '') + l.querySelector('.bdName').textContent + (l.classList.contains('me') ? '*' : '')).join(', ')`));
  log('on the board in the garden:', await S(`JSON.stringify(SH.ISLE6.listRows.map((r) => r.cls + ' ' + r.name))`));
  log("the Parrot King's board keeps only rounds:", await S(`JSON.stringify(ScoreBoard.pick(ScoreBoard.cached(), 'isle').map((r) => r.name))`));
  await shot('l6-list-panel' + T);
  await S(`document.getElementById('bdOk').click()`); await step(0.3);
  await S(`SH.tp(${LI.x - 20}, ${LI.y + 70})`); await step(0.5);
  await S('SH.ISLE6.zoom = 0.6'); await S('SH.step(1 / 60, 1)'); await shot('l6-list-board' + T);
  // 10) the wardrobe has the uniform; a reload keeps it
  await S('SH.Wardrobe.open && SH.Wardrobe.open()'); await sleep(300);
  log('the wardrobe:', await S(`[...document.querySelectorAll('#wdItems button, #wdItems .pick, #wdItems > *')].map((b) => b.textContent.trim()).join(', ')`));
  await shot('l6-wardrobe' + T);
  await S('SH.Wardrobe.close && SH.Wardrobe.close()');
  await S('SH.Save.save(); location.reload()'); await sleep(2500);
  for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
  log('after a reload: uniform', await S('!!SH.state.wear.uniform'), '| goals', await S('SH.state.school.goals'), '| uniform given', await S('SH.state.school.uniform'));
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
