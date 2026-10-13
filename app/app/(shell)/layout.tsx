import { createClient } from "@/data/supabase/server";
import { getProfile } from "@/data/profiles";
import { listCycles } from "@/data/cycles";
import { signOutAction } from "@/actions/auth";
import { TabBar } from "@/ui/TabBar";
import { Button } from "@/ui/Button";
import { CycleSelector } from "@/ui/CycleSelector";
import { NewOrderFab } from "@/ui/NewOrderFab";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  const [profile, cycles] = await Promise.all([
    getProfile(supabase, user.id),
    listCycles(supabase),
  ]);

  return (
    <div id="app-shell-root" className="mx-auto max-w-[560px] px-4 pb-[110px]">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b border-line bg-bg px-4 py-3.5">
        <div className="font-display font-extrabold leading-none">
          Libreta de Ventas
          <small className="mt-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
            Pedidos · cobros · ganancia
          </small>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <CycleSelector cycles={cycles} activeCycleId={profile?.active_cycle_id ?? null} />
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" size="sm" className="text-muted">
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="pt-4 pb-6">{children}</main>

      <NewOrderFab />

      <TabBar />
    </div>
  );
}
