// Which English voice each character gets in this browser, and whether the voices really speak
// (start / word / end events). Run it with CHROME pointing at Edge or Chrome to compare.
// With ONLY_TURKISH=1 the page sees nothing but a Turkish voice, like a Turkish Windows PC without English voices.
export default async function ({ evaluate, send, sleep, navigate, URL }) {
  const S = (e) => evaluate(e);
  if (process.env.ONLY_TURKISH) {
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
      const tr = [{ name: 'Microsoft Tolga - Turkish (Turkey)', lang: 'tr-TR', localService: true, default: true, voiceURI: 'tolga' }];
      speechSynthesis.getVoices = () => tr; })();` });
    await navigate(URL); await sleep(300);
  }
  for (let i = 0; i < 20 && await S(`SH.Speech.status === 'unknown'`); i++) await sleep(250);
  console.log('status:', await S('SH.Speech.status'), '| English voices:', await S('SH.Speech.english.length'));
  console.log('cast:', JSON.stringify(await S(`Object.fromEntries(Object.entries(SH.Speech.cast).map(([k, e]) => [k, e.v.name.replace(/ Online \(Natural\).*| - English.*/, '') + (e.real ? '' : ' (borrowed)') + ' pitch ' + SH.Speech.pitchFor(k, e).toFixed(2)]))`), null, 1));
  await S('SH.quickStart()'); await sleep(300);
  console.log('warning shown:', await S(`!document.getElementById('voiceWarn').classList.contains('hidden')`));
  for (const who of ['milo', 'rosa', 'bob']) {
    const r = await S(`new Promise((done) => {
      const ev = []; const t0 = performance.now(); const mark = (e) => ev.push(e + '@' + Math.round(performance.now() - t0));
      const ok = SH.Speech.speak("Hi! I'm here. This is my family.", { who: '${who}', onStart: () => mark('start'), onBoundary: () => mark('word'), onEnd: () => { mark('end'); done(ev); } });
      if (!ok) done(['not spoken']);
      setTimeout(() => done(ev.concat('timeout')), 9000);
    })`);
    console.log(' ', who.padEnd(5), r.filter((x) => !x.startsWith('word')).join(' '), '| words:', r.filter((x) => x.startsWith('word')).length);
  }
}
