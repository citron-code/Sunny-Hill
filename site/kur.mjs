/* İlk kurulum (bir kez):  node kur.mjs
   Öğretmen şifresini değiştirmek:  node kur.mjs --sifre

   Sırayla: Cloudflare'e giriş (tarayıcı açılır), veritabanı, tablolar, derleme, yükleme (ilk seferde workers.dev adı
   sorulabilir), gizli değerler (öğretmen şifresi ve PEPPER), son kontrol. Yeniden çalıştırmak güvenlidir: var olanı
   silmez, PEPPER'ı asla değiştirmez (değişirse bütün çocuk şifreleri çalışmaz).
   Site bir Cloudflare Worker'ı olarak workers.dev'de çalışır: pages.dev adresleri Türkiye'de erişime kapalı. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { SITE, DB_NAME, say, stop, wrangler, git, node, project, loggedIn, deploy, rememberOrigin, health } from './tools/cf.mjs';

function askHidden(q) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { rl.output.write(s.startsWith(q) ? q + '*'.repeat(s.length - q.length) : s.replace(/[^\r\n]/g, '*')); };
    rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); res(a); });
  });
}
async function newTeacherPassword() {
  for (;;) {
    const a = await askHidden('Öğretmen şifresi (en az 8 karakter, yazarken görünmez): ');
    if (a.length < 8) { console.log('En az 8 karakter olmalı.'); continue; }
    const b = await askHidden('Aynı şifre bir daha: ');
    if (a !== b) { console.log('İkisi aynı değil, yeniden.'); continue; }
    return a;
  }
}

const NAME = project();
const onlyPassword = process.argv.includes('--sifre');

if (Number(process.versions.node.split('.')[0]) < 18) stop('Node 18 ya da daha yenisi gerekli.');

say('1/7 Cloudflare hesabı');
if (!loggedIn()) {
  console.log('Tarayıcı açılacak: Cloudflare hesabınızla girip "Allow"a basın, sonra buraya dönün.');
  if (!wrangler('login').ok || !loggedIn()) stop('Cloudflare girişi olmadı. Yeniden deneyin.');
}

if (onlyPassword) {
  say('Öğretmen şifresi değişiyor');
  const pw = await newTeacherPassword();
  if (!wrangler('secret put TEACHER_PASSWORD', { input: pw }).ok) stop('Şifre kaydedilemedi.');
  console.log('Yeni şifre kaydedildi. Bir dakika içinde geçerli olur.');
  process.exit(0);
}

say('2/7 Veritabanı (' + DB_NAME + ')');
const findDb = () => {
  const r = wrangler('d1 list --json', { capture: true });
  try { const L = JSON.parse(r.out.slice(r.out.indexOf('['))); const d = L.find((x) => x.name === DB_NAME); return d ? d.uuid : ''; } catch (e) { return ''; }
};
let dbId = findDb();
if (!dbId) {
  if (!wrangler(`d1 create ${DB_NAME} --location weur`).ok) stop('Veritabanı açılamadı.');
  dbId = findDb();
}
if (!dbId) stop('Veritabanının kimliği okunamadı. "npx wrangler d1 list" ile bakın.');
const tomlFile = join(SITE, 'wrangler.toml');
writeFileSync(tomlFile, readFileSync(tomlFile, 'utf8').replace(/database_id = "[^"]*"/, `database_id = "${dbId}"`));
console.log('Veritabanı hazır: ' + dbId);

say('3/7 Tablolar');
if (!wrangler(`d1 execute ${DB_NAME} --remote --yes --file=schema.sql`).ok) stop('Tablolar kurulamadı.');

say('4/7 Derleme');
if (!git('fetch origin main').ok) console.log('(git fetch olmadı: bilgisayardaki son bilgilerle devam ediliyor)');
if (!node('build.mjs')) stop('Derleme olmadı.');

say('5/7 Yükleme');
console.log('Cloudflare bir workers.dev adı sorarsa: önce y yazıp Enter\'a basın, sonra citrobit yazıp Enter\'a basın.');
console.log('Sitenin adresi o zaman https://' + NAME + '.citrobit.workers.dev olur.');
const d = deploy();
if (!d.ok) stop('Yükleme olmadı. Bir dakika bekleyip yeniden deneyin: node kur.mjs');
if (d.url) console.log('Site adresi: ' + d.url);
else console.log('Sitenin adresi okunamadı: yukarıda yazan https://...workers.dev adresini Claude\'a söyleyin.');

say('6/7 Gizli değerler');
const list = wrangler('secret list', { capture: true });
if (!list.ok) stop('Gizli değerlerin listesi alınamadı. Bir dakika bekleyip yeniden deneyin: node kur.mjs');
if (!/TEACHER_PASSWORD/.test(list.out)) {
  const pw = await newTeacherPassword();
  if (!wrangler('secret put TEACHER_PASSWORD', { input: pw }).ok) stop('Öğretmen şifresi kaydedilemedi.');
} else console.log('Öğretmen şifresi zaten var (değiştirmek için: node kur.mjs --sifre).');
if (!/PEPPER/.test(list.out)) {
  if (!wrangler('secret put PEPPER', { input: randomBytes(32).toString('hex') }).ok) stop('PEPPER kaydedilemedi.');
} else console.log('PEPPER zaten var (hiç değişmez).');

say('7/7 Son kontrol');
if (!d.url) process.exit(0);
if (rememberOrigin(d.url)) console.log('Site adresi shared/config.js dosyasına yazıldı: eski kayıtların taşınması için GitHub\'da yayınlanması gerekir (Claude\'a "yayınla" deyin).');
const h = await health(d.url);
if (!h) console.log('Site henüz cevap vermiyor; yeni adreslerin açılması birkaç dakika sürebilir. Sonra ' + d.url + '/api/health adresine bakın.');
else if (!h.ok) console.log('Site açıldı ama bir eksik var: ' + JSON.stringify(h));
else console.log('Her şey hazır.');
console.log(`\nOyunlar:          ${d.url}\nÖğretmen sayfası: ${d.url}/ogretmen\n`);
