# The games site (technical notes)

Turkish guides for the teacher: [KURULUM.md](KURULUM.md) (setup and updates), [VELI-REHBERI.md](VELI-REHBERI.md) (parents).

One Cloudflare Pages project: static pages, a Pages Function for `/api/*`, and a D1 (SQLite) database.
The games are copied in as they are published, with one script tag added; their files are never edited.

| Path | What |
| --- | --- |
| `shared/games.js` | The game list: ids, the browser-storage keys that make up each save (`keys` or `prefix`), the summary line. Used by the pages, the bridge, the server and `../tasi.html`. |
| `shared/config.js` | The site's name (`name`, `short`: `build.mjs` puts them into every page and the home-screen app as `{{AD}}`, `{{KISA}}`), its addresses (`siteOrigins`: where `tasi.html` may send old saves) and the old address. |
| `tools/make-pixels.mjs` | The pixel art, drawn as text: the mascot (a little orange), the icon tile `img/logo.svg`, the scenery in `img/px/` and the icons in `img/i/`. Then `node tools/make-icons.mjs` draws the PNG icons from the logo. |
| `shared/names.js` | Usernames: first name + first letter of the surname, plain letters (`Çağla Şen` → `caglas`). |
| `server/api.js` | Everything under `/api/`: logins (PIN as HMAC with the `PEPPER` secret, locks after 5/10/15 wrong tries), saves with versions (409 when another device moved on; `force` wins and backs up the other copy), hourly backups (last 12), the old-save move (one-time code, CORS from the old address only), the teacher's tools. |
| `functions/api/[[path]].js` | The Pages Function entry; it calls `server/api.js`. |
| `src/oyun-sitesi.js` | The bridge. In a game page it wraps `Storage.prototype.setItem/removeItem/clear`, marks the game's keys that changed, sends them 4 s after a change (at most every 40 s) and at once when the page is hidden; offline changes wait in `oyunSitesi.meta.<game>`. On the pages it is the `window.OyunSitesi` helpers. `build.mjs` prepends the game list and writes `dist/js/oyun-sitesi.js`. |
| `public/` | The pages: `index.html` (login with a PIN pad, the games), `oyna.html` (opening a game: device vs cloud, stash for another child on a shared tablet, the old-save question), `ogretmen.html` (the teacher), `gizlilik.html`, `sw.js` (network first, a kept copy offline). |
| `../tasi.html` | Lives on the old address (GitHub Pages, same origin as both games' old saves): reads one game's keys and posts them to `/api/move/finish` with the code, then goes back. |
| `build.mjs` | `dist/`: Sunny Hill from `origin/main`, Pocket Quest from its web address (`--local`: the files on this computer). Refuses to build when a game's save keys are not where `games.js` expects them. |
| `kur.mjs`, `yayinla.mjs`, `tools/cf.mjs` | First setup and updates through `npx wrangler@4` (login, D1, project, secrets, deploy, health check). |
| `tools/dev.mjs`, `tools/d1-node.mjs` | The site on this computer (port 8787; the old address on 8788) with the same `server/api.js` on Node's SQLite. |
| `tools/test-api.mjs`, `tools/test-browser.mjs` | The tests: `node build.mjs --local`, then `node tools/test-api.mjs` (a second) and `node tools/test-browser.mjs` (headless Chrome, two devices, about 3–5 minutes; `GL=gpu` is faster). |

Adding a game: add it to `shared/games.js` (its save keys), to `SOURCES` in `build.mjs` (where it comes from, strings it must contain), and a cover in `public/img/`.

A game that renames its save key would lose the cloud copy's link to it: keep the keys in `games.js` in step (the build stops when they are missing).
