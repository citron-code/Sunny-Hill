// The game opens a newer copy of itself: a little web server serves the game (A) or a changed one (B), the page and the
// check apart. 1) same copy: no reload; 2) a newer one while on the title screen: it opens it (?v=), once; 3) the web keeps
// saying "newer" (the page itself stays old): only once, never round and round; 4) in the game, walking about: it opens
// it and you are where you were; in a talk: it waits.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
export default async function ({ evaluate, sleep, navigate, consoleLog }) {
  const S = (e) => evaluate(e), log = (...a) => console.log(...a);
  const A = readFileSync(process.cwd() + '/sunny-hill.html', 'utf8'), B = A.replace('/* ---- a newer Sunny Hill on the web', '/* (B) ---- a newer Sunny Hill on the web');
  log('B differs', A !== B);
  const mode = { page: 'A', check: 'A' }, hits = [];
  const srv = createServer((q, r) => {
    const u = new URL(q.url, 'http://x');
    if (u.pathname !== '/sunny-hill.html') { r.writeHead(404); r.end(); return; }
    const chk = u.searchParams.has('check'), v = chk ? mode.check : mode.page;
    hits.push((chk ? 'check ' : 'page ') + v + (u.searchParams.get('v') ? ' ?v' : ''));
    r.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=600' }); r.end(v === 'A' ? A : B);
  }).listen(8765);
  const url = 'http://127.0.0.1:8765/sunny-hill.html?sinif=2B';
  const after = async (secs) => { await sleep(secs * 1000); for (let i = 0; i < 100 && !(await S('!!(window.SH && SH.booted)').catch(() => false)); i++) await sleep(100); };
  const at = () => S('location.search + " | mode " + SH.game.mode + " | newer " + (SH.Update.newer || "-")');
  // 1)
  await navigate(url); await after(3);
  log('1) same copy:', await at(), '| mine', await S('SH.Update.mine'), '| hits', hits.join(', ')); hits.length = 0;
  // 2)
  mode.check = 'B'; await S('sessionStorage.clear()'); await navigate(url); mode.page = 'B'; await after(4);
  log('2) newer, on the title:', await at(), '| hits', hits.join(', '), '| class kept', await S('new URLSearchParams(location.search).get("sinif")')); hits.length = 0;
  // 3)
  mode.page = 'A'; mode.check = 'B'; await S('sessionStorage.clear()'); await navigate(url.replace("2B", "2C")); await after(5); await sleep(6000);
  log('3) the web says newer but serves the old page:', await at(), '| hits', hits.join(', ')); hits.length = 0;
  // 4)
  mode.page = 'A'; mode.check = 'A'; await S('sessionStorage.clear()'); await navigate(url); await after(2);
  await S(`SH.VoiceWarn.hide(); SH.VoiceWarn.shown = true; ScoreBoard.url = ""; SH.quickStart("Ayşe")`); await sleep(500);
  for (let i = 0; i < 20 && await S('SH.Dialog.open'); i++) await S('SH.Dialog.shownAt = 0; SH.Dialog.next()');
  await S('SH.tp(1200, 1000)'); await sleep(800);
  await S('SH.Dialog.show([["sparky", "Woof!"]])'); mode.check = 'B'; mode.page = 'B'; hits.length = 0;
  await S('SH.Update.look()'); await sleep(3000);
  log('4) in a talk:', await at(), '| hits', hits.join(', '));
  await S('SH.Dialog.shownAt = 0; SH.Dialog.next()'); await after(4);
  log('   after the talk:', await at(), '| hits', hits.join(', '), '| saved place', await S('JSON.stringify(SH.state.at)'));
  srv.close();
  log('errors:', JSON.stringify(consoleLog.filter((c) => c.level === 'exception' || c.level === 'error').slice(-5)));
}
