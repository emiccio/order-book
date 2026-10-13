import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  name: string | null;
  active_cycle_id: string | null;
};

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, active_cycle_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
}
