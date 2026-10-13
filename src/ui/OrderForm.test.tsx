import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderForm } from "./OrderForm";
import type { BrandRow } from "@/data/brands";

vi.mock("@/actions/orders", () => ({
  createOrderAction: vi.fn(async () => ({})),
  updateOrderAction: vi.fn(async () => ({})),
}));
vi.mock("@/actions/customers", () => ({
  createCustomerInlineAction: vi.fn(async () => ({ customer: { id: "c-new", name: "Nueva" } })),
}));

const customers = [{ id: "c1", name: "Laura Gómez" }];
const brands: BrandRow[] = [{ id: "b1", name: "Natura", margin_pct: 30, archived: false }];

describe("OrderForm", () => {
  it("calcula el total en vivo mientras se escribe, con varios ítems y marcas", async () => {
    const user = userEvent.setup();
    render(<OrderForm mode="create" customers={customers} brands={brands} />);

    // ítem 1: 2 x $5000, marca Natura (30%) -> costo 3500 c/u
    await user.type(screen.getByPlaceholderText("Producto"), "Perfume");
    await user.selectOptions(screen.getByLabelText("Marca"), "Natura");
    const qty = screen.getByLabelText("Cantidad");
    await user.clear(qty);
    await user.type(qty, "2");
    const price = screen.getByLabelText("Precio");
    await user.clear(price);
    await user.type(price, "5000");

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$ 10.000")).toBeInTheDocument(); // total
    expect(screen.getByText("$ 7.000")).toBeInTheDocument(); // costo: 2*3500
    expect(screen.getByText("$ 3.000")).toBeInTheDocument(); // ganancia

    // agrego un segundo producto sin marca y sin costo -> costo 0
    await user.click(screen.getByRole("button", { name: "+ Agregar producto" }));
    const products = screen.getAllByPlaceholderText("Producto");
    await user.type(products[1], "Vela");
    const prices = screen.getAllByLabelText("Precio");
    await user.clear(prices[1]);
    await user.type(prices[1], "1000");
    const qtys = screen.getAllByLabelText("Cantidad");
    await user.clear(qtys[1]);
    await user.type(qtys[1], "1");

    expect(screen.getByText("$ 11.000")).toBeInTheDocument(); // total: 10000 + 1000
    expect(screen.getByText("$ 4.000")).toBeInTheDocument(); // ganancia: 11000 - 7000
  });

  it("el costo cargado a mano pisa el % de la marca", async () => {
    const user = userEvent.setup();
    render(<OrderForm mode="create" customers={customers} brands={brands} />);

    await user.type(screen.getByPlaceholderText("Producto"), "Perfume");
    await user.selectOptions(screen.getByLabelText("Marca"), "Natura");
    const qty = screen.getByLabelText("Cantidad");
    await user.clear(qty);
    await user.type(qty, "1");
    const price = screen.getByLabelText("Precio");
    await user.clear(price);
    await user.type(price, "1000");
    await user.type(
      screen.getByPlaceholderText("Automático según marca"),
      "100",
    );

    // ganancia esperada: 1000 - 100 = 900 (no 1000 - 700 del % de marca)
    expect(screen.getByText("$ 900")).toBeInTheDocument();
  });

  it("el botón Guardar está deshabilitado sin clienta elegida", () => {
    render(<OrderForm mode="create" customers={customers} brands={brands} />);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });
});
