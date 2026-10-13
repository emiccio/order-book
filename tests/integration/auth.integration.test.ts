import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  hasSupabaseCredentials,
  type TestUser,
} from "./helpers";

describe.skipIf(!hasSupabaseCredentials)("Supabase: cuentas y aislamiento", () => {
  const admin = hasSupabaseCredentials ? createAdminClient() : null!;
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    userA = await createTestUser(admin, "libreta-a");
    userB = await createTestUser(admin, "libreta-b");
  });

  afterAll(async () => {
    await deleteTestUser(admin, userA.userId);
    await deleteTestUser(admin, userB.userId);
  });

  it("al registrarse se crea la fila de profiles", async () => {
    const { data, error } = await userA.client
      .from("profiles")
      .select("id")
      .eq("id", userA.userId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.id).toBe(userA.userId);
  });

  it("una usuaria no puede leer las marcas de la otra", async () => {
    await userA.client.from("brands").insert({
      user_id: userA.userId,
      name: "Marca de A",
      margin_pct: 20,
    });

    const { data, error } = await userB.client
      .from("brands")
      .select("id, name")
      .eq("name", "Marca de A");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("una usuaria no puede escribir marcas a nombre de la otra", async () => {
    const { error } = await userB.client.from("brands").insert({
      user_id: userA.userId,
      name: "Intento ajeno",
      margin_pct: 10,
    });

    expect(error).not.toBeNull();
  });

  it("una usuaria no puede leer los ciclos de la otra", async () => {
    await userA.client.from("cycles").insert({ user_id: userA.userId, name: "Ciclo de A" });

    const { data, error } = await userB.client
      .from("cycles")
      .select("id, name")
      .eq("name", "Ciclo de A");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  // RLS evita que B lea lo de A, pero por sí sola no evita que B
  // *referencie* un id de A en una fila propia — eso lo cierra la FK
  // compuesta (id, user_id) de la migración 0004.
  it("una usuaria no puede crear un pedido que apunte al ciclo de otra", async () => {
    const { data: cycleB } = await userB.client
      .from("cycles")
      .insert({ user_id: userB.userId, name: "Ciclo de B (ajeno)" })
      .select("id")
      .single();
    const { data: customerA } = await userA.client
      .from("customers")
      .insert({ user_id: userA.userId, name: "Clienta de A" })
      .select("id")
      .single();

    const { error } = await userA.client.from("orders").insert({
      user_id: userA.userId,
      cycle_id: cycleB!.id,
      customer_id: customerA!.id,
    });

    expect(error).not.toBeNull();
  });

  it("una usuaria no puede elegir como ciclo activo uno que no es suyo", async () => {
    const { data: cycleB } = await userB.client
      .from("cycles")
      .insert({ user_id: userB.userId, name: "Otro ciclo de B" })
      .select("id")
      .single();

    const { error } = await userA.client
      .from("profiles")
      .update({ active_cycle_id: cycleB!.id })
      .eq("id", userA.userId);

    expect(error).not.toBeNull();
  });
});
