"use client";

import { useActionState } from "react";
import { formatMoney } from "@/domain/money";
import { formatShortDate } from "@/domain/dates";
import { EXPENSE_CATEGORIES } from "@/domain/types";
import { expenseCategoryLabel } from "@/ui/labels";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";
import { List, ListRow } from "@/ui/List";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";
import type { ActionResult } from "@/actions/auth";
import { createExpenseAction, deleteExpenseAction } from "@/actions/expenses";
import type { ExpenseRow } from "@/data/expenses";

const initialState: ActionResult = {};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpensesView({
  cycleId,
  cycleName,
  expenses,
}: {
  cycleId: string;
  cycleName: string;
  expenses: ExpenseRow[];
}) {
  const [state, formAction, pending] = useActionState(createExpenseAction, initialState);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div>
      <SectionHeader title="Gastos">
        <span className="text-sm text-muted">{cycleName}</span>
      </SectionHeader>

      <div className="mt-2 text-sm text-muted">
        Total gastado: <span className="num font-semibold text-ink">{formatMoney(total)}</span>
      </div>

      {expenses.length === 0 ? (
        <EmptyState>Todavía no cargaste gastos en este ciclo.</EmptyState>
      ) : (
        <div className="mt-3">
          <List>
            {expenses.map((expense) => (
              <ListRow key={expense.id}>
                <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <div>
                    <div className="font-semibold">{expenseCategoryLabel(expense.category)}</div>
                    <div className="text-sm text-muted">
                      {formatShortDate(expense.date)}
                      {expense.description ? ` · ${expense.description}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num font-semibold">{formatMoney(expense.amount)}</span>
                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="id" value={expense.id} />
                      <input type="hidden" name="cycleId" value={cycleId} />
                      <Button type="submit" variant="danger" size="sm">
                        Borrar
                      </Button>
                    </form>
                  </div>
                </div>
              </ListRow>
            ))}
          </List>
        </div>
      )}

      <form action={formAction} className="mt-4 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Categoría">
            <select
              name="category"
              required
              defaultValue=""
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            >
              <option value="" disabled>
                Categoría
              </option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {expenseCategoryLabel(category)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Monto">
            <input
              name="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="Monto"
              required
              className="rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </Field>
        </div>
        <Field label="Fecha">
          <input
            name="date"
            type="date"
            defaultValue={today()}
            required
            className="rounded-xl border border-line bg-surface px-3 py-2.5"
          />
        </Field>
        <Field label="Descripción">
          <input
            name="description"
            placeholder="Descripción (opcional)"
            className="rounded-xl border border-line bg-surface px-3 py-2.5"
          />
        </Field>
        {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "+ Registrar gasto"}
        </Button>
      </form>
    </div>
  );
}
