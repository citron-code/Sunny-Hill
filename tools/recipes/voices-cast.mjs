// Who speaks with which voice, on the voice lists of typical devices (the test browser has no voices of its own, so the
// lists are handed to the game). Batuhan Teacher must get a man's voice where there is one; the classmates must not be
// left to the browser's default voice (that happened before: they were never given a voice).
export default async function ({ evaluate }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const lines = async () => { for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); };
  await S('SH.quickStart("Ayşe"); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = "";'); await lines();
  const v = (name, lang, local) => ({ name, lang, localService: local !== false, voiceURI: name, default: false });
  const devices = {
    'Windows, Chrome': [v('Microsoft David - English (United States)', 'en-US'), v('Microsoft Mark - English (United States)', 'en-US'), v('Microsoft Zira - English (United States)', 'en-US'),
      v('Google US English', 'en-US', false), v('Google UK English Female', 'en-GB', false), v('Google UK English Male', 'en-GB', false), v('Microsoft Tolga - Turkish (Turkey)', 'tr-TR')],
    'Windows, Edge': [v('Microsoft Aria Online (Natural) - English (United States)', 'en-US', false), v('Microsoft Guy Online (Natural) - English (United States)', 'en-US', false),
      v('Microsoft Jenny Online (Natural) - English (United States)', 'en-US', false), v('Microsoft Andrew Online (Natural) - English (United States)', 'en-US', false), v('Microsoft Ana Online (Natural) - English (United States)', 'en-US', false), v('Microsoft David - English (United States)', 'en-US')],
    'iPad': [v('Samantha', 'en-US'), v('Daniel', 'en-GB'), v('Karen', 'en-AU'), v('Moira', 'en-IE'), v('Fred', 'en-US'), v('Albert', 'en-US'), v('Yelda', 'tr-TR')],
    'Android': [v('English United States', 'en-US'), v('English United Kingdom', 'en-GB'), v('Türkçe Türkiye', 'tr-TR')],
  };
  for (const [dev, list] of Object.entries(devices)) {
    const r = await S(`(() => { const L = ${JSON.stringify(list)}; window.speechSynthesis.getVoices = () => L; SH.Speech.bad = {}; SH.Speech.build();
      const who = ['teacher', 'dad', 'amy', 'ben', 'zoe', 'sam', 'player', 'sparky'], C = SH.Speech.cast;
      return who.map((w) => { const e = C[w]; return w + ': ' + (e ? e.v.name.replace(/^Microsoft | - English.*| Online \\(Natural\\)/g, '') + ' (pitch ' + SH.Speech.pitchFor(w, e).toFixed(2) + (e.real ? '' : ', borrowed') + ')' : 'NONE: the browser default'); }).join(' | '); })()`);
    log(dev + ' → ' + r);
  }
}
