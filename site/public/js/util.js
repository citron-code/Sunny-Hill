// Small helpers for the site's pages.
export const $ = (id) => document.getElementById(id);

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function ago(t) {
  if (!t) return '';
  const d = Date.now() - t, m = 60000, h = 60 * m, day = 24 * h;
  if (d < 2 * m) return 'az önce';
  if (d < h) return Math.round(d / m) + ' dk önce';
  if (d < day) return Math.round(d / h) + ' saat önce';
  if (d < 2 * day) return 'dün';
  if (d < 7 * day) return Math.floor(d / day) + ' gün önce';
  return new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function registerSW() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
}
