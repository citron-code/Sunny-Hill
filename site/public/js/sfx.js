// The site's game feel: 8-bit sounds (built by ZzFX below, no sound files) and the pixel wipe that takes the child from
// the front page to their games. Sounds play only after the child has touched the page, never on hover; the speaker
// button turns them off and it stays so on this device.
const S = window.OyunSitesi;
const MASTER = 0.12;          // ZzFX's waves are full height: this keeps them as soft as the old beeps
let ctx = null;

export const soundOn = () => S.get('oyunSitesi.ses') !== 'kapali';
export function setSound(on) { S.set('oyunSitesi.ses', on ? 'acik' : 'kapali'); }

function audio() {
  const ua = navigator.userActivation;
  if (ua && !ua.hasBeenActive) return null;          // (a browser refuses sound before the first tap, with a warning)
  if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/*
  ZzFX - Zuper Zmall Zound Zynth v1.4.0 by Frank Force, https://github.com/KilledByAPixel/ZzFX
  Its sample builder, unchanged apart from the layout. MIT License, Copyright (c) 2019 - Frank Force:
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
  persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
  Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const RATE = 44100;
function zzfx(volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0, release = .1, shape = 0, shapeCurve = 1,
  slide = 0, deltaSlide = 0, pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0, bitCrush = 0,
  delay = 0, sustainVolume = 1, decay = 0, tremolo = 0, filter = 0) {
  let sampleRate = RATE, PI2 = Math.PI * 2, abs = Math.abs, sign = (v) => v < 0 ? -1 : 1,
    startSlide = slide *= 500 * PI2 / sampleRate / sampleRate,
    startFrequency = frequency *= (1 + randomness * 2 * Math.random() - randomness) * PI2 / sampleRate,
    modOffset = 0, repeat = 0, crush = 0, jump = 1, length, b, t = 0, i = 0, s = 0, f,
    quality = 2, w = PI2 * abs(filter) * 2 / sampleRate,
    cos = Math.cos(w), alpha = Math.sin(w) / 2 / quality,
    a0 = 1 + alpha, a1 = -2 * cos / a0, a2 = (1 - alpha) / a0,
    b0 = (1 + sign(filter) * cos) / 2 / a0, b1 = -(sign(filter) + cos) / a0, b2 = b0,
    x2 = 0, x1 = 0, y2 = 0, y1 = 0;
  const minAttack = 9;
  attack = attack * sampleRate || minAttack;
  decay *= sampleRate; sustain *= sampleRate; release *= sampleRate; delay *= sampleRate;
  deltaSlide *= 500 * PI2 / sampleRate ** 3; modulation *= PI2 / sampleRate;
  pitchJump *= PI2 / sampleRate; pitchJumpTime *= sampleRate; repeatTime = repeatTime * sampleRate | 0;
  length = attack + decay + sustain + release + delay | 0;
  b = new Float32Array(length > 0 ? length : 0);
  for (; i < length; b[i++] = s * volume) {
    if (!(++crush % (bitCrush * 100 | 0))) {
      s = shape ? shape > 1 ? shape > 2 ? shape > 3 ? shape > 4
        ? (t / PI2 % 1 < shapeCurve / 2 ? 1 : -1)
        : Math.sin(t ** 3)
        : Math.max(Math.min(Math.tan(t), 1), -1)
        : 1 - (2 * t / PI2 % 2 + 2) % 2
        : 1 - 4 * abs(Math.round(t / PI2) - t / PI2)
        : Math.sin(t);
      s = (repeatTime ? 1 - tremolo + tremolo * Math.sin(PI2 * i / repeatTime) : 1) *
        (shape > 4 ? s : sign(s) * abs(s) ** shapeCurve) *
        (i < attack ? i / attack : i < attack + decay ? 1 - ((i - attack) / decay) * (1 - sustainVolume)
          : i < attack + decay + sustain ? sustainVolume : i < length - delay ? (length - i - delay) / release * sustainVolume : 0);
      s = delay ? s / 2 + (delay > i ? 0 : (i < length - delay ? 1 : (length - i) / delay) * b[i - delay | 0] / 2 / volume) : s;
      if (filter) s = y1 = b2 * x2 + b1 * (x2 = x1) + b0 * (x1 = s) - a2 * y2 - a1 * (y2 = y1);
    }
    f = (frequency += slide += deltaSlide) * Math.cos(modulation * modOffset++);
    t += f + f * noise * (i * i * PI2 % 2 - 1);
    if (jump && ++jump > pitchJumpTime) { frequency += pitchJump; startFrequency += pitchJump; jump = 0; }
    if (repeatTime && !(++repeat % repeatTime)) { frequency = startFrequency; slide = startSlide; jump ||= 1; }
  }
  return b;
}

// one sound from ZzFX's numbers, `at` seconds from now
function play(params, at = 0) {
  const a = audio(); if (!a) return;
  const data = zzfx(...params);
  if (!data.length) return;
  const buf = a.createBuffer(1, data.length, RATE), src = a.createBufferSource(), v = a.createGain();
  buf.getChannelData(0).set(data);
  src.buffer = buf; v.gain.value = MASTER;
  src.connect(v); v.connect(a.destination);
  src.start(a.currentTime + at);
}
const NOTE = (n) => 523.25 * 2 ** (n / 12);          // semitones from C5
// a square note with a quarter duty, the NES's bright voice
const pulse = (f, len = .05, vol = .5, extra = []) => [vol, 0, f, 0, len, .05, 5, .5, ...extra];

/** a key: a short blip, a step higher for each digit already in */
export function blip(n = 0) { if (soundOn()) play(pulse(NOTE(7 + n * 2), .02, .5)); }
/** delete: a blip that falls */
export function back() { if (soundOn()) play(pulse(520, .03, .45, [-5])); }
/** a wrong PIN: a low crunchy "uh-uh", the second half lower */
export function buzz() { if (soundOn()) play([.7, 0, 150, 0, .1, .1, 2, 1, 0, 0, -40, .1, 0, 0, 0, .15]); }
/** PRESS START: a sweep up */
export function start() { if (soundOn()) { play([.45, 0, 330, 0, .06, .1, 5, 1, 8]); play(pulse(NOTE(12), .04, .35), .17); } }
/** in: a happy jingle going up */
export function jingle() {
  if (!soundOn()) return;
  [0, 4, 7].forEach((n, i) => play(pulse(NOTE(n), .04, .45), i * .075));
  play([.45, 0, NOTE(12), 0, .12, .22, 5, 1, 0, 0, 0, 0, .05, 0, 0, 0, 0, 1, 0, .25], .225);
}
/** a tap on the teacher's orange: a coin */
export function coin() { if (soundOn()) play([.5, .02, 1675, 0, .06, .24, 1, 1.82, 0, 0, 837, .06]); }
/** a new level: a fanfare, then a bright chord */
export function fanfare() {
  if (!soundOn()) return;
  [0, 4, 7, 12, 16, 19].forEach((n, i) => play(pulse(NOTE(n), .03, .4), i * .06));
  [12, 16, 19].forEach((n) => play([.28, 0, NOTE(n), 0, .18, .3, 5, 1, 0, 0, 0, 0, .06, 0, 0, 0, 0, 1, 0, .2], .38));
}

/** the pixel wipe: blocks fill the screen corner to corner, then `mid` runs (the page changes), then they clear */
export function wipe(mid) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { mid(); return; }
  const cols = 14, rows = Math.max(6, Math.round(cols * innerHeight / innerWidth)), w = document.createElement('div');
  w.className = 'wipe'; w.style.setProperty('--c', cols); w.style.setProperty('--r', rows); w.setAttribute('aria-hidden', 'true');
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const b = document.createElement('i'); b.style.setProperty('--d', x + y); w.appendChild(b); }
  document.body.appendChild(w);
  const half = (cols + rows) * 18 + 180;
  setTimeout(() => { mid(); w.classList.add('out'); setTimeout(() => w.remove(), half + 60); }, half);
}

/** pixel confetti (a new level): square bits in the site's colours, falling in whole pixels. They burst from the element
    when it is on screen; when it is not (a phone, the window further down), they rain from the top of the screen. */
export function confetti(from) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = from.getBoundingClientRect(), c = document.createElement('canvas'), P = 4;
  const seen = r.bottom > 40 && r.top < innerHeight - 40;
  c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
  c.width = Math.ceil(innerWidth / P); c.height = Math.ceil(innerHeight / P);
  document.body.appendChild(c);
  const g = c.getContext('2d'), cols = ['#ffdd3c', '#ff9f1c', '#3fbf3f', '#3fa9f5', '#ffffff', '#e2364a'];
  const bits = Array.from({ length: 90 }, (_, i) => (seen ? {
    x: (r.left + r.width * (0.2 + Math.random() * 0.6)) / P, y: (Math.max(r.top, 0) + Math.min(r.height, 200) * 0.3) / P,
    vx: (Math.random() - 0.5) * 3.2, vy: -2.2 - Math.random() * 2.6,
  } : {
    x: Math.random() * c.width, y: -Math.random() * c.height * 0.6, vx: (Math.random() - 0.5) * 0.8, vy: Math.random() * 0.8,
  })).map((b, i) => Object.assign(b, { s: Math.random() < 0.3 ? 2 : 1, c: cols[i % cols.length], f: Math.random() * 6, spin: 0.15 + Math.random() * 0.25 }));
  let t0 = 0;
  const step = (now) => {
    t0 ||= now;
    g.clearRect(0, 0, c.width, c.height);
    let alive = 0;
    for (const b of bits) {
      b.vy = Math.min(b.vy + 0.09, 1.6); b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.f += b.spin;
      if (b.y > c.height + 4) continue;
      alive++;
      const thin = Math.abs(Math.sin(b.f)) < 0.35;          // a bit turning over shows its thin side
      g.fillStyle = b.c; g.fillRect(Math.round(b.x), Math.round(b.y), thin ? b.s : b.s * 2, b.s * 2);
    }
    if (alive && now - t0 < 4500) requestAnimationFrame(step); else c.remove();
  };
  requestAnimationFrame(step);
}
