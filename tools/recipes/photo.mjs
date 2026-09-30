// The family photo (Quest 8 and the certificate) with small, big and kids-only families, in 3D and in the 2D fallback:
// are the grown-ups in the back row visible?
export default async function ({ evaluate, savePng }) {
  const S = (e) => evaluate(e);
  await S('SH.quickStart(); SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; SH.Dialog.close();');
  const fams = {
    small: { mother: 1, father: 1 },
    big: { mother: 1, father: 1, grandmother: 1, grandfather: 1, aunt: 1, uncle: 1, sister: 1, brother: 1, cousin: 2 },
    kidsOnly: { sister: 2, brother: 1, cousin: 3 },
  };
  for (const [fn, tag] of [['drawFamilyPhoto', ''], ['drawFamilyPhoto2D', '-2d']])
    for (const [name, fam] of Object.entries(fams))
      for (const [w, h, size] of [[640, 300, ''], [560, 300, '-cert']]) {
        if (size && name !== 'big') continue;
        savePng('photo-' + name + tag + size, await S(`(() => { const cv = document.createElement('canvas'); cv.width = ${w}; cv.height = ${h};
          ${fn}(cv, ${JSON.stringify(fam)}, GAME_CONTENT.quests[SH.Quests.index('final')].members); return cv.toDataURL('image/png'); })()`));
      }
}
