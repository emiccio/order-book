import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpensesView } from "./ExpensesView";
import type { ExpenseRow } from "@/data/expenses";

vi.mock("@/actions/expenses", () => ({
  createExpenseAction: vi.fn(async () => ({})),
  deleteExpenseAction: vi.fn(async () => {}),
}));

const expenses: ExpenseRow[] = [
  { id: "e1", category: "shipping", description: "Envíos del mes", amount: 8000, date: "2026-10-09" },
];

describe("ExpensesView", () => {
  it("renderiza sin error con gastos de ejemplo y el total", () => {
    render(<ExpensesView cycleId="c1" cycleName="Octubre" expenses={expenses} />);
    expect(screen.getAllByText("Envío").length).toBeGreaterThan(0);
    expect(screen.getByText(/Envíos del mes/)).toBeInTheDocument();
    expect(screen.getAllByText("$ 8.000").length).toBeGreaterThan(0);
  });

  it("muestra estado vacío sin gastos", () => {
    render(<ExpensesView cycleId="c1" cycleName="Octubre" expenses={[]} />);
    expect(screen.getByText(/todavía no cargaste gastos/i)).toBeInTheDocument();
  });
});
