"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createPayment, deletePayment } from "@/data/payments";
import { getOrder } from "@/data/orders";
import { paymentSchema } from "@/domain/validations";
import type { ActionResult } from "@/actions/auth";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** `type: "layout"` invalida todo lo que cuelga del layout de /app, prefetch incluido. */
function revalidateApp() {
  revalidatePath("/app", "layout");
}

export async function createPaymentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const orderId = String(formData.get("orderId") ?? "");
  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    date: formData.get("date"),
  });
  if (!orderId) return { error: "Pedido inválido." };
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  const result = await createPayment(supabase, data.user.id, orderId, parsed.data);
  if (result.error) return { error: result.error };

  revalidateApp();
  return {};
}

export async function deletePaymentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  if (!id || !orderId) return;

  const supabase = await createClient();
  await deletePayment(supabase, id);
  revalidateApp();
}

export async function markPaidAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const order = await getOrder(supabase, orderId);
  if (!order || order.balance <= 0) return;

  await createPayment(supabase, data.user.id, orderId, { amount: order.balance, date: today() });
  revalidateApp();
}
