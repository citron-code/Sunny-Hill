/* The site's name and addresses, in one place.
   name / short: build.mjs puts them into every page and the home-screen app; the pages also read them from here.
   siteOrigins: kur.mjs writes the real address here after the first setup (and it has to be published,
   because tasi.html on the old address reads this file). */

export const CONFIG = {
  name: 'Citrobit',                       // the site's name
  short: 'Citrobit',                      // under the icon on a phone's home screen (12 letters or so)
  mark: ['Citro', 'bit'],                  // the name in the logo: the second part is orange
  by: 'Batuhan Teacher',
  siteOrigins: ['https://citrobit.pages.dev'],  // where the site lives
  oldSite: 'https://citron-code.github.io',           // where the games were before: their old saves are there
  moveUrl: 'https://citron-code.github.io/Sunny-Hill/tasi.html',
  // only for the tests on this computer (tools/dev.mjs)
  testSite: 'http://localhost:8787',
  testOldSite: 'http://127.0.0.1:8788',
  testMoveUrl: 'http://127.0.0.1:8788/tasi.html',
};
