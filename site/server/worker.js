// The site on Cloudflare Workers. The pages and the games are static files from dist/ ([assets] in wrangler.toml);
// everything under /api/ comes here and goes to the site's server (server/api.js).
import { handle } from './api.js';

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) return handle(request, env);
    return env.ASSETS.fetch(request);
  },
};
