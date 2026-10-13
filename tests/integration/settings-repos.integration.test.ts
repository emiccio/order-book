import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { archiveBrand, createBrand, listBrands, updateBrand } from "@/data/brands";
import { createCycle, listCycles, setActiveCycle } from "@/data/cycles";
import { getProfile } from "@/data/profiles";
import {
  createAdminClient,
  createTestUser,
  deleteTestUser,
  hasSupabaseCredentials,
  type TestUser,
} from "./helpers";

describe.skipIf(!hasSupabaseCredentials)("Repositorios de brands y cycles", () => {
  const admin = hasSupabaseCredentials ? createAdminClient() : null!;
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser(admin, "libreta-repos");
  });

  afterAll(async () => {
    await deleteTestUser(admin, user.userId);
  });

  it("brands: alta, modificación y archivado", async () => {
    await createBrand(user.client, user.userId, { name: "Natura", marginPct: 30 });

    let brands = await listBrands(user.client);
    expect(brands).toHaveLength(1);
    expect(brands[0]).toMatchObject({ name: "Natura", margin_pct: 30, archived: false });

    await updateBrand(user.client, brands[0].id, { name: "Natura Ar", marginPct: 35 });
    brands = await listBrands(user.client);
    expect(brands[0]).toMatchObject({ name: "Natura Ar", margin_pct: 35 });

    await archiveBrand(user.client, brands[0].id);
    brands = await listBrands(user.client);
    expect(brands).toHaveLength(0);

    const archived = await listBrands(user.client, { includeArchived: true });
    expect(archived).toHaveLength(1);
    expect(archived[0].archived).toBe(true);
  });

  it("cycles: alta y elegir ciclo activo deja exactamente uno activo", async () => {
    const cycleA = await createCycle(user.client, user.userId, { name: "Ciclo A" });
    const cycleB = await createCycle(user.client, user.userId, { name: "Ciclo B" });

    await setActiveCycle(user.client, user.userId, cycleA.id);
    let profile = await getProfile(user.client, user.userId);
    expect(profile?.active_cycle_id).toBe(cycleA.id);

    await setActiveCycle(user.client, user.userId, cycleB.id);
    profile = await getProfile(user.client, user.userId);
    expect(profile?.active_cycle_id).toBe(cycleB.id);

    const cycles = await listCycles(user.client);
    expect(cycles.map((c) => c.id)).toEqual(
      expect.arrayContaining([cycleA.id, cycleB.id]),
    );
  });
});
