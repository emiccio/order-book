import { notFound } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCycle } from "@/data/cycles";
import { listOrders } from "@/data/orders";
import { listExpenses } from "@/data/expenses";
import { calcCycle } from "@/domain/calculations";
import { formatMoney } from "@/domain/money";
import { closeCycleAction } from "@/actions/cycles";
import { SectionHeader } from "@/ui/SectionHeader";
import { Chip } from "@/ui/Chip";
import { Button } from "@/ui/Button";

export default async function CycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const cycle = await getCycle(supabase, id);
  if (!cycle) notFound();

  const [orders, expenses] = await Promise.all([
    listOrders(supabase, id),
    listExpenses(supabase, id),
  ]);
  const calc = calcCycle(orders, expenses);
  const isOpen = cycle.status === "open";

  return (
    <div>
      <SectionHeader title={cycle.name}>
        <Chip tone={isOpen ? "ok" : "neutral"}>{isOpen ? "Abierto" : "Cerrado"}</Chip>
      </SectionHeader>

      <div className="num mt-3 rounded-card border border-line bg-surface p-3.5 text-sm">
        <Row label="Vendido" value={formatMoney(calc.sold)} strong />
        <Row label="Cobrado" value={formatMoney(calc.collected)} />
        <Row label="A cobrar" value={formatMoney(calc.outstanding)} />
        <Row label="Costo de productos" value={formatMoney(calc.productCost)} />
        <Row label="Ganancia de productos" value={formatMoney(calc.productProfit)} />
        <Row label="Gastos" value={formatMoney(calc.expenses)} />
        <Row label="Resultado" value={formatMoney(calc.result)} strong />
      </div>

      <div className="mt-3 flex gap-2">
        <a href="/app/expenses" className="rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold">
          Ver gastos
        </a>
      </div>

      {isOpen && (
        <div className="mt-4 rounded-card border border-line bg-surface p-3.5">
          {calc.outstanding > 0 && (
            <p className="mb-2.5 text-sm text-warn">
              Hay {formatMoney(calc.outstanding)} sin cobrar en este ciclo. Se puede cerrar
              igual: la deuda sigue en la clienta.
            </p>
          )}
          <form action={closeCycleAction}>
            <input type="hidden" name="cycleId" value={cycle.id} />
            <Button type="submit" variant="primary" size="sm">
              Cerrar ciclo
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 ${strong ? "font-semibold" : "text-muted"}`}>
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
