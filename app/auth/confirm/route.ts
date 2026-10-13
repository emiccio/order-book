import { NextResponse } from "next/server";
import { createClient } from "@/data/supabase/server";

/**
 * Intercambia el código del link de mail (confirmación de registro o
 * recuperación de contraseña) por una sesión, y redirige a `next`.
 */
const ALLOWED_NEXT_PATHS = new Set(["/app", "/app/login/reset"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const next = requestedNext && ALLOWED_NEXT_PATHS.has(requestedNext) ? requestedNext : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/app/login?error=auth`);
}
