import type { SupabaseClient } from "@supabase/supabase-js";
import { customerDebt, type OrderMoney } from "@/domain/calculations";
import type { DeliveryStatus } from "@/domain/types";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  archived: boolean;
  debt: number;
};

type CustomerWithOrdersRow = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  archived: boolean;
  orders: {
    delivery_status: DeliveryStatus;
    order_items: { quantity: number; unit_price: number }[];
    payments: { amount: number }[];
  }[];
};

export async function listCustomers(
  supabase: SupabaseClient,
  { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<CustomerRow[]> {
  let query = supabase
    .from("customers")
    .select(
      `id, name, phone, notes, archived,
       orders ( delivery_status, order_items ( quantity, unit_price ), payments ( amount ) )`,
    )
    .order("name", { ascending: true });

  if (!includeArchived) query = query.eq("archived", false);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data as unknown as CustomerWithOrdersRow[]).map((customer) => {
    const orders: OrderMoney[] = customer.orders.map((order) => ({
      deliveryStatus: order.delivery_status,
      items: order.order_items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unit_price,
        unitCost: null,
        brandMarginPct: null,
      })),
      payments: order.payments.map((payment) => ({ amount: payment.amount })),
    }));

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes,
      archived: customer.archived,
      debt: customerDebt(orders),
    };
  });
}

export async function createCustomer(
  supabase: SupabaseClient,
  userId: string,
  input: { name: string; phone: string | null; notes: string | null },
): Promise<{ id: string; name: string }> {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      name: input.name,
      phone: input.phone,
      notes: input.notes,
    })
    .select("id, name")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string; name: string };
}

export async function updateCustomer(
  supabase: SupabaseClient,
  id: string,
  input: { name: string; phone: string | null; notes: string | null },
): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update({ name: input.name, phone: input.phone, notes: input.notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function archiveCustomer(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("customers").update({ archived: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Borra de verdad solo si no tiene pedidos. Si tiene (el FK de orders.customer_id
 * lo impide a nivel de base), archiva en su lugar: la deuda y el historial no se pierden.
 */
export async function deleteCustomer(
  supabase: SupabaseClient,
  id: string,
): Promise<{ archived: boolean }> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (!error) return { archived: false };

  if (error.code === "23503") {
    await archiveCustomer(supabase, id);
    return { archived: true };
  }
  throw new Error(error.message);
}
