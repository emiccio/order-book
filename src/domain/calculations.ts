import type { DeliveryStatus } from "@/domain/types";

export type OrderItemMoney = {
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  brandMarginPct: number | null;
};

export type OrderMoney = {
  deliveryStatus: DeliveryStatus;
  items: OrderItemMoney[];
  payments: { amount: number }[];
};

/**
 * Costo por unidad: si el ítem tiene costo propio cargado se usa ese; si no,
 * precio × (1 − % de ganancia de su marca); sin costo y sin marca, cero.
 */
export function itemCost(
  item: Pick<OrderItemMoney, "unitPrice" | "unitCost" | "brandMarginPct">,
): number {
  if (item.unitCost != null) return item.unitCost;
  if (item.brandMarginPct == null) return 0;
  return item.unitPrice * (1 - item.brandMarginPct / 100);
}

export type OrderCalc = {
  total: number;
  cost: number;
  profit: number;
  paid: number;
  balance: number;
};

/** Total vendido, costo de productos, ganancia, pagado y saldo de un pedido. */
export function calcOrder(order: Pick<OrderMoney, "items" | "payments">): OrderCalc {
  const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const cost = order.items.reduce((sum, item) => sum + item.quantity * itemCost(item), 0);
  const paid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);

  return { total, cost, profit: total - cost, paid, balance: total - paid };
}

/** Saldo pendiente de un pedido (total menos pagado). */
export function orderBalance(order: Pick<OrderMoney, "items" | "payments">): number {
  return calcOrder(order).balance;
}

/** Deuda de una clienta: suma el saldo de sus pedidos, sin contar los cancelados. */
export function customerDebt(orders: OrderMoney[]): number {
  return orders
    .filter((order) => order.deliveryStatus !== "cancelled")
    .reduce((sum, order) => sum + orderBalance(order), 0);
}

// ============================================================
// Resumen del ciclo
// ============================================================

export type CycleOrderSummary = {
  deliveryStatus: DeliveryStatus;
  total: number;
  cost: number;
  paid: number;
};

export type CycleCalc = {
  sold: number;
  collected: number;
  outstanding: number;
  productCost: number;
  productProfit: number;
  expenses: number;
  result: number;
};

/** Los siete números del ciclo. Los pedidos cancelados no suman a ninguno. */
export function calcCycle(
  orders: CycleOrderSummary[],
  expenses: { amount: number }[],
): CycleCalc {
  const active = orders.filter((order) => order.deliveryStatus !== "cancelled");

  const sold = active.reduce((sum, order) => sum + order.total, 0);
  const collected = active.reduce((sum, order) => sum + order.paid, 0);
  const productCost = active.reduce((sum, order) => sum + order.cost, 0);
  const productProfit = sold - productCost;
  const expensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    sold,
    collected,
    outstanding: sold - collected,
    productCost,
    productProfit,
    expenses: expensesTotal,
    result: productProfit - expensesTotal,
  };
}

export type DebtorOrder = {
  orderId: string;
  customerId: string;
  deliveryStatus: DeliveryStatus;
  balance: number;
};

export type Debtor = {
  customerId: string;
  customerName: string;
  phone: string | null;
  balance: number;
  /** Pedido con mayor saldo de esa clienta, para poder ir directo ahí. */
  orderId: string;
};

/** Quién debe, de mayor a menor. Agrupa varios pedidos de la misma clienta. */
export function debtors(
  orders: DebtorOrder[],
  customers: { id: string; name: string; phone: string | null }[],
): Debtor[] {
  const totals = new Map<string, { balance: number; orderId: string; topBalance: number }>();

  for (const order of orders) {
    if (order.deliveryStatus === "cancelled" || order.balance <= 0) continue;

    const entry = totals.get(order.customerId) ?? {
      balance: 0,
      orderId: order.orderId,
      topBalance: -1,
    };
    entry.balance += order.balance;
    if (order.balance > entry.topBalance) {
      entry.topBalance = order.balance;
      entry.orderId = order.orderId;
    }
    totals.set(order.customerId, entry);
  }

  const result: Debtor[] = [];
  for (const [customerId, entry] of totals) {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) continue;
    result.push({
      customerId,
      customerName: customer.name,
      phone: customer.phone,
      balance: entry.balance,
      orderId: entry.orderId,
    });
  }

  return result.sort((a, b) => b.balance - a.balance);
}

export type BrandSaleItem = {
  brandId: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  brandMarginPct: number | null;
};

export type BrandSaleOrder = {
  deliveryStatus: DeliveryStatus;
  items: BrandSaleItem[];
};

export type BrandSummary = {
  brandId: string | null;
  brandName: string;
  sold: number;
  payable: number;
  profit: number;
};

/** Agrupa por marca lo vendido, lo que se le debe y la ganancia. Sin marca → "Sin marca". */
export function byBrand(
  orders: BrandSaleOrder[],
  brands: { id: string; name: string }[],
): BrandSummary[] {
  const totals = new Map<string | null, { sold: number; payable: number }>();

  for (const order of orders) {
    if (order.deliveryStatus === "cancelled") continue;
    for (const item of order.items) {
      const entry = totals.get(item.brandId) ?? { sold: 0, payable: 0 };
      entry.sold += item.quantity * item.unitPrice;
      entry.payable += item.quantity * itemCost(item);
      totals.set(item.brandId, entry);
    }
  }

  const result: BrandSummary[] = [];
  for (const [brandId, entry] of totals) {
    const brandName =
      brandId == null ? "Sin marca" : (brands.find((b) => b.id === brandId)?.name ?? "Sin marca");
    result.push({
      brandId,
      brandName,
      sold: entry.sold,
      payable: entry.payable,
      profit: entry.sold - entry.payable,
    });
  }

  return result.sort((a, b) => b.sold - a.sold);
}
