/* The site's pixel art, drawn here as text and saved as crisp SVG files: node tools/make-pixels.mjs
   Writes public/img/maskot.svg (the little orange, 2 frames: eyes open, blink), logo.svg (the icon tile),
   px/*.svg (sun, cloud, orange tree, hills, stars) and i/*.svg (icons, black: the CSS colours them as masks).
   After a change here, run node tools/make-icons.mjs for the home-screen PNGs. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const IMG = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'public', 'img');
mkdirSync(join(IMG, 'px'), { recursive: true });
mkdirSync(join(IMG, 'i'), { recursive: true });

/* ------------------------------------------------------------ drawing */
const grid = (w, h, ch = '.') => Array.from({ length: h }, () => Array(w).fill(ch));
const rows = (g) => g.map((r) => (Array.isArray(r) ? r.join('') : r));
function check(name, art) {
  const w = art[0].length;
  art.forEach((r, y) => { if (r.length !== w) throw new Error(`${name}: row ${y} is ${r.length} wide, not ${w}: "${r}"`); });
  return art;
}
function stamp(g, art, ox, oy) {          // copies the coloured pixels of art onto the grid g
  art.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch !== '.' && g[oy + y] && g[oy + y][ox + x] !== undefined) g[oy + y][ox + x] = ch;
  }));
}
function svg(name, art, pal) {            // one path per colour, pixels merged into runs
  art = check(name, rows(art));
  const w = art[0].length, h = art.length, d = {};
  art.forEach((r, y) => {
    for (let x = 0; x < w;) {
      const ch = r[x];
      if (ch === '.') { x++; continue; }
      if (!pal[ch]) throw new Error(`${name}: no colour for "${ch}"`);
      let n = 1;
      while (x + n < w && r[x + n] === ch) n++;
      (d[ch] = d[ch] || []).push(`M${x} ${y}h${n}v1h-${n}z`);
      x += n;
    }
  });
  const paths = Object.keys(d).map((ch) => `<path fill="${pal[ch]}" d="${d[ch].join('')}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${paths}</svg>\n`;
}
const save = (file, text) => { writeFileSync(join(IMG, file), text); console.log('public/img/' + file); };

/* ------------------------------------------------------------ the mascot: a little orange */
// A round orange with a leaf, a happy face and green shoes. Drawn without its outer line; outline() adds that.
function outline(art) {
  const g = art.map((r) => [...r]);
  const filled = (x, y) => art[y] && art[y][x] && art[y][x] !== '.';
  return g.map((r, y) => r.map((ch, x) => (ch === '.' && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) ? 'K' : ch)).join(''));
}
const FRUIT_FILL = [
  '........................',
  '.............GGG........',
  '...........bGGGGG.......',
  '...........bgg..........',
  '.........OOOOOO.........',
  '.......OLLLOOOOOO.......',
  '.....OLLOOOOOOOOOOO.....',
  '....OLOOOOOOOOOOOOOO....',
  '....OLOOOOOOOOOOOdOO....',
  '...OLOOOOOOOOOOOOOOOO...',
  '...OOOOWEOOOOOWEOOOOO...',
  '...OOOOEEOOOOOEEOOOOS...',
  '...OdOOEEOOOOOEEOOOOS...',
  '...OOBBOOOMOOMOOOBBOS...',
  '...OOOOOOOOMMOOOOOOOS...',
  '...OOOOOOOOOOOOOOOOSS...',
  '....OOdOOOOOOOOOOOSS....',
  '....OOOOOOOOOOOOdSSS....',
  '.....OOOOOOOOOOSSSS.....',
  '.......OOOOOOSSSS.......',
  '.........SSSSSS.........',
  '......GGGG....GGGG......',
  '.....ggggg....ggggg.....',
  '........................',
];
const FRUIT = outline(FRUIT_FILL);
const BLINK = outline(FRUIT_FILL.map((r, y) => (y === 10 || y === 11 ? r.slice(0, 7) + 'OO' + r.slice(9, 14) + 'OO' + r.slice(16) : r)));
const FRUIT_PAL = {
  K: '#3a1f12', O: '#ff9f1c', L: '#ffcf7a', S: '#e2711d', d: '#d0601a', E: '#1d1b2e', W: '#ffffff',
  B: '#ff5e78', M: '#5a2a12', G: '#4cc93f', g: '#24873a', b: '#7a4a24',
};
save('maskot.svg', svg('maskot', FRUIT.map((r, y) => r + BLINK[y]), FRUIT_PAL));

/* ------------------------------------------------------------ scenery */
const SUN = [
  '.......RR.......',
  '..R....RR....R..',
  '...R........R...',
  '.....KKKKKK.....',
  '....KYYYYYYK....',
  '...KYYYYYYYYK...',
  'RR.KYEYYYYEYK.RR',
  'RR.KYYYYYYYYK.RR',
  '...KYBMYYMBYK...',
  '...KYYYMMYYYK...',
  '....KYYYYYYK....',
  '.....KKKKKK.....',
  '...R........R...',
  '..R....RR....R..',
  '.......RR.......',
  '................',
];
save('px/sun.svg', svg('sun', SUN, { R: '#ffb11f', K: '#f08a12', Y: '#ffe14d', E: '#3a1f12', M: '#3a1f12', B: '#ff8a7a' }));

const CLOUD = [
  '........WWWW............',
  '......WWWWWWW...WWW.....',
  '....WWWWWWWWWWWWWWWWW...',
  '..WWWWWWWWWWWWWWWWWWWWW.',
  '.WWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWW',
  '.SSSSSSSSSSSSSSSSSSSSSS.',
];
save('px/cloud.svg', svg('cloud', CLOUD, { W: '#ffffff', S: '#cfe9ff' }));

const TREE = [
  '......KKKKKKKK......',
  '....KKllllGGGGKK....',
  '...KllGGGGGGGGGGK...',
  '..KlGGGGFYGGGGGGGK..',
  '.KlGGGGGFFGGGGFYGGK.',
  '.KlGGGGGGGGGGGFFGGK.',
  'KlGGFYGGGGGGGGGGGGgK',
  'KGGGFFGGGGGGFYGGGGgK',
  'KGGGGGGGGGGGFFGGGGgK',
  'KGGGGGGGFYGGGGGGGggK',
  '.KGGGGGGFFGGGGGFYgK.',
  '.KgGGGGGGGGGGGGFFgK.',
  '..KggGGGGGGGGGGggK..',
  '...KKgggGGGGgggKK...',
  '.....KKKKbbKKKKK....',
  '........TbbT........',
  '........TbdT........',
  '........TbdT........',
  '........TbdT........',
  '........TbdT........',
  '.......TbbdT........',
  '......TbbbddT.......',
  '.....TTTTTTTTT......',
];
save('px/tree.svg', svg('tree', TREE, { K: '#1f5a2c', G: '#43b83a', g: '#2c8a35', l: '#86dc5c', F: '#ffa41b', Y: '#ffe08a', b: '#a0603a', d: '#6e3c22', T: '#3a1f12' }));

// hills and ground, 64 wide, repeats sideways: soft back hills, grass with tufts, then earth
const HILL_PAL = { H: '#c4f0a2', h: '#9fe07a', L: '#7ad85a', G: '#4bc43b', g: '#2f9a3a', u: '#b0663a', v: '#8e4e2b', w: '#7d4227' };
function hills(w, h, grassTop) {
  const g = grid(w, h);
  for (let x = 0; x < w; x++) {
    const top = Math.round(grassTop - 4 - 3 * (1 - Math.cos((2 * Math.PI * x) / 32)));   // two humps per 64
    for (let y = top; y < grassTop; y++) g[y][x] = y === top ? 'H' : 'h';
    const tuft = [1, 6, 11, 19, 26, 30, 37, 44, 51, 55, 60].includes(x % 64);
    if (tuft) g[grassTop - 1][x] = 'G';
    for (let y = grassTop; y < h; y++) {
      const d = y - grassTop;
      g[y][x] = d === 0 ? 'L' : d < 3 ? 'G' : d === 3 ? 'g' : y === h - 1 ? 'w' : ((x * 7 + y * 13) % 11 === 0 ? 'v' : 'u');
    }
  }
  return g;
}
save('px/hills.svg', svg('hills', hills(64, 24, 14), HILL_PAL));

// the footer's night sky: a few stars, repeats both ways
const stars = grid(64, 32);
for (const [x, y, big] of [[5, 4, 1], [20, 10, 0], [33, 3, 0], [44, 14, 1], [57, 6, 0], [12, 22, 0], [27, 26, 1], [50, 25, 0], [38, 20, 0], [61, 29, 0]]) {
  stars[y][x] = 'S';
  if (big) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) stars[y + dy][x + dx] = 's';
}
save('px/stars.svg', svg('stars', stars, { S: '#ffffff', s: '#8ea2e8' }));

/* ------------------------------------------------------------ the icon tile (favicon, home screen) */
// the orange on a night-blue tile, with a soft light behind it and a few stars
function logo() {
  const g = grid(32, 32, 'n');
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const r = Math.hypot(x - 15.5, y - 15.5);
    if (r < 11.5) g[y][x] = 'm';
    else if (r < 13.5 && (x + y) % 2) g[y][x] = 'm';          // a dithered edge
  }
  for (const [x, y] of [[3, 4], [27, 3], [4, 27], [28, 26], [26, 9]]) g[y][x] = 'z';
  stamp(g, FRUIT, 4, 4);
  return g;
}
save('logo.svg', svg('logo', logo(), { ...FRUIT_PAL, n: '#1d2b53', m: '#2b3f78', z: '#ffffff' }));

/* ------------------------------------------------------------ icons, 12 x 12 */
const ICONS = {
  play: ['............', '...##.......', '...###......', '...####.....', '...#####....', '...######...',
    '...######...', '...#####....', '...####.....', '...###......', '...##.......', '............'],
  check: ['............', '............', '..........##', '.........###', '........###.', '.##....###..',
    '.###..###...', '..######....', '...####.....', '....##......', '............', '............'],
  user: ['............', '....####....', '...######...', '...######...', '...######...', '....####....',
    '............', '...######...', '..########..', '.##########.', '.##########.', '............'],
  del: ['............', '............', '....#######.', '...########.', '..###.#.###.', '.#####.####.',
    '..###.#.###.', '...########.', '....#######.', '............', '............', '............'],
  logout: ['............', '.######.....', '.#....#.....', '.#....#.#...', '.#....#.##..', '.#..########',
    '.#..########', '.#....#.##..', '.#....#.#...', '.#....#.....', '.######.....', '............'],
  cloud: ['............', '............', '.....###....', '...#######..', '..#########.', '.##########.',
    '############', '############', '.##########.', '............', '............', '............'],
  shield: ['............', '.##########.', '.##########.', '.##########.', '.##########.', '.##########.',
    '..########..', '..########..', '...######...', '....####....', '.....##.....', '............'],
  noads: ['....####....', '..########..', '.###....###.', '.##....####.', '##....###.##', '##...###..##',
    '##..###...##', '##.###....##', '.####....##.', '.###....###.', '..########..', '....####....'],
  chart: ['............', '.........##.', '.........##.', '......##.##.', '......##.##.', '...##.##.##.',
    '...##.##.##.', '...##.##.##.', '...##.##.##.', '...##.##.##.', '.##########.', '............'],
  star: ['.....##.....', '.....##.....', '....####....', '############', '.##########.', '..########..',
    '...######...', '..###..###..', '.###....###.', '.##......##.', '............', '............'],
  home: ['............', '.....##.....', '....####....', '...######...', '..########..', '.##########.',
    '############', '..########..', '..###..###..', '..###..###..', '..###..###..', '............'],
  lock: ['............', '....####....', '...##..##...', '...#....#...', '...#....#...', '..########..',
    '..########..', '..###..###..', '..###..###..', '..########..', '..########..', '............'],
  search: ['............', '..####......', '.##..##.....', '.#....#.....', '.#....#.....', '.##..##.....',
    '..#####.....', '......###...', '.......###..', '........###.', '.........##.', '............'],
  sound: ['............', '.....#......', '....##..#...', '...###...#..', '.#####.#..#.', '.#####..#.#.',
    '.#####..#.#.', '.#####.#..#.', '...###...#..', '....##..#...', '.....#......', '............'],
  mute: ['............', '.....#......', '....##......', '...###......', '.#####.#...#', '.#####..#.#.',
    '.#####...#..', '.#####..#.#.', '...###.#...#', '....##......', '.....#......', '............'],
  flame: ['......#.....', '.....##.....', '.....###....', '....####....', '...#####..#.', '...######.#.',
    '..#########.', '..####.####.', '..###...###.', '..###...###.', '...##...##..', '....#####...'],
};
for (const [name, art] of Object.entries(ICONS)) save(`i/${name}.svg`, svg(name, art, { '#': '#000' }));
save('i/check-ink.svg', svg('check-ink', ICONS.check, { '#': '#1d2b53' }));
