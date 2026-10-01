// The game's lettering on its main screens (desktop and phone): is the rounded web font in use everywhere?
export default async function ({ evaluate, sleep, shot, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  for (const [w, h, tag, mobile] of [[1280, 800, 'desk', false], [375, 667, 'phone', true]]) {
    await viewport(w, h, { mobile, dpr: 1 });
    await S('localStorage.clear()'); await navigate(URL); await sleep(800);
    console.log(tag, 'fonts loaded:', JSON.stringify(await S(`['700 20px "M PLUS Rounded 1c"', '700 20px "Fredoka"'].map((f) => document.fonts.check(f, 'Ağ'))`)), '| body font:', await S(`getComputedStyle(document.body).fontFamily.split(',')[0]`));
    await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
    await shot('f-' + tag + '-title');
    await S(`document.getElementById('tNew').click()`); await sleep(400); await shot('f-' + tag + '-parent');
    await S(`document.getElementById('pStart').click()`); await sleep(500); await shot('f-' + tag + '-creator');
    await S(`document.getElementById('crName').value = 'Ayşe'; document.getElementById('crOk').click()`); await sleep(900);
    await shot('f-' + tag + '-dialog');
    for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
    await S(`SH.tp(SH.NPC.milo.x + 10, SH.NPC.milo.y + 120)`); await sleep(900); await shot('f-' + tag + '-village');
    await S(`(() => { const C = SH.Quests.content(SH.Quests.index('where')); SH.MINI.pickPlace(C, () => {}); })()`); await sleep(800); await shot('f-' + tag + '-minigame');
    await S('SH.MG.close()'); await sleep(200);
    await S(`document.getElementById('menuBtn').click()`); await sleep(400); await shot('f-' + tag + '-menu');
    await S(`document.getElementById('mClose').click()`);
  }
}
