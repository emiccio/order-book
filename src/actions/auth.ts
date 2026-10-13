"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/domain/validations";

export type ActionResult = { error: string } | { error?: undefined };

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Mail o contraseña incorrectos.";
  }
  if (message.includes("User already registered")) {
    return "Ya existe una cuenta con ese mail.";
  }
  return "Algo salió mal. Probá de nuevo.";
}

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${await baseUrl()}/auth/confirm?next=/app`,
    },
  });
  if (error) return { error: translateAuthError(error.message) };

  redirect("/app");
}

export async function signInAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: translateAuthError(error.message) };

  redirect("/app");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/app/login");
}

export type RequestResetResult = { error: string; sent?: undefined } | { error?: undefined; sent: boolean };

export async function requestPasswordResetAction(
  _prev: RequestResetResult,
  formData: FormData,
): Promise<RequestResetResult> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await baseUrl()}/auth/confirm?next=/app/login/reset`,
  });
  // No confirmamos ni negamos si el mail existe: evita filtrar qué mails
  // están registrados.
  return { sent: true };
}

export async function updatePasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: translateAuthError(error.message) };

  redirect("/app");
}
