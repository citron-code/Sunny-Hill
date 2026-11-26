/* Siteyi güncellemek (oyunlar GitHub'da yayınlandıktan sonra):  node yayinla.mjs
   Sunny Hill'in GitHub'daki (origin/main) son hâlini ve Pocket Quest'in yayındaki son hâlini alır,
   siteyi derler ve Cloudflare'e (workers.dev'deki Worker'a) yükler. Kayıtlara ve hesaplara dokunmaz.
   node yayinla.mjs --tablolar   veritabanı tablolarını da yeniden kontrol eder (yeni bir sürüm isterse) */
import { DB_NAME, say, stop, wrangler, git, node, deploy, rememberOrigin, health } from './tools/cf.mjs';

say('Oyunların son hâli alınıyor');
if (!git('fetch origin main').ok) stop('GitHub\'a ulaşılamadı (git fetch).');
if (!node('build.mjs')) stop('Derleme olmadı.');
if (process.argv.includes('--tablolar') && !wrangler(`d1 execute ${DB_NAME} --remote --yes --file=schema.sql`).ok) stop('Tablolar güncellenemedi.');
say('Cloudflare\'e yükleniyor');
const d = deploy();
if (!d.ok) stop('Yükleme olmadı. Bir dakika sonra yeniden deneyin; giriş istenirse önce "node kur.mjs".');
if (!d.url) { console.log('\nYüklendi, ama sitenin adresi okunamadı (yukarıda yazıyor).\n'); process.exit(0); }
if (rememberOrigin(d.url)) console.log('Sitenin adresi değişti: shared/config.js güncellendi, GitHub\'da yayınlanmalı.');
const h = await health(d.url);
console.log(h && h.ok ? `\nSite güncel: ${d.url}\n` : `\nYüklendi; kontrol cevabı: ${JSON.stringify(h)}. Birkaç dakika sonra ${d.url}/api/health adresine bakın.\n`);
