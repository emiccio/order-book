"use client";

import { useActionState } from "react";
import { formatMoney } from "@/domain/money";
import { formatShortDate } from "@/domain/dates";
import type { ActionResult } from "@/actions/auth";
import {
  createPaymentAction,
  deletePaymentAction,
  markPaidAction,
} from "@/actions/payments";
import type { PaymentRow } from "@/data/payments";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";
import { Chip } from "@/ui/Chip";

const initialState: ActionResult = {};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentsPanel({
  orderId,
  total,
  paid,
  balance,
  payments,
}: {
  orderId: string;
  total: number;
  paid: number;
  balance: number;
  payments: PaymentRow[];
}) {
  const [state, formAction, pending] = useActionState(createPaymentAction, initialState);

  return (
    <div className="rounded-card border border-line bg-surface p-3.5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-[16px] font-bold">Pagos</h3>
        <Chip tone={balance > 0 ? "warn" : "ok"}>
          {balance > 0 ? `Debe ${formatMoney(balance)}` : "Pagado"}
        </Chip>
      </div>

      <div className="num mt-2 text-sm text-muted">
        Pagado {formatMoney(paid)} de {formatMoney(total)}
      </div>

      {payments.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="num flex items-center justify-between rounded-lg bg-sunk px-2.5 py-1.5 text-sm"
            >
              <span>{formatShortDate(payment.date)}</span>
              <span className="font-semibold">{formatMoney(payment.amount)}</span>
              <form action={deletePaymentAction}>
                <input type="hidden" name="id" value={payment.id} />
                <input type="hidden" name="orderId" value={orderId} />
                <Button type="submit" variant="danger" size="sm">
                  Borrar
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {balance > 0 && (
        <>
          <form action={formAction} className="mt-3 flex flex-col gap-2.5">
            <input type="hidden" name="orderId" value={orderId} />
            <div className="grid grid-cols-[1fr_140px] gap-2.5">
              <Field label="Monto">
                <input
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Monto"
                  required
                  className="rounded-lg border border-line px-2.5 py-2"
                />
              </Field>
              <Field label="Fecha">
                <input
                  name="date"
                  type="date"
                  defaultValue={today()}
                  required
                  className="rounded-lg border border-line px-2.5 py-2"
                />
              </Field>
            </div>
            {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}
            <Button type="submit" variant="primary" size="sm" disabled={pending}>
              {pending ? "Guardando…" : "+ Registrar pago"}
            </Button>
          </form>

          <form action={markPaidAction} className="mt-2">
            <input type="hidden" name="orderId" value={orderId} />
            <Button type="submit" variant="ghost" size="sm">
              Marcar como pagado completo
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
