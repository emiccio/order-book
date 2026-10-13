"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/data/supabase/server";
import { createOrder, updateDeliveryStatus, updateOrder } from "@/data/orders";
import { getProfile } from "@/data/profiles";
import { getCycle } from "@/data/cycles";
import { listCustomers, type CustomerRow } from "@/data/customers";
import { listBrands, type BrandRow } from "@/data/brands";
import { deliveryStatusSchema, orderSchema } from "@/domain/validations";
import type { ActionResult } from "@/actions/auth";

const updateOrderSchema = orderSchema.extend({
  id: z.string().trim().min(1, "Pedido inválido."),
});

/** `type: "layout"` invalida todo lo que cuelga del layout de /app, prefetch incluido. */
function revalidateApp() {
  revalidatePath("/app", "layout");
}

export async function createOrderAction(
  _prev: ActionResult,
  payload: unknown,
): Promise<ActionResult> {
  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  const profile = await getProfile(supabase, data.user.id);
  if (!profile?.active_cycle_id) {
    return { error: "Primero creá y elegí un ciclo en Ajustes." };
  }
  const cycle = await getCycle(supabase, profile.active_cycle_id);
  if (!cycle || cycle.status === "closed") {
    return { error: "El ciclo activo está cerrado. Creá o elegí uno abierto en Ajustes." };
  }

  await createOrder(supabase, data.user.id, profile.active_cycle_id, parsed.data);
  revalidateApp();
  redirect("/app/orders");
}

export async function updateOrderAction(
  _prev: ActionResult,
  payload: unknown,
): Promise<ActionResult> {
  const parsed = updateOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  await updateOrder(supabase, data.user.id, parsed.data.id, parsed.data);
  revalidateApp();
  return {};
}

export type NewOrderFormData =
  | { ok: true; customers: CustomerRow[]; brands: BrandRow[] }
  | { ok: false; error: string };

/**
 * Datos para armar el sheet de "+ Nuevo pedido" desde cualquier pestaña: el
 * FAB vive en el layout compartido, que no tiene clientas ni marcas
 * precargadas (solo perfil y ciclos), así que se piden al abrir el sheet.
 */
export async function loadNewOrderFormAction(): Promise<NewOrderFormData> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "Tenés que iniciar sesión." };

  const profile = await getProfile(supabase, data.user.id);
  if (!profile?.active_cycle_id) {
    return {
      ok: false,
      error: "Todavía no tenés un ciclo activo. Creá uno en Ajustes antes de cargar un pedido.",
    };
  }

  const [customers, brands] = await Promise.all([listCustomers(supabase), listBrands(supabase)]);
  return { ok: true, customers, brands };
}

export async function updateDeliveryStatusAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const parsed = deliveryStatusSchema.safeParse({
    deliveryStatus: formData.get("deliveryStatus"),
  });
  if (!orderId || !parsed.success) return;

  const supabase = await createClient();
  await updateDeliveryStatus(supabase, orderId, parsed.data.deliveryStatus);
  revalidateApp();
}
