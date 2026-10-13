const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalize(value: string): string {
  return value.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase();
}

/** Compara sin distinguir mayúsculas ni acentos (busco "Jose" y encuentro "José"). */
export function matchesSearch(text: string, query: string): boolean {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) return true;
  return normalize(text).includes(normalizedQuery);
}
