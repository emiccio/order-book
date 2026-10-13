import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Tests de integración contra un proyecto Supabase real. Se saltan solos
 * (describe.skipIf) si no hay credenciales en .env.local: no deben romper
 * `npm test` en una máquina sin ese archivo.
 */
export const hasSupabaseCredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export type TestUser = {
  userId: string;
  email: string;
  client: SupabaseClient;
};

/** Crea una usuaria de prueba ya confirmada y devuelve un cliente logueado como ella. */
export async function createTestUser(
  admin: SupabaseClient,
  label: string,
): Promise<TestUser> {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = "Test1234!";

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  // storageKey propio: en Node no hay localStorage real, así que sin esto
  // todos los clientes de test comparten el mismo storage en memoria y el
  // login de una usuaria pisa la sesión de la otra.
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        storageKey: `sb-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
    },
  );
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(signInError.message);

  return { userId: data.user!.id, email, client };
}

export async function deleteTestUser(admin: SupabaseClient, userId: string): Promise<void> {
  await admin.auth.admin.deleteUser(userId);
}
