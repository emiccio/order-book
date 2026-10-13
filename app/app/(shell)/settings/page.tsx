import { createClient } from "@/data/supabase/server";
import { listBrands } from "@/data/brands";
import { listCycles } from "@/data/cycles";
import { getProfile } from "@/data/profiles";
import { SettingsView } from "@/ui/SettingsView";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  const [brands, cycles, profile] = await Promise.all([
    listBrands(supabase),
    listCycles(supabase),
    getProfile(supabase, user.id),
  ]);

  return (
    <SettingsView
      brands={brands}
      cycles={cycles}
      activeCycleId={profile?.active_cycle_id ?? null}
    />
  );
}
