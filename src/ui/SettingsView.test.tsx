import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsView } from "./SettingsView";
import type { BrandRow } from "@/data/brands";
import type { CycleRow } from "@/data/cycles";

vi.mock("@/actions/brands", () => ({
  createBrandAction: vi.fn(async () => ({})),
  archiveBrandAction: vi.fn(async () => {}),
}));
vi.mock("@/actions/cycles", () => ({
  createCycleAction: vi.fn(async () => ({})),
  setActiveCycleAction: vi.fn(async () => {}),
}));

const brands: BrandRow[] = [{ id: "b1", name: "Natura", margin_pct: 30, archived: false }];
const cycles: CycleRow[] = [
  { id: "cy1", name: "Octubre", status: "open", closed_at: null },
];

describe("SettingsView", () => {
  it("renderiza sin error con marcas y ciclos de ejemplo", () => {
    render(<SettingsView brands={brands} cycles={cycles} activeCycleId="cy1" />);
    expect(screen.getByText("Natura")).toBeInTheDocument();
    expect(screen.getByText("30% de ganancia")).toBeInTheDocument();
    expect(screen.getByText("Octubre")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("muestra estado vacío sin marcas ni ciclos", () => {
    render(<SettingsView brands={[]} cycles={[]} activeCycleId={null} />);
    expect(screen.getByText(/todavía no cargaste ninguna marca/i)).toBeInTheDocument();
    expect(screen.getByText(/todavía no creaste ningún ciclo/i)).toBeInTheDocument();
  });

  it("muestra el botón Elegir en los ciclos no activos", () => {
    const twoCycles: CycleRow[] = [
      ...cycles,
      { id: "cy2", name: "Noviembre", status: "open", closed_at: null },
    ];
    render(<SettingsView brands={brands} cycles={twoCycles} activeCycleId="cy1" />);
    expect(screen.getAllByText("Elegir")).toHaveLength(1);
  });
});
