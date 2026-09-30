// A browser without WebGL (some old tablets block it): the game must fall back to the 2D view and still play through.
import full from './full.mjs';
export default async function (api) {
  await api.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, o) { return /webgl/i.test(type) ? null : orig.call(this, type, o); };
  })();` });
  await api.navigate(api.URL); await api.sleep(300);
  console.log('3D available:', await api.evaluate('SH.G3.ok'), '| 3D on:', await api.evaluate('SH.G3.on'), '| why:', await api.evaluate('SH.G3.why'));
  await full(api);
  await api.evaluate('SH.startGame()'); await api.sleep(300);
  for (let i = 0; i < 4 && await api.evaluate('SH.Dialog.open'); i++) { await api.sleep(300); await api.evaluate("document.getElementById('dlgNext').click()"); }
  await api.evaluate("document.getElementById('menuBtn').click()"); await api.sleep(150);
  console.log('menu open:', await api.evaluate('SH.game.mode'), '| View switch hidden:', await api.evaluate("document.getElementById('mViewRow').classList.contains('hidden')"));
}
