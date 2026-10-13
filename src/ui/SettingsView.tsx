"use client";

import { useActionState } from "react";
import { createBrandAction, archiveBrandAction } from "@/actions/brands";
import { createCycleAction, setActiveCycleAction } from "@/actions/cycles";
import type { ActionResult } from "@/actions/auth";
import type { BrandRow } from "@/data/brands";
import type { CycleRow } from "@/data/cycles";
import { EmptyState } from "@/ui/EmptyState";
import { SectionHeader } from "@/ui/SectionHeader";
import { List, ListRow } from "@/ui/List";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";
import { Chip } from "@/ui/Chip";

const initialState: ActionResult = {};

export function SettingsView({
  brands,
  cycles,
  activeCycleId,
}: {
  brands: BrandRow[];
  cycles: CycleRow[];
  activeCycleId: string | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeader title="Marcas" />

        {brands.length === 0 ? (
          <EmptyState>Todavía no cargaste ninguna marca.</EmptyState>
        ) : (
          <div className="mt-2.5">
            <List>
              {brands.map((brand) => (
                <ListRow key={brand.id}>
                  <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div>
                      <div className="font-semibold">{brand.name}</div>
                      <div className="text-sm text-muted">{brand.margin_pct}% de ganancia</div>
                    </div>
                    <form action={archiveBrandAction}>
                      <input type="hidden" name="id" value={brand.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Archivar
                      </Button>
                    </form>
                  </div>
                </ListRow>
              ))}
            </List>
          </div>
        )}

        <BrandForm />
      </section>

      <section>
        <SectionHeader title="Ciclos">
          {/* <a> plano: el saldo del ciclo activo cambia seguido */}
          <a href="/app/expenses" className="text-sm font-semibold text-accent">
            Gastos del ciclo activo
          </a>
        </SectionHeader>

        {cycles.length === 0 ? (
          <EmptyState>Todavía no creaste ningún ciclo.</EmptyState>
        ) : (
          <div className="mt-2.5">
            <List>
              {cycles.map((cycle) => {
                const isActive = cycle.id === activeCycleId;
                return (
                  <ListRow key={cycle.id}>
                    <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                      <a href={`/app/cycles/${cycle.id}`} className="min-w-0 flex-1">
                        <div className="font-semibold">{cycle.name}</div>
                        <div className="text-sm text-muted">
                          {cycle.status === "closed" ? "Cerrado" : "Abierto"}
                        </div>
                      </a>
                      {isActive ? (
                        <Chip tone="accent">Activo</Chip>
                      ) : (
                        <form action={setActiveCycleAction}>
                          <input type="hidden" name="cycleId" value={cycle.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Elegir
                          </Button>
                        </form>
                      )}
                    </div>
                  </ListRow>
                );
              })}
            </List>
          </div>
        )}

        <CycleForm />
      </section>
    </div>
  );
}

function BrandForm() {
  const [state, formAction, pending] = useActionState(createBrandAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2.5">
      <div className="grid grid-cols-[1fr_110px] gap-2.5">
        <Field label="Nombre de la marca">
          <input
            name="name"
            placeholder="Nombre de la marca"
            required
            className="rounded-xl border border-line bg-surface px-3 py-2.5"
          />
        </Field>
        <Field label="% de ganancia">
          <input
            name="marginPct"
            type="number"
            step="0.01"
            min={0}
            max={100}
            placeholder="% gan."
            required
            className="rounded-xl border border-line bg-surface px-3 py-2.5"
          />
        </Field>
      </div>
      {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}
      <Button type="submit" variant="primary" size="sm" disabled={pending}>
        {pending ? "Guardando…" : "+ Agregar marca"}
      </Button>
    </form>
  );
}

function CycleForm() {
  const [state, formAction, pending] = useActionState(createCycleAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2.5">
      <Field label="Nombre del ciclo">
        <input
          name="name"
          placeholder="Nombre del ciclo (ej. Octubre)"
          required
          className="rounded-xl border border-line bg-surface px-3 py-2.5"
        />
      </Field>
      {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}
      <Button type="submit" variant="primary" size="sm" disabled={pending}>
        {pending ? "Creando…" : "+ Nuevo ciclo"}
      </Button>
    </form>
  );
}
