"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type RequestResetResult } from "@/actions/auth";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";

const initialState: RequestResetResult = { sent: false };

export function ForgotPasswordView() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-muted">Te mandamos un link para elegir una nueva.</p>
      </div>

      {state.sent ? (
        <p className="text-sm font-medium text-ok">
          Si ese mail está registrado, te llegó un link. Revisá tu casilla.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <Field label="Mail">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
          {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={pending}>
            {pending ? "Enviando…" : "Mandar link"}
          </Button>
        </form>
      )}
    </main>
  );
}
