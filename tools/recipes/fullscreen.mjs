// Full screen with real taps: a phone goes full screen on New Game and the menu button turns it off and
// on again; a computer does not change on its own; an iPhone (no full screen for web pages) gets the
// "Add to Home Screen" explanation instead.
export default async function ({ evaluate, send, sleep, shot, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  const baseUA = await S('navigator.userAgent');
  const UA = {
    phone: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  };
  const tap = async (sel) => {
    const r = await S(`(() => { const e = document.querySelector('${sel}'); if (!e) return null; const b = e.getBoundingClientRect(); return b.width ? [b.left + b.width / 2, b.top + b.height / 2] : null; })()`);
    if (!r) { log('  !! cannot tap', sel); return; }
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await sleep(60);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(700);
  };
  const click = async (sel) => {
    const r = await S(`(() => { const b = document.querySelector('${sel}').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })()`);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: 'left', clickCount: 1 });
    await sleep(700);
  };
  const full = () => S('!!document.fullscreenElement');
  const shown = (id) => S(`!document.getElementById('${id}').classList.contains('hidden')`);
  // phone
  await send('Emulation.setUserAgentOverride', { userAgent: UA.phone });
  await viewport(375, 667, { mobile: true });
  await S('localStorage.clear()'); await navigate(URL); await sleep(1500);
  await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  log('phone    button on the main menu:', await shown('tFull'), '| full screen before:', await full());
  await shot('fs-phone-title');
  await tap('#tNew');
  log('phone    after New Game: full screen', await full(), '| screen', await S('SH.game.mode'), '| icon switched', await S(`document.body.classList.contains('fs')`));
  await S(`document.getElementById('pStart').click()`); await sleep(300);
  await S(`document.getElementById('crOk').click()`); await sleep(500);
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
  await sleep(400);
  await tap('#menuBtn');
  log('phone    menu button shown:', await shown('mFull'));
  await shot('fs-phone-menu');
  await tap('#mFull'); log('phone    menu button: full screen now', await full());
  await tap('#mFull'); log('phone    menu button again: full screen now', await full());
  await S(`document.exitFullscreen && document.fullscreenElement && document.exitFullscreen()`); await sleep(500);
  // computer
  await send('Emulation.setUserAgentOverride', { userAgent: baseUA });
  await viewport(1280, 800);
  await S('localStorage.clear()'); await navigate(URL); await sleep(1500);
  await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  await click('#tNew');
  log('computer after New Game: full screen', await full(), '| button shown:', await shown('tFull'));
  // iPhone: no full screen for web pages
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `delete Element.prototype.requestFullscreen; delete Element.prototype.webkitRequestFullscreen; Object.defineProperty(document, 'fullscreenEnabled', { value: false });` });
  await send('Emulation.setUserAgentOverride', { userAgent: UA.iphone });
  await viewport(390, 844, { mobile: true });
  await S('localStorage.clear()'); await navigate(URL); await sleep(1500);
  await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  log('iphone   detected', await S('SH.Device.kind + " / " + SH.Device.os'), '| can full screen:', await S('SH.FS.can()'), '| button shown:', await shown('tFull'));
  await tap('#tNew');
  log('iphone   after New Game: screen', await S('SH.game.mode'), '(no full screen, nothing breaks)');
  await S(`SH.Parent.start ? 0 : 0`); await S(`document.getElementById('pStart').click()`); await sleep(300); await S(`SH.Creator && document.getElementById('crOk').click()`); await sleep(400);
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
  await tap('#menuBtn'); await tap('#mFull');
  log('iphone   help shown:', await shown('fsHelp'), '|', await S(`document.getElementById('fsHelpText').textContent`));
  await shot('fs-iphone-help');
  await send('Emulation.setUserAgentOverride', { userAgent: baseUA });
}
