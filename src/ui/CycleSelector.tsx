"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ALL = "all";

// El picker de ciclo solo tiene sentido en las pantallas que listan datos
// por ciclo (como en el prototipo: resumen y pedidos). En Clientas y
// Ajustes no filtra nada, así que no se muestra.
const PICKER_PATHS = new Set(["/app", "/app/orders"]);

export function CycleSelector({
  cycles,
  activeCycleId,
}: {
  cycles: { id: string; name: string }[];
  activeCycleId: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (cycles.length === 0 || !PICKER_PATHS.has(pathname)) return null;

  const param = searchParams.get("cycle");
  const selected = param === ALL ? ALL : (param ?? activeCycleId ?? ALL);

  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pl-3 pr-2">
      <span className="text-[11px] uppercase tracking-[0.06em] text-muted">Ciclo</span>
      <select
        aria-label="Ciclo"
        value={selected}
        onChange={(event) => {
          // Siempre con ?cycle= explícito: sin parámetro, la página asume el
          // ciclo activo, no "todos". Preserva la ruta actual para que el
          // mismo dropdown del header sirva en Resumen y en Pedidos.
          router.push(`${pathname}?cycle=${event.target.value}`);
        }}
        className="min-w-0 max-w-[150px] bg-transparent text-sm font-semibold"
      >
        <option value={ALL}>Todos los ciclos</option>
        {cycles.map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.name}
          </option>
        ))}
      </select>
    </div>
  );
}
