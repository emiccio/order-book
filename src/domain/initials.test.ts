import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("toma la primera letra de hasta dos palabras", () => {
    expect(initials("María González")).toBe("MG");
  });

  it("maneja un solo nombre", () => {
    expect(initials("Laura")).toBe("L");
  });

  it("ignora espacios de más", () => {
    expect(initials("  Ana   Pérez  ")).toBe("AP");
  });

  it("usa solo las dos primeras palabras si hay más", () => {
    expect(initials("Ana María Pérez López")).toBe("AM");
  });

  it("devuelve ? sin nombre", () => {
    expect(initials("")).toBe("?");
    expect(initials(null)).toBe("?");
    expect(initials(undefined)).toBe("?");
  });
});
