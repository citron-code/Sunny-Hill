// Level 6, lesson 5: Art in the art room, a painting. After the break the arrow goes to the art room; a star in front of the
// long table; Paint: Batuhan Teacher talks (the arrow over the aprons), you choose your apron (a cap and a bag too), then
// you paint a picture of the school: ten steps ("Paint the roof red.", "Use a crayon. Color the grass green.", twice your
// own color); a wrong tool, part or color: he says why, the right part blinks; the colored pencil goes dull: the sharpener.
// The end: your painting goes on the class easel with your name. Then the Big Challenge (paper boxes to three rooms).
// FLAT=1: the flat view. NARROW=1: a phone held upright.
export default async function ({ evaluate, sleep, shot, consoleLog, viewport }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : process.env.NARROW ? '-nr' : '';
  const step = (secs) => S(`SH.step(1 / 30, ${Math.round(secs * 30)})`);
  const say = () => S(`SH.Dialog.open ? SH.Dialog.who + ': ' + SH.Dialog.text : ''`);
  const lines = async () => { const out = []; for (let i = 0; i < 40 && await S('SH.Dialog.open'); i++) { out.push(await say()); await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(20); } return out.join(' | '); };
  const talk = (id) => S(`SH.interact(SH.interactables().find((o) => o.id === ${JSON.stringify(id)}))`);
  const card = () => S(`document.getElementById('questCard').textContent.trim()`);
  const snapShot = async (n) => { await S("document.getElementById('toast').classList.add('hidden'); SH.SCHOOLIN.lcam = null; SH.render()"); await shot(n); };
  const words = () => S(`document.getElementById('pN').textContent + ' | ' + document.getElementById('pSay').textContent`);
  const tap = (part) => S(`(() => { const [x, y] = SH.SCHOOLIN.ART_CENTER[${JSON.stringify(part)}]; SH.SCHOOLIN.artTap(x, y); })()`);
  const idle = async () => { for (let i = 0; i < 40 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.busy'); i++) { await sleep(100); await step(0.05); } };
  if (process.env.NARROW) await viewport(390, 844, { mobile: true, dpr: 2 });
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  await S(`Object.assign(SH.state, { stars: 8, quest: 8, finished: true, done: ['brother','family','chores','animals','where','bedtime','truefalse','final'] });
    SH.state.lab = { stage: 'done', bananas: 8, told: 1, roared: 1 }; SH.state.ship = { stage: 'ready', got: ['max','dad','mom','nomi','lily','bob','owl','rosa'], capt: 1, sailed: 1 };
    SH.state.sea = { stage: 'won', hits: 5, told: 1, dmg: 0, map: 1 }; SH.state.isle = { stage: 'won', f: 5, n: 0, fixed: 1 };
    SH.state.school = { stage: 'pass', met: 1, yard: 1, uniform: 1, listed: 1, inside: 1, ttSeen: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 7 }, music: { plays: 1, best: 9 }, pe: { plays: 1, best: 8 } }, day: { d: SH.ISLE6.today(), in: 1, n: 4 } };
    SH.state.unlocked = ['uniform']; SH.state.wear = { uniform: true }; SH.state.bname = 'Ayşe'; SH.state.cls = 'B'; SH.refreshPlayerLook(); SH.Save.save();`);
  await S('SH.ISLE6.land()'); await lines(); await S('SH.SCHOOLIN.enter(true)'); await S('SH.game.paused = true'); await step(0.3); await sleep(1200);
  await S('SH.tp(1452, 2520)'); await step(0.4);
  log('in the art room: card', await card(), '| buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /spot6|seat6/.test(o.id)).map((o) => o.id + ' ' + o.label))`));
  await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-art-room' + T);
  // Paint: his words (the arrow over the aprons)
  await talk('spot6_art'); await step(0.2); await sleep(600); await step(0.2);
  const ex = [];
  for (let i = 0; i < 300 && await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph === "explain"'); i++) {
    if (!(await S('SH.Dialog.open'))) { await step(0.1); await sleep(60); continue; }
    const l = await say(); ex.push(l + '   [arrow ' + await S('JSON.stringify(SH.SCHOOLIN.artNow())') + ']');
    if (/aprons! We wear/.test(l)) await snapShot('l6-art-apron' + T);
    await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await sleep(30); await step(0.05);
  }
  log('explained:\n  ' + ex.join('\n  '));
  // the apron
  await step(0.2); log('the apron: phase', await S('SH.SCHOOLIN.lesson.ph'), '|', await words(), '| choices', await S(`[...document.querySelectorAll('#pPick button')].map((b) => b.textContent).join(' / ')`));
  await snapShot('l6-art-pick' + T);
  await S(`SH.SCHOOLIN.artApron('cap')`); log('   a cap:', await words());
  await S(`SH.SCHOOLIN.artApron('apron')`); log('   the apron:', await words()); await sleep(1700); await step(0.1);
  log('painting: phase', await S('SH.SCHOOLIN.lesson.ph'), '|', await words());
  await snapShot('l6-art-blank' + T);
  const out = [];
  for (let r = 0; r < 10; r++) {
    const St = await S('JSON.stringify(SH.SCHOOLIN.lesson.steps[SH.SCHOOLIN.lesson.i])').then(JSON.parse), w0 = await words(), tries = [];
    const note = async (what) => tries.push(what + ' -> ' + (await words()).split(' | ')[1]);
    if (r === 0) { await tap(St.part); await note('no color yet'); }
    if (r === 2) { await S(`SH.SCHOOLIN.artColor('${St.color}')`); await S(`SH.SCHOOLIN.artTool('brush')`); await tap(St.part); await note('the brush'); }
    if (r === 3) { await S(`SH.SCHOOLIN.artTool('${St.tool}'); SH.SCHOOLIN.artColor('${St.color}')`); await tap('sky'); await note('the sky'); await step(0.2); await snapShot('l6-art-hint' + T); }
    if (r === 7) { await S(`SH.SCHOOLIN.artTool('${St.tool}'); SH.SCHOOLIN.artColor('${St.color === 'red' ? 'green' : 'red'}')`); await tap(St.part); await note('a wrong color'); }
    if (St.tool === 'pencil' && await S('SH.SCHOOLIN.lesson.dull')) {
      await S(`SH.SCHOOLIN.artTool('pencil'); SH.SCHOOLIN.artColor('${St.color}')`); await tap(St.part); await note('a dull pencil');
      await snapShot('l6-art-dull' + T); await S('SH.SCHOOLIN.artSharpen()'); await note('the sharpener');
    }
    if (!St.free) await S(`SH.SCHOOLIN.artTool('${St.tool}')`);
    await S(`SH.SCHOOLIN.artColor('${St.free ? (St.part === 'sky' ? 'blue' : 'purple') : St.color}')`); await tap(St.part); await note('right');
    out.push(JSON.stringify(St) + ' | ' + w0 + '\n      ' + tries.join('\n      ') + '\n      right so far: ' + await S('SH.SCHOOLIN.lesson.right'));
    if (r === 4) await snapShot('l6-art-half' + T);
    await idle();
  }
  log('the steps:\n  ' + out.join('\n  '));
  await step(0.3); await sleep(200);
  log('end:', await S(`document.getElementById('lsN').textContent + ' | ' + document.getElementById('lsQ').textContent + ' | ' + document.getElementById('lsS').textContent`), '| saved', await S('JSON.stringify(SH.state.school.les.art)'), '| painting', await S('JSON.stringify(SH.state.school.artPic)'));
  await snapShot('l6-art-end' + T);
  await S(`document.querySelector('#lsBtns .done').click()`); await step(0.2);
  log('Done:', await lines(), '| panel hidden', await S(`document.getElementById('paint').classList.contains('hidden')`), '| challenge', await S('JSON.stringify(SH.state.school.art)'), '| easel shows it', await S('SH.SCHOOLIN.paintQ.canvas === SH.SCHOOLIN.paintQ.canvas0'));
  await S('SH.tp(1470, 2620)'); await step(0.4); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-art-easel' + T);
  // the Big Challenge: the boxes wait in the art room (you carry nothing yet); take them, then one to each room
  log('the challenge: card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'), '| carrying', await S('SH.SCHOOLIN.artCarry()'), '| put buttons', await S(`SH.interactables().filter((o) => /pbox6_/.test(o.id)).length`));
  await S('SH.tp(1560, 2420)'); await step(0.4); await S("document.getElementById('toast').classList.add('hidden')"); await shot('l6-art-pile' + T);
  await S('SH.tp(1600, 2400)'); await step(0.2); log('   by the pile: nearest', await S('(() => { const o = SH.nearestInteractable(); return o ? o.id + " " + o.label : null; })()'));
  await talk('pboxTake6'); log('   take:', await lines(), '| carrying', await S('SH.SCHOOLIN.artCarry()'), '| card', await card(), '| arrow', await S('JSON.stringify(SH.Quests.target())'));
  for (const id of ['classroom', 'library', 'computer']) { const sp = await S(`JSON.stringify(SH.SCHOOLIN.BOXSPOT.${id})`).then(JSON.parse); await S(`SH.tp(${sp[0] - 34}, ${sp[1] + 6})`); await step(0.3); await talk('pbox6_' + id); await lines(); }
  log('the boxes:', await S('JSON.stringify(SH.state.school.art)'), '| card', await card());
  log('a break now: place buttons', await S(`JSON.stringify(SH.interactables().filter((o) => /^(spot6_|seat6)/.test(o.id)).map((o) => o.id))`), '(only the next lesson)');
  await S('Object.assign(SH.state.school.day, { n: 9, ph: null, br: 0 }); SH.Save.save()'); await step(0.2);          // (the day's lessons done: every place asks which lesson)
  // Again from the star (free time): the apron again, a new picture
  await S('SH.tp(1452, 2510)'); await step(0.2); await talk('spot6_art'); await step(0.2); await S(`document.querySelector('#lsBtns button').click()`); await step(0.2); await sleep(600);
  log('again:', await lines(), '| phase', await S('SH.SCHOOLIN.lesson && SH.SCHOOLIN.lesson.ph'), '| colors so far', await S('JSON.stringify(SH.SCHOOLIN.lesson.pic.c)'));
  await S('SH.SCHOOLIN.reset()'); log('reset: panel hidden', await S(`document.getElementById('paint').classList.contains('hidden')`), '| lesson', await S('!!SH.SCHOOLIN.lesson'));
  await S('SH.game.paused = false');
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
