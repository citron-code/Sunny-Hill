// The whole game on a browser with no speech synthesis at all (some Android web views): nothing may wait forever.
import full from './full.mjs';
export default async function (api) {
  await api.send('Page.addScriptToEvaluateOnNewDocument', { source: `try { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; } catch (e) {}
    Object.defineProperty(window, 'speechSynthesis', { value: undefined }); Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined });` });
  await api.navigate(api.URL); await api.sleep(300);
  console.log('speech available:', await api.evaluate('SH.Speech.ok'));
  // the parent info screen opened from the menu must close back to the game
  await full(api);
}
