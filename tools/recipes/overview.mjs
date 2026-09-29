// Title shot, first desktop frame and a picture of the whole village (shots/02-overview.png).
export default async function ({ evaluate, shot, savePng, sleep, viewport }) {
  console.log('SH?', await evaluate('typeof SH'));
  await shot('00-title');
  await evaluate('SH.startGame()');
  await sleep(500);
  await shot('01-start-desktop');
  savePng('02-overview', await evaluate('SH.overview(0.75)'));
  console.log(JSON.stringify(await evaluate(`({stage: SH.state.stage, quest: SH.state.quest, mode: SH.game.mode, px: SH.player.x, py: SH.player.y, view: SH.view})`)));
}
