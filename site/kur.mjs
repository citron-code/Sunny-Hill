/* İlk kurulum (bir kez):  node kur.mjs
   Öğretmen şifresini değiştirmek:  node kur.mjs --sifre

   Sırayla: Cloudflare'e giriş (tarayıcı açılır), veritabanı, Pages projesi, gizli değerler
   (öğretmen şifresi ve PEPPER), siteyi derleyip yükleme, son kontrol. Yeniden çalıştırmak güvenlidir:
   var olanı silmez, PEPPER'ı asla değiştirmez (değişirse bütün çocuk şifreleri çalışmaz). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { SITE, DB_NAME, say, stop, wrangler, git, node, project, domainOf, rememberOrigin, health } from './tools/cf.mjs';

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
if (/not authenticated|You are not logged in/i.test(wrangler('whoami', { capture: true }).out)) {
  console.log('Tarayıcı açılacak: Cloudflare hesabınızla girip "Allow"a basın, sonra buraya dönün.');
  if (!wrangler('login').ok) stop('Cloudflare girişi olmadı. Yeniden deneyin.');
}

if (onlyPassword) {
  say('Öğretmen şifresi değişiyor');
  const pw = await newTeacherPassword();
  if (!wrangler(`pages secret put TEACHER_PASSWORD --project-name ${NAME}`, { input: pw }).ok) stop('Şifre kaydedilemedi.');
  console.log('Yeni şifre kaydedildi. Birkaç dakika içinde geçerli olur (gerekirse "node yayinla.mjs").');
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
console.log('"Ok to proceed?" diye sorarsa y yazıp Enter\'a basın.');
if (!wrangler(`d1 execute ${DB_NAME} --remote --file=schema.sql`).ok) stop('Tablolar kurulamadı.');

say('4/7 Pages projesi (' + NAME + ')');
let domain = domainOf(NAME);
if (!domain) {
  if (!wrangler(`pages project create ${NAME} --production-branch main`).ok) stop('Proje açılamadı. wrangler.toml içindeki "name" başka bir ad olabilir.');
  domain = domainOf(NAME) || NAME + '.pages.dev';
}
const origin = 'https://' + domain;
console.log('Site adresi: ' + origin);

say('5/7 Gizli değerler');
const secrets = wrangler(`pages secret list --project-name ${NAME}`, { capture: true }).out;
if (!/TEACHER_PASSWORD/.test(secrets)) {
  const pw = await newTeacherPassword();
  if (!wrangler(`pages secret put TEACHER_PASSWORD --project-name ${NAME}`, { input: pw }).ok) stop('Öğretmen şifresi kaydedilemedi.');
} else console.log('Öğretmen şifresi zaten var (değiştirmek için: node kur.mjs --sifre).');
if (!/PEPPER/.test(secrets)) {
  if (!wrangler(`pages secret put PEPPER --project-name ${NAME}`, { input: randomBytes(32).toString('hex') }).ok) stop('PEPPER kaydedilemedi.');
} else console.log('PEPPER zaten var (hiç değişmez).');

say('6/7 Derleme ve yükleme');
if (rememberOrigin(origin)) console.log('Site adresi shared/config.js dosyasına yazıldı: eski kayıtların taşınması için bunun GitHub\'da yayınlanması gerekir.');
if (!git('fetch origin main').ok) console.log('(git fetch olmadı: bilgisayardaki son bilgilerle devam ediliyor)');
if (!node('build.mjs')) stop('Derleme olmadı.');
if (!wrangler(`pages deploy dist --project-name ${NAME} --branch main --commit-dirty=true`).ok) stop('Yükleme olmadı.');

say('7/7 Son kontrol');
const h = await health(origin);
if (!h) console.log('Site henüz cevap vermiyor; yeni adreslerin açılması birkaç dakika sürebilir. Sonra ' + origin + '/api/health adresine bakın.');
else if (!h.ok) console.log('Site açıldı ama bir eksik var: ' + JSON.stringify(h));
else console.log('Her şey hazır.');
console.log(`\nOyunlar:          ${origin}\nÖğretmen sayfası: ${origin}/ogretmen\n`);
