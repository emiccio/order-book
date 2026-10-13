import { describe, expect, it } from "vitest";
import { DELIVERY_STATUSES, EXPENSE_CATEGORIES } from "@/domain/types";
import {
  DELIVERY_STATUS_LABELS,
  deliveryStatusLabel,
  EXPENSE_CATEGORY_LABELS,
  expenseCategoryLabel,
} from "./labels";

describe("DELIVERY_STATUS_LABELS", () => {
  it("tiene una etiqueta en castellano para cada estado de entrega", () => {
    for (const status of DELIVERY_STATUSES) {
      const label = DELIVERY_STATUS_LABELS[status];
      expect(label, `falta etiqueta para "${status}"`).toBeTruthy();
      expect(typeof label).toBe("string");
    }
  });

  it("no tiene etiquetas para estados que no existen", () => {
    const knownStatuses = new Set(DELIVERY_STATUSES);
    for (const key of Object.keys(DELIVERY_STATUS_LABELS)) {
      expect(knownStatuses.has(key as (typeof DELIVERY_STATUSES)[number])).toBe(true);
    }
  });

  it("deliveryStatusLabel devuelve la etiqueta esperada", () => {
    expect(deliveryStatusLabel("pending_delivery")).toBe("Pendiente de entregar");
    expect(deliveryStatusLabel("delivered")).toBe("Entregado");
  });
});

describe("EXPENSE_CATEGORY_LABELS", () => {
  it("tiene una etiqueta en castellano para cada categoría de gasto", () => {
    for (const category of EXPENSE_CATEGORIES) {
      const label = EXPENSE_CATEGORY_LABELS[category];
      expect(label, `falta etiqueta para "${category}"`).toBeTruthy();
      expect(typeof label).toBe("string");
    }
  });

  it("no tiene etiquetas para categorías que no existen", () => {
    const known = new Set(EXPENSE_CATEGORIES);
    for (const key of Object.keys(EXPENSE_CATEGORY_LABELS)) {
      expect(known.has(key as (typeof EXPENSE_CATEGORIES)[number])).toBe(true);
    }
  });

  it("expenseCategoryLabel devuelve la etiqueta esperada", () => {
    expect(expenseCategoryLabel("shipping")).toBe("Envío");
    expect(expenseCategoryLabel("commission")).toBe("Comisión");
  });
});
