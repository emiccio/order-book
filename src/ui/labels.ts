import { type DeliveryStatus, type ExpenseCategory } from "@/domain/types";

/**
 * Único lugar donde los valores de los enums (en inglés) se traducen
 * a lo que lee la usuaria (castellano rioplatense).
 */
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending_receipt: "Pendiente de recibir",
  received: "Recibido",
  pending_delivery: "Pendiente de entregar",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function deliveryStatusLabel(status: DeliveryStatus): string {
  return DELIVERY_STATUS_LABELS[status];
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  shipping: "Envío",
  packaging: "Packaging",
  advertising: "Publicidad",
  commission: "Comisión",
  other: "Otros",
};

export function expenseCategoryLabel(category: ExpenseCategory): string {
  return EXPENSE_CATEGORY_LABELS[category];
}
