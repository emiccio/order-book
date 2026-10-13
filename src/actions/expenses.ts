"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createExpense, deleteExpense } from "@/data/expenses";
import { getProfile } from "@/data/profiles";
import { getCycle } from "@/data/cycles";
import { expenseSchema } from "@/domain/validations";
import type { ActionResult } from "@/actions/auth";

/** `type: "layout"` invalida todo lo que cuelga del layout de /app, prefetch incluido. */
function revalidateApp() {
  revalidatePath("/app", "layout");
}

export async function createExpenseAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse({
    category: formData.get("category"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    date: formData.get("date"),
  });
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

  const result = await createExpense(supabase, data.user.id, profile.active_cycle_id, parsed.data);
  if (result.error) return { error: result.error };

  revalidateApp();
  return {};
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await deleteExpense(supabase, id);
  revalidateApp();
}
