// Makes a test copy of the game with its own save (it never touches the real game's progress), a small TEST label
// and a TEST menu at the bottom of the screen. Not for parents: it is never committed or published.
//   node tools/make-test-build.cjs [output file]
//     the new levels: every new game starts with the first eight quests done (level 2 is open)
//     (default: ../Sunny Hill TEST.html, outside the repo)
//   node tools/make-test-build.cjs --full [output file]
//     the whole game from the very start (parent screen, character, quest 1 ... the Junior Captain certificate),
//     with shortcuts to every quest and level, a list of what has been reached, and "jump to where Sparky points"
//     (default: ../Sunny Hill TEST - Baştan Sona.html)
const fs = require('fs'), path = require('path');
const FULL = process.argv.includes('--full');
const outArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const src = path.join(__dirname, '..', 'sunny-hill.html');
const out = outArg || path.join(__dirname, '..', '..', FULL ? 'Sunny Hill TEST - Baştan Sona.html' : 'Sunny Hill TEST.html');
const KEY = FULL ? 'sunnyHill.testfull.v1' : 'sunnyHill.test.v1', TPKEY = KEY.replace(/\.v1$/, '.tp');
const LABEL = FULL ? 'TEST baştan sona' : 'TEST';
let h = fs.readFileSync(src, 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('not found: ' + a.slice(0, 80)); h = h.replace(a, () => b); };
rep(`<title>Sunny Hill</title>`, `<title>Sunny Hill (${LABEL})</title>`);
rep(`    document.title = GAME_CONTENT.title;`, `    document.title = GAME_CONTENT.title + ' (${LABEL})';`);
rep(`  saveKey: 'sunnyHill.save.v1',`, `  saveKey: '${KEY}',     // TEST copy: its own save`);
if (!FULL) {
  rep(`function defaultState() {
  return {`, `// TEST copy: every new game starts with the first eight quests done, so level 2 can be tried at once
function defaultState() {
  return Object.assign(defaultState0(), {
    parentSeen: true, created: true, started: true, name: 'Test', stars: 8, quest: 8, stage: 'available',
    done: ['brother', 'family', 'chores', 'animals', 'where', 'bedtime', 'truefalse', 'final'], unlocked: ['hat', 'glasses', 'cape', 'crown'],
    family: { mother: 1, father: 1, sister: 1 }, finished: true, finishedAt: new Date().toLocaleDateString('tr-TR'),
  });
}
function defaultState0() {
  return {`);
}

// ---- the TEST menu: shortcuts (each writes a save, then reloads; press Continue), and for the full copy a list of
// what has been reached and a jump to the current goal
const QUESTS = [['brother', "Leo'yu bul"], ['family', 'Aile fotoğrafı'], ['chores', "Rosa'nın işleri"], ['animals', "Nomi'nin hayvanları"],
  ['where', 'Kim nerede yaşıyor?'], ['bedtime', 'Uyku zamanı'], ['truefalse', 'Doğru mu, yanlış mı?'], ['final', 'Benim ailem']];
const buttons = FULL ? `
    <div class="tmHead">Baştan</div>
    <button data-p="new">🔄 Yeni oyun (ebeveyn ekranından başlar)</button>
    <div class="tmHead">1. bölüm: görevin başı</div>
    <div class="tmGrid">${QUESTS.map(([, t], i) => `<button data-p="q${i}">${i + 1}. ${t}</button>`).join('')}</div>
    <div class="tmHead">2. bölüm: Dr. Fizz ve Bongo</div>
    <button data-p="l2">Sparky'nin çağrısı (köprü açılır)</button>
    <button data-p="l2b7">Büyük salon: 7 muz, son muz</button>
    <div class="tmHead">3. bölüm: Tess ve gemi</div>
    <button data-p="l3">Dr. Fizz'in sırrı</button>
    <button data-p="ship7">Gemi: 7 parça toplandı</button>
    <button data-p="ship8">Gemi: 8 parça, suya inmeye hazır</button>
    <button data-p="cert">Gemi suda: Kaptan Bob ve sertifika</button>
    <div class="tmHead">Yardım</div>
    <button data-p="goal">🎯 Sparky'nin gösterdiği yere ışınlan</button>
    <div class="tmHead">Nereye kadar gelindi</div>
    <div id="tmDone"></div>` : `
    <button data-p="l2">2. bölümün başı (Bongo)</button>
    <button data-p="l3">3. bölümün başı (Dr. Fizz'in sırrı)</button>
    <button data-p="ship7">Gemi: 7 parça toplandı</button>
    <button data-p="ship8">Gemi: 8 parça, suya inmeye hazır</button>
    <button data-p="cert">Gemi suda: Kaptan Bob ve sertifika</button>`;
rep(`</body>`, `<div id="testBar" style="position:fixed;left:50%;bottom:calc(6px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:99;font:bold 14px sans-serif">
  <button id="testBtn" style="background:#e8503a;color:#fff;border:0;border-radius:10px;padding:4px 12px;font:inherit;opacity:.92;cursor:pointer">${LABEL} ▴ (yayında değil)</button>
  <div id="testMenu" style="display:none;position:absolute;bottom:34px;left:50%;transform:translateX(-50%);background:#fff;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.25);padding:8px;width:${FULL ? 'min(420px,94vw)' : '270px'};max-height:min(78vh,calc(100vh - 60px));overflow:auto">${buttons}
  </div>
</div>
<style>#testMenu button{display:block;width:100%;margin:4px 0;padding:10px;border:0;border-radius:10px;background:#ffe7a8;font:bold 15px sans-serif;cursor:pointer;text-align:left;color:#3a2a20}
#testMenu .tmHead{font:bold 13px sans-serif;color:#8a6a50;margin:10px 4px 2px;text-transform:uppercase;letter-spacing:.5px}
#testMenu .tmGrid{display:grid;grid-template-columns:1fr 1fr;gap:0 6px}
#testMenu .tmGrid button{font-size:14px;padding:9px 8px}
#tmDone{font:15px sans-serif;color:#3a2a20;padding:2px 6px 4px}
#tmDone div{padding:3px 0}</style>
<script>
(() => {
  const KEY = '${KEY}', TP = '${TPKEY}', FULL = ${FULL}, ALL = ['max', 'dad', 'mom', 'nomi', 'lily', 'bob', 'owl', 'rosa'];
  const QIDS = ${JSON.stringify(QUESTS.map(([id]) => id))}, ACC = ['hat', 'glasses', 'cape', 'crown'];
  // a game with the first n quests done (n = 8: the first certificate is earned, the bridge to Dr. Fizz opens)
  const atQuest = (n) => Object.assign(defaultState(), {
    parentSeen: true, created: true, started: true, name: 'Test', stars: n, quest: n, stage: 'available', q: {},
    done: QIDS.slice(0, n), unlocked: ACC.slice(0, n >> 1), wear: {},
    family: n >= 8 ? { mother: 1, father: 1, sister: 1 } : {}, finished: n >= 8, finishedAt: n >= 8 ? new Date().toLocaleDateString('tr-TR') : '',
  });
  const after2 = () => Object.assign(atQuest(8), { lab: { stage: 'done', bananas: 8, told: 1, roared: 1 }, unlocked: ACC.concat('tie') });
  const P = {
    l2: () => atQuest(8),
    l2b7: () => Object.assign(atQuest(8), { lab: { stage: 'active', bananas: 7, told: 1, roared: 1 } }),
    l3: () => Object.assign(after2(), { ship: { stage: '', got: [] } }),
    ship7: () => Object.assign(after2(), { ship: { stage: 'parts', got: ALL.slice(0, 7) } }),
    ship8: () => Object.assign(after2(), { ship: { stage: 'built', got: ALL.slice() } }),
    cert: () => Object.assign(after2(), { ship: { stage: 'ready', got: ALL.slice() } }),
  };
  for (let i = 0; i < 8; i++) P['q' + i] = () => atQuest(i);
  const where = { l2b7: [2900, 2480], l3: [2760, 660], ship7: [2950, 1320], ship8: [2950, 1320], cert: [3240, 1350] };
  const menu = document.getElementById('testMenu');
  const refresh = () => { try { Hud.cardKey = ''; Hud.refresh(); } catch (e) { /* older game */ } };          // the quest card, after a jump
  // what has been reached so far (read from the game itself)
  const done = () => {
    const box = document.getElementById('tmDone');
    if (!box || !window.SH) return;
    const s = SH.state, lab = s.lab || {}, sh = s.ship || {}, ok = (b) => (b ? '✅ ' : '⬜ ');
    const n = (s.done || []).length, eggs = Object.keys(s.eggs || {}).length;
    box.innerHTML = [
      ok(n >= 8) + '1. bölüm: ' + n + ' / 8 görev',
      ok(s.finished) + '1. sertifika (Sunny Hill)',
      ok(lab.stage === 'calm' || lab.stage === 'done') + "2. bölüm: Bongo'nun muzları " + (lab.bananas | 0) + ' / 8',
      ok((s.unlocked || []).indexOf('tie') >= 0) + "Bongo'nun kravatı",
      ok(sh.stage === 'built' || sh.stage === 'ready') + '3. bölüm: gemi parçaları ' + (sh.got || []).length + ' / 8',
      ok(sh.stage === 'ready') + 'Gemi suya indi',
      ok(!!sh.capt) + 'Kaptan şapkası ve Genç Kaptan sertifikası',
      'ℹ️ Gizli sürprizler: ' + eggs + ' / 8',
    ].map((t) => '<div>' + t + '</div>').join('');
  };
  document.getElementById('testBtn').addEventListener('click', () => { const open = menu.style.display === 'none'; menu.style.display = open ? 'block' : 'none'; if (open) done(); });
  for (const b of menu.querySelectorAll('button')) b.addEventListener('click', () => {
    const k = b.dataset.p;
    if (k === 'goal') {          // jump next to whatever Sparky's arrow points at
      menu.style.display = 'none';
      if (!window.SH || SH.game.mode !== 'play') return;
      const t = SH.Quests.target();
      if (t) { SH.tp(t.x, t.y + 46); refresh(); } else SH.Toast.show('🎯 Şu an bir hedef yok');
      return;
    }
    try {
      if (k === 'new') { localStorage.removeItem(KEY); localStorage.removeItem(TP); }
      else { localStorage.setItem(KEY, JSON.stringify(P[k]())); if (where[k]) localStorage.setItem(TP, JSON.stringify(where[k])); else localStorage.removeItem(TP); }
    } catch (e) { /* no storage */ }
    location.reload();
  });
  // after the reload: the first time you are in the game (Continue), jump to the right place
  let tp = null; try { tp = localStorage.getItem(TP); } catch (e) { /* no storage */ }
  if (tp) { const iv = setInterval(() => { if (window.SH && SH.game && SH.game.mode === 'play') { clearInterval(iv); try { localStorage.removeItem(TP); } catch (e) { /* */ } const [x, y] = JSON.parse(tp); SH.tp(x, y); refresh(); } }, 300); }
  void FULL;
})();
</script>
</body>`);
fs.writeFileSync(out, h);
console.log('wrote', out, (h.length / 1024).toFixed(1) + ' KB');
