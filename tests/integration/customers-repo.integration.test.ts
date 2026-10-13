import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  archiveCustomer,
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from "@/data/customers";
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  hasSupabaseCredentials,
  type TestUser,
} from "./helpers";

describe.skipIf(!hasSupabaseCredentials)("Repositorio de customers", () => {
  const admin = hasSupabaseCredentials ? createAdminClient() : null!;
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser(admin, "libreta-customers");
  });

  afterAll(async () => {
    await deleteTestUser(admin, user.userId);
  });

  it("alta, modificación y archivado", async () => {
    await createCustomer(user.client, user.userId, {
      name: "Laura Gómez",
      phone: "2235551234",
      notes: null,
    });

    let customers = await listCustomers(user.client);
    expect(customers).toHaveLength(1);
    expect(customers[0]).toMatchObject({
      name: "Laura Gómez",
      phone: "2235551234",
      archived: false,
      debt: 0,
    });

    await updateCustomer(user.client, customers[0].id, {
      name: "Laura G.",
      phone: "2235559999",
      notes: "Cliente frecuente",
    });
    customers = await listCustomers(user.client);
    expect(customers[0]).toMatchObject({ name: "Laura G.", phone: "2235559999" });

    await archiveCustomer(user.client, customers[0].id);
    customers = await listCustomers(user.client);
    expect(customers).toHaveLength(0);

    const archived = await listCustomers(user.client, { includeArchived: true });
    expect(archived).toHaveLength(1);
    expect(archived[0].archived).toBe(true);
  });

  it("no se puede borrar una clienta con pedidos: se archiva en su lugar", async () => {
    await createCustomer(user.client, user.userId, {
      name: "Marina Pérez",
      phone: null,
      notes: null,
    });
    const [customer] = await listCustomers(user.client, { includeArchived: true }).then(
      (rows) => rows.filter((r) => r.name === "Marina Pérez"),
    );

    const { data: cycle } = await user.client
      .from("cycles")
      .insert({ user_id: user.userId, name: "Ciclo de prueba" })
      .select("id")
      .single();

    await user.client.from("orders").insert({
      user_id: user.userId,
      cycle_id: cycle!.id,
      customer_id: customer.id,
    });

    const result = await deleteCustomer(user.client, customer.id);
    expect(result).toEqual({ archived: true });

    const rows = await listCustomers(user.client, { includeArchived: true });
    const stillThere = rows.find((r) => r.id === customer.id);
    expect(stillThere).toBeDefined();
    expect(stillThere?.archived).toBe(true);
  });

  it("borra de verdad una clienta sin pedidos", async () => {
    await createCustomer(user.client, user.userId, {
      name: "Sol Fernández",
      phone: null,
      notes: null,
    });
    const [customer] = await listCustomers(user.client, { includeArchived: true }).then(
      (rows) => rows.filter((r) => r.name === "Sol Fernández"),
    );

    const result = await deleteCustomer(user.client, customer.id);
    expect(result).toEqual({ archived: false });

    const rows = await listCustomers(user.client, { includeArchived: true });
    expect(rows.find((r) => r.id === customer.id)).toBeUndefined();
  });

  it("la deuda de la clienta suma sus pedidos no cancelados, menos lo pagado", async () => {
    await createCustomer(user.client, user.userId, {
      name: "Deudora de prueba",
      phone: null,
      notes: null,
    });
    const [customer] = await listCustomers(user.client, { includeArchived: true }).then(
      (rows) => rows.filter((r) => r.name === "Deudora de prueba"),
    );

    const { data: cycle } = await user.client
      .from("cycles")
      .insert({ user_id: user.userId, name: "Ciclo deuda" })
      .select("id")
      .single();

    const { data: order } = await user.client
      .from("orders")
      .insert({ user_id: user.userId, cycle_id: cycle!.id, customer_id: customer.id })
      .select("id")
      .single();

    await user.client.from("order_items").insert({
      user_id: user.userId,
      order_id: order!.id,
      name: "Perfume",
      quantity: 2,
      unit_price: 5000,
    });
    await user.client
      .from("payments")
      .insert({ user_id: user.userId, order_id: order!.id, amount: 4000 });

    const { data: cancelledOrder } = await user.client
      .from("orders")
      .insert({
        user_id: user.userId,
        cycle_id: cycle!.id,
        customer_id: customer.id,
        delivery_status: "cancelled",
      })
      .select("id")
      .single();
    await user.client.from("order_items").insert({
      user_id: user.userId,
      order_id: cancelledOrder!.id,
      name: "Pedido cancelado",
      quantity: 1,
      unit_price: 999999,
    });

    const rows = await listCustomers(user.client);
    const found = rows.find((r) => r.id === customer.id);
    // total 10000 - pagado 4000 = 6000; el pedido cancelado no suma
    expect(found?.debt).toBe(6000);
  });
});
