import { createClient } from "@/data/supabase/server";
import { getProfile } from "@/data/profiles";
import { listCycles } from "@/data/cycles";
import { listOrders } from "@/data/orders";
import { listCustomers } from "@/data/customers";
import { listBrands } from "@/data/brands";
import { listExpenses } from "@/data/expenses";
import { byBrand, calcCycle, debtors } from "@/domain/calculations";
import { ResumenView } from "@/ui/ResumenView";

const TOP_DEBTORS = 5;

export default async function ResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const { cycle: cycleParam } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  const [cycles, profile] = await Promise.all([listCycles(supabase), getProfile(supabase, user.id)]);

  let selectedCycleId: string | null;
  if (cycleParam === "all") selectedCycleId = null;
  else if (cycleParam) selectedCycleId = cycleParam;
  else selectedCycleId = profile?.active_cycle_id ?? null;

  if (cycles.length === 0) {
    return (
      <ResumenView
        cycleCalc={{ sold: 0, collected: 0, outstanding: 0, productCost: 0, productProfit: 0, expenses: 0, result: 0 }}
        totalPayable={0}
        orderCount={0}
        pendingDeliveryCount={0}
        pendingDeliveryOrders={[]}
        topDebtors={[]}
        brandSummary={[]}
        cycles={[]}
      />
    );
  }

  const [orders, customers, brands, expenses] = await Promise.all([
    listOrders(supabase, selectedCycleId),
    listCustomers(supabase),
    listBrands(supabase),
    listExpenses(supabase, selectedCycleId),
  ]);

  const cycleCalc = calcCycle(orders, expenses);
  const brandSummary = byBrand(orders, brands);
  const totalPayable = brandSummary
    .filter((brand) => brand.brandId !== null)
    .reduce((sum, brand) => sum + brand.payable, 0);

  const topDebtors = debtors(
    orders.map((order) => ({
      orderId: order.id,
      customerId: order.customerId,
      deliveryStatus: order.deliveryStatus,
      balance: order.balance,
    })),
    customers,
  ).slice(0, TOP_DEBTORS);

  const pendingDeliveryOrders = orders
    .filter((order) => order.deliveryStatus === "pending_delivery")
    .map((order) => ({ id: order.id, customerName: order.customerName, total: order.total }));

  const pendingDeliveryCount = orders.filter(
    (order) => order.deliveryStatus !== "delivered" && order.deliveryStatus !== "cancelled",
  ).length;

  return (
    <ResumenView
      cycleCalc={cycleCalc}
      totalPayable={totalPayable}
      orderCount={orders.length}
      pendingDeliveryCount={pendingDeliveryCount}
      pendingDeliveryOrders={pendingDeliveryOrders}
      topDebtors={topDebtors}
      brandSummary={brandSummary}
      cycles={cycles}
    />
  );
}
