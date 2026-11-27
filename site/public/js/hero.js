// The front page's living world, like a game's title screen: the Citrobit valley (valley.js: orange groves, and a place
// for each game) scrolls slowly; Batuhan Teacher walks through it with his orange, Grabbo sneaks up for it and flees
// when the teacher turns round, Pip flies by. The sky follows the clock: day, sunset, night with stars and a moon.
// It stops when nobody can see it. Drawn with Pocket Quest's pixel engine (pq-world.js), so it is all one style.
import { CAST } from './pq-cast.js';
import { buildValley, drawValley, orangeTree } from './valley.js';

const W = 480, H = 270, GY = 224, FPS = 30;
const TX = 196;                     // where the teacher walks on the screen (the world moves under him)
const CYCLE = 18;                   // seconds: walk, turn round, look, shrug, walk on

let g, PQW, sheet, stars, moodNow = '', camX = 0, last = 0, running = false, shown = true;

function load(src) {
  return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
}
function img(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; }); }

// one picture from the cast sheet, its feet at (x, feetY), facing right or left; gives back where it went
function spr(c, name, x, feetY, left) {
  const a = CAST[name], dx = Math.round(x - (left ? a.w - a.ax : a.ax)), dy = Math.round(feetY - a.ay);
  if (!left) c.drawImage(sheet, a.x, 0, a.w, a.h, dx, dy, a.w, a.h);
  else { c.save(); c.translate(dx + a.w, dy); c.scale(-1, 1); c.drawImage(sheet, a.x, 0, a.w, a.h, 0, 0, a.w, a.h); c.restore(); }
  return { dx, dy, a, left, c };
}
const sprite = (name, x, feetY, left) => spr(g, name, x, feetY, left);
function orangeIn(s, lift = 0) {    // the orange, sitting on his near hand
  const hx = s.left ? s.a.w - s.a.hx : s.a.hx;
  spr(s.c, 'orange', s.dx + hx + (s.left ? -1 : 1), s.dy + s.a.hy - 1 - lift, s.left);
}

const FORCED = new URLSearchParams(location.search).get('mood');          // ?mood=day|dusk|night, to look at each one
function mood(h) {
  if (/^(day|dusk|night)$/.test(FORCED || '')) return FORCED;
  return h >= 7 && h < 17 ? 'day' : (h >= 17 && h < 20) || (h >= 5 && h < 7) ? 'dusk' : 'night';
}

function build() {          // the night's stars (the valley builds itself: valley.js)
  const r = (i, n) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
  stars = [];
  for (let i = 0; i < 46; i++) {
    const s = [Math.floor(r(i, 1) * W), Math.floor(r(i, 2) * 104), r(i, 3) * 6.28, r(i, 4) < 0.2 ? 2 : 1];
    if (Math.hypot(s[0] - 402, s[1] - 46) > 30) stars.push(s);
  }
}

function disc(cx, cy, r, col) {
  g.fillStyle = col;
  for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); }
}
function sky(m, t) {               // the time of day over everything; then the night's own lights
  if (m === 'day') return;
  g.save();
  g.globalCompositeOperation = 'multiply';
  const gr = g.createLinearGradient(0, 0, 0, H);
  if (m === 'dusk') { gr.addColorStop(0, '#ffb894'); gr.addColorStop(0.55, '#ffd8bc'); gr.addColorStop(1, '#ffeadb'); }
  else { gr.addColorStop(0, '#22285e'); gr.addColorStop(0.6, '#3a4486'); gr.addColorStop(1, '#4a5694'); }
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.restore();
  if (m === 'night') {
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * 2.2 + s[2]);
      g.fillStyle = 'rgba(255,250,220,' + tw.toFixed(2) + ')'; g.fillRect(s[0], s[1], s[3], s[3]);
    }
    g.fillStyle = 'rgba(255,248,214,0.12)'; g.beginPath(); g.arc(402, 46, 24, 0, 7); g.fill();
    disc(402, 46, 14, '#3a4486'); disc(402, 46, 12, '#fff4cf');
    g.fillStyle = '#e8dcae'; g.fillRect(397, 41, 3, 3); g.fillRect(405, 49, 4, 3); g.fillRect(404, 39, 2, 2);
  } else {
    g.fillStyle = 'rgba(255,170,110,0.10)'; g.fillRect(0, 0, W, 150);
  }
}

function frame(t) {
  const m = mood(new Date().getHours());
  if (m !== moodNow) { moodNow = m; document.documentElement.dataset.mood = m; }
  const tau = t % CYCLE, walking = tau < 10 || tau >= 13.6;
  drawValley(g, camX, t);
  if (m === 'day') PQW.light(g, t, camX);

  // Grabbo: creeps up behind the teacher, flees up and away when he turns round, comes back from the left
  let gx = null, gy = GY - 30 + Math.round(Math.sin(t * 3) * 3), gf = Math.floor(t * 4) % 2 ? 'grabbo1' : 'grabbo0';
  if (tau < 10) gx = TX - 96 + 54 * (tau / 10);
  else if (tau < 10.6) { gx = TX - 42; gy -= Math.round(((tau - 10) / 0.6) ** 2 * 170); gf = 'grabboOops'; }
  else if (tau >= 13.6) gx = -40 + (TX - 96 + 40) * ((tau - 13.6) / (CYCLE - 13.6));
  if (gx !== null) { PQW.shadow(g, gx, GY, 22); sprite(gf, gx, gy, false); }

  // the teacher
  let s;
  PQW.shadow(g, TX, GY, 26);
  if (walking) s = sprite('walk' + (Math.floor(camX / 5) % 8), TX, GY, false);
  else if (tau < 10.6) s = sprite('surprised', TX, GY, true);
  else if (tau < 12.6) s = sprite(tau > 11.4 && tau < 11.55 ? 'blink' : 'stand', TX, GY, true);
  else s = sprite('shrug', TX, GY, false);
  orangeIn(s);

  // Pip flies over now and then
  const pt = t % 26;
  if (pt < 10) sprite(Math.floor(t * 8) % 2 ? 'pip0' : 'pip1', W + 30 - pt * 55, 74 + Math.round(Math.sin(t * 3) * 6), true);

  PQW.foreground(g, camX);
  sky(m, t);
  if (walking && running) camX += 26 / FPS;
}

function loop(now) {
  if (!running) return;
  requestAnimationFrame(loop);
  if (now - last < 1000 / FPS - 2) return;
  last = now;
  frame(now / 1000);
}
function play() {
  const on = shown && !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (on && !running) { running = true; requestAnimationFrame(loop); }
  if (!on) running = false;
}

let ready = null;                   // the world's drawing code and the cast sheet, loaded once for both canvases
function loadWorld() {
  ready ||= Promise.all([window.PQ && window.PQ.world ? null : load('/js/pq-world.js'), img('/img/pq-cast.png')])
    .then((both) => { sheet = both[1]; PQW = window.PQ.world; buildValley(); return true; }, () => false);
  return ready;
}

/** draw the world into the canvas (480 x 270) and keep it alive while it is on screen */
export async function startWorld(canvas) {
  if (!(await loadWorld())) return;          // no world: the plain sky behind it stays
  g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
  // whole screen pixels for each of the world's pixels (never stretched unevenly): 4 on a computer, the windows' own
  // pixel (more only on a very big screen); in the band of a tablet 3, of a phone 2. Its ground on the bottom, the
  // teacher a little left of the middle; what does not fit is cut off.
  const stage = canvas.parentElement;
  const fit = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    const s = innerWidth <= 980 ? (innerWidth <= 640 ? 2 : 3) : Math.max(4, Math.ceil(Math.max(w / W, h / H)));
    const left = Math.min(0, Math.max(w - W * s, Math.round(w * 0.45 - TX * s)));
    Object.assign(canvas.style, { width: W * s + 'px', height: H * s + 'px', left: left + 'px', top: h - H * s + 'px' });
  };
  fit();
  new ResizeObserver(fit).observe(stage);
  build();
  frame(2);                      // a first picture at once (and the only one when motion is turned off)
  canvas.classList.add('on');
  new IntersectionObserver((e) => { shown = e[0].isIntersecting; play(); }).observe(canvas);
  document.addEventListener('visibilitychange', play);
  play();
}

/* ------------------------------------------------------------------ "How to play": a strip of the same ground
   Three signposts (1, 2, 3) under the step windows and a star at the end. Batuhan Teacher walks in, stops at each
   post, cheers on the star and walks on. On a phone the windows stand in a column, so the strip keeps only the star.
   Its pixels are as big as the world's on top (4, 3 or 2 screen pixels), and it only moves while it is on screen. */
const SH = 86, ST = 72, SPEED = 32;          // the strip's height, its ground line, the walk (its pixels per second)
// the goal at the end of the strip: a gold star set in the grass (Pocket Quest's challenge pad, drawn here)
const STAR = ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'];
function goal(c, cx, base) {
  const r = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  r('#1b1029', cx - 15, base - 1, 31, 4); r('#d98c2f', cx - 14, base - 1, 29, 3); r('#ffd64a', cx - 14, base - 1, 29, 1);
  const x0 = cx - 4, y0 = base - 12;
  for (const [dx, dy, col] of [[-1, 0, '#1b1029'], [1, 0, '#1b1029'], [0, -1, '#1b1029'], [0, 1, '#1b1029'], [0, 0, '#ffd64a']]) {
    STAR.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') r(col, x0 + x + dx, y0 + y + dy, 1, 1); }));
  }
  r('#fff4b0', x0 + 4, y0 + 2, 1, 2); r('#fff4b0', x0 + 3, y0 + 3, 1, 1);
}
export async function startStrip(canvas) {
  if (!(await loadWorld())) return;
  const c = canvas.getContext('2d'), still = matchMedia('(prefers-reduced-motion: reduce)');
  let bg = null, cw = 0, wide = false, segs = [], total = 1, rest = 0, on = false, seen = false, lastT = 0;

  function layout() {
    // the same pixel as the world on top (4, 3 or 2 screen pixels); the windows stand in a row from 900 px up, as in
    // site.css: only then a signpost under each
    const box = canvas.parentElement.clientWidth || 480, s = innerWidth <= 980 ? (innerWidth <= 640 ? 2 : 3) : 4;
    const nw = Math.max(120, Math.ceil(box / s)), nwide = matchMedia('(min-width: 900px)').matches;
    canvas.style.width = nw * s + 'px'; canvas.style.height = SH * s + 'px';
    if (nw === cw && nwide === wide && bg) return false;
    cw = nw; wide = nwide;
    canvas.width = cw; canvas.height = SH;
    bg = document.createElement('canvas'); bg.width = cw; bg.height = SH;
    const b = bg.getContext('2d'), G = PQW.GY;
    b.imageSmoothingEnabled = false; c.imageSmoothingEnabled = false;
    b.translate(0, ST - G);          // the world's ground line lands on the strip's
    for (let x = 0; x < cw; x += 480) { b.save(); b.translate(x, 0); PQW.ground(b, x, -100000, 100000, G); b.restore(); }
    PQW.bush(b, 8, G, 24);
    let stops = [], padX = cw - 30;
    if (wide) {
      const xs = [cw / 6, cw / 2, cw * 5 / 6].map(Math.round);
      PQW.fence(b, xs[0] + 24, xs[1] - 26, G);
      orangeTree(b, Math.round((xs[1] + xs[2]) / 2), G, 13);
      xs.forEach((x, i) => PQW.signpost(b, x, G, String(i + 1)));
      stops = xs.map((x) => x - 22);
      padX = Math.min(cw - 26, xs[2] + 44);
    } else orangeTree(b, Math.round(cw * 0.42), G, 13);
    goal(b, padX, G);
    PQW.bush(b, cw - 4, G, 22);
    // the walk, as pieces of time: walk to each post and look at it, walk to the star and cheer, walk off, wait
    const plan = [];
    let x = -30;
    for (const s of stops) { plan.push(['walk', x, s], ['look', 1.6, s]); x = s; }
    plan.push(['walk', x, padX - 2], ['cheer', 1.4, padX - 2], ['walk', padX - 2, cw + 40], ['wait', 0.8, cw + 40]);
    segs = plan.map((p) => (p[0] === 'walk' ? { k: 'walk', d: Math.abs(p[2] - p[1]) / SPEED, a: p[1], b: p[2] } : { k: p[0], d: p[1], a: p[2], b: p[2] }));
    total = segs.reduce((n, sg) => n + sg.d, 0);
    rest = segs[0].d + 0.2;          // the still picture: at the first post (or the star)
    return true;
  }

  function draw(t) {
    c.clearRect(0, 0, cw, SH);
    c.drawImage(bg, 0, 0);
    let u = ((t % total) + total) % total, sg = segs[0];
    for (sg of segs) { if (u < sg.d) break; u -= sg.d; }
    if (sg.k === 'wait') return;
    let x = sg.b, pose = 'stand', lift = 0;
    if (sg.k === 'walk') { x = sg.a + (sg.b - sg.a) * (u / sg.d); pose = 'walk' + (((Math.floor(x / 5) % 8) + 8) % 8); }
    else if (sg.k === 'cheer') { pose = 'happy'; lift = Math.round(Math.abs(Math.sin(u * 5)) * 7); }
    else if (u > 0.7 && u < 0.85) pose = 'blink';
    PQW.shadow(c, x, ST, 26);
    orangeIn(spr(c, pose, x, ST, false), lift);
  }

  function loop(now) {
    if (!on) return;
    requestAnimationFrame(loop);
    if (now - lastT < 1000 / FPS - 2) return;
    lastT = now;
    draw(now / 1000);
  }
  function go() {
    const want = seen && !document.hidden && !still.matches;
    if (want && !on) { on = true; requestAnimationFrame(loop); }
    if (!want) on = false;
  }
  layout(); draw(rest);
  canvas.classList.add('on');
  new ResizeObserver(() => { if (layout()) draw(on ? performance.now() / 1000 : rest); }).observe(canvas.parentElement);
  new IntersectionObserver((e) => { seen = e[0].isIntersecting; go(); }).observe(canvas);
  document.addEventListener('visibilitychange', go);
}
