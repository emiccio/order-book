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
});
