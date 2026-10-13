import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomersView } from "./CustomersView";
import type { CustomerRow } from "@/data/customers";

vi.mock("@/actions/customers", () => ({
  createCustomerAction: vi.fn(async () => ({})),
  updateCustomerAction: vi.fn(async () => ({})),
  archiveCustomerAction: vi.fn(async () => {}),
}));

const customers: CustomerRow[] = [
  { id: "c1", name: "Laura Gómez", phone: "2235551234", notes: null, archived: false, debt: 5000 },
  { id: "c2", name: "José Pérez", phone: null, notes: null, archived: false, debt: 0 },
];

describe("CustomersView", () => {
  it("renderiza sin error con clientas de ejemplo", () => {
    render(<CustomersView customers={customers} />);
    expect(screen.getByText("Laura Gómez")).toBeInTheDocument();
    expect(screen.getByText("José Pérez")).toBeInTheDocument();
  });

  it("muestra la deuda y a quién no debe", () => {
    render(<CustomersView customers={customers} />);
    expect(screen.getByText("Debe $ 5.000")).toBeInTheDocument();
    expect(screen.getByText("Al día")).toBeInTheDocument();
  });

  it("muestra estado vacío sin clientas", () => {
    render(<CustomersView customers={[]} />);
    expect(screen.getByText(/todavía no cargaste ninguna clienta/i)).toBeInTheDocument();
  });

  it("el buscador filtra sin distinguir mayúsculas ni acentos", async () => {
    const user = userEvent.setup();
    render(<CustomersView customers={customers} />);

    await user.type(screen.getByPlaceholderText("Buscar clienta…"), "JOSE");

    expect(screen.queryByText("Laura Gómez")).not.toBeInTheDocument();
    expect(screen.getByText("José Pérez")).toBeInTheDocument();
  });

  it("avisa cuando ninguna clienta coincide con la búsqueda", async () => {
    const user = userEvent.setup();
    render(<CustomersView customers={customers} />);

    await user.type(screen.getByPlaceholderText("Buscar clienta…"), "zzz");

    expect(screen.getByText(/ninguna clienta coincide/i)).toBeInTheDocument();
  });

  it("abre la hoja de alta al tocar + Agregar", async () => {
    const user = userEvent.setup();
    render(<CustomersView customers={customers} />);

    await user.click(screen.getByRole("button", { name: "+ Agregar" }));

    expect(screen.getByText("Nueva clienta")).toBeInTheDocument();
  });
});
