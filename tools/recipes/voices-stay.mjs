// A character keeps its voice (children heard Sparky's voice change "out of nowhere"): on a typical Chrome-on-Windows
// voice list, Sparky speaks; then an online voice fails for a while, it comes back, a new voice turns up late, the page is
// opened again. Sparky's voice must stay the one he first spoke with (while it is there). The test browser has no voices
// of its own, so the list is handed to the game; "speaking" is the moment a voice is kept (Speech.pin, as when it starts).
export default async function ({ evaluate, sleep }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const lines = async () => { for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  const v = (name, lang, local) => ({ name, lang, localService: local !== false, voiceURI: name, default: false });
  const list = [v('Microsoft David - English (United States)', 'en-US'), v('Microsoft Mark - English (United States)', 'en-US'), v('Microsoft Zira - English (United States)', 'en-US'),
    v('Google US English', 'en-US', false), v('Google UK English Female', 'en-GB', false), v('Google UK English Male', 'en-GB', false)];
  const late = v('Microsoft Ana Online (Natural) - English (United States)', 'en-US', false);
  const setList = (L) => S(`(() => { const L = ${JSON.stringify(L)}; window.speechSynthesis.getVoices = () => L; SH.Speech.build(); })()`);
  const who = (w) => S(`(() => { const e = SH.Speech.cast['${w}']; return e ? e.v.name.replace(/^Microsoft | - English.*| Online \\(Natural\\)/g, '') : 'none'; })()`);
  const cast = async () => { const out = []; for (const w of ['sparky', 'milo', 'player', 'teacher']) out.push(w + ' ' + await who(w)); return out.join(', '); };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  await sleep(2600);          // (the first moments, while a list may still be loading, keep nothing)
  const pinning = await S('typeof SH.Speech.pin === "function"');
  await setList(list);
  log('at first:', await cast());
  if (pinning) await S(`(() => { for (const w of ['sparky', 'milo', 'player', 'teacher']) { const e = SH.Speech.cast[w]; if (e) SH.Speech.pin(w, e.v); } })()`);          // (they all speak once)
  const first = await who('sparky');
  await S(`SH.Speech.bad['Google US English'] = Date.now(); SH.Speech.build()`);
  log('an online voice fails for a minute:', await cast(), '| Sparky the same:', await who('sparky') === first);
  await S(`SH.Speech.bad = {}; SH.Speech.build()`);
  log('it is back:', await cast(), '| Sparky the same:', await who('sparky') === first);
  await setList([late].concat(list));
  log('a new voice turns up late:', await cast(), '| Sparky the same:', await who('sparky') === first);
  if (pinning) {
    await S('location.reload()'); await sleep(3000);
    for (let i = 0; i < 40 && !(await S('!!(window.SH && SH.Speech)')); i++) await sleep(250);
    await setList([late].concat(list));
    log('the page opened again:', await cast(), '| Sparky the same:', await who('sparky') === first, '| kept on this device:', await S(`localStorage.getItem('sunnyHill.voices.v1')`));
  }
}
