import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCustomer } from "@/data/customers";
import { createCycle } from "@/data/cycles";
import { createOrder, getOrder, updateDeliveryStatus } from "@/data/orders";
import { createPayment, deletePayment, listPayments } from "@/data/payments";
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  hasSupabaseCredentials,
  type TestUser,
} from "./helpers";

describe.skipIf(!hasSupabaseCredentials)("Repositorio de payments", () => {
  const admin = hasSupabaseCredentials ? createAdminClient() : null!;
  let user: TestUser;
  let cycleId: string;
  let customerId: string;

  beforeAll(async () => {
    user = await createTestUser(admin, "libreta-payments");
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo pagos" });
    cycleId = cycle.id;
    const customer = await createCustomer(user.client, user.userId, {
      name: "Marina Pérez",
      phone: null,
      notes: null,
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await deleteTestUser(admin, user.userId);
  });

  async function newOrder(total: number) {
    return createOrder(user.client, user.userId, cycleId, {
      customerId,
      notes: null,
      items: [{ name: "Item", brandId: null, quantity: 1, unitPrice: total, unitCost: null }],
    });
  }

  it("un pago parcial deja 'Debe' el resto", async () => {
    const orderId = await newOrder(50000);
    const result = await createPayment(user.client, user.userId, orderId, {
      amount: 20000,
      date: "2026-10-09",
    });
    expect(result.error).toBeUndefined();

    const order = await getOrder(user.client, orderId);
    expect(order!.paid).toBe(20000);
    expect(order!.balance).toBe(30000);
  });

  it("pago de exactamente el saldo lo deja en cero", async () => {
    const orderId = await newOrder(50000);
    await createPayment(user.client, user.userId, orderId, { amount: 20000, date: "2026-10-09" });
    const result = await createPayment(user.client, user.userId, orderId, {
      amount: 30000,
      date: "2026-10-09",
    });
    expect(result.error).toBeUndefined();

    const order = await getOrder(user.client, orderId);
    expect(order!.balance).toBe(0);
    expect(order!.paid).toBe(50000);
  });

  it("un pago mayor al saldo es rechazado, con el saldo en el mensaje", async () => {
    const orderId = await newOrder(50000);
    await createPayment(user.client, user.userId, orderId, { amount: 20000, date: "2026-10-09" });

    const result = await createPayment(user.client, user.userId, orderId, {
      amount: 30001,
      date: "2026-10-09",
    });
    expect(result.error).toBeDefined();
    expect(result.error).toContain("30.000");

    const order = await getOrder(user.client, orderId);
    expect(order!.balance).toBe(30000); // no cambió
  });

  it("la base rechaza un monto de pago cero o negativo (CHECK)", async () => {
    const orderId = await newOrder(10000);
    const { error } = await user.client
      .from("payments")
      .insert({ user_id: user.userId, order_id: orderId, amount: 0 });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23514");
  });

  it("dos pagos casi simultáneos no superan el total entre los dos", async () => {
    const orderId = await newOrder(10000);

    const [a, b] = await Promise.allSettled([
      createPayment(user.client, user.userId, orderId, { amount: 6000, date: "2026-10-09" }),
      createPayment(user.client, user.userId, orderId, { amount: 6000, date: "2026-10-09" }),
    ]);

    // una de las dos tiene que haber sido rechazada (por la Server Action o,
    // si ganó la carrera, por el trigger de la base)
    const results = [a, b].map((settled) =>
      settled.status === "fulfilled" ? settled.value : { error: "threw" },
    );
    const accepted = results.filter((r) => !r.error);
    expect(accepted.length).toBe(1);

    const order = await getOrder(user.client, orderId);
    expect(order!.paid).toBeLessThanOrEqual(10000);
    expect(order!.paid).toBe(6000);
  });

  it("borrar un pago recalcula el saldo", async () => {
    const orderId = await newOrder(10000);
    await createPayment(user.client, user.userId, orderId, { amount: 4000, date: "2026-10-09" });

    let order = await getOrder(user.client, orderId);
    expect(order!.balance).toBe(6000);

    const [payment] = await listPayments(user.client, orderId);
    await deletePayment(user.client, payment.id);

    order = await getOrder(user.client, orderId);
    expect(order!.balance).toBe(10000);
    expect(order!.paid).toBe(0);
  });

  it("entrega y pago son independientes en las dos direcciones", async () => {
    // entregado pero debiendo
    const orderA = await newOrder(10000);
    await updateDeliveryStatus(user.client, orderA, "delivered");
    await createPayment(user.client, user.userId, orderA, { amount: 3000, date: "2026-10-09" });
    const a = await getOrder(user.client, orderA);
    expect(a!.deliveryStatus).toBe("delivered");
    expect(a!.balance).toBe(7000);

    // pagado pero sin entregar
    const orderB = await newOrder(5000);
    await createPayment(user.client, user.userId, orderB, { amount: 5000, date: "2026-10-09" });
    const b = await getOrder(user.client, orderB);
    expect(b!.balance).toBe(0);
    expect(b!.deliveryStatus).toBe("pending_receipt");
  });
});
