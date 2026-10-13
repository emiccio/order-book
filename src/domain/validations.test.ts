import { describe, expect, it } from "vitest";
import {
  brandSchema,
  customerSchema,
  cycleSchema,
  deliveryStatusSchema,
  expenseSchema,
  orderItemSchema,
  orderSchema,
  paymentSchema,
  signInSchema,
  signUpSchema,
} from "./validations";

function validItem(overrides: Partial<Record<string, unknown>> = {}) {
  return { name: "Perfume", brandId: null, quantity: 1, unitPrice: 1000, unitCost: null, ...overrides };
}

describe("brandSchema", () => {
  it("rechaza nombre vacío", () => {
    const result = brandSchema.safeParse({ name: "   ", marginPct: 30 });
    expect(result.success).toBe(false);
  });

  it("recorta espacios del nombre", () => {
    const result = brandSchema.safeParse({ name: "  Natura  ", marginPct: 30 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Natura");
  });

  it("rechaza margin_pct negativo", () => {
    const result = brandSchema.safeParse({ name: "Natura", marginPct: -1 });
    expect(result.success).toBe(false);
  });

  it("rechaza margin_pct mayor a 100", () => {
    const result = brandSchema.safeParse({ name: "Natura", marginPct: 101 });
    expect(result.success).toBe(false);
  });

  it("acepta 0 y 100 como límites válidos", () => {
    expect(brandSchema.safeParse({ name: "Propio", marginPct: 0 }).success).toBe(true);
    expect(brandSchema.safeParse({ name: "Natura", marginPct: 100 }).success).toBe(true);
  });
});

describe("cycleSchema", () => {
  it("rechaza nombre vacío", () => {
    expect(cycleSchema.safeParse({ name: "" }).success).toBe(false);
    expect(cycleSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("acepta un nombre válido", () => {
    const result = cycleSchema.safeParse({ name: "Octubre" });
    expect(result.success).toBe(true);
  });
});

describe("customerSchema", () => {
  it("rechaza nombre vacío", () => {
    expect(customerSchema.safeParse({ name: "" }).success).toBe(false);
    expect(customerSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("recorta espacios del nombre", () => {
    const result = customerSchema.safeParse({ name: "  Laura Gómez  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Laura Gómez");
  });

  it("el teléfono y las notas son opcionales", () => {
    const result = customerSchema.safeParse({ name: "Laura" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });

  it("acepta teléfono y notas cuando vienen", () => {
    const result = customerSchema.safeParse({
      name: "Laura",
      phone: "2235551234",
      notes: "Prefiere que la llamen",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("2235551234");
      expect(result.data.notes).toBe("Prefiere que la llamen");
    }
  });

  it("un teléfono vacío queda null", () => {
    const result = customerSchema.safeParse({ name: "Laura", phone: "   " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBeNull();
  });
});

describe("orderItemSchema", () => {
  it("rechaza cantidad cero o negativa", () => {
    expect(orderItemSchema.safeParse(validItem({ quantity: 0 })).success).toBe(false);
    expect(orderItemSchema.safeParse(validItem({ quantity: -1 })).success).toBe(false);
  });

  it("rechaza precio negativo", () => {
    expect(orderItemSchema.safeParse(validItem({ unitPrice: -1 })).success).toBe(false);
  });

  it("acepta precio cero", () => {
    expect(orderItemSchema.safeParse(validItem({ unitPrice: 0 })).success).toBe(true);
  });

  it("rechaza costo negativo", () => {
    expect(orderItemSchema.safeParse(validItem({ unitCost: -1 })).success).toBe(false);
  });

  it("acepta costo null (usa el % de la marca)", () => {
    const result = orderItemSchema.safeParse(validItem({ unitCost: null }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.unitCost).toBeNull();
  });

  it("rechaza nombre de producto vacío", () => {
    expect(orderItemSchema.safeParse(validItem({ name: "  " })).success).toBe(false);
  });
});

describe("orderSchema", () => {
  it("rechaza pedido sin clienta", () => {
    const result = orderSchema.safeParse({ customerId: "", items: [validItem()] });
    expect(result.success).toBe(false);
  });

  it("rechaza pedido sin ítems", () => {
    const result = orderSchema.safeParse({ customerId: "c1", items: [] });
    expect(result.success).toBe(false);
  });

  it("acepta un pedido válido con varios ítems", () => {
    const result = orderSchema.safeParse({
      customerId: "c1",
      items: [validItem({ name: "Perfume" }), validItem({ name: "Crema", brandId: "b1" })],
    });
    expect(result.success).toBe(true);
  });
});

describe("deliveryStatusSchema", () => {
  it("acepta cualquiera de los cinco estados", () => {
    for (const status of ["pending_receipt", "received", "pending_delivery", "delivered", "cancelled"]) {
      expect(deliveryStatusSchema.safeParse({ deliveryStatus: status }).success).toBe(true);
    }
  });

  it("rechaza un estado inventado", () => {
    expect(deliveryStatusSchema.safeParse({ deliveryStatus: "en_camino" }).success).toBe(false);
  });
});

describe("paymentSchema", () => {
  it("rechaza monto cero o negativo", () => {
    expect(paymentSchema.safeParse({ amount: 0, date: "2026-10-09" }).success).toBe(false);
    expect(paymentSchema.safeParse({ amount: -100, date: "2026-10-09" }).success).toBe(false);
  });

  it("rechaza sin fecha", () => {
    expect(paymentSchema.safeParse({ amount: 1000, date: "" }).success).toBe(false);
  });

  it("acepta un pago válido", () => {
    expect(paymentSchema.safeParse({ amount: 1000, date: "2026-10-09" }).success).toBe(true);
  });
});

describe("expenseSchema", () => {
  it("rechaza monto cero o negativo", () => {
    expect(
      expenseSchema.safeParse({ category: "shipping", amount: 0, date: "2026-10-09" }).success,
    ).toBe(false);
    expect(
      expenseSchema.safeParse({ category: "shipping", amount: -500, date: "2026-10-09" }).success,
    ).toBe(false);
  });

  it("rechaza sin categoría", () => {
    expect(expenseSchema.safeParse({ amount: 1000, date: "2026-10-09" }).success).toBe(false);
  });

  it("rechaza una categoría inventada", () => {
    expect(
      expenseSchema.safeParse({ category: "viaje", amount: 1000, date: "2026-10-09" }).success,
    ).toBe(false);
  });

  it("acepta un gasto válido, con descripción opcional", () => {
    const result = expenseSchema.safeParse({
      category: "shipping",
      amount: 8000,
      date: "2026-10-09",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeNull();
  });
});

describe("signUpSchema / signInSchema", () => {
  it("rechaza mail inválido", () => {
    expect(
      signUpSchema.safeParse({ name: "Laura", email: "no-es-mail", password: "123456" })
        .success,
    ).toBe(false);
  });

  it("rechaza contraseña corta", () => {
    expect(
      signUpSchema.safeParse({ name: "Laura", email: "laura@mail.com", password: "123" })
        .success,
    ).toBe(false);
  });

  it("acepta datos válidos", () => {
    expect(
      signInSchema.safeParse({ email: "laura@mail.com", password: "123456" }).success,
    ).toBe(true);
  });
});
