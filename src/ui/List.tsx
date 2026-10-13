export function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="overflow-hidden rounded-card border border-line bg-surface">{children}</ul>
  );
}

/**
 * Fila de lista. `interactive` agrega hover/active (toda la lista es
 * clickeable por completo, como las filas del prototipo), para que algo
 * responda al toque — el prototipo tenía `.row:hover` pero la app no tenía
 * ningún estado de interacción.
 */
export function ListRow({
  interactive,
  className = "",
  children,
}: {
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`border-t border-line first:border-t-0 ${
        interactive ? "hover:bg-sunk active:bg-sunk" : ""
      } ${className}`}
    >
      {children}
    </li>
  );
}
