// Small helpers for the site's pages.
export const $ = (id) => document.getElementById(id);

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function ago(t, lang) {          // 'en' on the children's pages (English); Turkish on the teacher's
  if (!t) return '';
  const d = Date.now() - t, m = 60000, h = 60 * m, day = 24 * h;
  if (lang === 'en') {
    if (d < 2 * m) return 'just now';
    if (d < h) return Math.round(d / m) + ' min ago';
    if (d < day) { const n = Math.round(d / h); return n + (n === 1 ? ' hour ago' : ' hours ago'); }
    if (d < 2 * day) return 'yesterday';
    if (d < 7 * day) return Math.floor(d / day) + ' days ago';
    return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
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
