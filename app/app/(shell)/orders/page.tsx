import { createClient } from "@/data/supabase/server";
import { getProfile } from "@/data/profiles";
import { listCycles } from "@/data/cycles";
import { listOrders } from "@/data/orders";
import { OrdersView } from "@/ui/OrdersView";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const { cycle: cycleParam } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  const [cycles, profile] = await Promise.all([listCycles(supabase), getProfile(supabase, user.id)]);

  if (cycles.length === 0) {
    return (
      <div>
        <SectionHeader title="Pedidos" />
        <EmptyState>
          Todavía no tenés un ciclo activo. Creá uno en Ajustes para empezar a cargar pedidos.
        </EmptyState>
      </div>
    );
  }

  // Mismo criterio que Resumen: "?cycle=all" trae todos, un id puntual
  // filtra por ese ciclo, y sin parámetro se asume el ciclo activo. Así el
  // dropdown del header sirve igual en las dos pantallas.
  let selectedCycleId: string | null;
  if (cycleParam === "all") selectedCycleId = null;
  else if (cycleParam) selectedCycleId = cycleParam;
  else selectedCycleId = profile?.active_cycle_id ?? null;

  const orders = await listOrders(supabase, selectedCycleId);
  return <OrdersView orders={orders} />;
}
