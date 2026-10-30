// Makes a test copy of the game with its own save (it never touches the real game's progress), its own Parrot King's board
// (it shows the online board but never writes to it: test rounds stay on this device), a small TEST label
// and a TEST menu at the bottom of the screen. Not for parents: it is never committed or published.
//   node tools/make-test-build.cjs [output file]
//     the new levels: every new game starts with the first eight quests done (level 2 is open)
//     (default: ../Sunny Hill TEST.html, outside the repo)
//   node tools/make-test-build.cjs --full [output file]
//     the whole game from the very start (parent screen, character, quest 1 ... Captain Grumble at sea, the Parrot King, the school island),
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
// the Parrot King's board: a TEST copy shows the real online board but never writes to it; its own rounds stay on this device
rep(`  KEY: 'sunnyHill.board.v1', url: BOARD_URL,`, `  KEY: '${KEY.replace(/\.v1$/, '.board.v1')}', url: BOARD_URL,     // TEST copy: its own board on this device`);
rep(`    if (this.url && e.cls) fetch(this.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(e) }).catch(() => {});`,
  `    // TEST copy: nothing is sent to the teacher's online board`);
rep(`    $('bdNote').textContent = [C.hint, note].filter(Boolean).join(' ');`,
  `    $('bdNote').textContent = [C.hint, note, '(TEST: turların yalnızca bu cihazda kalır, online tabloya gönderilmez.)'].filter(Boolean).join(' ');`);
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
    <div class="tmHead">4. bölüm: denizde Kaptan Grumble</div>
    <button data-p="sea0">Dümen başında: denize açılış</button>
    <button data-p="sea3">Korsan savaşı: 3 isabet yapılmış</button>
    <button data-p="sea4">Korsan savaşı: son atış (4 isabet)</button>
    <button data-p="seamap">Korsan kaçtı: haritası denizde</button>
    <button data-p="seawon">Harita bulundu: adaya yolculuk</button>
    <div class="tmHead">5. bölüm: Papağan Kral'ın adası</div>
    <button data-p="isle0">Dümen başında: adaya yolculuk</button>
    <button data-p="isle1">Adada, iskelede (köy ve kafesler)</button>
    <button data-p="isle3">Tepede: Papağan Kral, 3 tüy alınmış</button>
    <button data-p="isleW">Papağan yenildi, gemi tamir edildi</button>
    <div class="tmHead">6. bölüm: okul adası</div>
    <button data-p="sch0">Dümen başında: okul adasına yolculuk</button>
    <button data-p="sch1">Okul adası: iskelede, quiz öncesi</button>
    <button data-p="schP">Okul adası: quiz geçildi, kapı açık</button>
    <button data-p="schL">Okul adası: sabah töreni (ilk gün)</button>
    <button data-p="schI">Okulun içi: sınıfta, 1. dersten önce</button>
    <button data-p="schM">Okulun içi: müzik odasında, 3. dersten (Müzik) önce</button>
    <button data-p="schG">Okulun içi: spor salonunda, 4. dersten (Beden Eğitimi) önce</button>
    <button data-p="schA">Okulun içi: resim odasında, 5. dersten (Resim) önce</button>
    <button data-p="schLu">Okulun içi: yemekhanede, öğle arasından önce</button>
    <button data-p="schLf">Okulun içi: lobide, kayıp eşya kutusundan önce</button>
    <button data-p="schR">Okulun içi: kütüphanede, Okuma dersinden önce</button>
    <button data-p="schW">Okulun içi: bilgisayar laboratuvarında, son dersten (Yazma) önce</button>
    <button data-p="schK">Okulun içi: dersler bitti, Kim ile tanışma (müdür odası)</button>
    <button data-p="schH">Okulun içi: Kim tamam, ev zamanı ve karne</button>
    <button data-p="schS">Okulun içi: Sunny Shop önünde, 600 coin ile</button>
    <button data-p="funH">Serbest oyun: köyde, okul bugün bitti (balık, elma, uçurtma, iksir, 📷, hazine, saklambaç)</button>
    <button data-p="funR">Serbest oyun: okul bahçesinde, yarış çizgisinde</button>
    <button data-p="newDay">🔁 Yeni gün: tören yeniden (adada)</button>
    <button data-p="les1">🔁 Ders programı baştan (anlatımlar yeniden)</button>
    <button data-p="brkEnd">⏩ Teneffüsü bitir (zil)</button>
    <button data-p="coins">🪙 +100 Sunny Coin</button>
    <div class="tmHead">Yardım</div>
    <button data-p="goal">🎯 Sparky'nin gösterdiği yere ışınlan</button>
    <div class="tmHead">Nereye kadar gelindi</div>
    <div id="tmDone"></div>` : `
    <button data-p="l2">2. bölümün başı (Bongo)</button>
    <button data-p="l3">3. bölümün başı (Dr. Fizz'in sırrı)</button>
    <button data-p="ship7">Gemi: 7 parça toplandı</button>
    <button data-p="ship8">Gemi: 8 parça, suya inmeye hazır</button>
    <button data-p="cert">Gemi suda: Kaptan Bob ve sertifika</button>
    <button data-p="sea0">4. bölüm: dümen başında, denize açılış</button>
    <button data-p="sea3">Korsan savaşı: 3 isabet yapılmış</button>
    <button data-p="sea4">Korsan savaşı: son atış (4 isabet)</button>
    <button data-p="seamap">Korsan kaçtı: haritası denizde</button>
    <button data-p="seawon">Harita bulundu: adaya yolculuk</button>
    <button data-p="isle0">5. bölüm: dümen başında, adaya yolculuk</button>
    <button data-p="isle1">Papağan adası: iskelede</button>
    <button data-p="isle3">Papağan adası: tepede, 3 tüy alınmış</button>
    <button data-p="isleW">Papağan yenildi, gemi tamir edildi</button>
    <button data-p="sch0">6. bölüm: dümen başında, okul adasına yolculuk</button>
    <button data-p="sch1">Okul adası: iskelede, quiz öncesi</button>
    <button data-p="schP">Okul adası: quiz geçildi, kapı açık</button>
    <button data-p="schL">Okul adası: sabah töreni (ilk gün)</button>
    <button data-p="schI">Okulun içi: sınıfta, 1. dersten önce</button>
    <button data-p="schM">Okulun içi: müzik odasında, 3. dersten (Müzik) önce</button>
    <button data-p="schG">Okulun içi: spor salonunda, 4. dersten (Beden Eğitimi) önce</button>
    <button data-p="schA">Okulun içi: resim odasında, 5. dersten (Resim) önce</button>
    <button data-p="schLu">Okulun içi: yemekhanede, öğle arasından önce</button>
    <button data-p="schLf">Okulun içi: lobide, kayıp eşya kutusundan önce</button>
    <button data-p="schR">Okulun içi: kütüphanede, Okuma dersinden önce</button>
    <button data-p="schW">Okulun içi: bilgisayar laboratuvarında, son dersten (Yazma) önce</button>
    <button data-p="schK">Okulun içi: dersler bitti, Kim ile tanışma (müdür odası)</button>
    <button data-p="schH">Okulun içi: Kim tamam, ev zamanı ve karne</button>
    <button data-p="schS">Okulun içi: Sunny Shop önünde, 600 coin ile</button>
    <button data-p="funH">Serbest oyun: köyde, okul bugün bitti (balık, elma, uçurtma, iksir, 📷, hazine, saklambaç)</button>
    <button data-p="funR">Serbest oyun: okul bahçesinde, yarış çizgisinde</button>
    <button data-p="newDay">🔁 Yeni gün: tören yeniden (adada)</button>
    <button data-p="les1">🔁 Ders programı baştan (anlatımlar yeniden)</button>
    <button data-p="brkEnd">⏩ Teneffüsü bitir (zil)</button>
    <button data-p="coins">🪙 +100 Sunny Coin</button>`;
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
  // level 4: after the Junior Captain certificate (the captain's hat on), with the sea battle at some point
  const after3 = (sea) => Object.assign(after2(), { ship: { stage: 'ready', got: ALL.slice(), capt: 1, sailed: 1 }, unlocked: ACC.concat('tie', 'captain'), wear: { captain: true }, sea });
  Object.assign(P, {
    sea0: () => after3({ stage: '', hits: 0, told: 1 }),
    sea3: () => after3({ stage: 'fight', hits: 3, told: 1 }),
    sea4: () => after3({ stage: 'fight', hits: 4, told: 1 }),
    seamap: () => after3({ stage: 'map', hits: 5, told: 1, dmg: 4 }),
    seawon: () => after3({ stage: 'won', hits: 5, told: 1, dmg: 4, map: 1 }),
  });
  // level 5: after Grumble's map (our ship broken), with the Parrot King's island at some point
  const after4 = (isle, fixed) => Object.assign(after3({ stage: 'won', hits: 5, told: 1, dmg: fixed ? 0 : 4, map: 1 }), { isle });
  Object.assign(P, {
    isle0: () => after4({ stage: '' }),
    isle1: () => after4({ stage: 'land' }),
    isle3: () => after4({ stage: 'fight', f: 3, n: 0 }),
    isleW: () => after4({ stage: 'won', f: 5, n: 0, fixed: 1 }, true),
  });
  // level 6: after the Parrot King, the school island (its gate's quiz not yet passed, or passed)
  const after5 = (school) => Object.assign(after4({ stage: 'won', f: 5, n: 0, fixed: 1 }, true), { school });
  Object.assign(P, {
    sch0: () => after5({}),
    sch1: () => after5({ stage: 'land' }),
    schP: () => after5({ stage: 'pass', met: 1, tries: 1, best: 30, yard: 1 }),
  });
  const pupil = (school) => Object.assign(after5(Object.assign({ stage: 'pass', met: 1, tries: 1, best: 30, yard: 1, uniform: 1, listed: 1, ttSeen: 1 }, school)), { unlocked: ACC.concat('tie', 'captain', 'uniform'), wear: { uniform: true }, bname: 'Test', cls: 'A' });
  Object.assign(P, {
    schL: () => pupil({}),
    schI: () => pupil({ inside: 1, days: 1, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1 } }),
    schM: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 } }, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 2 } }),
    schG: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 } }, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 3 } }),
    schA: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 } }, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 4 } }),
    schLu: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 5 } }),
    schLf: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 6 } }),
    schR: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 }, lost: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 7 } }),
    schW: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 }, lost: { plays: 1, best: 8 }, reading: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, news: undefined, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 8 } }),
    schK: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 }, lost: { plays: 1, best: 8 }, reading: { plays: 1, best: 8 }, writing: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, news: { a: 'zoe', b: 'sam' }, coins: 180, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 9 } }),
    schH: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 }, music: { plays: 1, best: 8 }, pe: { plays: 1, best: 8 }, art: { plays: 1, best: 8 }, lunch: { plays: 1, best: 8 }, lost: { plays: 1, best: 8 }, reading: { plays: 1, best: 8 }, writing: { plays: 1, best: 8 } }, art: { del: ['classroom', 'library', 'computer'] }, news: { a: 'zoe', b: 'sam' }, kim: { st: 'tour', i: 4, done: 1 }, coins: 190, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 9 } }),
    schS: () => pupil({ inside: 1, days: 1, les: { english: { plays: 1, best: 8 }, math: { plays: 1, best: 8 } }, coins: 600, day: { d: new Date().toLocaleDateString('tr-TR'), in: 1, n: 2, ph: 'break', br: 110 } }),
  });
  // free play: today's school day is over (all nine, Kim, home time); at home in the village, or in the school garden
  const freePlay = () => { const t = new Date().toLocaleDateString('tr-TR'), les = {}; for (const k of ['english', 'math', 'music', 'pe', 'art', 'lunch', 'lost', 'reading', 'writing']) les[k] = { plays: 1, best: 8 };
    return pupil({ inside: 1, days: 1, les, art: { del: ['classroom', 'library', 'computer'] }, news: { a: 'zoe', b: 'sam' }, kim: { st: 'tour', i: 4, done: 1 }, coins: 200, coinTold: 1, home: t, day: { d: t, in: 1, n: 9, home: 1 } }); };
  Object.assign(P, { funH: freePlay, funR: freePlay });
  for (let i = 0; i < 8; i++) P['q' + i] = () => atQuest(i);
  const where = { l2b7: [2900, 2480], l3: [2760, 660], ship7: [2950, 1320], ship8: [2950, 1320], cert: [3240, 1350], sea0: 'helm', sea3: 'helm', sea4: 'helm', seamap: 'helm', seawon: 'helm', isle0: 'helm', isle1: 'isle', isle3: 'hill', isleW: 'isle', sch0: 'helm', sch1: 'school', schP: 'school', schL: 'school', schI: 'classroom', schM: 'musicroom', schG: 'gym', schA: 'artroom', schR: 'libroom', schW: 'pcroom', schLu: 'cafe', schLf: 'lobbybox', schK: 'office', schH: 'office', schS: 'shopfront', funH: [1200, 1110], funR: 'race' };
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
      ok(((s.sea || {}).hits | 0) >= 5) + '4. bölüm: Kaptan Grumble ' + ((s.sea || {}).hits | 0) + ' / 5 isabet',
      ok(!!(s.sea || {}).map) + "Grumble'ın haritası (Papağan Kral'ın adası)",
      ok((s.isle || {}).stage === 'won') + "5. bölüm: Papağan Kral " + ((s.isle || {}).f | 0) + ' / 5 tüy',
      ok((s.school || {}).stage === 'pass') + '6. bölüm: okul kapısının quizi',
      ok(!!((s.school || {}).day && s.school.day.d === new Date().toLocaleDateString('tr-TR'))) + 'Bugünün sabah töreni (kapılar açıldı)',
      ...[['english', '1. ders (İngilizce)'], ['math', '2. ders (Matematik)'], ['music', '3. ders (Müzik)'], ['pe', '4. ders (Beden Eğitimi)'], ['art', '5. ders (Resim)'], ['lunch', 'Öğle arası (yemekhane)'], ['lost', 'Kayıp eşya kutusu (lobi)'], ['reading', 'Okuma (kütüphane)'], ['writing', 'Yazma (bilgisayar)']].map(([id, t]) => { const e = ((s.school || {}).les || {})[id]; return ok(!!e) + t + (e ? ': ' + e.plays + ' kez, en iyi ' + e.best + ' / 10' : ''); }),
      (() => { const a = (s.school || {}).art; return ok(!!a && a.del.length === 3) + 'Büyük görev: kâğıt kutuları' + (a ? ' (' + a.del.length + ' / 3)' : ''); })(),
      ok(!!(s.school || {}).news) + 'Okul gazetesi panoda',
      ok(!!((s.school || {}).kim && s.school.kim.done)) + 'Yeni öğrenci Kim: okul turu',
      ok(!!(s.school || {}).home) + 'Ev zamanı ve karne (gemi açıldı)',
      (() => { const f = s.fun || {}, ph = Object.keys(f.photo || {}).length; return ok(ph >= 16) + 'Serbest oyun: 📷 albüm ' + ph + ' / 16 · 🗺️ hazine ' + (f.hunted | 0) + ' kez · 🙈 saklambaç ' + (f.hides | 0) + ' kez · 🎣 ' + Object.keys(f.fish || {}).length + ' renk balık · 🍎 ' + (f.apples | 0) + ' elma · 🎈 ' + (f.balloons | 0) + ' balon · ⚗️ ' + (f.potions | 0) + ' iksir'; })(),
      'ℹ️ Sunny Coin: ' + ((window.SH && SH.Coins) ? SH.Coins.get() : 0) + ' · dükkândan: ' + (((s.school || {}).shop || {}).own || []).join(', '),
      'ℹ️ Bugün: ' + (window.SH && SH.SCHOOLIN && SH.SCHOOLIN.day() ? (SH.SCHOOLIN.onBreak() ? 'teneffüs' : SH.SCHOOLIN.nextLesson() ? 'sıradaki ders ' + SH.SCHOOLIN.lessonName() : 'dersler bitti') : 'kapılar açılmadı'),
      'ℹ️ Gizli sürprizler: ' + eggs + ' / 8',
    ].map((t) => '<div>' + t + '</div>').join('');
  };
  document.getElementById('testBtn').addEventListener('click', () => { const open = menu.style.display === 'none'; menu.style.display = open ? 'block' : 'none'; if (open) done(); });
  for (const b of menu.querySelectorAll('button')) b.addEventListener('click', () => {
    const k = b.dataset.p;
    if (k === 'newDay' || k === 'les1' || k === 'brkEnd' || k === 'coins') {          // (at once: a new school day, or lesson 1 as the first time)
      menu.style.display = 'none';
      if (!window.SH || !SH.state.school || SH.state.school.stage !== 'pass') { if (window.SH) SH.Toast.show('🔁 Önce okul adasının quizini geç'); return; }
      const sc = SH.state.school;
      if (k === 'newDay') { sc.day = { d: '01.01.2026' }; SH.Save.save(); SH.Toast.show(SH.ISLE6.here() ? '🔁 Yeni gün: zil çalıyor!' : '🔁 Yeni gün: okul adasında tören başlayacak'); }
      else if (k === 'coins') { SH.Coins.add(100); }
      else if (k === 'brkEnd') { if (SH.SCHOOLIN.onBreak()) SH.SCHOOLIN.breakOver(); else SH.Toast.show('⏩ Şu an teneffüs yok'); }
      else { delete sc.les; if (sc.day) { sc.day.n = 0; delete sc.day.ph; delete sc.day.l1; } SH.Save.save(); SH.SCHOOLIN.paintTimetable(); SH.Toast.show('🔁 Ders programı baştan: sırana otur'); }
      refresh(); return;
    }
    if (k === 'goal') {          // jump next to whatever Sparky's arrow points at
      menu.style.display = 'none';
      if (!window.SH || SH.game.mode !== 'play') return;
      const t = SH.Quests.target();
      if (t) { SH.tp(t.x, t.y + 46); refresh(); } else SH.Toast.show('🎯 Şu an bir hedef yok');
      return;
    }
    try {
      if (window.SH && SH.Save) SH.Save.save = () => {};          // (this page saves no more: closing it would write the old game over the chosen one)
      if (k === 'new') { localStorage.removeItem(KEY); localStorage.removeItem(TP); }
      else { localStorage.setItem(KEY, JSON.stringify(P[k]())); if (where[k]) localStorage.setItem(TP, JSON.stringify(where[k])); else localStorage.removeItem(TP); }
    } catch (e) { /* no storage */ }
    location.reload();
  });
  // after the reload: the first time you are in the game (Continue), jump to the right place
  let tp = null; try { tp = localStorage.getItem(TP); } catch (e) { /* no storage */ }
  if (tp) { const iv = setInterval(() => { if (window.SH && SH.game && SH.game.mode === 'play') { clearInterval(iv); try { localStorage.removeItem(TP); } catch (e) { /* */ } let p = JSON.parse(tp); if (p === 'school' && SH.ISLE6) { SH.ISLE6.land(); refresh(); return; } if (p === 'race' && SH.ISLE6) { SH.ISLE6.land(); SH.tp(2590, 5428); refresh(); return; } if (p === 'classroom' && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(1490, 2150); refresh(); return; } if (p === 'musicroom' && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(746, 2165); refresh(); return; } if (p === 'gym' && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(470, 2125); refresh(); return; } if (p === 'artroom' && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(1452, 2525); refresh(); return; } if (p === 'libroom' && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(1810, 2125); refresh(); return; } if (p === 'pcroom' && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(1797, 2560); refresh(); return; } const inside = { cafe: [374, 2560], lobbybox: [990, 2560], office: [800, 2400], shopfront: [960, 2240] }; if (inside[p] && SH.SCHOOLIN) { SH.SCHOOLIN.enter(true); SH.tp(inside[p][0], inside[p][1]); refresh(); return; } if (p === 'isle' || p === 'hill') { SH.ISLE5.land(); if (p === 'hill') { const H = SH.ISLE5.HILL; SH.tp(H.x - H.rx * H.top - 50, SH.ISLE5.RAMP.y); } refresh(); return; } if (p === 'helm') { const q = SH.SHIP.helmSpot(); p = [q.x, q.y]; } SH.tp(p[0], p[1]); refresh(); } }, 300); }
  void FULL;
})();
</script>
</body>`);
fs.writeFileSync(out, h);
console.log('wrote', out, (h.length / 1024).toFixed(1) + ' KB');
