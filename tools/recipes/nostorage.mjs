// localStorage throws on every access (blocked site data / private mode): the game must still play.
export default async function ({ evaluate, send, sleep, navigate, URL, shot, viewport }) {
  const S = (e) => evaluate(e);
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });` });
  await navigate(URL); await sleep(300);
  console.log('storage access throws:', await S(`(() => { try { localStorage; return false; } catch (e) { return true; } })()`));
  await S('SH.startGame()');
  for (let i = 0; i < 3; i++) { await sleep(400); await S(`document.getElementById('dlgNext').click()`); }
  await S(`SH.tp(SH.NPC.milo.x, SH.NPC.milo.y + 50)`); await sleep(200);
  await S(`SH.interact(SH.interactables().find(o => o.id === 'milo'))`);
  for (let i = 0; i < 4; i++) { await sleep(400); await S(`document.getElementById('dlgNext').click()`); }
  console.log('stage in memory:', await S('SH.state.stage'), 'Save.ok:', await S('SH.Save.ok'), 'mode:', await S('SH.game.mode'));
  await viewport(375, 667, { dpr: 2, mobile: true }); await sleep(300);
  await shot('30-nostorage-phone');
}
