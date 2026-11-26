/* The games on the site. One list for everyone: the pages, the little bridge inside each game,
   the server and tasi.html (the page on the old address that brings old saves over).

   A child's save for a game is made of the browser-storage keys listed in `keys`
   (or every key starting with `prefix`). The games themselves are not changed: they keep
   saving where they always did, and the site copies those keys to the cloud and back.

   No imports here and nothing outside this file: build.mjs also turns it into a plain script. */

export const GAMES = [
  {
    id: 'sunny-hill',
    title: 'Sunny Hill',
    tagline: 'Köyü gez, İngilizce konuş!',
    about: "Köyü gez, karakterlerle İngilizce konuş; korsan gemisi, Parrot King'in adası ve okul gezisi gibi bölümlerde ilerle.",
    tags: ['3D macera', 'Unit 1–3'],
    cover: '/img/sunny-hill.jpg',
    shot: '/img/sh-village.jpg',          // (the front page's picture of the game)
    accent: '#5cb83a',
    keys: ['sunnyHill.save.v1', 'sunnyHill.save.v1.album'],
    main: ['sunnyHill.save.v1'],   // removed only by "New Game": the cloud keeps a backup first
    classParam: 'sinif',          // the game takes the class from ?sinif=A for its boards
    needs3d: true,
    summary(get) {                // a short line for the teacher's list and the games page
      const s = parse(get('sunnyHill.save.v1'));
      if (!s) return '';
      let lv = 1;
      if (s.lab && s.lab.stage && s.lab.stage !== 'meet') lv = 2;
      if (s.ship && s.ship.stage) lv = 3;
      if (s.sea && s.sea.stage) lv = 4;
      if (s.isle && s.isle.stage) lv = 5;
      if (s.school && s.school.stage) lv = 6;
      if (s.school && s.school.trip && s.school.trip.st) lv = 7;          // (the game makes trip = { st: '' } for everyone)
      return 'Bölüm ' + lv + ' · ' + (s.stars | 0) + ' yıldız';
    },
  },
  {
    id: 'pocket-quest',
    title: 'Pocket Quest',
    tagline: "Grabbo'nun cebine kaçan eşyaları kurtar!",
    about: "Bluebird School'un eşyalarını Grabbo'dan geri al: koş, zıpla, İngilizce görevleri tamamla.",
    tags: ['Platform oyunu', 'Unit 2–3'],
    cover: '/img/pq-school.jpg',
    shot: '/img/pq-play.jpg',
    accent: '#3f7fd6',
    prefix: 'pq.',
    main: ['pq.unit2.save', 'pq.unit3.save'],
    summary(get) {
      const s2 = parse(get('pq.unit3.save')), s1 = parse(get('pq.unit2.save')), s = s2 || s1;
      if (!s) return '';
      return 'Sezon ' + (s2 ? 2 : 1) + (typeof s.zone === 'number' ? ' · Bölge ' + (s.zone + 1) : '') + ' · ' + (s.stars | 0) + ' yıldız';
    },
  },
];

export function gameById(id) {
  for (const g of GAMES) if (g.id === id) return g;
  return null;
}

export function ownsKey(g, k) {
  k = String(k);
  return g.keys ? g.keys.indexOf(k) >= 0 : !!g.prefix && k.indexOf(g.prefix) === 0;
}

// keys: an object {key: value}, or a function key -> value
export function summaryOf(g, keys) {
  try {
    const get = typeof keys === 'function' ? keys : (k) => (keys && keys[k] != null ? keys[k] : null);
    return String((g.summary && g.summary(get)) || '').slice(0, 120);
  } catch (e) {
    return '';
  }
}

function parse(s) {
  try { return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
