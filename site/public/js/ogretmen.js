/* The teacher's page: new accounts from a class list, login cards to print, the list with each child's
   progress, a new PIN, unlocking, backups, moving class, deleting.
   The children's real names never leave this browser (localStorage 'ogretmen.adlar.v1': username -> name). */
import { suggestUser, canonUser } from './names.js';
import { CONFIG } from './config.js';
import { $, esc, ago } from './util.js';

const S = window.OyunSitesi;
const api = (p, b) => S.api('teacher/' + p, b);

/* ------------------------------------------------------------ names here */
const NAMES = 'ogretmen.adlar.v1';
const names = () => { try { return JSON.parse(localStorage.getItem(NAMES) || '{}') || {}; } catch (e) { return {}; } };
const setNames = (o) => localStorage.setItem(NAMES, JSON.stringify(o));
const nameOf = (u) => names()[u] || '';

/* --------------------------------------------------------- cards (PINs) */
// the PINs exist only right after an account is made or a PIN is renewed: kept in this tab until printed
const CARDS = 'ogretmen.kartlar';
const cards = () => { try { return JSON.parse(sessionStorage.getItem(CARDS) || '[]'); } catch (e) { return []; } };
function addCards(list) {
  const C = cards().filter((c) => !list.some((x) => x.username === c.username));
  sessionStorage.setItem(CARDS, JSON.stringify(C.concat(list)));
  renderCards();
}

let DATA = { students: [], games: [] }, cls = '', query = '', open = 0;

function toast(text) {
  const t = $('toast');
  t.textContent = text; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 3500);
}

/* ------------------------------------------------------------------ login */
function showLogin(msg) {
  $('tMain').hidden = true; $('tLogout').hidden = true; $('tLogin').hidden = false;
  $('tMsg').textContent = msg || '';
  $('tPass').focus();
}
$('tForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await api('login', { password: $('tPass').value });
  if (r.ok) { $('tPass').value = ''; return load(); }
  $('tMsg').textContent = r.status === 429 ? `Çok fazla yanlış deneme. ${r.data.minutes} dakika bekleyin.` : r.status === 0 ? 'İnternet yok.' : 'Şifre yanlış.';
});
$('tLogout').addEventListener('click', async () => { await api('logout', {}); showLogin(); });

async function load() {
  const r = await api('students');
  if (r.status === 401) return showLogin();
  if (!r.ok) return showLogin(r.status === 0 ? 'İnternet yok.' : 'Sunucu şu an cevap vermiyor.');
  DATA = r.data;
  $('tLogin').hidden = true; $('tMain').hidden = false; $('tLogout').hidden = false;
  renderList(); renderCards(); renderNamesInfo();
  $('clsList').innerHTML = classes().map((c) => `<option value="${esc(c)}">`).join('');
}

/* ------------------------------------------------------------------- tabs */
function tab(name) {
  for (const b of $('tabs').children) b.classList.toggle('on', b.dataset.tab === name);
  for (const t of ['list', 'add', 'cards', 'names']) $('tab-' + t).hidden = t !== name;
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) tab(b.dataset.tab); });

/* ------------------------------------------------------------------- list */
const classes = () => [...new Set(DATA.students.map((s) => s.cls))].sort((a, b) => a.localeCompare(b, 'tr'));

function renderList() {
  const C = classes(), N = names();
  if (cls && !C.includes(cls)) cls = '';
  const week = Date.now() - 7 * 864e5;
  const active = DATA.students.filter((s) => Object.values(s.games).some((x) => x.updated_at > week)).length;
  const locked = DATA.students.filter((s) => s.locked).length;
  $('stats').innerHTML = `<div class="stat"><b>${DATA.students.length}</b><span>öğrenci</span></div>` +
    `<div class="stat"><b>${C.length}</b><span>sınıf</span></div>` +
    `<div class="stat"><b>${active}</b><span>bu hafta oynayan</span></div>` +
    (locked ? `<div class="stat warnc"><b>${locked}</b><span>kilitli hesap</span></div>` : '');
  $('pills').innerHTML = [['', 'Tümü', DATA.students.length]].concat(C.map((c) => [c, c || '(sınıfsız)', DATA.students.filter((s) => s.cls === c).length]))
    .map(([v, t, n]) => `<button type="button" data-c="${esc(v)}" class="${v === cls ? 'on' : ''}">${esc(t)} <small>${n}</small></button>`).join('');
  const qq = query.toLocaleLowerCase('tr-TR');
  const rows = DATA.students.filter((s) => (!cls || s.cls === cls) &&
    (!qq || s.username.includes(canonUser(qq)) || (N[s.username] || '').toLocaleLowerCase('tr-TR').includes(qq)));
  if (!DATA.students.length) {
    $('list').innerHTML = '<p class="empty">Henüz hesap yok. "Hesap aç" sekmesinden bir sınıf listesi yapıştırın.</p>';
    return;
  }
  const G = DATA.games;
  $('list').innerHTML = `<div class="tablewrap"><table class="list">
    <thead><tr><th>Ad</th><th>Kullanıcı adı</th><th>Sınıf</th><th>Son giriş</th>${G.map((g) => `<th>${esc(g.title)}</th>`).join('')}<th></th></tr></thead>
    <tbody>${rows.map((s) => row(s, N, G)).join('')}</tbody></table></div>
    ${rows.length ? '' : '<p class="empty">Bu aramaya uyan öğrenci yok.</p>'}`;
  const so = open && DATA.students.find((x) => x.id === open);
  if (so) showBackups(so); else open = 0;
}

function row(s, N, G) {
  const game = (g) => {
    const x = s.games[g.id];
    return x ? `<td><b>${esc(x.summary || 'kayıt var')}</b><br><small>${esc(ago(x.updated_at))}</small></td>` : '<td class="none">—</td>';
  };
  const nm = N[s.username];
  return `<tr data-id="${s.id}" class="${s.locked ? 'locked' : ''}">
    <td>${nm ? esc(nm) : '<span class="none">—</span>'} <button class="mini" data-a="name" title="Adı düzenle (sadece bu bilgisayarda)">✎</button></td>
    <td class="u">${esc(s.username)}${s.locked ? ' <span class="tag">kilitli</span>' : ''}</td>
    <td>${esc(s.cls)}</td>
    <td>${esc(ago(s.last_login)) || '<span class="none">hiç</span>'}</td>
    ${G.map(game).join('')}
    <td class="acts">
      <button class="btn b sm" data-a="pin">Yeni şifre</button>
      ${s.locked ? '<button class="btn o sm" data-a="unlock">Kilidi aç</button>' : ''}
      <button class="btn n sm" data-a="backups">Yedekler</button>
      <button class="btn n sm" data-a="class">Sınıf</button>
      <button class="btn r sm" data-a="delete">Sil</button>
    </td></tr>
    ${open === s.id ? `<tr class="bk"><td colspan="${5 + G.length}" id="bk-${s.id}">Yedekler yükleniyor…</td></tr>` : ''}`;
}

$('pills').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { cls = b.dataset.c; renderList(); } });
$('search').addEventListener('input', () => { query = $('search').value.trim(); renderList(); });

$('list').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const tr = b.closest('tr'), id = Number(tr.dataset.id), s = DATA.students.find((x) => x.id === id);
  if (!s) return;
  const who = nameOf(s.username) || s.username;
  const a = b.dataset.a;
  if (a === 'name') {
    const v = prompt(`${s.username} için ad soyad (yalnızca bu bilgisayarda saklanır):`, nameOf(s.username));
    if (v == null) return;
    const N = names();
    if (v.trim()) N[s.username] = v.trim(); else delete N[s.username];
    setNames(N); renderList(); renderNamesInfo();
  } else if (a === 'pin') {
    if (!confirm(`${who} için yeni şifre verilsin mi?\nEski şifre çalışmaz; çocuk bütün cihazlarda yeni şifreyle yeniden giriş yapar. Oyun kayıtları silinmez.`)) return;
    const r = await api('pin', { id });
    if (!r.ok) return toast('Olmadı. Yeniden deneyin.');
    addCards([{ username: r.data.username, pin: r.data.pin, cls: r.data.cls }]);
    toast(`${who}: yeni şifre ${r.data.pin}. Kart "Kartlar" sekmesine eklendi.`);
    await load();
  } else if (a === 'unlock') {
    await api('unlock', { id }); toast(`${who}: kilit açıldı.`); await load();
  } else if (a === 'class') {
    const v = prompt(`${who} hangi sınıfa geçsin?`, s.cls);
    if (v == null) return;
    await api('class', { id, cls: v }); await load();
  } else if (a === 'delete') {
    const v = prompt(`${who} hesabı ve bütün oyun kayıtları kalıcı olarak silinecek (yedekler dahil). Bu geri alınamaz.\nOnaylamak için kullanıcı adını yazın: ${s.username}`);
    if (v == null) return;
    if (canonUser(v) !== s.username) return toast('Kullanıcı adı tutmadı; silinmedi.');
    const r = await api('delete', { id });
    if (!r.ok) return toast('Olmadı. Yeniden deneyin.');
    const N = names(); delete N[s.username]; setNames(N);
    toast(`${who} silindi.`); await load();
  } else if (a === 'backups') {
    open = open === id ? 0 : id;
    renderList();
  } else if (a === 'restore') {
    const bid = Number(b.dataset.b);
    if (!confirm(`${who} için bu yedek geri yüklensin mi? Şimdiki kayıt da yedeklere eklenir, kaybolmaz.\nÇocuk oyunu bir sonraki açışında bu kayıtla devam eder.`)) return;
    const r = await api('restore', { backup_id: bid });
    toast(r.ok ? 'Yedek geri yüklendi.' : 'Olmadı. Yeniden deneyin.');
    await load();
  }
});

const REASON = { hourly: 'saatlik yedek', conflict: 'başka cihazın kaydı', device: 'cihazda kalan kayıt', 'old-site': 'eski adresten', 'before-restore': 'geri yüklemeden önce', 'new-game': 'yeni oyundan önce' };
async function showBackups(s) {
  const cell = $('bk-' + s.id);
  if (!cell) return;
  const parts = await Promise.all(DATA.games.map(async (g) => {
    const r = await api('backups?id=' + s.id + '&game=' + g.id);
    const L = (r.ok && r.data.backups) || [];
    return `<div class="bkg"><b>${esc(g.title)}</b>${L.length ? `<ul>${L.map((x) => `<li><span>${esc(new Date(x.saved_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</span>
      <span>${esc(x.summary || '')}</span><small>${esc(REASON[x.reason] || x.reason)}</small>
      <button class="btn n sm" data-a="restore" data-b="${x.id}">Geri yükle</button></li>`).join('')}</ul>` : '<p class="none">Yedek yok.</p>'}</div>`;
  }));
  cell.innerHTML = parts.join('');
}

/* ------------------------------------------------------------ new accounts */
let pending = [];
$('preview').addEventListener('click', () => {
  const lines = $('newNames').value.split(/\r?\n/).map((l) => l.replace(/[;,\t].*$/, '').trim()).filter(Boolean);
  const taken = new Set(DATA.students.map((s) => s.username));
  pending = lines.map((full) => {
    const base = suggestUser(full);
    let u = base, n = 2;
    while (u && taken.has(u)) u = base + n++;
    if (u) taken.add(u);
    return { full, u };
  });
  if (!pending.length) { $('previewBox').innerHTML = '<p class="msg">Önce öğrencileri yazın.</p>'; return; }
  $('previewBox').innerHTML = `<table class="list pre"><thead><tr><th>Ad Soyad</th><th>Kullanıcı adı</th></tr></thead><tbody>
    ${pending.map((p, i) => `<tr><td>${esc(p.full)}</td><td><input data-i="${i}" value="${esc(p.u)}" maxlength="18" autocomplete="off" spellcheck="false"></td></tr>`).join('')}
    </tbody></table>
    <p class="muted">${pending.length} öğrenci · sınıf: <b>${esc($('newCls').value.trim() || '(sınıfsız)')}</b></p>
    <button class="btn" type="button" id="create">Hesapları aç</button>`;
  $('create').addEventListener('click', create);
});

async function create() {
  const inputs = [...$('previewBox').querySelectorAll('input[data-i]')];
  const usernames = inputs.map((i) => canonUser(i.value));
  if (usernames.some((u) => !u)) return toast('Her öğrencinin bir kullanıcı adı olmalı.');
  $('create').disabled = true;
  const r = await api('students', { cls: $('newCls').value, usernames });
  if (!r.ok) { $('create').disabled = false; return toast(r.status === 401 ? 'Oturum bitti, yeniden giriş yapın.' : 'Olmadı. Yeniden deneyin.'); }
  const N = names(), made = [];
  r.data.created.forEach((c, i) => {
    if (c.error) return;
    N[c.username] = pending[i].full;
    made.push({ username: c.username, pin: c.pin, cls: c.cls });
  });
  setNames(N);
  addCards(made);
  $('newNames').value = ''; $('previewBox').innerHTML = ''; pending = [];
  toast(`${made.length} hesap açıldı. Kartlar hazır.`);
  await load();
  tab('cards');
}

/* -------------------------------------------------------------- the cards */
const site = () => location.origin;
const host = () => location.host;
const link = (c) => `${site()}/#g=${c.username}.${c.pin}`;
function parentMessage(c) {          // for WhatsApp: Turkish, first person singular, plain text
  const nm = nameOf(c.username);
  return `Merhaba,\n${nm ? nm + ' için ' : ''}${CONFIG.name} İngilizce oyun sitesi giriş bilgileri aşağıdadır.\n\n` +
    `Site: ${site()}\nKullanıcı adı: ${c.username}\nŞifre: ${c.pin}\n\nTek dokunuşla giriş: ${link(c)}\n\n` +
    'Oyunlar kaydı artık sitede tutuyor; hangi cihazdan girilirse girilsin kaldığı yerden devam eder. ' +
    'Daha önce eski bağlantıdan oynandıysa, o cihazda ilk girişte "Get my old save" düğmesine basmanız yeterli.\n\n' +
    'Bu bilgileri başkalarıyla paylaşmamanızı rica ederim.\n\nELT Batuhan Teacher';
}

function renderCards() {
  const C = cards();
  $('cardCount').textContent = C.length ? `(${C.length})` : '';
  $('cardsInfo').textContent = C.length
    ? 'Şifreler yalnızca hesap açılınca ya da yeni şifre verilince görünür ve bu sekme kapanınca kaybolur. Kartları yazdırın ya da veli mesajlarını kopyalayın.'
    : 'Yeni hesap açınca ya da yeni şifre verince kartlar burada görünür.';
  $('kcards').innerHTML = C.map((c, i) => `<div class="kcard">
      <div class="kh"><img src="/img/logo.svg" alt=""><span class="kt">${CONFIG.mark ? esc(CONFIG.mark[0]) + '<em>' + esc(CONFIG.mark[1]) + '</em>' : esc(CONFIG.name)}</span><span class="kb">${esc(CONFIG.by)}</span></div>
      <div class="kn">${esc(nameOf(c.username) || ' ')}<small>${esc(c.cls ? 'Sınıf ' + c.cls : '')}</small></div>
      <div class="kl"><span>Site</span><b>${esc(host())}</b></div>
      <div class="kl"><span>Kullanıcı adı</span><b class="big">${esc(c.username)}</b></div>
      <div class="kl"><span>Şifre</span><b class="big">${esc(c.pin)}</b></div>
      <p class="ks">Siteyi aç · kullanıcı adını yaz · şifreni gir</p>
      <div class="kact noprint">
        <button class="btn n sm" data-c="${i}" data-a="msg">Veli mesajını kopyala</button>
        <button class="btn n sm" data-c="${i}" data-a="link">Giriş bağlantısını kopyala</button>
      </div></div>`).join('');
}
$('kcards').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-a]');
  if (!b) return;
  const c = cards()[Number(b.dataset.c)];
  const text = b.dataset.a === 'msg' ? parentMessage(c) : link(c);
  try { await navigator.clipboard.writeText(text); toast('Kopyalandı. WhatsApp\'a yapıştırabilirsiniz.'); } catch (err) { prompt('Kopyalayın:', text); }
});
$('print').addEventListener('click', () => { tab('cards'); window.print(); });
$('clearCards').addEventListener('click', () => {
  if (!confirm('Kartlar temizlensin mi? Şifreler bir daha gösterilemez (gerekirse yeni şifre verirsiniz).')) return;
  sessionStorage.removeItem(CARDS); renderCards();
});

/* ------------------------------------------------------- the names' file */
function renderNamesInfo() {
  const N = names(), n = Object.keys(N).length, missing = DATA.students.filter((s) => !N[s.username]).length;
  $('namesInfo').textContent = `Bu bilgisayarda ${n} ad kayıtlı.` + (missing ? ` ${missing} öğrencinin adı burada yok.` : '');
}
$('exportNames').addEventListener('click', () => {
  const N = names(), by = new Map(DATA.students.map((s) => [s.username, s.cls]));
  const lines = ['Ad Soyad;Kullanıcı adı;Sınıf'].concat(Object.keys(N).sort().map((u) => [N[u], u, by.get(u) || ''].map((v) => String(v).replace(/[;\r\n]/g, ' ')).join(';')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ogrenci-adlari.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$('importNames').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const text = (await f.text()).replace(/^﻿/, '');
  const N = names();
  let n = 0;
  try {
    if (text.trim().startsWith('{')) {
      const o = JSON.parse(text);
      for (const u of Object.keys(o)) if (canonUser(u) && typeof o[u] === 'string') { N[canonUser(u)] = o[u]; n++; }
    } else {
      for (const line of text.split(/\r?\n/)) {
        const [nm, u] = line.split(/[;,\t]/).map((x) => (x || '').trim());
        if (!nm || !u || /kullanıcı/i.test(u)) continue;
        N[canonUser(u)] = nm; n++;
      }
    }
    setNames(N);
    $('namesMsg').textContent = `${n} ad yüklendi.`;
  } catch (err) {
    $('namesMsg').textContent = 'Dosya okunamadı.';
  }
  e.target.value = '';
  renderList(); renderNamesInfo(); renderCards();
});

load();
