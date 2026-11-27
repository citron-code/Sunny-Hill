// The Citrobit valley: the living world behind the front page and the child's page (hero.js). It is the site's own
// valley, not one game's: orange groves (the brand), and a place for each game, which Batuhan Teacher walks past.
// It is drawn with Pocket Quest's pixel engine and ground (pq-world.js), so the valley, its places and the cast are one style.
import { GAMES } from './games.js';

/* The places, one per game (its id in games.js), in the order the teacher meets them. A new game gets one more entry:
   where it starts in the valley (x, in the world's pixels), how wide it is (w), its art (draw, below; back: what stands
   behind the ground) and, with sea: true, a bay instead of ground. Its sign takes the game's title and colour from games.js. Orange groves fill
   the gaps by themselves; make LOOP longer when a new place does not fit. */
export const PLACES = [
  { game: 'pocket-quest', x: 330, w: 330, draw: bluebird },                  // Pocket Quest: Bluebird School
  { game: 'sunny-hill', x: 860, w: 440, back: sunnySea, draw: sunnyPier, sea: true },          // Sunny Hill: its island across a bay
  { game: null, x: 1500, w: 200, draw: nextGame },                           // the next game: a plot waiting for it
];
export const LOOP = 1920;          // the valley's length in the world's pixels; then it starts again

let PX, PQW, W, H, GY, strip, groves, ready = false;
const memo = {};
const hash = (n) => PQW.hash(n);
const R = (...c) => PX.ramp(...c);
let LEAF, ORANGE, TRUNK, GRASS, SAND, WALL, WOOD, SAIL, FUR, SHIRT, ROOF;

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rect(g, col, x, y, w, h) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function sprite(key, make) { return memo[key] || (memo[key] = make()); }
function put(g, c, cx, base) { g.drawImage(c, Math.round(cx - c.width / 2), Math.round(base - c.height + 1)); }          // bottom centre at (cx, base)

/* ------------------------------------------------------------------ the pictures */
/** an orange tree: Pocket Quest's tree shape with citrus leaves, and oranges in it */
export function orangeTree(g, cx, base, r) {
  put(g, sprite('otree' + r, () => {
    const p = new PX.Pic(Math.round(r * 2.8), Math.round(r * 3.1)), ox = p.w / 2, oy = p.h - 1;
    p.part('trunk'); p.rbox(ox - r * 0.17, oy - r * 1.25, ox + r * 0.17, oy, r * 0.1, TRUNK, { vert: 0.1 });
    [[0, -1.9, 0.95], [-0.62, -1.55, 0.68], [0.64, -1.5, 0.7], [-0.24, -2.45, 0.6], [0.34, -2.4, 0.6]].forEach((b, i) => {
      p.part('leaf' + i, { soft: true }); p.ellipse(ox + b[0] * r, oy + b[1] * r, b[2] * r * 1.08, b[2] * r, LEAF, { flat: 1 });
    });
    p.retone((x, y, xi, yi) => hash(xi * 13 + yi * 7) > 0.84, -1, ['leaf0', 'leaf2', 'leaf4']);
    const n = Math.round(r * 0.75);
    for (let i = 0; i < n; i++) {
      const a = hash(i * 31 + r * 7) * Math.PI * 2, d = Math.sqrt(hash(i * 17 + r * 3)) * r * 0.92;
      p.part('fruit' + i); p.ellipse(ox + Math.cos(a) * d * 1.1, oy - r * 1.95 + Math.sin(a) * d * 0.8, 1.8, 1.8, ORANGE, { flat: 1 });
    }
    return p.toCanvas();
  }), cx, base);
}

/** a wooden crate full of oranges */
function crate(g, cx, base) {
  put(g, sprite('crate', () => {
    const p = new PX.Pic(18, 13);
    for (let i = 0; i < 5; i++) { p.part('o' + i); p.ellipse(3 + i * 3 + (i % 2), 4 - (i % 2), 2.2, 2.2, ORANGE, { flat: 1 }); }
    p.part('box'); p.rbox(0, 5, 18, 13, 0.5, WOOD, { vert: 0.2 });
    p.decal(['..................', '                  ', '..................'].map((s) => s.replace(/\./g, 'l')), 0, 8, { l: '#8a5634' });
    return p.toCanvas();
  }), cx, base);
}

/** a signboard on two posts, in a game's colour, with its name in Pocket Quest's lettering */
function sign(g, cx, base, text, col, o = {}) {
  const key = 'sign|' + text + '|' + col;
  put(g, sprite(key, () => {
    const tw = Math.max(20, PQ.font.measure ? PQ.font.measure(text, true) : text.length * 6), w = tw + 14, h = 17, c = canvas(w + 2, h + 16), sg = c.getContext('2d');
    const ink = PX.INK, dark = PX.mix(col, ink, 0.45), lite = PX.mix(col, '#ffffff', 0.35);
    for (const px of [5, w - 6]) { rect(sg, ink, px, h, 4, 16); rect(sg, '#8f5f3d', px + 1, h, 2, 16); }
    rect(sg, ink, 1, 0, w, h); rect(sg, col, 2, 1, w - 2, h - 2); rect(sg, lite, 2, 1, w - 2, 1); rect(sg, dark, 2, h - 2, w - 2, 1);
    PQ.font.draw(sg, text, 1 + w / 2, 4, { color: o.color || '#ffffff', align: 'center', outline: dark });
    return c;
  }), cx, base);
}

/** Sunny Hill's island: a green hill with a little village, a lighthouse, trees and a sandy rim */
function islandSprite() {
  const w = 156, h = 70, p = new PX.Pic(w, h), base = h - 4;
  p.part('sand'); p.ellipse(w * 0.5, base, w * 0.47, 6.5, SAND, { flat: 1.6 });
  const hills = [[w * 0.43, 52, 36], [w * 0.76, 26, 22]];
  hills.forEach(([hx, rx, ry], i) => { p.part('hill' + i, { soft: true }); p.ellipse(hx, base, rx, ry, GRASS, { flat: 0.9, clip: (x, y) => y < base - 1 }); });
  const surface = (x) => { let top = base; for (const [hx, rx, ry] of hills) { const k = (x - hx) / rx; if (Math.abs(k) < 1) top = Math.min(top, base - ry * Math.sqrt(1 - k * k)); } return top; };
  // the village on the slope: white houses with red, blue and yellow roofs, a window each
  [[30, 12, 9, 0], [47, 13, 10, 1], [64, 12, 9, 2], [80, 11, 8, 0], [97, 10, 8, 1]].forEach(([x, hw, hh, r], i) => {
    const bottom = Math.round(surface(x + hw / 2)) + 4, top = bottom - hh;
    p.part('wall' + i); p.rbox(x, top, x + hw, bottom, 0.5, WALL, { vert: 0.2 });
    p.part('roof' + i); p.poly([[x - 2, top + 1], [x + hw / 2, top - 7], [x + hw + 2, top + 1]], ROOF[r]);
    p.decal(['ww', 'ww'], x + 2, top + 3, { w: '#5f8fc8' }); p.decal(['d', 'd', 'd'], x + hw - 4, bottom - 4, { d: '#8f5f3d' });
  });
  // round trees between them
  [[18, 3.6], [41, 3.2], [88, 3.4], [112, 3]].forEach(([x, r], i) => { p.part('tree' + i, { soft: true }); p.ellipse(x, surface(x) - r + 2, r * 1.1, r, LEAF, { flat: 1 }); });
  // the lighthouse on the small hill: white with red bands, a yellow light under a red cap
  const lx = Math.round(w * 0.78), lb = Math.round(surface(lx)) + 3;
  p.part('tower'); p.poly([[lx - 5, lb], [lx - 3, lb - 30], [lx + 3, lb - 30], [lx + 5, lb]], WALL);
  p.retone((x, y) => (Math.floor((lb - y) / 6) % 2 === 1) && y < lb - 2, 0, ['tower']);
  for (let y = lb - 30; y < lb; y++) if (Math.floor((lb - y) / 6) % 2 === 1) for (let x = lx - 6; x <= lx + 6; x++) if (p.get(x, y)) p.set(x, y, ROOF[0], x < lx ? 1 : 2, null, true);
  p.part('light'); p.rbox(lx - 3, lb - 36, lx + 3, lb - 30, 0.5, R('#fff6b0', '#ffd64a', '#e9a92a', '#b47a1a'), { tone: 0 });
  p.part('cap'); p.poly([[lx - 5, lb - 35], [lx, lb - 41], [lx + 5, lb - 35]], ROOF[0]);
  return p.toCanvas();
}

/** Sunny Hill's ship: a wooden hull, two white sails and a red flag */
function shipSprite() {
  const p = new PX.Pic(36, 34);
  p.part('mast'); p.rbox(17, 4, 19, 26, 0.3, WOOD, { tone: 2 });
  p.part('sail'); p.poly([[19, 6], [31, 20], [19, 22]], SAIL);
  p.part('sail2'); p.poly([[17, 9], [7, 21], [17, 22]], SAIL);
  p.decal(['rrrr', 'rrr', 'rr'], 19, 3, { r: '#e2364a' });
  p.part('hull'); p.poly([[2, 24], [34, 24], [29, 32], [7, 32]], WOOD);
  p.decal(['yyyyyyyyyyyyyyyyyyyyyyyy'], 6, 26, { y: '#ffd64a' });
  return p.toCanvas();
}

/** a Sunny Hill villager: a round-headed cat in a blue shirt, waving (frame 1) or not (frame 0) */
function villagerSprite(f) {
  const p = new PX.Pic(24, 32);
  p.part('legs'); p.rbox(8, 24, 11, 31, 1, FUR); p.rbox(13, 24, 16, 31, 1, FUR);
  p.part('body'); p.rbox(6, 17, 18, 27, 3.5, SHIRT);
  p.part('armL'); p.capsule(7, 19, 4, 25, 1.6, FUR);
  p.part('armR'); if (f) p.capsule(17, 19, 21, 12 + (f === 2 ? 1 : 0), 1.6, FUR); else p.capsule(17, 19, 20, 25, 1.6, FUR);
  p.part('earL'); p.poly([[4, 8], [6, 1], [11, 5]], FUR); p.part('earR'); p.poly([[13, 5], [18, 1], [20, 8]], FUR);
  p.part('head'); p.ellipse(12, 10.5, 8.5, 7.5, FUR, { flat: 1.1 });
  p.decal(['E.....E', 'E.....E', '.b...b.', '...n...'], 9, 9, { E: '#1d1b2e', b: '#ff9ab0', n: '#e06a8a' });
  p.decal(['p', 'p'], 6, 3, { p: '#ffb3c6' }); p.decal(['p', 'p'], 17, 3, { p: '#ffb3c6' });
  return p.toCanvas();
}

/** the next game's present: a box with a ribbon and a question mark on its tag */
function giftSprite() {
  const p = new PX.Pic(22, 22), BOX = R('#ffe08a', '#ffc23c', '#e59b1c', '#b06e12'), RIB = R('#ff8fb1', '#ef4f7a', '#c22f5c', '#8a1f45');
  p.part('box'); p.rbox(2, 8, 20, 21, 1, BOX, { vert: 0.3 });
  p.part('lid'); p.rbox(1, 5, 21, 9, 1, BOX);
  p.part('rib'); p.rbox(9, 5, 13, 21, 0.3, RIB, { tone: 1 });
  p.part('bow'); p.ellipse(7.5, 3.5, 3.5, 2.5, RIB); p.ellipse(14.5, 3.5, 3.5, 2.5, RIB);
  p.decal(['.www.', 'w...w', '...w.', '..w..', '.....', '..w..'], 14, 11, { w: '#ffffff' });
  return p.toCanvas();
}

/** a grassy bank at the end of a bay, so the sea seems to come from behind the land */
function bankSprite(flip) {
  const p = new PX.Pic(70, 64);
  p.part('bank', { soft: true }); p.ellipse(flip ? 44 : 26, 72, 46, 64, GRASS, { flat: 0.8 });
  p.part('sand'); p.ellipse(flip ? 14 : 56, 66, 14, 8, SAND, { flat: 1.5, clip: (x, y) => y < 64 });
  return p.toCanvas();
}

/* ------------------------------------------------------------------ the places (their still art, drawn once) */
function gameOf(id) { return GAMES.find((x) => x.id === id) || null; }

function bluebird(g, pl) {          // Pocket Quest's school, as in the game, and its sign
  PQW.school(g, pl.x + 30, GY);
  const gm = gameOf(pl.game);
  sign(g, pl.x + 296, GY, gm ? gm.title : 'Pocket Quest', gm && gm.accent || '#3f7fd6');
  PQW.bush(g, pl.x + 10, GY, 26);
}

function sunnySea(g, pl) {          // the bay: sea to the horizon and the island on it (behind the ground)
  const x0 = pl.x, x1 = pl.x + pl.w, top = 172;
  // the water, lighter towards the horizon, with lines of small waves
  const bands = [[top, '#bfe6ff'], [top + 2, '#8fd0fb'], [top + 8, '#6bbcf3'], [top + 20, '#4fa6e8'], [top + 38, '#3f8fd8'], [top + 62, '#3478c4']];
  bands.forEach(([y, col], i) => rect(g, col, x0, y, x1 - x0, (bands[i + 1] ? bands[i + 1][0] : H) - y));
  for (let i = 0; i < 70; i++) {
    const y = top + 4 + Math.floor(hash(i * 7 + 1) * (H - top - 6)), x = x0 + hash(i * 13 + 5) * (x1 - x0), len = 3 + Math.round((y - top) / 14);
    rect(g, y < top + 20 ? '#e3f5ff' : '#9fd6ff', x, y, len, 1);
  }
  put(g, sprite('island', islandSprite), x0 + pl.w * 0.6, top + 6);
}
function sunnyPier(g, pl) {          // a pier across the bay, on posts in the water, and the game's sign at its start
  const x0 = pl.x, x1 = pl.x + pl.w;
  const p0 = x0 + 20, p1 = x1 - 20, ink = PX.INK;
  for (let x = p0 + 6; x < p1; x += 30) { rect(g, ink, x - 1, GY + 2, 6, H - GY); rect(g, '#69432f', x, GY + 2, 4, H - GY); rect(g, '#8f5f3d', x, GY + 2, 1, H - GY); }
  rect(g, ink, p0, GY - 1, p1 - p0, 7); rect(g, '#b87b47', p0, GY, p1 - p0, 4); rect(g, '#e3ad6e', p0, GY, p1 - p0, 1); rect(g, '#8a5634', p0, GY + 4, p1 - p0, 1);
  for (let x = p0 + 3; x < p1; x += 9) rect(g, '#8a5634', x, GY + 1, 1, 3);
  const gm = gameOf(pl.game);
  sign(g, x0 + 54, GY, gm ? gm.title : 'Sunny Hill', gm && gm.accent || '#5cb83a');
}

function nextGame(g, pl) {          // a plot with a little fence, waiting for the next game
  const gx = pl.x + pl.w / 2;
  PQW.fence(g, pl.x + 10, pl.x + 64, GY); PQW.fence(g, pl.x + pl.w - 64, pl.x + pl.w - 10, GY);
  sign(g, gx - 34, GY, 'Coming soon', '#b87b47', { color: '#fff4c8' });
  PQW.bush(g, pl.x + pl.w - 4, GY, 22);
}

/* ------------------------------------------------------------------ build: the far groves and the valley's strip */
function buildGroves() {          // rolling hills of orange groves, between the far hills and the valley floor
  const LW = W * 2, c = canvas(LW, H), g = c.getContext('2d'), haze = (col, k) => PX.mix(col, '#cde5f5', k);
  const line = (x) => Math.round(194 - 9 * (0.6 * Math.sin(x / LW * Math.PI * 6 + 0.7) + 0.4 * Math.sin(x / LW * Math.PI * 14 + 2.1)));
  for (let x = 0; x < LW; x++) { const t = line(x); rect(g, haze(Math.floor(x / 120) % 2 ? '#7cc35e' : '#86ca66', 0.32), x, t, 1, 230 - t); rect(g, haze('#d8f2a0', 0.3), x, t, 1, 1); }
  for (let row = 0; row < 2; row++) for (let x = 6 + row * 7; x < LW; x += 14) {          // rows of little orange trees
    const y = line(x) + 6 + row * 9;
    rect(g, haze('#3b8a3e', 0.3 - row * 0.06), x - 3, y - 6, 7, 5); rect(g, haze('#2c6f3a', 0.3 - row * 0.06), x - 2, y - 1, 5, 1);
    rect(g, haze('#5fb544', 0.3 - row * 0.06), x - 2, y - 6, 4, 1);
    if (hash(x * 3 + row) > 0.35) rect(g, haze('#ff9f1c', 0.25), x - 1 + Math.round(hash(x + row) * 3), y - 4, 1, 1);
    if (hash(x * 5 + row) > 0.55) rect(g, haze('#ffb43c', 0.25), x + 1, y - 3, 1, 1);
  }
  return c;
}

function buildStrip() {
  const c = canvas(LOOP, H), g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const places = PLACES.slice().sort((a, b) => a.x - b.x), seas = places.filter((p) => p.sea);
  for (const pl of places) if (pl.back) pl.back(g, pl);          // first what stands behind the ground (a bay's sea)
  // the ground: runs of land between the bays, with a lip where each one ends at the water (it joins up at the loop's ends)
  const runs = [];
  let from = -200;
  for (const s of seas) { runs.push([from, s.x + 24]); from = s.x + s.w - 24; }
  runs.push([from, LOOP + 200]);
  for (let sx = 0; sx < LOOP; sx += W) {
    const tmp = canvas(W, H), tg = tmp.getContext('2d');
    for (const [a, b] of runs) PQW.ground(tg, sx, a, b, GY);
    g.drawImage(tmp, sx, 0);
  }
  // a grassy bank at each end of a bay hides the water's sides, as if the sea came from behind the land
  for (const s of seas) {
    g.drawImage(sprite('bankL', () => bankSprite(false)), s.x - 34, GY - 62); g.drawImage(sprite('bankR', () => bankSprite(true)), s.x + s.w - 36, GY - 62);
    orangeTree(g, s.x - 10, GY - 50, 10); orangeTree(g, s.x + s.w + 10, GY - 50, 11);          // the groves go on over the banks
  }
  // orange groves in the gaps, and the valley's own sign at its start
  const busy = places.map((p) => [p.x - 24, p.x + p.w + 24]);
  const free = (x) => busy.every(([a, b]) => x < a || x > b);
  for (let x = 20; x < LOOP - 20; x += 46) {
    if (!free(x) || (x > 40 && x < 150)) continue;
    const k = hash(x * 0.37 + 11), r = 11 + Math.round(k * 4);
    if (k < 0.12) crate(g, x, GY); else orangeTree(g, x + Math.round((hash(x) - 0.5) * 12), GY, r);
    if (hash(x * 1.7) > 0.6 && free(x + 23)) PQW.flower(g, x + 23, GY - 1, Math.floor(hash(x) * 3));
  }
  sign(g, 92, GY, 'Citrobit', '#1d2b53', { color: '#ffdd3c' });
  crate(g, 128, GY);
  for (const pl of places) pl.draw(g, pl);
  return c;
}

/** load once: called by hero.js when pq-world.js is there */
export function buildValley() {
  if (ready) return;
  PX = window.PQ.px; PQW = window.PQ.world; W = PQW.W; H = PQW.H; GY = PQW.GY;
  LEAF = R('#b4ea73', '#6cc552', '#3f9c47', '#26713f'); ORANGE = R('#ffe08a', '#ffa62b', '#ec7a1f', '#b9521a');
  TRUNK = R('#c08a5c', '#8f5f3d', '#69432f', '#4a2d24'); GRASS = R('#c9f07e', '#8fd65e', '#5cb447', '#3b8a3e');
  SAND = R('#fff3c2', '#f6dc92', '#e0bd6e', '#b8924e'); WALL = R('#ffffff', '#fff3df', '#ecd9bd', '#c7ad8b');
  WOOD = R('#e3ad6e', '#b87b47', '#8a5634', '#5e3825'); SAIL = R('#ffffff', '#f4f1e8', '#dcd6c6', '#b6ae9a');
  FUR = R('#ffffff', '#f2eadf', '#d8c9b5', '#ab9a85'); SHIRT = R('#9cc8ff', '#4f8fe8', '#3466b8', '#22457e');
  ROOF = [R('#ff8a8a', '#e2364a', '#b5233a', '#7d1730'), R('#8fc2ff', '#3f7fd6', '#2c5fae', '#1d3f7a'), R('#ffe58a', '#ffc23c', '#e09a1c', '#a86a12')];
  groves = buildGroves();
  strip = buildStrip();
  ready = true;
}

/* ------------------------------------------------------------------ every frame: everything behind the cast */
export function drawValley(g, camX, t) {
  PQW.far(g, camX, t);
  const LW = groves.width, go = -Math.round((camX * 0.2) % LW);
  for (let x = go > 0 ? go - LW : go; x < W; x += LW) g.drawImage(groves, x, 0);
  const off = Math.round(((camX % LOOP) + LOOP) % LOOP);
  const a = Math.min(W, LOOP - off);          // (only the part on screen is copied)
  g.drawImage(strip, off, 0, a, H, 0, 0, a, H);
  if (a < W) g.drawImage(strip, 0, 0, W - a, H, a, 0, W - a, H);
  // what moves at each place on screen: the bay's sparkles, the ship, the villager waving; the present bobbing
  for (const pl of PLACES) for (const rep of [0, LOOP]) {
    const sx = pl.x - off + rep;
    if (sx > W + 60 || sx + pl.w < -60) continue;
    if (pl.sea) {
      for (let i = 0; i < 14; i++) {
        const y = 176 + Math.floor(hash(i * 5 + 3) * 44), x = sx + 10 + hash(i * 11 + 7) * (pl.w - 20);
        if (Math.sin(t * 2.5 + i * 1.7) > 0.55) rect(g, '#ffffff', x, y, 2, 1);
      }
      put(g, sprite('ship', shipSprite), sx + pl.w * 0.3, 196 + Math.round(Math.sin(t * 1.6) * 1.5));
      put(g, sprite('vil' + (Math.floor(t * 2.5) % 2 + 1), () => villagerSprite(Math.floor(t * 2.5) % 2 + 1)), sx + 124, GY);
    }
    if (pl.game === null) {
      const bob = Math.round(Math.abs(Math.sin(t * 2.2)) * 4);
      put(g, sprite('gift', giftSprite), sx + pl.w / 2 + 30, GY - 2 - bob);
      if (Math.floor(t * 3) % 3 === 0) { rect(g, '#fff6b0', sx + pl.w / 2 + 44, GY - 30 - bob, 1, 3); rect(g, '#fff6b0', sx + pl.w / 2 + 43, GY - 29 - bob, 3, 1); }
    }
  }
}
