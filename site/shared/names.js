/* Usernames: the child's first name and the first letter of the surname, in plain letters
   ("Çağla Şen" -> "caglas"). Typing is forgiving: "Çağla Ş", "cagla s" and "CaglaS" are all "caglas". */

export function canonUser(s) {
  return String(s || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
}

export function suggestUser(fullName) {
  const w = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '';
  const first = canonUser(w[0]);
  const last = w.length > 1 ? canonUser(w[w.length - 1]) : '';
  return (first + last.slice(0, 1)).slice(0, 18);
}
