import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrdersView } from "./OrdersView";
import type { OrderRow } from "@/data/orders";

function order(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "o1",
    customerId: "c1",
    customerName: "Laura",
    customerPhone: null,
    date: "2026-10-02",
    deliveryStatus: "pending_delivery",
    notes: null,
    items: [],
    total: 10000,
    cost: 0,
    profit: 10000,
    paid: 0,
    balance: 10000,
    ...overrides,
  };
}

describe("OrdersView", () => {
  it("renderiza sin error con pedidos de ejemplo", () => {
    render(<OrdersView orders={[order()]} />);
    expect(screen.getByText("Laura")).toBeInTheDocument();
    expect(screen.getByText("Pendiente de entregar")).toBeInTheDocument();
  });

  it("muestra el saldo pendiente cuando hay deuda", () => {
    render(<OrdersView orders={[order({ balance: 4000 })]} />);
    expect(screen.getByText("Debe $ 4.000")).toBeInTheDocument();
  });

  it("no muestra deuda cuando el pedido está pago", () => {
    render(<OrdersView orders={[order({ balance: 0, paid: 10000 })]} />);
    expect(screen.queryByText(/debe/i)).not.toBeInTheDocument();
  });

  it("muestra estado vacío sin pedidos", () => {
    render(<OrdersView orders={[]} />);
    expect(screen.getByText(/todavía no tenés pedidos/i)).toBeInTheDocument();
  });
});
