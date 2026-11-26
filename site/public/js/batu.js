// Batuhan Teacher on the child's page: his dialog box, as in a game (his picture inside it, cut at the waist by the box's
// edge, an orange in his hand). Each time the page opens he says something funny (never the same line twice in a row);
// a tap on the box: another line, and the orange hops.
// His pictures are drawn by Pocket Quest's own character code (tools/make-teacher.mjs -> img/ogretmen/).
import { $ } from './util.js';
import { coin } from './sfx.js';

const S = window.OyunSitesi;

// The strip's frames, and where the orange sits in each one (tools/teacher-sprite.json, in the strip's pixels).
const FRAMES = ['idle', 'breathe', 'blink', 'talk', 'happy', 'wave', 'wave2'];
const AT = [[39, 50], [39, 52], [39, 50], [39, 50], [39, 50], [39, 50], [39, 50]];
const F = Object.fromEntries(FRAMES.map((f, i) => [f, i]));

// What he says: short and simple (Grade 2 English), with a joke and his "Heh." {name}: the child's username;
// {hi}: Good morning / Good afternoon / Good evening.
const LINES = [
  '{hi}, {name}! This is my orange. Its name is... Orange. Heh.',
  'Look, {name}! It is round. It is orange. It is MY orange. Heh.',
  'Is this an apple? No, it isn\'t! It is an orange! Heh.',
  'I have one orange. You have zero oranges. Sorry, {name}. Heh.',
  'Shh! Do not tell Grabbo about my orange. Heh.',
  '{hi}, {name}! My orange says hello too. Hello! Heh.',
  'Do you like oranges, {name}? I like oranges. Oranges like me. Heh.',
  'Are you ready, {name}? My orange is ready. I am ready. Wow. Heh.',
  'One orange, two oranges, three... Hmm. Where are my oranges? Heh.',
  'Can my orange play games? No, it can\'t. It has no hands. Heh.',
  '{name} is here! Hooray! My orange is very happy. Look at it! Heh.',
  'I love oranges. They are round, sweet and orange. Like me. Wait... Heh.',
  'This is my orange. That is your game. Go and play, {name}! Heh.',
  'I am the best teacher on this website. Also the only teacher here. Heh.',
  'Orange, orange, orange! Say it with me: orange! Heh.',
];

const still = matchMedia('(prefers-reduced-motion: reduce)');
let name = '', talking = false, waving = false, happyUntil = 0, blinkAt = 0, blinkUntil = 0, typing = 0, ticking = 0;

function frame(f) {
  const i = F[f];
  $('batuBody').style.backgroundPosition = (i * 100 / (FRAMES.length - 1)) + '% 0';
  const o = $('batuOrange').style;
  o.setProperty('--ox', AT[i][0]); o.setProperty('--oy', AT[i][1]);
}

// ten times a second: the mouth while he talks (and the waving hand), a smile after a joke, breathing and blinking
function tick() {
  if (document.hidden || $('games').hidden) return;
  const t = Date.now();
  if (talking) return frame(waving ? (Math.floor(t / 230) % 2 ? 'wave' : 'wave2') : (Math.floor(t / 120) % 2 ? 'talk' : 'idle'));
  if (t < happyUntil) return frame('happy');
  if (t > blinkAt) { blinkUntil = t + 150; blinkAt = t + 2500 + Math.random() * 3500; }
  frame(t < blinkUntil ? 'blink' : Math.floor(t / 700) % 2 ? 'breathe' : 'idle');
}

function pick() {
  const prev = Number(S.get('oyunSitesi.batu'));
  let i;
  do { i = Math.floor(Math.random() * LINES.length); } while (i === prev);
  S.set('oyunSitesi.batu', String(i));
  const h = new Date().getHours(), hi = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return LINES[i].replace('{hi}', hi).replace(/\{name\}/g, name);
}

// the line comes out letter by letter, like in a game (a little stop at each . , ! ?)
function speak(text, wave) {
  clearTimeout(typing);
  const box = $('batuSay'), out = $('batuTxt');
  box.hidden = false;
  box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  $('batuSr').textContent = text;
  if (still.matches) { out.textContent = text; frame('happy'); return; }
  talking = true; waving = wave;
  let n = 0;
  const step = () => {
    out.textContent = text.slice(0, ++n);
    if (n >= text.length) { talking = waving = false; happyUntil = /Heh\.$/.test(text) ? Date.now() + 1500 : 0; return; }
    const c = text[n - 1];
    typing = setTimeout(step, c === '.' ? 240 : /[!?,]/.test(c) ? 200 : 32);
  };
  step();
}

/** the child's page is on screen: say hello (with a wave), or `line` when there is news (a new level) */
export function greet(username, line) {
  name = username;
  if (!ticking && !still.matches) ticking = setInterval(tick, 100);
  if (still.matches) frame('idle');
  speak(line || pick(), true);
}

// a tap anywhere on his dialog box (or Enter on his picture): another line, as in a game
$('batuSay').addEventListener('click', () => {
  const o = $('batuOrange');
  o.classList.remove('hop'); void o.offsetWidth; o.classList.add('hop');
  coin();
  speak(pick(), false);
});
// back from a game (the page comes back from the browser's memory): a new line
addEventListener('pageshow', (e) => { if (e.persisted && !$('games').hidden && name) speak(pick(), true); });
