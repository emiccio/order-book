import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formatea con separador de miles y sin decimales", () => {
    expect(formatMoney(12500)).toBe("$ 12.500");
  });

  it("redondea en lugar de truncar", () => {
    expect(formatMoney(12500.6)).toBe("$ 12.501");
    expect(formatMoney(12500.4)).toBe("$ 12.500");
  });

  it("maneja cero", () => {
    expect(formatMoney(0)).toBe("$ 0");
  });

  it("maneja negativos", () => {
    expect(formatMoney(-500)).toBe("$ -500");
  });

  it("maneja null y undefined como cero", () => {
    expect(formatMoney(null)).toBe("$ 0");
    expect(formatMoney(undefined)).toBe("$ 0");
  });
});
