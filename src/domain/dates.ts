/** Convierte una fecha ISO ("2026-10-09") al formato corto `dd/mm` para listas. */
export function formatShortDate(iso: string): string {
  if (!iso) return "";
  const [, month, day] = iso.split("-");
  if (!month || !day) return iso;
  return `${day}/${month}`;
}
