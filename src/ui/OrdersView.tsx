import { formatMoney } from "@/domain/money";
import { deliveryStatusLabel } from "@/ui/labels";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";
import { List, ListRow } from "@/ui/List";
import { Avatar } from "@/ui/Avatar";
import { Chip } from "@/ui/Chip";
import type { OrderRow } from "@/data/orders";

const DELIVERY_TONE = {
  pending_receipt: "neutral",
  received: "neutral",
  pending_delivery: "neutral",
  delivered: "ok",
  cancelled: "danger",
} as const satisfies Record<OrderRow["deliveryStatus"], "neutral" | "ok" | "danger">;

export function OrdersView({ orders }: { orders: OrderRow[] }) {
  return (
    <div>
      <SectionHeader title="Pedidos">
        <span className="text-sm text-muted">{orders.length}</span>
      </SectionHeader>

      {orders.length === 0 ? (
        <EmptyState>Todavía no tenés pedidos cargados en este ciclo.</EmptyState>
      ) : (
        <div className="mt-2.5">
          <List>
            {orders.map((order) => {
              const description =
                order.items.map((item) => item.name).join(", ") || "Sin productos";
              return (
                <ListRow key={order.id} interactive>
                  <a
                    href={`/app/orders/${order.id}`}
                    className="flex items-center gap-3 px-3.5 py-3"
                  >
                    <Avatar name={order.customerName} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{order.customerName}</div>
                      <div className="truncate text-sm text-muted">{description}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="num font-semibold">{formatMoney(order.total)}</span>
                      {order.balance > 0 ? (
                        <Chip tone="warn">Debe {formatMoney(order.balance)}</Chip>
                      ) : (
                        <Chip tone="ok">Pagado</Chip>
                      )}
                      <Chip tone={DELIVERY_TONE[order.deliveryStatus]}>
                        {deliveryStatusLabel(order.deliveryStatus)}
                      </Chip>
                    </div>
                  </a>
                </ListRow>
              );
            })}
          </List>
        </div>
      )}
    </div>
  );
}
