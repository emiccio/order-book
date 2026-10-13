import { formatMoney } from "@/domain/money";
import { reminderMessage, whatsappUrl } from "@/domain/whatsapp";
import type { CycleCalc, Debtor, BrandSummary } from "@/domain/calculations";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";
import { List, ListRow } from "@/ui/List";
import { Avatar } from "@/ui/Avatar";
import { Tile } from "@/ui/Tile";
import { buttonClasses } from "@/ui/Button";

export function ResumenView({
  cycleCalc,
  totalPayable,
  orderCount,
  pendingDeliveryCount,
  pendingDeliveryOrders,
  topDebtors,
  brandSummary,
  cycles,
}: {
  cycleCalc: CycleCalc;
  totalPayable: number;
  orderCount: number;
  pendingDeliveryCount: number;
  pendingDeliveryOrders: { id: string; customerName: string; total: number }[];
  topDebtors: Debtor[];
  brandSummary: BrandSummary[];
  cycles: { id: string; name: string }[];
}) {
  if (cycles.length === 0) {
    return (
      <div>
        <h2 className="mb-3 font-display text-[19px] font-bold">Resumen</h2>
        <EmptyState>
          Todavía no tenés un ciclo. Creá uno en Ajustes para empezar a cargar pedidos.
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Resumen" />

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Tile label="Vendido" value={formatMoney(cycleCalc.sold)} />
        <Tile label="Cobrado" value={formatMoney(cycleCalc.collected)} />
        <Tile label="A cobrar" value={formatMoney(cycleCalc.outstanding)} />
        <Tile label="Ganancia de productos" value={formatMoney(cycleCalc.productProfit)} highlight />
      </div>

      {orderCount > 0 && (
        <p className="mt-2.5 px-0.5 text-sm text-muted">
          {orderCount} pedido{orderCount === 1 ? "" : "s"} · {pendingDeliveryCount} sin entregar
        </p>
      )}

      <div className="num mt-3 rounded-card border border-line bg-surface p-3.5 text-sm">
        <SumboxRow label="A pagar a marcas" value={formatMoney(totalPayable)} />
        <SumboxRow label="Gastos" value={formatMoney(cycleCalc.expenses)} />
        <SumboxRow label="Resultado" value={formatMoney(cycleCalc.result)} strong />
      </div>

      <Section title="Pendientes de entregar">
        {pendingDeliveryOrders.length === 0 ? (
          <p className="text-sm text-muted">No tenés pedidos pendientes de entregar.</p>
        ) : (
          <List>
            {pendingDeliveryOrders.map((order) => (
              <ListRow key={order.id} interactive>
                <a
                  href={`/app/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-3"
                >
                  <span className="font-medium">{order.customerName}</span>
                  <span className="num font-semibold">{formatMoney(order.total)}</span>
                </a>
              </ListRow>
            ))}
          </List>
        )}
      </Section>

      <Section title="Principales deudoras">
        {topDebtors.length === 0 ? (
          <p className="text-sm text-muted">Nadie te debe en este ciclo.</p>
        ) : (
          <List>
            {topDebtors.map((debtor) => (
              <ListRow key={debtor.customerId}>
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <Avatar name={debtor.customerName} />
                  <a href={`/app/orders/${debtor.orderId}`} className="min-w-0 flex-1">
                    <div className="font-medium">{debtor.customerName}</div>
                    <div className="num font-semibold text-warn">
                      Debe {formatMoney(debtor.balance)}
                    </div>
                  </a>
                  <a
                    href={whatsappUrl(debtor.phone, reminderMessage(debtor.customerName, debtor.balance))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`shrink-0 ${buttonClasses("wa", "sm")}`}
                  >
                    Recordar
                  </a>
                </div>
              </ListRow>
            ))}
          </List>
        )}
      </Section>

      <Section title="Por marca">
        {brandSummary.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay ventas para agrupar.</p>
        ) : (
          <>
            <div className="num overflow-x-auto rounded-card border border-line bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-3.5 py-2">Marca</th>
                    <th className="px-3.5 py-2 text-right">Vendido</th>
                    <th className="px-3.5 py-2 text-right">A pagarle</th>
                    <th className="px-3.5 py-2 text-right">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {brandSummary.map((brand) => (
                    <tr key={brand.brandId ?? "sin-marca"} className="border-t border-line">
                      <td className="px-3.5 py-2 text-left font-medium">{brand.brandName}</td>
                      <td className="px-3.5 py-2 text-right">{formatMoney(brand.sold)}</td>
                      <td className="px-3.5 py-2 text-right">{formatMoney(brand.payable)}</td>
                      <td className="px-3.5 py-2 text-right">{formatMoney(brand.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 px-0.5 text-sm text-muted">
              &quot;A pagarle&quot; es lo que le pagás a la marca, o tu costo de los productos.
            </p>
          </>
        )}
      </Section>
    </div>
  );
}

function SumboxRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-0.5 ${strong ? "font-bold text-[16px]" : "text-muted"}`}>
      <span>{label}</span>
      <span className={strong ? "text-ink" : ""}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 font-display text-[19px] font-bold">{title}</h2>
      {children}
    </div>
  );
}
