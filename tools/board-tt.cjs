/*
 * The This & That Corner, for the teacher: from the online board (read only), each child on the school list with
 * how many games and their average of right answers; each class's average. The game's lists never show these.
 *
 *   node tools/board-tt.cjs            (all classes)
 *   node tools/board-tt.cjs B          (one class)
 *
 * The averages start with the version that sends them (2026-11-01): older games only count as games.
 */
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'sunny-hill.html'), 'utf8');
const url = (html.match(/const BOARD_URL = '([^']+)'/) || [])[1];
if (!url) { console.log('No board address in sunny-hill.html.'); process.exit(1); }
const only = (process.argv[2] || '').toUpperCase(), CLASSES = ['A', 'B', 'C', 'D'];
const pct = (r, q) => (q ? Math.round(r / q * 100) + '%' : '-');

fetch(url).then((r) => r.json()).then((d) => {
  const rows = (d.entries || []).filter((x) => CLASSES.includes(x.cls) && x.look && x.look.school && (!only || x.cls === only));
  for (const c of CLASSES) {
    if (only && c !== only) continue;
    const L = rows.filter((x) => x.cls === c).sort((a, b) => (b.look.ttq | 0) - (a.look.ttq | 0) || (b.look.ttp | 0) - (a.look.ttp | 0) || a.name.localeCompare(b.name, 'tr'));
    const R = L.reduce((s, x) => s + (x.look.ttr | 0), 0), Q = L.reduce((s, x) => s + (x.look.ttq | 0), 0);
    console.log(`\nClass ${c}: ${L.length} on the school list | class average ${pct(R, Q)} (${Q / 10} games counted)`);
    for (const x of L) console.log(`  ${x.name.padEnd(16)} games ${String(x.look.ttp | 0).padStart(3)} | average ${pct(x.look.ttr | 0, x.look.ttq | 0).padStart(4)}${x.look.ttq ? ` (${x.look.ttq / 10} counted)` : ''}`);
  }
}).catch((e) => { console.log('Could not read the board:', e.message); process.exit(1); });
