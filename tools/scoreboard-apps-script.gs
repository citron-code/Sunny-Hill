// Sunny Hill: the Parrot King's board, online (a Google Sheet with this Apps Script).
// Setting it up once (about 5 minutes) is described in README.md, "Online skor tablosu".
// One row per child: id | name (first name only) | class | look | wear | rounds | right | wrong | updated
// The teacher can read, change or delete any row in the sheet.
const SHEET = 'Board';

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['id', 'name', 'class', 'look', 'wear', 'rounds', 'right', 'wrong', 'updated']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean_(v, n) { return String(v || '').replace(/[<>"'`\\]/g, '').trim().slice(0, n); }

// the board: GET .../exec (everyone) or .../exec?cls=A (one class)
function doGet(e) {
  const cls = clean_(e && e.parameter && e.parameter.cls, 6).toUpperCase();
  const rows = sheet_().getDataRange().getValues().slice(1), out = [];
  for (const r of rows) {
    if (cls && String(r[2]).toUpperCase() !== cls) continue;
    let look = {}, wear = [];
    try { look = JSON.parse(r[3] || '{}'); } catch (err) { /* a hand-edited cell */ }
    try { wear = JSON.parse(r[4] || '[]'); } catch (err) { /* a hand-edited cell */ }
    out.push({ id: String(r[0]), name: String(r[1]), cls: String(r[2]), look: look, wear: wear,
      rounds: Number(r[5]) || 0, right: Number(r[6]) || 0, wrong: Number(r[7]) || 0, t: new Date(r[8]).getTime() || 0 });
  }
  out.sort((a, b) => b.rounds - a.rounds);
  return json_({ entries: out.slice(0, 200), all: !cls });
}

// a child's rounds: POST (text/plain, JSON) { id, name, cls, look, wear, rounds, right, wrong }; a row only grows
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false }); }
  const id = clean_(d.id, 24), cls = clean_(d.cls, 6).toUpperCase(), name = clean_(d.name, 12);
  const rounds = Math.max(0, Math.min(100000, Math.floor(Number(d.rounds) || 0)));
  if (!id || !cls || !name) return json_({ ok: false });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_(), ids = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues().map((r) => String(r[0]));
    const row = [id, name, cls, JSON.stringify(d.look || {}).slice(0, 400), JSON.stringify(d.wear || []).slice(0, 200), rounds,
      Math.max(0, Math.floor(Number(d.right) || 0)), Math.max(0, Math.floor(Number(d.wrong) || 0)), new Date()];
    const i = ids.indexOf(id);
    if (i > 0) { const old = Number(sh.getRange(i + 1, 6).getValue()) || 0; if (rounds >= old) sh.getRange(i + 1, 1, 1, row.length).setValues([row]); }
    else sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
