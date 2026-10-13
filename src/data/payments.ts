import type { SupabaseClient } from "@supabase/supabase-js";
import { formatMoney } from "@/domain/money";
import { getOrder } from "@/data/orders";

export type PaymentRow = {
  id: string;
  date: string;
  amount: number;
};

export async function listPayments(
  supabase: SupabaseClient,
  orderId: string,
): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("id, date, amount")
    .eq("order_id", orderId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data as PaymentRow[];
}

export type CreatePaymentResult = { error?: string };

/**
 * Rechaza un pago mayor al saldo. El chequeo acá cubre el caso normal (y da
 * el saldo en el mensaje); el trigger `payments_balance_check` en la base
 * es la red de seguridad para dos pagos casi simultáneos del mismo pedido.
 */
export async function createPayment(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
  input: { amount: number; date: string },
): Promise<CreatePaymentResult> {
  const order = await getOrder(supabase, orderId);
  if (!order) return { error: "No se encontró el pedido." };
  if (input.amount > order.balance) {
    return {
      error: `El pago no puede superar el saldo pendiente: ${formatMoney(order.balance)}.`,
    };
  }

  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    order_id: orderId,
    amount: input.amount,
    date: input.date,
  });
  if (error) {
    if (error.code === "P0001") {
      return { error: "El pago supera el saldo pendiente del pedido." };
    }
    throw new Error(error.message);
  }
  return {};
}

export async function deletePayment(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
