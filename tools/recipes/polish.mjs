// Last-polish checks: the loading screen shows first and goes away; family words stay whole on phone cards;
// the certificate title fits on one line and its picture can be saved; the music plays, ducks under speech
// and switches off from both menus.
export default async function ({ evaluate, sleep, shot, savePng, viewport, navigate, URL, send }) {
  const S = (e) => evaluate(e);
  const log = (...a) => console.log(...a);
  // 1) loading screen, on a slow phone
  await viewport(390, 844, { mobile: true, dpr: 2 });
  await send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await send('Page.navigate', { url: URL });
  // the page is busy building, so look at what is on screen instead of asking the page
  for (const ms of [400, 900, 1400]) { await sleep(450); try { await shot('p-splash-' + ms); } catch (e) { console.log('  (no frame yet at', ms, 'ms)'); } }
  log('loading screen: see p-splash-*.png');
  for (let i = 0; i < 200; i++) { try { if (await S('!!(window.SH && SH.booted)')) break; } catch (e) { /* loading */ } await sleep(100); }
  await send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await sleep(900);
  log('after building: splash removed', await S(`!document.getElementById('splash')`), '| screen', await S('SH.game.mode'));
  // 2) family words on phone cards
  await viewport(375, 667, { mobile: true, dpr: 2 });
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.close()');
  await S(`(() => { const C = SH.Quests.content(SH.Quests.index('final')); SH.MINI.familyBuilder(C, () => {}); })()`);
  await sleep(800);
  log('family cards:', JSON.stringify(await S(`[...document.querySelectorAll('#mgBody .pick > span.fit')].map((s) => s.textContent + ' ' + parseFloat(getComputedStyle(s).fontSize) + 'px ' + (s.getBoundingClientRect().height < parseFloat(getComputedStyle(s).fontSize) * 1.7 ? 'one line' : 'TWO LINES') + (s.scrollWidth > s.clientWidth + 1 ? ' CUT' : ''))`)));
  await shot('p-family-cards');
  await S('SH.MG.close()'); await sleep(300);
  // 3) certificate
  await S(`SH.state.stars = 8; SH.state.finished = true; SH.state.finishedAt = '02.10.2026'; SH.state.family = { mother: 1, father: 1, sister: 1, grandmother: 1, cousin: 2 }; SH.Cert.open();`);
  await sleep(1200);
  log('certificate title on one line:', await S(`(() => { const t = document.getElementById('certTitle'); return t.getBoundingClientRect().height < parseFloat(getComputedStyle(t).fontSize) * 1.9 && t.scrollWidth <= t.clientWidth + 1; })()`), '| save button:', await S(`document.getElementById('certSave').textContent`));
  await shot('p-cert-phone');
  savePng('p-cert-picture', await S(`SH.Cert.image().toDataURL('image/png')`));
  await viewport(1280, 800, { dpr: 1 }); await sleep(500);
  await S('SH.Device.touch = false'); await S(`document.getElementById('certSave').click()`); await sleep(600);
  log('desktop save: toast', JSON.stringify(await S(`document.getElementById('toast').textContent`)));
  await S('SH.Cert.close()');
  // 4) music
  await S(`SH.Title.open()`); await sleep(300);
  const r = await S(`(() => { const b = document.getElementById('tMusic').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })()`);
  for (const k of [0, 1]) for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: 'left', clickCount: 1 });
  await sleep(1500);
  log('music: running', await S('!!SH.Music.timer'), '| notes scheduled', await S('SH.Music.step'), '| on', await S('SH.state.settings.music'));
  await S(`document.getElementById('tMusic').click()`); await sleep(200);
  log('music after main-menu button: on', await S('SH.state.settings.music'), '| button looks off', await S(`document.getElementById('tMusic').classList.contains('off')`));
  await S(`document.getElementById('tMusic').click()`);
  log('pause menu music button present:', await S(`!!document.getElementById('mMusic')`));
}
