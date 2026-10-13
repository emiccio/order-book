import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResumenView } from "./ResumenView";
import type { CycleCalc, Debtor, BrandSummary } from "@/domain/calculations";

const cycleCalc: CycleCalc = {
  sold: 15000,
  collected: 9000,
  outstanding: 6000,
  productCost: 5000,
  productProfit: 10000,
  expenses: 0,
  result: 10000,
};

const cycles = [{ id: "cy1", name: "Octubre" }];

const debtor: Debtor = {
  customerId: "c1",
  customerName: "Laura",
  phone: "2235551234",
  balance: 6000,
  orderId: "o1",
};

const brand: BrandSummary = {
  brandId: "b1",
  brandName: "Natura",
  sold: 10000,
  payable: 7000,
  profit: 3000,
};

describe("ResumenView", () => {
  it("renderiza los siete números y la sección por marca", () => {
    render(
      <ResumenView
        cycleCalc={cycleCalc}
        totalPayable={7000}
        orderCount={2}
        pendingDeliveryCount={1}
        pendingDeliveryOrders={[{ id: "o2", customerName: "Marina", total: 5000 }]}
        topDebtors={[debtor]}
        brandSummary={[brand]}
        cycles={cycles}
      />,
    );
    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("$ 15.000")).toBeInTheDocument(); // vendido
    expect(screen.getByText("$ 9.000")).toBeInTheDocument(); // cobrado
    expect(screen.getByText("Laura")).toBeInTheDocument();
    expect(screen.getByText("Natura")).toBeInTheDocument();
    expect(screen.getByText("Marina")).toBeInTheDocument();

    const recordar = screen.getByRole("link", { name: "Recordar" });
    expect(recordar).toHaveAttribute("href", expect.stringContaining("https://wa.me/"));
    expect(recordar).toHaveAttribute("href", expect.stringContaining("549"));
  });

  it("muestra estado vacío sin ciclos", () => {
    render(
      <ResumenView
        cycleCalc={{ sold: 0, collected: 0, outstanding: 0, productCost: 0, productProfit: 0, expenses: 0, result: 0 }}
        totalPayable={0}
        orderCount={0}
        pendingDeliveryCount={0}
        pendingDeliveryOrders={[]}
        topDebtors={[]}
        brandSummary={[]}
        cycles={[]}
      />,
    );
    expect(screen.getByText(/todavía no tenés un ciclo/i)).toBeInTheDocument();
  });

  it("muestra mensajes vacíos por sección cuando no hay datos en el ciclo", () => {
    render(
      <ResumenView
        cycleCalc={{ sold: 0, collected: 0, outstanding: 0, productCost: 0, productProfit: 0, expenses: 0, result: 0 }}
        totalPayable={0}
        orderCount={0}
        pendingDeliveryCount={0}
        pendingDeliveryOrders={[]}
        topDebtors={[]}
        brandSummary={[]}
        cycles={cycles}
      />,
    );
    expect(screen.getByText(/no tenés pedidos pendientes de entregar/i)).toBeInTheDocument();
    expect(screen.getByText(/nadie te debe/i)).toBeInTheDocument();
    expect(screen.getByText(/todavía no hay ventas/i)).toBeInTheDocument();
  });
});
