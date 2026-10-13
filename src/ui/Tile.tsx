const SIZE_CLASSES = {
  // El tamaño de la app (design-system.md: número de tarjeta 23px 700).
  md: { pad: "p-3.5", value: "text-[23px]" },
  // Para contextos angostos como el mockup del celular en la landing: el
  // mismo componente, pero el monto no entra en 23px sin partirse en dos
  // líneas cuando la tarjeta mide ~120px de ancho.
  sm: { pad: "p-2.5", value: "text-[17px]" },
} as const;

export function Tile({
  label,
  value,
  highlight,
  size = "md",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const { pad, value: valueSize } = SIZE_CLASSES[size];
  return (
    <div
      className={`rounded-card border ${pad} ${
        highlight
          ? "border-accent-solid bg-accent-solid text-accent-ink"
          : "border-line bg-surface"
      }`}
    >
      <div
        className={`text-xs uppercase tracking-[0.06em] ${highlight ? "opacity-85" : "text-muted"}`}
      >
        {label}
      </div>
      <div className={`num mt-0.5 whitespace-nowrap font-display font-bold ${valueSize}`}>
        {value}
      </div>
    </div>
  );
}
