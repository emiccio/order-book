import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createBrand } from "@/data/brands";
import { createCustomer } from "@/data/customers";
import { createCycle } from "@/data/cycles";
import {
  createOrder,
  getOrder,
  listOrders,
  updateDeliveryStatus,
  updateOrder,
} from "@/data/orders";
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  hasSupabaseCredentials,
  type TestUser,
} from "./helpers";

describe.skipIf(!hasSupabaseCredentials)("Repositorio de orders", () => {
  const admin = hasSupabaseCredentials ? createAdminClient() : null!;
  let user: TestUser;
  let cycleId: string;
  let customerId: string;
  let brandId: string;

  beforeAll(async () => {
    user = await createTestUser(admin, "libreta-orders");
    const cycle = await createCycle(user.client, user.userId, { name: "Ciclo pedidos" });
    cycleId = cycle.id;
    const customer = await createCustomer(user.client, user.userId, {
      name: "Laura Gómez",
      phone: "2235551234",
      notes: null,
    });
    customerId = customer.id;
    await createBrand(user.client, user.userId, { name: "Natura", marginPct: 30 });
    const { data: brand } = await user.client
      .from("brands")
      .select("id")
      .eq("name", "Natura")
      .single();
    brandId = brand!.id;
  });

  afterAll(async () => {
    await deleteTestUser(admin, user.userId);
  });

  it("alta de un pedido con varios ítems y marcas, total/costo/ganancia correctos", async () => {
    const orderId = await createOrder(user.client, user.userId, cycleId, {
      customerId,
      notes: null,
      items: [
        { name: "Perfume", brandId, quantity: 2, unitPrice: 5000, unitCost: null },
        { name: "Jabón propio", brandId: null, quantity: 1, unitPrice: 1000, unitCost: 300 },
      ],
    });

    const order = await getOrder(user.client, orderId);
    expect(order).not.toBeNull();
    expect(order!.customerName).toBe("Laura Gómez");
    expect(order!.customerPhone).toBe("2235551234");
    expect(order!.items).toHaveLength(2);
    expect(order!.total).toBe(2 * 5000 + 1000); // 11000
    expect(order!.cost).toBe(2 * (5000 * 0.7) + 300); // 7300
    expect(order!.profit).toBe(order!.total - order!.cost);
    expect(order!.deliveryStatus).toBe("pending_receipt");
  });

  it("listOrders devuelve los pedidos del ciclo", async () => {
    const orders = await listOrders(user.client, cycleId);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.every((o) => o.customerName === "Laura Gómez")).toBe(true);
  });

  it("editar un pedido reemplaza sus ítems", async () => {
    const orderId = await createOrder(user.client, user.userId, cycleId, {
      customerId,
      notes: null,
      items: [{ name: "Original", brandId: null, quantity: 1, unitPrice: 1000, unitCost: null }],
    });

    await updateOrder(user.client, user.userId, orderId, {
      customerId,
      notes: "Editado",
      items: [
        { name: "Nuevo A", brandId: null, quantity: 2, unitPrice: 500, unitCost: null },
        { name: "Nuevo B", brandId: null, quantity: 1, unitPrice: 200, unitCost: null },
      ],
    });

    const order = await getOrder(user.client, orderId);
    expect(order!.items.map((i) => i.name).sort()).toEqual(["Nuevo A", "Nuevo B"]);
    expect(order!.notes).toBe("Editado");
    expect(order!.total).toBe(1200);
  });

  it("cambiar el estado de entrega no toca los pagos", async () => {
    const orderId = await createOrder(user.client, user.userId, cycleId, {
      customerId,
      notes: null,
      items: [{ name: "Item", brandId: null, quantity: 1, unitPrice: 2000, unitCost: null }],
    });
    await user.client.from("payments").insert({ user_id: user.userId, order_id: orderId, amount: 500 });

    await updateDeliveryStatus(user.client, orderId, "received");

    const order = await getOrder(user.client, orderId);
    expect(order!.deliveryStatus).toBe("received");
    expect(order!.paid).toBe(500);
    expect(order!.balance).toBe(1500);
  });

  it("la base rechaza un ítem con cantidad cero o negativa (CHECK)", async () => {
    const { error } = await user.client.from("order_items").insert({
      user_id: user.userId,
      order_id: (await createOrder(user.client, user.userId, cycleId, {
        customerId,
        notes: null,
        items: [{ name: "Base", brandId: null, quantity: 1, unitPrice: 1, unitCost: null }],
      })),
      name: "Inválido",
      quantity: 0,
      unit_price: 100,
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23514");
  });

  it("la base rechaza un precio negativo (CHECK)", async () => {
    const orderId = await createOrder(user.client, user.userId, cycleId, {
      customerId,
      notes: null,
      items: [{ name: "Base", brandId: null, quantity: 1, unitPrice: 1, unitCost: null }],
    });
    const { error } = await user.client.from("order_items").insert({
      user_id: user.userId,
      order_id: orderId,
      name: "Inválido",
      quantity: 1,
      unit_price: -1,
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23514");
  });

  it("la base rechaza un pedido sin clienta o sin ciclo (NOT NULL)", async () => {
    const { error: noCustomer } = await user.client.from("orders").insert({
      user_id: user.userId,
      cycle_id: cycleId,
      customer_id: null,
    });
    expect(noCustomer).not.toBeNull();

    const { error: noCycle } = await user.client.from("orders").insert({
      user_id: user.userId,
      cycle_id: null,
      customer_id: customerId,
    });
    expect(noCycle).not.toBeNull();
  });
});
