import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCustomer } from "@/data/customers";
import { closeCycle, createCycle, getCycle } from "@/data/cycles";
import { createOrder, getOrder, listOrders } from "@/data/orders";
import { createExpense, listExpenses } from "@/data/expenses";
import { customerDebt } from "@/domain/calculations";
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  hasSupabaseCredentials,
  type TestUser,
} from "./helpers";

describe.skipIf(!hasSupabaseCredentials)("Cierre de ciclo", () => {
  const admin = hasSupabaseCredentials ? createAdminClient() : null!;
  let user: TestUser;
  let customerId: string;

  beforeAll(async () => {
    user = await createTestUser(admin, "libreta-closing");
    const customer = await createCustomer(user.client, user.userId, {
      name: "Clienta cierre",
      phone: null,
      notes: null,
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await deleteTestUser(admin, user.userId);
  });

  it("cerrar un ciclo con pedidos sin cobrar avisa pero no bloquea: la deuda sigue en la clienta", async () => {
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo con deuda" });
    const orderId = await createOrder(user.client, user.userId, cycle.id, {
      customerId,
      notes: null,
      items: [{ name: "Item", brandId: null, quantity: 1, unitPrice: 10000, unitCost: null }],
    });

    await closeCycle(user.client, cycle.id);

    const closed = await getCycle(user.client, cycle.id);
    expect(closed?.status).toBe("closed");

    const order = await getOrder(user.client, orderId);
    expect(order?.balance).toBe(10000); // la deuda del pedido no se tocó

    const debt = customerDebt([
      {
        deliveryStatus: order!.deliveryStatus,
        items: order!.items.map((i) => ({
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          unitCost: i.unitCost,
          brandMarginPct: null,
        })),
        payments: [],
      },
    ]);
    expect(debt).toBe(10000); // sigue en la clienta
  });

  it("un ciclo cerrado rechaza pedidos nuevos (CHECK en la base)", async () => {
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo cerrado A" });
    await closeCycle(user.client, cycle.id);

    const { error } = await user.client
      .from("orders")
      .insert({ user_id: user.userId, cycle_id: cycle.id, customer_id: customerId });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("P0001");
  });

  it("un ciclo cerrado rechaza gastos nuevos (CHECK en la base)", async () => {
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo cerrado B" });
    await closeCycle(user.client, cycle.id);

    const { error } = await user.client
      .from("expenses")
      .insert({ user_id: user.userId, cycle_id: cycle.id, category: "shipping", amount: 1000 });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("P0001");
  });

  it("un ciclo abierto sí acepta gastos, y createExpense valida monto y categoría", async () => {
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo gastos" });

    const result = await createExpense(user.client, user.userId, cycle.id, {
      category: "shipping",
      amount: 8000,
      description: null,
      date: "2026-10-09",
    });
    expect(result.error).toBeUndefined();

    const expenses = await listExpenses(user.client, cycle.id);
    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toMatchObject({ category: "shipping", amount: 8000 });
  });

  it("los ciclos cerrados se siguen pudiendo leer, con sus números intactos", async () => {
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo a consultar" });
    await createOrder(user.client, user.userId, cycle.id, {
      customerId,
      notes: null,
      items: [{ name: "Item", brandId: null, quantity: 1, unitPrice: 20000, unitCost: null }],
    });
    await createExpense(user.client, user.userId, cycle.id, {
      category: "packaging",
      amount: 2000,
      description: null,
      date: "2026-10-09",
    });

    await closeCycle(user.client, cycle.id);

    const orders = await listOrders(user.client, cycle.id);
    const expenses = await listExpenses(user.client, cycle.id);
    expect(orders).toHaveLength(1);
    expect(orders[0].total).toBe(20000);
    expect(expenses).toHaveLength(1);
    expect(expenses[0].amount).toBe(2000);
  });
});
