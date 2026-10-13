"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { archiveCustomer, createCustomer, updateCustomer } from "@/data/customers";
import { customerSchema } from "@/domain/validations";
import type { ActionResult } from "@/actions/auth";

export async function createCustomerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  await createCustomer(supabase, data.user.id, parsed.data);
  revalidatePath("/app/customers");
  return {};
}

export async function updateCustomerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
  if (!id) return { error: "Clienta inválida." };
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  await updateCustomer(supabase, id, parsed.data);
  revalidatePath("/app/customers");
  return {};
}

export async function archiveCustomerAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await archiveCustomer(supabase, id);
  revalidatePath("/app/customers");
}

export type CreateCustomerInlineResult =
  | { error: string; customer?: undefined }
  | { error?: undefined; customer: { id: string; name: string } };

/** Alta rápida de clienta desde la hoja de pedido, sin salir de ahí. */
export async function createCustomerInlineAction(
  name: string,
): Promise<CreateCustomerInlineResult> {
  const parsed = customerSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tenés que iniciar sesión." };

  const customer = await createCustomer(supabase, data.user.id, parsed.data);
  revalidatePath("/app/customers");
  return { customer };
}
