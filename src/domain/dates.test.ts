import { describe, expect, it } from "vitest";
import { formatShortDate } from "./dates";

describe("formatShortDate", () => {
  it("convierte una fecha ISO a dd/mm", () => {
    expect(formatShortDate("2026-10-09")).toBe("09/10");
  });

  it("devuelve vacío para una fecha vacía", () => {
    expect(formatShortDate("")).toBe("");
  });
});
