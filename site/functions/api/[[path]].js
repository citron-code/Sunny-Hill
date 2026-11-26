// Cloudflare Pages runs this for every address under /api/ (the site's server is in server/api.js).
import { handle } from '../../server/api.js';

export function onRequest(context) {
  return handle(context.request, context.env);
}
