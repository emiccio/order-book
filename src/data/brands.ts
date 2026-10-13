import type { SupabaseClient } from "@supabase/supabase-js";

export type BrandRow = {
  id: string;
  name: string;
  margin_pct: number;
  archived: boolean;
};

export async function listBrands(
  supabase: SupabaseClient,
  { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<BrandRow[]> {
  let query = supabase
    .from("brands")
    .select("id, name, margin_pct, archived")
    .order("created_at", { ascending: true });

  if (!includeArchived) query = query.eq("archived", false);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as BrandRow[];
}

export async function createBrand(
  supabase: SupabaseClient,
  userId: string,
  input: { name: string; marginPct: number },
): Promise<void> {
  const { error } = await supabase
    .from("brands")
    .insert({ user_id: userId, name: input.name, margin_pct: input.marginPct });
  if (error) throw new Error(error.message);
}

export async function updateBrand(
  supabase: SupabaseClient,
  id: string,
  input: { name: string; marginPct: number },
): Promise<void> {
  const { error } = await supabase
    .from("brands")
    .update({ name: input.name, margin_pct: input.marginPct })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function archiveBrand(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("brands").update({ archived: true }).eq("id", id);
  if (error) throw new Error(error.message);
}
