import { describe, expect, it } from "vitest";
import { normalizePhone, orderMessage, reminderMessage, whatsappUrl } from "./whatsapp";

describe("normalizePhone", () => {
  it("10 dígitos: antepone 549", () => {
    expect(normalizePhone("2235551234")).toBe("5492235551234");
  });

  it("con 0 adelante: lo saca antes de anteponer 549", () => {
    expect(normalizePhone("02235551234")).toBe("5492235551234");
  });

  it("con +54: inserta el 9 que falta", () => {
    expect(normalizePhone("+542235551234")).toBe("5492235551234");
  });

  it("con 549 ya puesto: lo deja como está", () => {
    expect(normalizePhone("5492235551234")).toBe("5492235551234");
  });

  it("con espacios y guiones: los ignora", () => {
    expect(normalizePhone("223 555-1234")).toBe("5492235551234");
    expect(normalizePhone("(223) 555-1234")).toBe("5492235551234");
  });

  it("vacío o nulo: devuelve null", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
  });
});

describe("whatsappUrl", () => {
  it("arma el link de wa.me con el teléfono normalizado y el mensaje", () => {
    const url = whatsappUrl("2235551234", "Hola!");
    expect(url).toBe("https://wa.me/5492235551234?text=Hola!");
  });

  it("sin teléfono, el link queda sin destinatario", () => {
    const url = whatsappUrl(null, "Hola!");
    expect(url).toBe("https://wa.me/?text=Hola!");
  });
});

describe("orderMessage", () => {
  const base = {
    customerName: "Laura Gómez",
    items: [
      { name: "Perfume Kaiak", quantity: 2, unitPrice: 5000 },
      { name: "Crema Ekos", quantity: 1, unitPrice: 3000 },
    ],
    total: 13000,
    paid: 0,
    balance: 13000,
  };

  it("incluye los ítems y el total", () => {
    const message = orderMessage(base);
    expect(message).toContain("2 x Perfume Kaiak");
    expect(message).toContain("1 x Crema Ekos");
    expect(message).toContain("Total: $ 13.000");
  });

  it("incluye lo pagado y el saldo cuando hay pago parcial", () => {
    const message = orderMessage({ ...base, paid: 5000, balance: 8000 });
    expect(message).toContain("Pagaste: $ 5.000");
    expect(message).toContain("Te queda: $ 8.000");
  });

  it("cuando está todo pago, dice que está pago (y no menciona saldo)", () => {
    const message = orderMessage({ ...base, paid: 13000, balance: 0 });
    expect(message).toContain("Está todo pago");
    expect(message).not.toContain("Te queda");
  });

  it("no menciona 'Pagaste' si todavía no pagó nada", () => {
    const message = orderMessage(base);
    expect(message).not.toContain("Pagaste");
  });
});

describe("reminderMessage", () => {
  it("incluye el nombre de la clienta y el monto", () => {
    const message = reminderMessage("Marina Pérez", 15000);
    expect(message).toContain("Marina");
    expect(message).toContain("$ 15.000");
  });
});
