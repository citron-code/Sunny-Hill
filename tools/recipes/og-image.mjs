// The picture shown when the game's link is shared (WhatsApp, Facebook...): the main menu's logo over the
// 3D village, without buttons. Saved as tools/shots/og-image.jpg; copy it to the repo root as og-image.jpg.
export default async function ({ evaluate, sleep, shot, viewport, navigate, URL }) {
  await viewport(1200, 630, { dpr: 1 });
  await evaluate('localStorage.clear()'); await navigate(URL); await sleep(1500);
  await evaluate(`SH.VoiceWarn.hide(); document.querySelector('.titleR').style.display = 'none'; document.getElementById('titleBox').style.transform = 'scale(1.25)';`);
  await sleep(4500);
  await shot('og-image');
}
