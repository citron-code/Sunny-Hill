// Level 6, part 1: the school island. On the pier Batuhan Teacher gives a quiz on paper (30 questions; 24 right open the
// gate). A first paper with too many wrong answers: marked in red, try again. A second paper: passed, the gate opens.
// School has not started: the school garden (the yard, Sparky's word), the door is closed, the bell rings. After a
// reload the gate stays open. FLAT=1: the flat view.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const lines = async () => { const out = []; for (let i = 0; i < 16 && await S('SH.Dialog.open'); i++) { out.push(await S(`SH.Dialog.who + ': ' + SH.Dialog.text`)); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('qcText').textContent`);
  const paper = (right) => S(`(() => { const Q = SH.SchoolQuiz, list = document.getElementById('qpList'); Q.items.forEach((q, i) => { const want = i < ${right} ? q.ans : q.opts.find((o) => o !== q.ans); [...list.children[i].querySelectorAll('.qpOpt')].find((b) => b.lastChild.textContent === want).click(); }); return Q.picks.filter((p) => p != null).length; })()`);
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 }; SH.state.school = {}; SH.Save.save();`);
  await S('SH.ISLE6.land()'); log('on the pier:', await lines(), '| card:', await card(), '| Sparky points at the teacher', await S('(() => { const t = SH.Quests.target(), T = SH.ISLE6.TEACHER; return !!t && Math.hypot(t.x - T.x, t.y - T.y) < 60; })()'));
  log('the gate is shut:', await S('(() => { const G = SH.ISLE6.GATE, p = SH.findPath(SH.player.x, SH.player.y, G.x + 120, G.y); return SH.ISLE6.blocked(G.x + 4, G.y) && (!p || p[p.length - 1].x < G.x); })()'));          // (a path may stop short of the gate)
  await S('(() => { const T = SH.ISLE6.TEACHER; SH.tp(T.x - 60, T.y + 20); })()'); await step(0.4);
  log('music on the pier:', await S('SH.ISLE6.music()'));
  await talk('teacher6'); log('music while he talks:', await S('SH.ISLE6.music()')); log('Batuhan Teacher:', await lines());
  log('music over his paper:', await S('SH.ISLE6.music()'));
  log('the paper:', await S(`!document.getElementById('quizPaper').classList.contains('hidden')`), '| questions', await S('SH.SchoolQuiz.items.length'), '| kinds', await S(`JSON.stringify(SH.SchoolQuiz.items.reduce((a, q) => (a[q.topic] = (a[q.topic] || 0) + 1, a), {}))`), '| hand in off', await S(`document.getElementById('qpHand').disabled`), '| left', await S(`document.getElementById('qpLeft').textContent`), '| card', await card());
  await S('SH.game.paused = true'); await sleep(200); await shot('l6-paper' + T); await S('SH.game.paused = false');
  // a first paper: 20 right, 10 wrong
  log('answered', await paper(20), '| hand in on', !(await S(`document.getElementById('qpHand').disabled`)));
  await S(`document.getElementById('qpHand').click()`); await sleep(300);
  log('marked: score', await S(`document.getElementById('qpScore').textContent`), '| stamp', await S(`document.getElementById('qpStamp').textContent`), '| crosses', await S(`document.querySelectorAll('#qpList .qpQ.bad').length`), '| a red answer', await S(`document.querySelector('#qpList .qpQ.bad .qpFix').textContent`));
  await S('SH.game.paused = true'); await sleep(200); await shot('l6-paper-marked' + T); await S('SH.game.paused = false');
  await S(`document.getElementById('qpHand').click()`); await sleep(200);
  log('not yet:', await lines(), '| gate shut', await S('SH.ISLE6.gateK') === 0, '| saved', await S('JSON.stringify(SH.state.school)'));
  // a second paper: all right
  await talk('teacher6'); log('again:', await lines());
  log('a new paper, other questions', await S('SH.SchoolQuiz.items.length'), '| answered', await paper(30));
  await S(`document.getElementById('qpHand').click()`); await sleep(300);
  log('marked: score', await S(`document.getElementById('qpScore').textContent`), '| stamp', await S(`document.getElementById('qpStamp').textContent`));
  await S('SH.game.paused = true'); await sleep(200); await shot('l6-paper-passed' + T); await S('SH.game.paused = false');
  await S(`document.getElementById('qpHand').click()`); await sleep(200);
  log('passed:', await lines(), '| the student list asks for a name and class', await S(`!document.getElementById('prof').classList.contains('hidden')`));
  await S(`(() => { const i = document.getElementById('pfName'); i.value = 'Ayşe'; i.dispatchEvent(new Event('input')); document.querySelectorAll('#pfClass button')[0].click(); document.getElementById('pfOk').click(); })()`);
  log('on the student list:', await lines(), '| saved', await S('JSON.stringify(SH.state.school)'));
  for (let i = 0; i < 20 && await S('SH.ISLE6.gateK < 1'); i++) await step(0.2);
  log('the gate opened:', await S('SH.ISLE6.gateK'), '| the way is free', await S('(() => { const G = SH.ISLE6.GATE; return !SH.ISLE6.blocked(G.x + 4, G.y) && !!SH.findPath(SH.player.x, SH.player.y, G.x + 120, G.y); })()'), '| card', await card());
  await step(0.6); await shot('l6-gate-open' + T);
  // the school garden
  await S('(() => { const Y = SH.ISLE6.YARD; SH.tp((Y.x0 + Y.x1) / 2 - 120, Y.y1 - 60); })()'); await step(0.6);
  log('in the yard:', await lines(), '| card', await card());
  await talk('door6'); log('the door:', await lines());
  await S('(() => { const T = SH.ISLE6.TEACHER; SH.tp(T.x + 60, T.y + 20); })()'); await step(0.3);
  await talk('teacher6'); log('Batuhan Teacher, a joke:', await lines());
  await talk('teacher6'); log('and another:', await lines(), '| jokes told', await S('SH.state.school.joke'));
  await S('(() => { const Y = SH.ISLE6.YARD; SH.tp((Y.x0 + Y.x1) / 2 - 120, Y.y1 - 60); })()'); await step(0.3);
  await talk('bell6'); await step(0.3); log('the bell:', await S(`document.getElementById('toast').textContent`));
  await shot('l6-yard' + T);
  await S('SH.Save.save(); location.reload()'); await sleep(2500);
  for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.game)')); i++) await sleep(250);
  log('after a reload:', await S('JSON.stringify(SH.state.school)'));
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
