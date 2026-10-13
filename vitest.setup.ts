import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { config } from "dotenv";

config({ path: ".env.local" });

// Sin esto, el DOM de un componente queda montado para el próximo test
// (vitest no usa `globals: true`, así que el auto-cleanup de RTL no se
// registra solo): varios `it()` renderizando el mismo texto chocan entre sí.
afterEach(() => cleanup());
