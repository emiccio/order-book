"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { archiveBrand, createBrand, updateBrand } from "@/data/brands";
import { brandSchema } from "@/domain/validations";
import type { ActionResult } from "@/actions/auth";

export async function createBrandAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    marginPct: formData.get("marginPct"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  await createBrand(supabase, data.user.id, parsed.data);
  revalidatePath("/app/settings");
  return {};
}

export async function updateBrandAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    marginPct: formData.get("marginPct"),
  });
  if (!id) return { error: "Marca inválida." };
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  await updateBrand(supabase, id, parsed.data);
  revalidatePath("/app/settings");
  return {};
}

export async function archiveBrandAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await archiveBrand(supabase, id);
  revalidatePath("/app/settings");
}
