import { createClient } from "@/data/supabase/server";
import { listCustomers } from "@/data/customers";
import { CustomersView } from "@/ui/CustomersView";

export default async function CustomersPage() {
  const supabase = await createClient();
  const customers = await listCustomers(supabase);

  return <CustomersView customers={customers} />;
}
