import { createClient } from "@/data/supabase/server";
import { getProfile } from "@/data/profiles";
import { getCycle } from "@/data/cycles";
import { listExpenses } from "@/data/expenses";
import { ExpensesView } from "@/ui/ExpensesView";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  const profile = await getProfile(supabase, user.id);
  if (!profile?.active_cycle_id) {
    return (
      <div>
        <SectionHeader title="Gastos" />
        <EmptyState>
          Todavía no tenés un ciclo activo. Creá uno en Ajustes para empezar a cargar gastos.
        </EmptyState>
      </div>
    );
  }

  const cycle = await getCycle(supabase, profile.active_cycle_id);
  const expenses = await listExpenses(supabase, profile.active_cycle_id);

  return (
    <ExpensesView
      cycleId={profile.active_cycle_id}
      cycleName={cycle?.name ?? ""}
      expenses={expenses}
    />
  );
}
