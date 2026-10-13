import { describe, expect, it } from "vitest";
import {
  byBrand,
  calcCycle,
  calcOrder,
  customerDebt,
  debtors,
  itemCost,
  orderBalance,
  type BrandSaleOrder,
  type CycleOrderSummary,
  type DebtorOrder,
  type OrderItemMoney,
  type OrderMoney,
} from "./calculations";

function item(overrides: Partial<OrderItemMoney> = {}): OrderItemMoney {
  return { quantity: 1, unitPrice: 1000, unitCost: null, brandMarginPct: null, ...overrides };
}

function order(overrides: Partial<OrderMoney> = {}): OrderMoney {
  return { deliveryStatus: "pending_delivery", items: [], payments: [], ...overrides };
}

describe("itemCost", () => {
  it("con costo propio cargado, usa ese costo", () => {
    expect(itemCost(item({ unitPrice: 1000, unitCost: 400, brandMarginPct: 30 }))).toBe(400);
  });

  it("sin costo propio, usa el % de ganancia de la marca", () => {
    // precio 1000, ganancia 30% -> costo 700
    expect(itemCost(item({ unitPrice: 1000, unitCost: null, brandMarginPct: 30 }))).toBe(700);
  });

  it("sin costo propio y sin marca, el costo es cero", () => {
    expect(itemCost(item({ unitPrice: 1000, unitCost: null, brandMarginPct: null }))).toBe(0);
  });

  it("costo propio en cero es válido y se respeta (no cae al % de marca)", () => {
    expect(itemCost(item({ unitPrice: 1000, unitCost: 0, brandMarginPct: 50 }))).toBe(0);
  });
});

describe("calcOrder", () => {
  it("total, costo y ganancia con varios ítems, cantidades > 1 y marcas distintas", () => {
    const o = order({
      items: [
        // 2 x $5000, marca 30% -> costo unitario 3500, costo 7000
        item({ quantity: 2, unitPrice: 5000, unitCost: null, brandMarginPct: 30 }),
        // 1 x $3000, costo propio 1000
        item({ quantity: 1, unitPrice: 3000, unitCost: 1000, brandMarginPct: null }),
        // 3 x $1000, sin marca y sin costo -> costo 0
        item({ quantity: 3, unitPrice: 1000, unitCost: null, brandMarginPct: null }),
      ],
    });

    const result = calcOrder(o);
    expect(result.total).toBe(2 * 5000 + 3000 + 3 * 1000); // 16000
    expect(result.cost).toBe(2 * 3500 + 1000 + 0); // 8000
    expect(result.profit).toBe(16000 - 8000);
  });

  it("paid y balance con pagos parciales", () => {
    const o = order({
      items: [item({ quantity: 1, unitPrice: 10000 })],
      payments: [{ amount: 4000 }, { amount: 1000 }],
    });
    const result = calcOrder(o);
    expect(result.paid).toBe(5000);
    expect(result.balance).toBe(5000);
  });

  it("sin ítems ni pagos, todo da cero", () => {
    expect(calcOrder(order())).toEqual({ total: 0, cost: 0, profit: 0, paid: 0, balance: 0 });
  });
});

describe("orderBalance", () => {
  it("balance sin pagos es el total", () => {
    const o = order({ items: [item({ quantity: 1, unitPrice: 1000 })] });
    expect(orderBalance(o)).toBe(1000);
  });

  it("balance con un pago parcial", () => {
    const o = order({
      items: [item({ quantity: 1, unitPrice: 1000 })],
      payments: [{ amount: 400 }],
    });
    expect(orderBalance(o)).toBe(600);
  });

  it("balance con varios pagos, exactamente el saldo da cero", () => {
    const o = order({
      items: [item({ quantity: 1, unitPrice: 1000 })],
      payments: [{ amount: 400 }, { amount: 600 }],
    });
    expect(orderBalance(o)).toBe(0);
  });
});

describe("customerDebt", () => {
  it("suma el saldo de varios pedidos", () => {
    const orders = [
      order({ items: [item({ quantity: 1, unitPrice: 1000 })] }),
      order({
        items: [item({ quantity: 1, unitPrice: 500 })],
        payments: [{ amount: 200 }],
      }),
    ];
    expect(customerDebt(orders)).toBe(1300);
  });

  it("excluye los pedidos cancelados", () => {
    const orders = [
      order({ items: [item({ quantity: 1, unitPrice: 1000 })] }),
      order({
        deliveryStatus: "cancelled",
        items: [item({ quantity: 1, unitPrice: 99999 })],
      }),
    ];
    expect(customerDebt(orders)).toBe(1000);
  });

  it("sin pedidos, la deuda es cero", () => {
    expect(customerDebt([])).toBe(0);
  });
});

function cycleOrder(overrides: Partial<CycleOrderSummary> = {}): CycleOrderSummary {
  return { deliveryStatus: "pending_delivery", total: 0, cost: 0, paid: 0, ...overrides };
}

describe("calcCycle", () => {
  it("los siete números con un conjunto de pedidos armado a mano, incluyendo pagos parciales", () => {
    const orders = [
      cycleOrder({ total: 50000, cost: 20000, paid: 50000 }), // pagado completo
      cycleOrder({ total: 30000, cost: 10000, paid: 10000 }), // pago parcial
      cycleOrder({ total: 20000, cost: 8000, paid: 0 }), // sin pagar
    ];
    const expenses = [{ amount: 5000 }, { amount: 3000 }];

    const result = calcCycle(orders, expenses);

    expect(result.sold).toBe(100000);
    expect(result.collected).toBe(60000);
    expect(result.outstanding).toBe(40000);
    expect(result.productCost).toBe(38000);
    expect(result.productProfit).toBe(62000);
    expect(result.expenses).toBe(8000);
    expect(result.result).toBe(54000);
  });

  it("los pedidos cancelados no suman a ningún total", () => {
    const orders = [
      cycleOrder({ total: 10000, cost: 4000, paid: 10000 }),
      cycleOrder({ deliveryStatus: "cancelled", total: 99999, cost: 99999, paid: 99999 }),
    ];
    const result = calcCycle(orders, []);
    expect(result.sold).toBe(10000);
    expect(result.collected).toBe(10000);
    expect(result.productCost).toBe(4000);
  });

  it("result = productProfit - expenses, con gastos", () => {
    const orders = [cycleOrder({ total: 20000, cost: 12000, paid: 20000 })]; // profit 8000
    const result = calcCycle(orders, [{ amount: 3000 }]);
    expect(result.productProfit).toBe(8000);
    expect(result.expenses).toBe(3000);
    expect(result.result).toBe(5000);
  });

  it("result = productProfit - expenses, sin gastos (result = productProfit)", () => {
    const orders = [cycleOrder({ total: 20000, cost: 12000, paid: 20000 })];
    const result = calcCycle(orders, []);
    expect(result.expenses).toBe(0);
    expect(result.result).toBe(result.productProfit);
  });

  it("sin pedidos ni gastos, todo da cero", () => {
    expect(calcCycle([], [])).toEqual({
      sold: 0,
      collected: 0,
      outstanding: 0,
      productCost: 0,
      productProfit: 0,
      expenses: 0,
      result: 0,
    });
  });
});

function debtorOrder(overrides: Partial<DebtorOrder> = {}): DebtorOrder {
  return {
    orderId: "o1",
    customerId: "c1",
    deliveryStatus: "pending_delivery",
    balance: 0,
    ...overrides,
  };
}

const customers = [
  { id: "c1", name: "Laura", phone: "111" },
  { id: "c2", name: "Marina", phone: "222" },
  { id: "c3", name: "Sol", phone: null },
];

describe("debtors", () => {
  it("ordena de mayor a menor", () => {
    const orders = [
      debtorOrder({ orderId: "o1", customerId: "c1", balance: 1000 }),
      debtorOrder({ orderId: "o2", customerId: "c2", balance: 5000 }),
    ];
    const result = debtors(orders, customers);
    expect(result.map((d) => d.customerName)).toEqual(["Marina", "Laura"]);
  });

  it("agrupa varios pedidos de la misma clienta", () => {
    const orders = [
      debtorOrder({ orderId: "o1", customerId: "c1", balance: 1000 }),
      debtorOrder({ orderId: "o2", customerId: "c1", balance: 2000 }),
    ];
    const result = debtors(orders, customers);
    expect(result).toHaveLength(1);
    expect(result[0].balance).toBe(3000);
    // el pedido referenciado es el de mayor saldo individual
    expect(result[0].orderId).toBe("o2");
  });

  it("excluye a quien no debe", () => {
    const orders = [
      debtorOrder({ orderId: "o1", customerId: "c1", balance: 0 }),
      debtorOrder({ orderId: "o2", customerId: "c2", balance: 1000 }),
    ];
    const result = debtors(orders, customers);
    expect(result.map((d) => d.customerName)).toEqual(["Marina"]);
  });

  it("excluye pedidos cancelados aunque tengan saldo", () => {
    const orders = [
      debtorOrder({ orderId: "o1", customerId: "c1", balance: 1000, deliveryStatus: "cancelled" }),
    ];
    expect(debtors(orders, customers)).toEqual([]);
  });
});

function brandItem(overrides: Partial<BrandSaleOrder["items"][number]> = {}) {
  return {
    brandId: null,
    quantity: 1,
    unitPrice: 1000,
    unitCost: null,
    brandMarginPct: null,
    ...overrides,
  };
}

const brands = [
  { id: "b1", name: "Natura" },
  { id: "b2", name: "Mis velas" },
];

describe("byBrand", () => {
  it("agrupa por marca, suma payable y profit", () => {
    const orders: BrandSaleOrder[] = [
      {
        deliveryStatus: "pending_delivery",
        items: [
          // 2 x $5000, marca Natura 30% -> costo 3500 c/u
          brandItem({ brandId: "b1", quantity: 2, unitPrice: 5000, brandMarginPct: 30 }),
        ],
      },
      {
        deliveryStatus: "delivered",
        items: [
          // 1 x $3000, marca Natura, costo propio 1000
          brandItem({ brandId: "b1", quantity: 1, unitPrice: 3000, unitCost: 1000 }),
        ],
      },
    ];

    const result = byBrand(orders, brands);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      brandName: "Natura",
      sold: 2 * 5000 + 3000, // 13000
      payable: 2 * 3500 + 1000, // 8000
      profit: 13000 - 8000,
    });
  });

  it("junta los ítems sin marca en 'Sin marca'", () => {
    const orders: BrandSaleOrder[] = [
      {
        deliveryStatus: "pending_delivery",
        items: [
          brandItem({ brandId: null, quantity: 1, unitPrice: 1000 }),
          brandItem({ brandId: "b1", quantity: 1, unitPrice: 2000, brandMarginPct: 10 }),
        ],
      },
    ];

    const result = byBrand(orders, brands);
    const sinMarca = result.find((b) => b.brandName === "Sin marca");
    expect(sinMarca).toMatchObject({ brandId: null, sold: 1000, payable: 0 });
  });

  it("no suma pedidos cancelados", () => {
    const orders: BrandSaleOrder[] = [
      {
        deliveryStatus: "cancelled",
        items: [brandItem({ brandId: "b1", quantity: 1, unitPrice: 99999 })],
      },
    ];
    expect(byBrand(orders, brands)).toEqual([]);
  });
});
