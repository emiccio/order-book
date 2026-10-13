import { describe, expect, it } from "vitest";
import { matchesSearch } from "./search";

describe("matchesSearch", () => {
  it("no distingue mayúsculas", () => {
    expect(matchesSearch("Laura Gómez", "laura")).toBe(true);
    expect(matchesSearch("Laura Gómez", "LAURA")).toBe(true);
  });

  it("no distingue acentos", () => {
    expect(matchesSearch("José Pérez", "jose")).toBe(true);
    expect(matchesSearch("María López", "maria lopez")).toBe(true);
  });

  it("busca por coincidencia parcial", () => {
    expect(matchesSearch("Marina Pérez", "rina")).toBe(true);
  });

  it("no matchea texto que no está", () => {
    expect(matchesSearch("Laura Gómez", "sol")).toBe(false);
  });

  it("una búsqueda vacía matchea todo", () => {
    expect(matchesSearch("Laura Gómez", "")).toBe(true);
    expect(matchesSearch("Laura Gómez", "   ")).toBe(true);
  });
});
