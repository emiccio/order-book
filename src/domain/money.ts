const formatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Redondea y formatea pesos argentinos sin decimales, p. ej. `$ 12.500`. */
export function formatMoney(amount: number | null | undefined): string {
  const safe = amount == null || Number.isNaN(amount) ? 0 : amount;
  return `$ ${formatter.format(Math.round(safe))}`;
}
