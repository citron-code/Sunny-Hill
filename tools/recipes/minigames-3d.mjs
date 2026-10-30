// The level 1 quest windows in the 3D view (their pictures come from 3D models): who is in the photo, where they live, the
// bedtime cards, true or false, the family photo. Opened straight with MG / MINI; pictures only. FLAT=1: the flat ones.
export default async function ({ evaluate, sleep, shot, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a), T = process.env.FLAT ? '-2d' : '';
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; SH.Speech.speak = () => {};');
  for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()');
  if (process.env.FLAT) { await S('SH.setView3(false)'); await sleep(300); }
  for (const [kind, id] of [['pickPerson', 'family'], ['pickPlace', 'where'], ['sequence', 'bedtime'], ['trueFalse', 'truefalse'], ['familyBuilder', 'final']]) {
    const ok = await S(`(() => { try { const C = GAME_CONTENT.quests.find((q) => q.id === '${id}'); MINI.${kind}(C, () => {}); return true; } catch (e) { return String(e); } })()`);
    await sleep(1200); log(kind, ok); await shot('mg3d-' + kind + T);
    await S('(() => { MG.token++; document.getElementById("mg").classList.add("hidden"); SH.game.mode = "play"; })()'); await sleep(200);
  }
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
