"use client";

import { useState, useTransition } from "react";
import { loadNewOrderFormAction } from "@/actions/orders";
import type { CustomerRow } from "@/data/customers";
import type { BrandRow } from "@/data/brands";
import { Sheet } from "@/ui/Sheet";
import { OrderForm } from "@/ui/OrderForm";
import { EmptyState } from "@/ui/EmptyState";

type FormState = { customers: CustomerRow[]; brands: BrandRow[] } | { error: string } | null;

/**
 * El "+ Nuevo pedido" del prototipo abre como hoja, no navega a una página
 * nueva (igual que "+ Agregar" en Clientas). Vive en el layout compartido
 * porque CLAUDE.md pide que el botón esté siempre visible en cualquier
 * pestaña, así que pide clientas y marcas recién al abrirse (el layout no
 * las tiene precargadas).
 */
export function NewOrderFab() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    startTransition(async () => {
      const result = await loadNewOrderFormAction();
      setState(result.ok ? { customers: result.customers, brands: result.brands } : { error: result.error });
      setOpen(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={pending}
        className="fixed right-4 z-10 rounded-full bg-accent-solid px-5 py-3.5 text-[15px] font-semibold text-accent-ink shadow-float disabled:opacity-80"
        style={{ bottom: "calc(82px + env(safe-area-inset-bottom, 0px))" }}
      >
        {pending ? "Cargando…" : "+ Nuevo pedido"}
      </button>

      <Sheet open={open} title="Nuevo pedido" onClose={() => setOpen(false)}>
        {state &&
          (("error" in state) ? (
            <EmptyState>{state.error}</EmptyState>
          ) : (
            <OrderForm mode="create" customers={state.customers} brands={state.brands} />
          ))}
      </Sheet>
    </>
  );
}
