import { createClient } from "@/data/supabase/server";
import { getProfile } from "@/data/profiles";
import { listCustomers } from "@/data/customers";
import { listBrands } from "@/data/brands";
import { OrderForm } from "@/ui/OrderForm";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";

export default async function NewOrderPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  const profile = await getProfile(supabase, user.id);
  if (!profile?.active_cycle_id) {
    return (
      <div>
        <SectionHeader title="Nuevo pedido" />
        <EmptyState>
          Todavía no tenés un ciclo activo. Creá uno en Ajustes antes de cargar un pedido.
        </EmptyState>
      </div>
    );
  }

  const [customers, brands] = await Promise.all([listCustomers(supabase), listBrands(supabase)]);

  return (
    <div>
      <h2 className="mb-3 font-display text-[19px] font-bold">Nuevo pedido</h2>
      <OrderForm mode="create" customers={customers} brands={brands} />
    </div>
  );
}
