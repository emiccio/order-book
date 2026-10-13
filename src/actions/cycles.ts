"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { closeCycle, createCycle, setActiveCycle } from "@/data/cycles";
import { cycleSchema } from "@/domain/validations";
import type { ActionResult } from "@/actions/auth";

/**
 * Todas las pantallas autenticadas comparten el layout de `/app`: el header
 * muestra el ciclo activo y el FAB "+ Nuevo pedido" ya puede tener
 * prefetcheada /app/orders/new. Invalidar solo /app/settings deja esas
 * otras páginas con el estado viejo en caché (sin ciclo activo) hasta la
 * próxima recarga dura. `type: "layout"` invalida todo lo que cuelga de
 * ese layout de una sola vez.
 */
function revalidateApp() {
  revalidatePath("/app", "layout");
}

export async function createCycleAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = cycleSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  const cycle = await createCycle(supabase, data.user.id, parsed.data);
  await setActiveCycle(supabase, data.user.id, cycle.id);
  revalidateApp();
  return {};
}

export async function setActiveCycleAction(formData: FormData): Promise<void> {
  const cycleId = String(formData.get("cycleId") ?? "");
  if (!cycleId) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await setActiveCycle(supabase, data.user.id, cycleId);
  revalidateApp();
}

export async function closeCycleAction(formData: FormData): Promise<void> {
  const cycleId = String(formData.get("cycleId") ?? "");
  if (!cycleId) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await closeCycle(supabase, cycleId);
  revalidateApp();
}
