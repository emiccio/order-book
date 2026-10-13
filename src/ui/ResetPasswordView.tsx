"use client";

import { useActionState } from "react";
import { updatePasswordAction, type ActionResult } from "@/actions/auth";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";

const initialState: ActionResult = {};

export function ResetPasswordView() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Elegí una contraseña nueva</h1>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <Field label="Contraseña nueva">
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="rounded-xl border border-line bg-surface px-3 py-2.5"
          />
        </Field>
        {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </main>
  );
}
