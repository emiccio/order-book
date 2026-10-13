import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components y Server Actions.
 * Lee y escribe la sesión en las cookies (vía @supabase/ssr), nunca en
 * localStorage: así la sesión viaja entre celular y PC sin sincronizar nada
 * a mano.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se puede llamar desde un Server Component (sin permiso de
            // escribir cookies); el middleware se encarga de refrescar
            // la sesión en esos casos.
          }
        },
      },
      global: {
        // Next.js parchea fetch y cachea las respuestas GET por defecto,
        // compartido entre páginas distintas que pidan la misma URL. Sin
        // esto, una página puede mostrar datos viejos de Supabase que ya
        // cambiaron (ej. el ciclo activo) hasta que esa URL puntual expire
        // de la caché por su cuenta.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
