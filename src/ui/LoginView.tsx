"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, signUpAction, type ActionResult } from "@/actions/auth";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";

const initialState: ActionResult = {};

export function LoginView() {
  // El botón principal de la landing linkea a /app/login?mode=signup para
  // abrir directo en "Crear cuenta" — un toque menos que entrar y elegir
  // la pestaña a mano.
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    initialState,
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Libreta de Ventas</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "signin" ? "Entrá con tu cuenta." : "Creá tu cuenta gratis."}
        </p>
      </div>

      <div className="flex gap-2 rounded-full bg-sunk p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`min-h-11 flex-1 rounded-full text-sm font-semibold ${
            mode === "signin" ? "bg-surface shadow" : "text-muted"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`min-h-11 flex-1 rounded-full text-sm font-semibold ${
            mode === "signup" ? "bg-surface shadow" : "text-muted"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {mode === "signin" ? (
        <form action={signInFormAction} className="flex flex-col gap-3">
          <Field label="Mail">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
          <Field label="Contraseña">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
          {signInState.error && (
            <p className="text-sm font-medium text-danger">{signInState.error}</p>
          )}
          <Button type="submit" variant="primary" fullWidth disabled={signInPending}>
            {signInPending ? "Un momento…" : "Entrar"}
          </Button>
          <Link href="/app/login/forgot" className="text-center text-sm font-semibold text-accent">
            Olvidé mi contraseña
          </Link>
        </form>
      ) : (
        <form action={signUpFormAction} className="flex flex-col gap-3">
          <Field label="Nombre">
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
          <Field label="Mail">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
          <Field label="Contraseña">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
          {signUpState.error && (
            <p className="text-sm font-medium text-danger">{signUpState.error}</p>
          )}
          <Button type="submit" variant="primary" fullWidth disabled={signUpPending}>
            {signUpPending ? "Un momento…" : "Crear cuenta"}
          </Button>
        </form>
      )}
    </main>
  );
}
