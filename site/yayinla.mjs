/* Siteyi güncellemek (oyunlar GitHub'da yayınlandıktan sonra):  node yayinla.mjs
   Sunny Hill'in GitHub'daki (origin/main) son hâlini ve Pocket Quest'in yayındaki son hâlini alır,
   siteyi derler ve Cloudflare'e yükler. Kayıtlara ve hesaplara dokunmaz.
   node yayinla.mjs --tablolar   veritabanı tablolarını da yeniden kontrol eder (yeni bir sürüm isterse) */
import { DB_NAME, say, stop, wrangler, git, node, project, domainOf, health } from './tools/cf.mjs';

const NAME = project();
say('Oyunların son hâli alınıyor');
if (!git('fetch origin main').ok) stop('GitHub\'a ulaşılamadı (git fetch).');
if (!node('build.mjs')) stop('Derleme olmadı.');
if (process.argv.includes('--tablolar') && !wrangler(`d1 execute ${DB_NAME} --remote --file=schema.sql`).ok) stop('Tablolar güncellenemedi.');
say('Cloudflare\'e yükleniyor');
if (!wrangler(`pages deploy dist --project-name ${NAME} --branch main --commit-dirty=true`).ok) stop('Yükleme olmadı. Gerekirse önce "node kur.mjs".');
const origin = 'https://' + (domainOf(NAME) || NAME + '.pages.dev');
const h = await health(origin);
console.log(h && h.ok ? `\nSite güncel: ${origin}\n` : `\nYüklendi; kontrol cevabı: ${JSON.stringify(h)}. Birkaç dakika sonra ${origin} adresine bakın.\n`);
