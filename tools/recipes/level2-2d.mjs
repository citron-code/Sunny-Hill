// Level 2 in the flat 2D view (a browser without WebGL): the same play-through as level2.mjs.
import level2 from './level2.mjs';
export default async function (api) {
  await api.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, o) { return /webgl/i.test(type) ? null : orig.call(this, type, o); };
  })();` });
  await api.navigate(api.URL); await api.sleep(300);
  console.log('3D on:', await api.evaluate('SH.G3.on'));
  const shot = api.shot;
  await level2(Object.assign({}, api, { shot: (n) => shot(n + '-2d') }));
}
