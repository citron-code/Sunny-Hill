// The menu's View button: 3D → 2D → 3D, with a screenshot of each, and the choice survives a reload.
export default async function ({ evaluate, shot, sleep, navigate, URL }) {
  const S = (e) => evaluate(e);
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true;');
  for (let i = 0; i < 8 && await S('SH.Dialog.open'); i++) { await sleep(300); await S(`document.getElementById('dlgNext').click()`); }
  const view = async (tag) => {
    await S(`document.getElementById('menuBtn').click()`); await sleep(150);
    const label = await S(`document.getElementById('mView').textContent`);
    await S(`document.getElementById('mView').click()`); await sleep(150);
    const after = await S(`document.getElementById('mView').textContent`);
    await S(`document.getElementById('mClose').click()`); await sleep(700);
    await shot('sv-' + tag);
    console.log(tag, '| button before:', label, '| after:', after, '| 3D on:', await S('SH.G3.on'), '| saved:', await S('SH.state.settings.view'));
  };
  await view('to-2d');
  await navigate(URL); await sleep(400);
  console.log('after reload: 3D tried', await S('SH.G3.tried'), 'on', await S('SH.G3.on'));
  await S('SH.startGame()'); await sleep(300);
  for (let i = 0; i < 4 && await S('SH.Dialog.open'); i++) { await sleep(300); await S(`document.getElementById('dlgNext').click()`); }
  await view('to-3d');
}
