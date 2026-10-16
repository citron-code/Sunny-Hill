// After the Parrot King is beaten: practising with him (five right words make a round, mostly am / is / are) and his board on
// the hilltop (place, avatar, name, section, rounds; everyone in one table). Before the first practice a screen asks for the name
// and class (section A-D) the board uses; they stay on the device. Two rounds, one wrong word, walking off the hill ends the
// practice; the board's button changes name and class; after a reload nothing is asked again. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  await S('SH.quickStart("Ayşe Kaya"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;'); await lines();
  await S("ScoreBoard.url = ''");          // (a test never writes to the teacher's real board)
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.cls = ''; SH.Save.save();
    try { localStorage.removeItem('sunnyHill.board.v1'); } catch (e) {}`);
  await S('SH.ISLE5.land()'); await sleep(200); log('landed:', await lines());
  await S('(() => { const T = SH.ISLE5.THRONE; SH.tp(T.x - 110, T.y + 40); })()'); await step(0.6);
  log('the king and the board can be talked to:', await S(`JSON.stringify(SH.interactables().map((o) => o.id))`));
  await talk('king5'); await sleep(200);
  log('first, the name and class screen:', await S(`!document.getElementById('prof').classList.contains('hidden')`), '| name filled in', await S(`document.getElementById('pfName').value`), '| classes', await S(`JSON.stringify([...document.querySelectorAll('#pfClass .bdSec')].map((b) => b.textContent))`), '| OK off until a class is picked', await S(`document.getElementById('pfOk').disabled`));
  await S(`(() => { const i = document.getElementById('pfName'); i.value = 'Ayşe K.<3'; i.dispatchEvent(new Event('input')); [...document.querySelectorAll('#pfClass .bdSec')].find((b) => b.textContent === 'A').click(); })()`); await sleep(150);
  log('typed a name, picked A: OK on', !(await S(`document.getElementById('pfOk').disabled`)));
  await S(`document.getElementById('pfOk').click()`); await sleep(200);
  log('saved: name', await S('SH.state.bname'), '| class', await S('SH.state.cls'), '| screen closed', await S(`document.getElementById('prof').classList.contains('hidden')`));
  log('the king:', await lines());
  log('practising:', await S('!!SH.ISLE5.prac'), '| bar', await S(`document.getElementById('bbName').textContent`), '| card', await S(`(Hud.cardKey = '', Hud.refresh(), document.getElementById('qcText').textContent)`));
  let topics = [], wrongOnce = false;
  for (let i = 0; i < 12 && (await S('SH.ISLE5.prac ? SH.ISLE5.prac.rounds : 0')) < 2; i++) {
    for (let k = 0; k < 40 && !(await S('SH.ISLE5.words.length > 0 && SH.ISLE5.words.every((w) => w.t >= 0)')); k++) await step(0.2);
    topics.push(await S('SH.ISLE5.round && SH.ISLE5.round.topic'));
    if (!wrongOnce) { wrongOnce = true; await S(`(() => { SH.player.stun = 0; const w = SH.ISLE5.words.find((w) => !w.ok); if (w) SH.tp(w.x, w.y); })()`); await step(0.2); log('  a wrong word: wrong count', await S('SH.ISLE5.prac.wrong')); }
    await S(`(() => { SH.player.stun = 0; SH.player.inv = 0; const w = SH.ISLE5.words.find((w) => w.ok); if (w) SH.tp(w.x, w.y); })()`); await step(0.2);
    for (let k = 0; k < 10 && await S('!!SH.ISLE5.fly'); k++) await step(0.1);
    await step(0.3);
    if (i === 2) { await S('SH.game.paused = true'); await shot('l5p-practice' + T); await S('SH.game.paused = false'); log('  plumes left on his crown (5 - right words this round):', await S('5 - SH.ISLE5.prac.n'), '| bar', await S(`document.getElementById('bbName').textContent`)); }
  }
  log('topics asked:', topics.join(','), '| am/is/are:', topics.filter((t) => t === 'tobe').length, 'of', topics.length);
  log('after two rounds:', await S('JSON.stringify({ rounds: SH.ISLE5.prac.rounds, right: SH.ISLE5.prac.right, wrong: SH.ISLE5.prac.wrong, saved: SH.state.isle.pr })'));
  // walking off the hilltop ends it
  await S('(() => { const H = SH.ISLE5.HILL; SH.tp(H.x - H.rx - 60, SH.ISLE5.RAMP.y); })()'); await step(0.6);
  log('walked down: practising', await S('!!SH.ISLE5.prac'), '| in fight', await S('SH.ISLE5.inFight'), '| toast', await S(`document.getElementById('toast').textContent`), '| on this device', await S(`localStorage.getItem('sunnyHill.board.v1')`));
  // the board
  await S('(() => { const B = SH.ISLE5.BOARD; SH.tp(B.x, B.y + 60); })()'); await step(0.4);
  await talk('board5'); await sleep(200);
  log('class', await S('SH.state.cls'), '| rows:', await S(`JSON.stringify([...document.querySelectorAll('#bdList li')].map((li) => li.textContent))`), '| me highlighted', await S(`!!document.querySelector('#bdList li.me')`), '| avatar drawn', await S(`(() => { const c = document.querySelector('#bdList li canvas'); return !!c && c.getContext('2d').getImageData(52, 40, 1, 1).data[3] > 0; })()`));
  // two more children on this device (other saves), so the places show
  await S(`(() => { const L = JSON.parse(localStorage.getItem('sunnyHill.board.v1')); L.push({ id: 'x1', name: 'Mert', cls: 'B', look: { body: 0, skin: 3, hair: 0, style: 'curly', clothes: 'hoodie', outfit: 1 }, wear: ['captain'], rounds: 5, right: 25, wrong: 2, t: 1 }, { id: 'x2', name: 'Elif', cls: 'C', look: { body: 1, skin: 1, hair: 2, style: 'pigtails', clothes: 'dress', outfit: 4 }, wear: ['crown'], rounds: 1, right: 5, wrong: 0, t: 2 }, { id: 'x3', name: 'Can', cls: 'D', look: {}, wear: [], rounds: 9, right: 45, wrong: 1, t: 3 }, { id: 'x4', name: 'Test', cls: 'TEST', look: {}, wear: [], rounds: 99, right: 1, wrong: 0, t: 4 }); localStorage.setItem('sunnyHill.board.v1', JSON.stringify(L)); })()`);
  await S('ScoreBoard.refresh()'); await sleep(200);
  log('the board (all sections A-D together; a TEST row left out):', await S(`JSON.stringify([...document.querySelectorAll('#bdList li')].map((li) => li.textContent))`));
  await shot('l5p-board' + T);
  await S(`document.getElementById('bdOk').click()`); await sleep(200);
  log('closed:', await S(`document.getElementById('board').classList.contains('hidden')`), '| mode', await S('SH.game.mode'));
  // change name and class from the board
  await talk('board5'); await sleep(200);
  log('on the board: me', await S(`document.querySelector('#bdClass .bdMe').textContent`));
  await S(`[...document.querySelectorAll('#bdClass .btn')].find((b) => b.textContent.indexOf('✏️') === 0).click()`); await sleep(200);
  log('change: screen open', await S(`!document.getElementById('prof').classList.contains('hidden')`), '| name kept', await S(`document.getElementById('pfName').value`), '| class kept', await S(`document.querySelector('#pfClass .bdSec.on').textContent`));
  await S(`[...document.querySelectorAll('#pfClass .bdSec')].find((b) => b.textContent === 'B').click(); document.getElementById('pfOk').click();`); await sleep(300);
  log('changed: back on the board', await S(`!document.getElementById('board').classList.contains('hidden')`), '| me', await S(`document.querySelector('#bdClass .bdMe').textContent`), '| my row', await S(`document.querySelector('#bdList li.me').textContent`));
  await S(`document.getElementById('bdOk').click()`); await sleep(200);
  // it stays on the device: after a reload, talking to the king starts the practice at once
  await S('SH.Save.save(); location.reload()'); await sleep(2500);
  for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
  await S('SH.quickStart ? 0 : 0'); await sleep(300);
  log('after a reload: name', await S('SH.state.bname'), '| class', await S('SH.state.cls'));
  await S('SH.game.paused = true'); await shot('l5p-hill' + T); await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => (c.level === 'exception' || c.level === 'error') && !/ERR_INTERNET|ERR_NETWORK/.test(c.text || '')).slice(-5)));
}
