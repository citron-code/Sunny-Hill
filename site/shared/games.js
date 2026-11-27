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
    tagline: 'Explore the village, speak English!',
    about: "Explore the village and talk to its people in English; sail on to the pirate ship, the Parrot King's island and the school trip.",
    tags: ['3D adventure', 'Units 1–3'],
    cover: '/img/sunny-hill.jpg',
    shots: ['/img/sh-village.jpg', '/img/sh-ship.jpg', '/img/sh-sea.jpg'],          // (the front page's moving preview of the game)
    accent: '#5cb83a',
    keys: ['sunnyHill.save.v1', 'sunnyHill.save.v1.album'],
    main: ['sunnyHill.save.v1'],   // removed only by "New Game": the cloud keeps a backup first
    classParam: 'sinif',          // the game takes the class from ?sinif=A for its boards
    needs3d: true,
    levels: 8,                    // how many levels the game has now (the child's page shows Level n of 8). A new level in the game: raise this
                                  // and add its line to summary() below, then publish the site and run yayinla.mjs
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
      if (s.school && s.school.trip && s.school.trip.wk >= 2) lv = 8;          // unit 3, week 2: the Green Islands' south (trip.wk = 2)
      return 'Level ' + lv + ' · ' + stars(s.stars);
    },
  },
  {
    id: 'pocket-quest',
    title: 'Pocket Quest',
    tagline: "Save the things that fell into Grabbo's pocket!",
    about: "Get Bluebird School's things back from Grabbo: run, jump and finish English quests.",
    tags: ['Platformer', 'Units 2–3'],
    cover: '/img/pq-school.jpg',
    shots: ['/img/pq-play.jpg', '/img/pq-school.jpg'],
    accent: '#3f7fd6',
    prefix: 'pq.',
    main: ['pq.unit2.save', 'pq.unit3.save'],
    summary(get) {
      const s2 = parse(get('pq.unit3.save')), s1 = parse(get('pq.unit2.save')), s = s2 || s1;
      if (!s) return '';
      const of = Array.isArray(s.zones) && s.zones.length ? '/' + s.zones.length : '';          // (the save lists every zone of its season)
      return 'Season ' + (s2 ? 2 : 1) + (typeof s.zone === 'number' ? ' · Zone ' + (s.zone + 1) + of : '') + ' · ' + stars(s.stars);
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
function stars(n) { n = n | 0; return n + (n === 1 ? ' star' : ' stars'); }

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
