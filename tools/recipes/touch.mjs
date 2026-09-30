// Phone and tablet controls with real touch input: which device the game thinks it is on, the joystick
// (full push, small push, letting go), the action button (also while the other thumb holds the joystick),
// and a computer with a touch screen switching the controls on at its first touch.
export default async function ({ evaluate, send, sleep, shot, viewport, navigate, URL }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  const UA = {
    phone: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    tablet: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',   // an iPad says it is a Mac
  };
  const baseUA = await S('navigator.userAgent');
  const touch = (type, pts) => send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const box = (sel) => S(`(() => { const b = document.querySelector('${sel}').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2, Math.round(b.width), Math.round(b.height)]; })()`);
  const pos = () => S('[SH.player.x, SH.player.y, SH.game.t]');
  const speed = (a, b) => [Math.round(b[0] - a[0]), Math.round(b[1] - a[1]), Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / Math.max(0.001, b[2] - a[2]))];
  const play = async () => {
    await S('SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; SH.quickStart("Ayşe");');
    for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
    for (let i = 0; i < 40 && await S(`document.getElementById('joyZone').classList.contains('hidden') && SH.Touch.on`); i++) await sleep(150);
    await sleep(300);
  };
  for (const [tag, w, h, dpr] of [['phone', 375, 667, 1], ['phone-land', 667, 375, 1], ['tablet', 1024, 768, 1], ['computer', 1280, 800, 1]]) {
    const kind = tag.split('-')[0], mobile = kind !== 'computer';
    await send('Emulation.setUserAgentOverride', { userAgent: UA[kind] || baseUA });
    await viewport(w, h, { dpr, mobile });
    await S('localStorage.clear()'); await navigate(URL); await sleep(1200);
    log(tag.padEnd(11), 'detected:', await S('SH.Device.kind'), '| touch controls:', await S('SH.Touch.on'));
    await S('SH.VoiceWarn.hide(); SH.Parent.open(true)'); await sleep(200);
    log(''.padEnd(11), 'parent screen:', await S(`document.getElementById('pControls').textContent`));
    await S(`document.getElementById('pStart').click()`);
    await play();
    const shown = await S(`['joyZone', 'actBtn'].map((id) => !document.getElementById(id).classList.contains('hidden'))`);
    log(''.padEnd(11), 'joystick / button shown:', JSON.stringify(shown));
    if (!mobile) {
      // a laptop with a touch screen: the first touch brings the controls
      await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await touch('touchStart', [{ x: 900, y: 500, id: 1 }]); await sleep(60); await touch('touchEnd', []); await sleep(300);
      log(''.padEnd(11), 'after the first touch:', await S('SH.Touch.on'), JSON.stringify(await S(`['joyZone', 'actBtn'].map((id) => !document.getElementById(id).classList.contains('hidden'))`)));
      await shot('t-computer-touched');
      continue;
    }
    const [jx, jy, jw] = await box('#joyBase'), [bx, by, bw, bh] = await box('#actBtn');
    log(''.padEnd(11), 'sizes: joystick', jw, '| button', bw + 'x' + bh, '| button off:', await S(`document.getElementById('actBtn').classList.contains('off')`));
    await shot('t-' + tag);
    // full push to the right for a second: the thumb lands anywhere in the corner, the joystick comes to it
    let p0 = await pos();
    await touch('touchStart', [{ x: jx + 10, y: jy - 12, id: 1 }]);
    for (let i = 1; i <= 6; i++) { await touch('touchMove', [{ x: jx + 10 + i * 14, y: jy - 12, id: 1 }]); await sleep(25); }
    await sleep(1000);
    let p1 = await pos();
    await shot('t-' + tag + '-push');
    await touch('touchEnd', []); await sleep(200);
    const rel = await S('[SH.Joy.id === null, SH.Joy.m]'); await sleep(400);
    log(''.padEnd(11), 'full push right: moved [dx, dy, units/s]', JSON.stringify(speed(p0, p1)), '| let go:', JSON.stringify(rel), '| still walking', await S('SH.player.moving'));
    // a small push up: slower
    p0 = await pos();
    await touch('touchStart', [{ x: jx, y: jy, id: 1 }]);
    await touch('touchMove', [{ x: jx, y: jy - jw * 0.2, id: 1 }]); await sleep(1000);
    p1 = await pos(); await touch('touchEnd', []); await sleep(300);
    log(''.padEnd(11), 'small push up: moved [dx, dy, units/s]', JSON.stringify(speed(p0, p1)));
    // next to Milo: the button says what it will do; the right thumb presses it while the left holds the joystick
    await S(`SH.tp(SH.NPC.milo.x + 8, SH.NPC.milo.y + 40)`); await sleep(500);
    log(''.padEnd(11), 'near Milo, button:', JSON.stringify(await S(`[document.getElementById('actLbl').textContent, document.getElementById('actIcon').textContent, document.getElementById('actBtn').className]`)));
    await touch('touchStart', [{ x: jx, y: jy, id: 1 }]);
    await touch('touchStart', [{ x: jx, y: jy, id: 1 }, { x: bx, y: by, id: 2 }]); await sleep(80);
    await touch('touchEnd', [{ x: jx, y: jy, id: 1 }]); await sleep(80);
    await touch('touchEnd', []); await sleep(600);
    log(''.padEnd(11), 'two thumbs: dialog open', await S('SH.Dialog.open'), '| with', await S('SH.Dialog.who'), '| controls hidden', await S(`document.getElementById('joyZone').classList.contains('hidden')`), '| joystick let go', await S('SH.Joy.id === null'));
    await shot('t-' + tag + '-talk');
    for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
    await sleep(300);
    // nothing in reach: the button only wiggles
    await S(`SH.tp(1200, 1300)`); await sleep(400);
    await touch('touchStart', [{ x: bx, y: by, id: 3 }]); await sleep(60); await touch('touchEnd', []); await sleep(300);
    log(''.padEnd(11), 'nothing near, pressed: mode', await S('SH.game.mode'), '| button', await S(`document.getElementById('actBtn').className`));
  }
  await send('Emulation.setUserAgentOverride', { userAgent: baseUA });
}
