"use client";

import { startTransition, useActionState, useId, useState, useTransition } from "react";
import { calcOrder, itemCost, type OrderItemMoney } from "@/domain/calculations";
import { formatMoney } from "@/domain/money";
import type { ActionResult } from "@/actions/auth";
import { createOrderAction, updateOrderAction } from "@/actions/orders";
import { createCustomerInlineAction } from "@/actions/customers";
import type { OrderRow } from "@/data/orders";
import type { BrandRow } from "@/data/brands";
import { Field } from "@/ui/Field";
import { Button } from "@/ui/Button";

const initialState: ActionResult = {};
const NEW_CUSTOMER = "__new__";

type CustomerOption = { id: string; name: string };

type ItemDraft = {
  key: string;
  name: string;
  brandId: string | null;
  quantity: string;
  unitPrice: string;
  unitCost: string;
};

function blankItem(): ItemDraft {
  return {
    key: Math.random().toString(36).slice(2),
    name: "",
    brandId: null,
    quantity: "1",
    unitPrice: "",
    unitCost: "",
  };
}

function toItemMoney(item: ItemDraft, brands: BrandRow[]): OrderItemMoney {
  const brand = brands.find((b) => b.id === item.brandId);
  return {
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    unitCost: item.unitCost.trim() === "" ? null : Number(item.unitCost),
    brandMarginPct: brand ? brand.margin_pct : null,
  };
}

export function OrderForm({
  mode,
  order,
  customers: initialCustomers,
  brands,
}: {
  mode: "create" | "edit";
  order?: OrderRow;
  customers: CustomerOption[];
  brands: BrandRow[];
}) {
  const action = mode === "edit" ? updateOrderAction : createOrderAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [customers, setCustomers] = useState(initialCustomers);
  const [customerId, setCustomerId] = useState(order?.customerId ?? "");
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isAddingCustomer, startAddCustomer] = useTransition();

  const [items, setItems] = useState<ItemDraft[]>(
    order && order.items.length > 0
      ? order.items.map((item) => ({
          key: item.id,
          name: item.name,
          brandId: item.brandId,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          unitCost: item.unitCost == null ? "" : String(item.unitCost),
        }))
      : [blankItem()],
  );

  const liveCalc = calcOrder({
    items: items.map((item) => toItemMoney(item, brands)),
    payments: [],
  });

  function updateItem(key: string, patch: Partial<ItemDraft>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.key !== key) : current));
  }

  function handleCustomerChange(value: string) {
    if (value === NEW_CUSTOMER) {
      setAddingCustomer(true);
      return;
    }
    setCustomerId(value);
  }

  function handleAddCustomer() {
    setCustomerError(null);
    startAddCustomer(async () => {
      const result = await createCustomerInlineAction(newCustomerName);
      if (!result.customer) {
        setCustomerError(result.error ?? "No se pudo agregar la clienta.");
        return;
      }
      const customer = result.customer;
      setCustomers((current) => [...current, customer]);
      setCustomerId(customer.id);
      setAddingCustomer(false);
      setNewCustomerName("");
    });
  }

  function handleSubmit() {
    const payload = {
      id: order?.id,
      customerId,
      notes: order?.notes ?? "",
      items: items.map((item) => ({
        name: item.name,
        brandId: item.brandId,
        quantity: toItemMoney(item, brands).quantity,
        unitPrice: toItemMoney(item, brands).unitPrice,
        unitCost: item.unitCost.trim() === "" ? null : Number(item.unitCost),
      })),
    };
    startTransition(() => formAction(payload));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Field label="Clienta">
          <select
            value={customerId}
            onChange={(event) => handleCustomerChange(event.target.value)}
            className="rounded-xl border border-line bg-surface px-3 py-2.5"
          >
            <option value="" disabled>
              Elegí una clienta
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
            <option value={NEW_CUSTOMER}>+ Nueva clienta</option>
          </select>
        </Field>

        {addingCustomer && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-surface p-2.5">
            <input
              value={newCustomerName}
              onChange={(event) => setNewCustomerName(event.target.value)}
              placeholder="Nombre de la nueva clienta"
              className="flex-1 rounded-lg border border-line px-2.5 py-2"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddCustomer}
              disabled={isAddingCustomer || !newCustomerName.trim()}
            >
              {isAddingCustomer ? "Agregando…" : "Agregar"}
            </Button>
          </div>
        )}
        {customerError && <p className="mt-1 text-sm font-medium text-danger">{customerError}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Productos</span>
        {items.map((item) => (
          <ItemRow
            key={item.key}
            item={item}
            brands={brands}
            canRemove={items.length > 1}
            onChange={(patch) => updateItem(item.key, patch)}
            onRemove={() => removeItem(item.key)}
          />
        ))}
        <Button variant="secondary" size="sm" onClick={() => setItems((current) => [...current, blankItem()])}>
          + Agregar producto
        </Button>
      </div>

      <div className="num rounded-card border border-line bg-surface p-3.5 text-sm">
        <Row label="Total" value={formatMoney(liveCalc.total)} strong />
        <Row label="Costo" value={formatMoney(liveCalc.cost)} />
        <Row label="Ganancia" value={formatMoney(liveCalc.profit)} />
      </div>

      {state.error && <p className="text-sm font-medium text-danger">{state.error}</p>}

      <Button variant="primary" fullWidth onClick={handleSubmit} disabled={pending || !customerId}>
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 ${strong ? "font-semibold" : "text-muted"}`}>
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function ItemRow({
  item,
  brands,
  canRemove,
  onChange,
  onRemove,
}: {
  item: ItemDraft;
  brands: BrandRow[];
  canRemove: boolean;
  onChange: (patch: Partial<ItemDraft>) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const cost = itemCost(toItemMoney(item, brands));
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const lineTotal = quantity * unitPrice;
  const lineProfit = lineTotal - quantity * cost;

  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <div className="grid grid-cols-2 gap-2.5">
        <input
          aria-label="Producto"
          value={item.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Producto"
          required
          className="col-span-2 rounded-lg border border-line px-2.5 py-2"
        />
        <select
          aria-label="Marca"
          value={item.brandId ?? ""}
          onChange={(event) => onChange({ brandId: event.target.value || null })}
          className="col-span-2 rounded-lg border border-line px-2.5 py-2"
        >
          <option value="">Sin marca</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <label className="flex flex-col gap-1 text-xs text-muted" htmlFor={`${id}-qty`}>
          Cantidad
          <input
            id={`${id}-qty`}
            type="number"
            min={0}
            step="0.01"
            value={item.quantity}
            onChange={(event) => onChange({ quantity: event.target.value })}
            required
            className="rounded-lg border border-line px-2.5 py-2 text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted" htmlFor={`${id}-price`}>
          Precio
          <input
            id={`${id}-price`}
            type="number"
            min={0}
            step="0.01"
            value={item.unitPrice}
            onChange={(event) => onChange({ unitPrice: event.target.value })}
            required
            className="rounded-lg border border-line px-2.5 py-2 text-ink"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1 text-xs text-muted" htmlFor={`${id}-cost`}>
          Costo (opcional, si no usa el % de la marca)
          <input
            id={`${id}-cost`}
            type="number"
            min={0}
            step="0.01"
            value={item.unitCost}
            onChange={(event) => onChange({ unitCost: event.target.value })}
            placeholder="Automático según marca"
            className="rounded-lg border border-line px-2.5 py-2 text-ink"
          />
        </label>
      </div>
      <div className="num mt-2 flex items-center justify-between text-xs text-muted">
        <span>
          Costo {formatMoney(quantity * cost)} · Ganancia {formatMoney(lineProfit)}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="min-h-11 px-2 font-semibold text-danger"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}
