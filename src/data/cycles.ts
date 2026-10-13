import type { SupabaseClient } from "@supabase/supabase-js";

export type CycleRow = {
  id: string;
  name: string;
  status: "open" | "closed";
  closed_at: string | null;
};

export async function listCycles(supabase: SupabaseClient): Promise<CycleRow[]> {
  const { data, error } = await supabase
    .from("cycles")
    .select("id, name, status, closed_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as CycleRow[];
}

export async function getCycle(supabase: SupabaseClient, id: string): Promise<CycleRow | null> {
  const { data, error } = await supabase
    .from("cycles")
    .select("id, name, status, closed_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as CycleRow | null;
}

export async function createCycle(
  supabase: SupabaseClient,
  userId: string,
  input: { name: string },
): Promise<CycleRow> {
  const { data, error } = await supabase
    .from("cycles")
    .insert({ user_id: userId, name: input.name })
    .select("id, name, status, closed_at")
    .single();
  if (error) throw new Error(error.message);
  return data as CycleRow;
}

export async function setActiveCycle(
  supabase: SupabaseClient,
  userId: string,
  cycleId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ active_cycle_id: cycleId })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function closeCycle(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from("cycles")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
