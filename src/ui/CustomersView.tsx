"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/domain/money";
import { matchesSearch } from "@/domain/search";
import type { CustomerRow } from "@/data/customers";
import {
  archiveCustomerAction,
  createCustomerAction,
  updateCustomerAction,
} from "@/actions/customers";
import type { ActionResult } from "@/actions/auth";
import { EmptyState } from "@/ui/EmptyState";
import { Sheet } from "@/ui/Sheet";
import { SectionHeader } from "@/ui/SectionHeader";
import { List, ListRow } from "@/ui/List";
import { Avatar } from "@/ui/Avatar";
import { Chip } from "@/ui/Chip";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";

const initialState: ActionResult = {};

export function CustomersView({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CustomerRow | "new" | null>(null);

  const filtered = customers.filter((customer) => matchesSearch(customer.name, query));

  return (
    <div>
      <SectionHeader title="Clientas">
        <Button variant="primary" size="sm" onClick={() => setEditing("new")}>
          + Agregar
        </Button>
      </SectionHeader>

      {customers.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar clienta…"
          aria-label="Buscar clienta"
          className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5"
        />
      )}

      {customers.length === 0 ? (
        <EmptyState>Todavía no cargaste ninguna clienta.</EmptyState>
      ) : filtered.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">
          Ninguna clienta coincide con &quot;{query}&quot;.
        </p>
      ) : (
        <div className="mt-2.5">
          <List>
            {filtered.map((customer) => (
              <ListRow key={customer.id}>
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <Avatar name={customer.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{customer.name}</div>
                    {customer.phone && (
                      <div className="truncate text-sm text-muted">{customer.phone}</div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {customer.debt > 0 ? (
                      <Chip tone="warn">Debe {formatMoney(customer.debt)}</Chip>
                    ) : (
                      <Chip tone="ok">Al día</Chip>
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(customer)}>
                        Editar
                      </Button>
                      <form action={archiveCustomerAction}>
                        <input type="hidden" name="id" value={customer.id} />
                        <Button type="submit" variant="secondary" size="sm">
                          Archivar
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </ListRow>
            ))}
          </List>
        </div>
      )}

      <Sheet
        open={editing !== null}
        title={editing === "new" ? "Nueva clienta" : "Editar clienta"}
        onClose={() => setEditing(null)}
      >
        {editing !== null && (
          <CustomerForm
            customer={editing === "new" ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Sheet>
    </div>
  );
}

function CustomerForm({
  customer,
  onDone,
}: {
  customer: CustomerRow | null;
  onDone: () => void;
}) {
  const action = customer ? updateCustomerAction : createCustomerAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onDone();
    }
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {customer && <input type="hidden" name="id" value={customer.id} />}

      <Field label="Nombre">
        <input
          name="name"
          defaultValue={customer?.name ?? ""}
          required
          className="rounded-xl border border-line bg-surface px-3 py-2.5"
        />
      </Field>

      <Field label="WhatsApp">
        <input
          name="phone"
          type="tel"
          defaultValue={customer?.phone ?? ""}
          placeholder="Ej. 2235551234"
          className="rounded-xl border border-line bg-surface px-3 py-2.5"
        />
      </Field>

      <Field label="Notas">
        <textarea
          name="notes"
          defaultValue={customer?.notes ?? ""}
          rows={3}
          className="rounded-xl border border-line bg-surface px-3 py-2.5"
        />
      </Field>

      {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}

      <Button type="submit" variant="primary" fullWidth disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
