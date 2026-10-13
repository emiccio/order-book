import { notFound } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getOrder } from "@/data/orders";
import { listCustomers } from "@/data/customers";
import { listBrands } from "@/data/brands";
import { listPayments } from "@/data/payments";
import { orderMessage, whatsappUrl } from "@/domain/whatsapp";
import { OrderForm } from "@/ui/OrderForm";
import { DeliveryStatusPicker } from "@/ui/DeliveryStatusPicker";
import { PaymentsPanel } from "@/ui/PaymentsPanel";
import { buttonClasses } from "@/ui/Button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [order, customers, brands, payments] = await Promise.all([
    getOrder(supabase, id),
    listCustomers(supabase),
    listBrands(supabase),
    listPayments(supabase, id),
  ]);

  if (!order) notFound();

  const waLink = whatsappUrl(
    order.customerPhone,
    orderMessage({
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      paid: order.paid,
      balance: order.balance,
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[19px] font-bold">Pedido de {order.customerName}</h2>
        <DeliveryStatusPicker orderId={order.id} current={order.deliveryStatus} />
      </div>

      <a href={waLink} target="_blank" rel="noopener noreferrer" className={buttonClasses("wa", "sm")}>
        Compartir por WhatsApp
      </a>

      <PaymentsPanel
        orderId={order.id}
        total={order.total}
        paid={order.paid}
        balance={order.balance}
        payments={payments}
      />

      <OrderForm mode="edit" order={order} customers={customers} brands={brands} />
    </div>
  );
}
