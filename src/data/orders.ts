import type { SupabaseClient } from "@supabase/supabase-js";
import { calcOrder, type OrderItemMoney } from "@/domain/calculations";
import type { DeliveryStatus } from "@/domain/types";

export type OrderItemRow = {
  id: string;
  name: string;
  brandId: string | null;
  brandName: string | null;
  brandMarginPct: number | null;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
};

export type OrderRow = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  date: string;
  deliveryStatus: DeliveryStatus;
  notes: string | null;
  items: OrderItemRow[];
  total: number;
  cost: number;
  profit: number;
  paid: number;
  balance: number;
};

export type OrderItemInput = {
  name: string;
  brandId: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
};

type RawOrderRow = {
  id: string;
  customer_id: string;
  date: string;
  delivery_status: DeliveryStatus;
  notes: string | null;
  customers: { name: string; phone: string | null } | null;
  order_items: {
    id: string;
    name: string;
    brand_id: string | null;
    brands: { name: string; margin_pct: number } | null;
    quantity: number;
    unit_price: number;
    unit_cost: number | null;
  }[];
  payments: { amount: number }[];
};

const ORDER_SELECT = `
  id, customer_id, date, delivery_status, notes,
  customers ( name, phone ),
  order_items ( id, name, brand_id, quantity, unit_price, unit_cost, brands ( name, margin_pct ) ),
  payments ( amount )
`;

function toOrderRow(raw: RawOrderRow): OrderRow {
  const items: OrderItemRow[] = raw.order_items.map((item) => ({
    id: item.id,
    name: item.name,
    brandId: item.brand_id,
    brandName: item.brands?.name ?? null,
    brandMarginPct: item.brands?.margin_pct ?? null,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    unitCost: item.unit_cost,
  }));

  const itemsForCalc: OrderItemMoney[] = raw.order_items.map((item) => ({
    quantity: item.quantity,
    unitPrice: item.unit_price,
    unitCost: item.unit_cost,
    brandMarginPct: item.brands?.margin_pct ?? null,
  }));
  const calc = calcOrder({
    items: itemsForCalc,
    payments: raw.payments.map((payment) => ({ amount: payment.amount })),
  });

  return {
    id: raw.id,
    customerId: raw.customer_id,
    customerName: raw.customers?.name ?? "",
    customerPhone: raw.customers?.phone ?? null,
    date: raw.date,
    deliveryStatus: raw.delivery_status,
    notes: raw.notes,
    items,
    ...calc,
  };
}

/** `cycleId: null` trae los pedidos de todos los ciclos (opción "Todos" del Resumen). */
export async function listOrders(
  supabase: SupabaseClient,
  cycleId: string | null,
): Promise<OrderRow[]> {
  let query = supabase.from("orders").select(ORDER_SELECT).order("date", { ascending: false });
  if (cycleId) query = query.eq("cycle_id", cycleId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data as unknown as RawOrderRow[]).map(toOrderRow);
}

export async function getOrder(
  supabase: SupabaseClient,
  id: string,
): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return toOrderRow(data as unknown as RawOrderRow);
}

export async function createOrder(
  supabase: SupabaseClient,
  userId: string,
  cycleId: string,
  input: { customerId: string; notes: string | null; items: OrderItemInput[] },
): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      cycle_id: cycleId,
      customer_id: input.customerId,
      notes: input.notes,
    })
    .select("id")
    .single();
  if (orderError) throw new Error(orderError.message);

  await insertItems(supabase, userId, order!.id, input.items);
  return order!.id;
}

export async function updateOrder(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: { customerId: string; notes: string | null; items: OrderItemInput[] },
): Promise<void> {
  const { error: updateError } = await supabase
    .from("orders")
    .update({ customer_id: input.customerId, notes: input.notes })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);

  const { error: deleteError } = await supabase.from("order_items").delete().eq("order_id", id);
  if (deleteError) throw new Error(deleteError.message);

  await insertItems(supabase, userId, id, input.items);
}

async function insertItems(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
  items: OrderItemInput[],
): Promise<void> {
  const rows = items.map((item, index) => ({
    user_id: userId,
    order_id: orderId,
    name: item.name,
    brand_id: item.brandId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    unit_cost: item.unitCost,
    position: index,
  }));
  const { error } = await supabase.from("order_items").insert(rows);
  if (error) throw new Error(error.message);
}

/** Cambia solo el estado de entrega: no toca pagos ni ítems. */
export async function updateDeliveryStatus(
  supabase: SupabaseClient,
  id: string,
  deliveryStatus: DeliveryStatus,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ delivery_status: deliveryStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
